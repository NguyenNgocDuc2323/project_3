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
            if (request == null || string.IsNullOrWhiteSpace(request.Message))
            {
                return BadRequest(new { error = "Message is required" });
            }

            try
            {
                var groqKey = _configuration["Groq:ApiKey"]?.Trim();
                if (string.IsNullOrEmpty(groqKey))
                {
                    return StatusCode(500, new { error = "Chat not configured. Add Groq:ApiKey in appsettings.json (get free key at https://console.groq.com/keys)." });
                }

                var model = _configuration["Groq:Model"]?.Trim() ?? "llama-3.1-8b-instant";
                try
                {
                    var response = await GenerateGroqResponse(request.Message, groqKey, model);
                    return Ok(new { response, mode = "groq" });
                }
                catch (HttpRequestException ex)
                {
                    _logger.LogError(ex, "Groq error: {Message}", ex.Message);
                    return MapAIError(ex.Message);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error processing chat message");
                return StatusCode(500, new { error = ex.Message ?? "An error occurred. Please try again later." });
            }
        }

        private IActionResult MapAIError(string message)
        {
            var msg = message ?? "AI service error";
            if (msg.Contains("429", StringComparison.OrdinalIgnoreCase) || msg.Contains("rate limit", StringComparison.OrdinalIgnoreCase))
                return StatusCode(429, new { error = "Groq rate limit exceeded. Please wait a moment and try again." });
            if (msg.Contains("401", StringComparison.OrdinalIgnoreCase) || msg.Contains("403", StringComparison.OrdinalIgnoreCase) || msg.Contains("API key", StringComparison.OrdinalIgnoreCase))
                return StatusCode(403, new { error = "Invalid Groq API key. Check Groq:ApiKey in appsettings.json (get key at https://console.groq.com/keys)." });
            if (msg.Contains("404", StringComparison.OrdinalIgnoreCase))
                return StatusCode(404, new { error = "Model not found. Check Groq:Model (e.g. llama-3.1-8b-instant)." });
            return StatusCode(500, new { error = $"Groq error: {msg}" });
        }

        private async Task<string> GenerateGroqResponse(string userMessage, string apiKey, string model)
        {
            const string systemPrompt = "You are a helpful AI assistant for a jewelry website. Help customers find products, answer questions, and give recommendations. Be friendly and concise. Keep responses under 200 words.";
            var requestBody = new
            {
                model,
                messages = new[]
                {
                    new { role = "system", content = systemPrompt },
                    new { role = "user", content = userMessage }
                },
                max_tokens = 500
            };
            var json = JsonSerializer.Serialize(requestBody, new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.CamelCase });
            var request = new HttpRequestMessage(HttpMethod.Post, "https://api.groq.com/openai/v1/chat/completions")
            {
                Content = new StringContent(json, Encoding.UTF8, "application/json")
            };
            request.Headers.Add("Authorization", "Bearer " + apiKey);

            var response = await _httpClient.SendAsync(request);
            var responseContent = await response.Content.ReadAsStringAsync();

            if (!response.IsSuccessStatusCode)
            {
                _logger.LogError("Groq error: Status={Status}, Response={Response}", response.StatusCode, responseContent);
                throw new HttpRequestException($"Groq returned {response.StatusCode}: {responseContent}");
            }

            using var doc = JsonDocument.Parse(responseContent);
            var root = doc.RootElement;
            if (root.TryGetProperty("choices", out var choices) && choices.GetArrayLength() > 0
                && choices[0].TryGetProperty("message", out var message)
                && message.TryGetProperty("content", out var content))
            {
                var text = content.GetString();
                return string.IsNullOrWhiteSpace(text) ? "I couldn't generate a response. Please try again." : text.Trim();
            }
            throw new Exception("Invalid Groq response format");
        }
    }

    public class ChatRequest
    {
        public string Message { get; set; } = string.Empty;
    }
}
