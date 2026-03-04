using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using System.Text;
using System.Text.Json;

namespace Backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [AllowAnonymous]
    public class ChatController : ControllerBase
    {
        private readonly IConfiguration _configuration;
        private readonly ILogger<ChatController> _logger;
        private readonly HttpClient _httpClient;

        public ChatController(IConfiguration configuration, ILogger<ChatController> logger, IHttpClientFactory httpClientFactory)
        {
            _configuration = configuration;
            _logger = logger;
            _httpClient = httpClientFactory.CreateClient();
        }

        [HttpPost]
        public async Task<IActionResult> Chat([FromBody] ChatRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.Message))
            {
                return BadRequest(new { error = "Message is required" });
            }

            try
            {
                var geminiApiKey = _configuration["GoogleGemini:ApiKey"];
                var model = _configuration["GoogleGemini:Model"] ?? "gemini-1.5-flash";
                
                if (string.IsNullOrWhiteSpace(geminiApiKey))
                {
                    _logger.LogWarning("Google Gemini API key not configured");
                    return StatusCode(500, new { error = "AI service is not configured. Please contact administrator." });
                }

                try
                {
                    var response = await GenerateGeminiResponse(request.Message, geminiApiKey, model);
                    return Ok(new { response, mode = "gemini" });
                }
                catch (HttpRequestException httpEx)
                {
                    _logger.LogError(httpEx, "Google Gemini HTTP error: {Message}", httpEx.Message);

                    var message = httpEx.Message ?? "AI service error";
                    var isQuota =
                        message.Contains("quota", StringComparison.OrdinalIgnoreCase) ||
                        message.Contains("429", StringComparison.OrdinalIgnoreCase) ||
                        message.Contains("rate limit", StringComparison.OrdinalIgnoreCase);

                    var is404 = message.Contains("404", StringComparison.OrdinalIgnoreCase) ||
                                 message.Contains("Not Found", StringComparison.OrdinalIgnoreCase);

                    var is503 = message.Contains("503", StringComparison.OrdinalIgnoreCase) ||
                                message.Contains("ServiceUnavailable", StringComparison.OrdinalIgnoreCase) ||
                                message.Contains("overloaded", StringComparison.OrdinalIgnoreCase) ||
                                message.Contains("UNAVAILABLE", StringComparison.OrdinalIgnoreCase);

                    if (is404)
                    {
                        _logger.LogWarning("Google Gemini model not found (404).");
                        return StatusCode(404, new { error = "Google Gemini API model not found. Please check configuration." });
                    }

                    if (is503)
                    {
                        _logger.LogWarning("Google Gemini service overloaded (503).");
                        return StatusCode(503, new { error = "Google Gemini API is overloaded. Please try again later." });
                    }

                    if (isQuota)
                    {
                        _logger.LogWarning("Google Gemini quota/rate limit detected.");
                        return StatusCode(429, new { error = "Google Gemini API quota/rate limit exceeded. Please try again later." });
                    }

                    _logger.LogWarning("Google Gemini API error.");
                    return StatusCode(500, new { error = $"Google Gemini API error: {message}. Please try again later." });
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error processing chat message");
                return StatusCode(500, new { error = "An error occurred while processing your request. Please try again later." });
            }
        }

        private async Task<string> GenerateGeminiResponse(string userMessage, string apiKey, string model)
        {
            var systemPrompt = "You are a helpful AI assistant for a jewelry website. " +
                "You help customers find books, answer questions about the website, and provide recommendations. " +
                "Be friendly, concise, and helpful. Keep responses under 200 words.";

            var apiUrl = $"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent";

            var requestBody = new
            {
                contents = new[]
                {
                    new
                    {
                        parts = new[]
                        {
                            new { text = $"{systemPrompt}\n\nUser: {userMessage}" }
                        }
                    }
                },
                generationConfig = new
                {
                    temperature = 0.7,
                    maxOutputTokens = 500,
                    topP = 0.8,
                    topK = 40
                }
            };

            var jsonContent = JsonSerializer.Serialize(requestBody);
            var content = new StringContent(jsonContent, Encoding.UTF8, "application/json");

            var request = new HttpRequestMessage(HttpMethod.Post, apiUrl)
            {
                Content = content
            };
            request.Headers.Add("x-goog-api-key", apiKey);

            _logger.LogInformation("Calling Gemini API: Model={Model}, URL={Url}", model, apiUrl);

            var response = await _httpClient.SendAsync(request);
            var responseContent = await response.Content.ReadAsStringAsync();

            if (!response.IsSuccessStatusCode)
            {
                _logger.LogError("Gemini API error: Status={Status}, Response={Response}", 
                    response.StatusCode, responseContent);
                throw new HttpRequestException($"Gemini API returned {response.StatusCode}: {responseContent}");
            }

            var jsonDoc = JsonDocument.Parse(responseContent);

            if (jsonDoc.RootElement.TryGetProperty("candidates", out var candidates) &&
                candidates.GetArrayLength() > 0 &&
                candidates[0].TryGetProperty("content", out var contentElement) &&
                contentElement.TryGetProperty("parts", out var parts) &&
                parts.GetArrayLength() > 0 &&
                parts[0].TryGetProperty("text", out var textElement))
            {
                var responseText = textElement.GetString();
                return string.IsNullOrWhiteSpace(responseText)
                    ? "I apologize, but I couldn't generate a response. Please try again."
                    : responseText;
            }

            _logger.LogError("Invalid Gemini API response format: {Response}", responseContent);
            throw new Exception("Invalid response format from Gemini API");
        }
    }

    public class ChatRequest
    {
        public string Message { get; set; } = string.Empty;
    }
}
