using Microsoft.AspNetCore.Mvc;
using Backend.Models;
using Backend.Services;

namespace Backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ExampleController : ControllerBase
    {
        private readonly IExampleService _exampleService;

        public ExampleController(IExampleService exampleService)
        {
            _exampleService = exampleService;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<ExampleModel>>> GetExamples()
        {
            var examples = await _exampleService.GetAllAsync();
            return Ok(examples);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<ExampleModel>> GetExample(int id)
        {
            var example = await _exampleService.GetByIdAsync(id);
            
            if (example == null)
            {
                return NotFound();
            }

            return Ok(example);
        }

        [HttpPost]
        public async Task<ActionResult<ExampleModel>> CreateExample(ExampleModel example)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var created = await _exampleService.CreateAsync(example);
            return CreatedAtAction(nameof(GetExample), new { id = created.Id }, created);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateExample(int id, ExampleModel example)
        {
            if (id != example.Id)
            {
                return BadRequest();
            }

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var result = await _exampleService.UpdateAsync(example);
            if (!result)
            {
                return NotFound();
            }

            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteExample(int id)
        {
            var result = await _exampleService.DeleteAsync(id);
            if (!result)
            {
                return NotFound();
            }

            return NoContent();
        }
    }
}

