using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Backend.Services;

namespace Backend.Controllers
{
    [ApiController]
    [Route("api/admin/reports")]
    [Authorize(Roles = "1")] // Admin
    public class AdminReportController : ControllerBase
    {
        private readonly IReportService _reportService;

        public AdminReportController(IReportService reportService)
        {
            _reportService = reportService;
        }

        [HttpGet("summary")]
        public async Task<ActionResult<SalesSummaryDto>> GetSalesSummary(
            [FromQuery] DateTimeOffset? from = null,
            [FromQuery] DateTimeOffset? to = null)
        {
            if (from.HasValue && to.HasValue && from.Value > to.Value)
            {
                return BadRequest(new { message = "From date must be earlier than (or equal to) To date" });
            }

            var fromUtc = from?.UtcDateTime;
            var toUtc = to?.UtcDateTime;

            var result = await _reportService.GetSalesSummaryAsync(fromUtc, toUtc);
            return Ok(result);
        }

        [HttpGet("chart")]
        public async Task<ActionResult<ChartDataDto>> GetChartData(
            [FromQuery] DateTimeOffset? from = null,
            [FromQuery] DateTimeOffset? to = null)
        {
            if (from.HasValue && to.HasValue && from.Value > to.Value)
            {
                return BadRequest(new { message = "From date must be earlier than (or equal to) To date" });
            }

            var fromUtc = from?.UtcDateTime;
            var toUtc = to?.UtcDateTime;

            var result = await _reportService.GetChartDataAsync(fromUtc, toUtc);
            return Ok(result);
        }

        [HttpGet("products")]
        public async Task<ActionResult<IEnumerable<ProductSalesDto>>> GetProductSales(
            [FromQuery] DateTimeOffset? from = null,
            [FromQuery] DateTimeOffset? to = null,
            [FromQuery] int top = 10)
        {
            if (from.HasValue && to.HasValue && from.Value > to.Value)
            {
                return BadRequest(new { message = "From date must be earlier than (or equal to) To date" });
            }

            var fromUtc = from?.UtcDateTime;
            var toUtc = to?.UtcDateTime;

            var result = await _reportService.GetProductSalesAsync(fromUtc, toUtc, top);
            return Ok(result);
        }

        [HttpGet("users")]
        public async Task<ActionResult<IEnumerable<UserSalesDto>>> GetUserSales(
            [FromQuery] DateTimeOffset? from = null,
            [FromQuery] DateTimeOffset? to = null,
            [FromQuery] int top = 10)
        {
            if (from.HasValue && to.HasValue && from.Value > to.Value)
            {
                return BadRequest(new { message = "From date must be earlier than (or equal to) To date" });
            }

            var fromUtc = from?.UtcDateTime;
            var toUtc = to?.UtcDateTime;

            var result = await _reportService.GetUserSalesAsync(fromUtc, toUtc, top);
            return Ok(result);
        }

        [HttpGet("invoices")]
        public async Task<ActionResult<IEnumerable<InvoiceDto>>> GetInvoices(
            [FromQuery] DateTimeOffset? from = null,
            [FromQuery] DateTimeOffset? to = null,
            [FromQuery] string? status = "Paid")
        {
            if (from.HasValue && to.HasValue && from.Value > to.Value)
            {
                return BadRequest(new { message = "From date must be earlier than (or equal to) To date" });
            }

            var fromUtc = from?.UtcDateTime;
            var toUtc = to?.UtcDateTime;

            var result = await _reportService.GetInvoicesAsync(fromUtc, toUtc, status);
            return Ok(result);
        }
    }
}

