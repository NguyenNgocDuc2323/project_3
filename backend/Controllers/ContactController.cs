using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Backend.Models;
using Backend.Data;
using Backend.Services;
using Microsoft.EntityFrameworkCore;

namespace Backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ContactController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<ContactController> _logger;
        private readonly IEmailService _emailService;

        public ContactController(ApplicationDbContext context, ILogger<ContactController> logger, IEmailService emailService)
        {
            _context = context;
            _logger = logger;
            _emailService = emailService;
        }

        [HttpPost("submit")]
        public async Task<ActionResult<object>> SubmitContact([FromBody] ContactRequest request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {
                var contact = new Contact
                {
                    Name = request.Name,
                    Email = request.Email,
                    Phone = request.Phone,
                    Subject = request.Subject,
                    Message = request.Message,
                    CreatedAt = DateTime.UtcNow,
                    IsResolved = false
                };

                _context.Contacts.Add(contact);
                await _context.SaveChangesAsync();

                // Send confirmation email to user
                await _emailService.SendEmailAsync(
                    contact.Email,
                    "Contact Form Confirmation",
                    $"Thank you for contacting us. We have received your message and will get back to you soon.\n\nSubject: {contact.Subject}"
                );

                _logger.LogInformation($"New contact form submitted from {contact.Email}");

                return Ok(new
                {
                    success = true,
                    message = "Your message has been sent successfully. We will get back to you soon.",
                    contactId = contact.Id
                });
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error submitting contact form: {ex.Message}");
                return StatusCode(500, new
                {
                    success = false,
                    message = "An error occurred while submitting your message. Please try again later."
                });
            }
        }

        [HttpGet]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<List<Contact>>> GetAllContacts()
        {
            try
            {
                var contacts = await _context.Contacts
                    .OrderByDescending(c => c.CreatedAt)
                    .ToListAsync();

                return Ok(contacts);
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error retrieving contacts: {ex.Message}");
                return StatusCode(500, new
                {
                    success = false,
                    message = "An error occurred while retrieving contacts."
                });
            }
        }

        [HttpGet("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<Contact>> GetContactById(int id)
        {
            try
            {
                var contact = await _context.Contacts.FindAsync(id);
                if (contact == null)
                {
                    return NotFound();
                }

                return Ok(contact);
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error retrieving contact: {ex.Message}");
                return StatusCode(500, new
                {
                    success = false,
                    message = "An error occurred while retrieving the contact."
                });
            }
        }

        [HttpPut("{id}/resolve")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<object>> ResolveContact(int id, [FromBody] ResolveContactRequest request)
        {
            try
            {
                var contact = await _context.Contacts.FindAsync(id);
                if (contact == null)
                {
                    return NotFound();
                }

                contact.IsResolved = true;
                contact.AdminResponse = request.Response;

                _context.Contacts.Update(contact);
                await _context.SaveChangesAsync();

                // Send response email to user
                await _emailService.SendEmailAsync(
                    contact.Email,
                    $"Re: {contact.Subject}",
                    request.Response
                );

                return Ok(new
                {
                    success = true,
                    message = "Contact has been marked as resolved."
                });
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error resolving contact: {ex.Message}");
                return StatusCode(500, new
                {
                    success = false,
                    message = "An error occurred while resolving the contact."
                });
            }
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<object>> DeleteContact(int id)
        {
            try
            {
                var contact = await _context.Contacts.FindAsync(id);
                if (contact == null)
                {
                    return NotFound();
                }

                _context.Contacts.Remove(contact);
                await _context.SaveChangesAsync();

                return Ok(new
                {
                    success = true,
                    message = "Contact has been deleted."
                });
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error deleting contact: {ex.Message}");
                return StatusCode(500, new
                {
                    success = false,
                    message = "An error occurred while deleting the contact."
                });
            }
        }
    }

    public class ContactRequest
    {
        [Required]
        [StringLength(100)]
        public string Name { get; set; } = string.Empty;

        [Required]
        [StringLength(255)]
        [EmailAddress]
        public string Email { get; set; } = string.Empty;

        [StringLength(20)]
        public string Phone { get; set; } = string.Empty;

        [Required]
        [StringLength(100)]
        public string Subject { get; set; } = string.Empty;

        [Required]
        [StringLength(5000)]
        public string Message { get; set; } = string.Empty;
    }

    public class ResolveContactRequest
    {
        [Required]
        [StringLength(500)]
        public string Response { get; set; } = string.Empty;
    }
}
