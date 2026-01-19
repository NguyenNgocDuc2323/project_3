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
                var geminiApiKey = Environment.GetEnvironmentVariable("GOOGLE_GEMINI_API_KEY") 
                    ?? _configuration["GoogleGemini:ApiKey"];
                var model = Environment.GetEnvironmentVariable("GOOGLE_GEMINI_MODEL") 
                    ?? _configuration["GoogleGemini:Model"] 
                    ?? "gemini-2.5-flash";
                
                if (string.IsNullOrWhiteSpace(geminiApiKey))
                {
                    _logger.LogInformation("Google Gemini API key not configured, using mock responses");
                    var mockResponse = GenerateMockResponse(request.Message);
                    await Task.Delay(500);
                    return Ok(new { response = mockResponse, mode = "mock" });
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
                        _logger.LogWarning("Google Gemini model not found (404). Falling back to mock responses.");
                        var mockResponse = GenerateMockResponse(request.Message);
                        return Ok(new
                        {
                            response = mockResponse,
                            mode = "mock",
                            warning = "Google Gemini API model không tìm thấy. Đang dùng mock response."
                        });
                    }

                    if (is503)
                    {
                        _logger.LogWarning("Google Gemini service overloaded (503). Falling back to mock responses.");
                        var mockResponse = GenerateMockResponse(request.Message);
                        return Ok(new
                        {
                            response = mockResponse,
                            mode = "mock",
                            warning = "Google Gemini API đang quá tải. Vui lòng thử lại sau. Đang dùng mock response."
                        });
                    }

                    if (isQuota)
                    {
                        _logger.LogWarning("Google Gemini quota/rate limit detected. Falling back to mock responses.");
                        var mockResponse = GenerateMockResponse(request.Message);
                        return Ok(new
                        {
                            response = mockResponse,
                            mode = "mock",
                            warning = "Google Gemini API đã hết quota / rate limit. Đang dùng mock response."
                        });
                    }

                    _logger.LogWarning("Google Gemini API error. Falling back to mock responses.");
                    var fallbackResponse = GenerateMockResponse(request.Message);
                    return Ok(new
                    {
                        response = fallbackResponse,
                        mode = "mock",
                        warning = $"Google Gemini API lỗi: {message}. Đang dùng mock response."
                    });
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error processing chat message");
                return StatusCode(500, new { error = "An error occurred while processing your request. Please try again later." });
            }
        }

        private string GenerateMockResponse(string userMessage)
        {
            var message = userMessage.ToLower().Trim();

            if (message.Contains("hello") || message.Contains("hi") || message.Contains("hey"))
            {
                return "Hello! I'm your AI assistant. I'm currently running in mock mode for local development. How can I help you today?";
            }
            else if (message.Contains("xinh") || message.Contains("đẹp") || message.Contains("cute") || message.Contains("dễ thương"))
            {
                return "Mình không thể đánh giá ngoại hình nếu không thấy ảnh, nhưng chắc chắn bạn có nét dễ thương theo cách riêng. Bạn muốn mình góp ý về phong cách (tóc/đồ/skin-care) không?";
            }
            else if (message.Contains("book") || message.Contains("story") || message.Contains("read"))
            {
                return "We have a great collection of books and stories! You can browse by category or check out our featured books on the homepage. What type of books are you interested in?";
            }
            else if (message.Contains("price") || message.Contains("cost") || message.Contains("buy"))
            {
                return "For pricing information and purchasing details, please check individual book pages or contact us. Would you like help finding a specific book?";
            }
            else if (message.Contains("thank") || message.Contains("thanks"))
            {
                return "You're welcome! I'm happy to help. Feel free to ask if you have any other questions!";
            }
            else if (message.Contains("bye") || message.Contains("goodbye") || message.Contains("see you"))
            {
                return "Goodbye! Have a great day. See you again soon!";
            }
            else if (message.Contains("help") || message.Contains("support"))
            {
                return "I can help you with:\n- Finding books and stories\n- Browsing by categories\n- Website navigation\n- Answering common questions\n\nWhat would you like help with?";
            }
            else
            {
                return "Mình đang chạy mock mode nên trả lời sẽ hơi chung chung. Bạn có thể hỏi mình về:\n- Tìm sách/câu chuyện\n- Gợi ý theo thể loại\n- Cách dùng website\n\nBạn muốn mình giúp cụ thể phần nào?";
            }
        }

        private async Task<string> GenerateGeminiResponse(string userMessage, string apiKey, string model)
        {
            var systemPrompt = "You are a helpful AI assistant for a book and story website. " +
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
