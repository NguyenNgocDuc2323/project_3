using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using OpenAI;
using OpenAI.Chat;

namespace Backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class ChatController : ControllerBase
    {
        private readonly IConfiguration _configuration;
        private readonly ILogger<ChatController> _logger;

        public ChatController(IConfiguration configuration, ILogger<ChatController> logger)
        {
            _configuration = configuration;
            _logger = logger;
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
                var apiKey = _configuration["OpenAI:ApiKey"];
                
                if (string.IsNullOrWhiteSpace(apiKey) || 
                    !apiKey.StartsWith("sk-", StringComparison.OrdinalIgnoreCase))
                {
                    _logger.LogInformation("OpenAI API key not configured, using mock responses");
                    var mockResponse = GenerateMockResponse(request.Message);
                    await Task.Delay(500);
                    return Ok(new { response = mockResponse });
                }

                var response = await GenerateAIResponse(request.Message, apiKey);
                return Ok(new { response });
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
                return $"Thanks for your message about \"{userMessage}\". I understand you're interested in this topic. For better assistance, you can:\n- Browse books by category\n- Check out featured books\n- Contact us for detailed support\n\nDo you have any specific questions?";
            }
        }

        private async Task<string> GenerateAIResponse(string userMessage, string apiKey)
        {
            try
            {
                var openAIClient = new OpenAIClient(apiKey);
                var chatClient = openAIClient.GetChatClient("gpt-3.5-turbo");

                var systemPrompt = "You are a helpful AI assistant for a book and story website. " +
                    "You help customers find books, answer questions about the website, and provide recommendations. " +
                    "Be friendly, concise, and helpful. Keep responses under 200 words.";

                var chatMessages = new List<ChatMessage>
                {
                    new SystemChatMessage(systemPrompt),
                    new UserChatMessage(userMessage)
                };

                var chatCompletion = await chatClient.CompleteChatAsync(chatMessages);

                if (chatCompletion?.Value?.Content != null && chatCompletion.Value.Content.Count > 0)
                {
                    var content = chatCompletion.Value.Content[0];
                    if (content is TextContent textContent)
                    {
                        return textContent.Text ?? "I apologize, but I couldn't generate a response. Please try again.";
                    }
                }

                return "I apologize, but I couldn't generate a response. Please try again.";
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error calling OpenAI API: {Message}", ex.Message);
                throw;
            }
        }
    }

    public class ChatRequest
    {
        public string Message { get; set; } = string.Empty;
    }
}
