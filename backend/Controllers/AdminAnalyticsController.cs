using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Backend.Data;

namespace Backend.Controllers
{
    [ApiController]
    [Route("api/admin/analytics")]
    [Authorize(Roles = "1")] // Admin
    public class AdminAnalyticsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public AdminAnalyticsController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet("revenue")]
        public async Task<ActionResult<RevenueSeriesDto>> GetRevenue([FromQuery] string period = "month")
        {
            var normalized = (period ?? "month").Trim().ToLowerInvariant();
            var today = DateTime.UtcNow.Date;
            DateTime start;
            int buckets;
            Func<DateTime, string> labelFormatter;

            if (normalized == "day")
            {
                buckets = 7;
                start = today.AddDays(-(buckets - 1));
                labelFormatter = date => date.ToString("MMM d");
            }
            else if (normalized == "week")
            {
                buckets = 8;
                start = StartOfWeek(today).AddDays(-(7 * (buckets - 1)));
                labelFormatter = date => $"Week of {date:MMM d}";
            }
            else
            {
                normalized = "month";
                buckets = 12;
                start = new DateTime(today.Year, today.Month, 1).AddMonths(-(buckets - 1));
                labelFormatter = date => date.ToString("MMM yyyy");
            }

            var orders = await _context.Orders
                .AsNoTracking()
                .Where(o => o.CreatedAt >= start && o.Status != "Cancelled")
                .ToListAsync();

            var points = new List<RevenuePointDto>();
            for (var i = 0; i < buckets; i++)
            {
                DateTime bucketStart;
                DateTime bucketEnd;

                if (normalized == "day")
                {
                    bucketStart = start.AddDays(i);
                    bucketEnd = bucketStart.AddDays(1);
                }
                else if (normalized == "week")
                {
                    bucketStart = start.AddDays(i * 7);
                    bucketEnd = bucketStart.AddDays(7);
                }
                else
                {
                    bucketStart = start.AddMonths(i);
                    bucketEnd = bucketStart.AddMonths(1);
                }

                var total = orders
                    .Where(o => o.CreatedAt >= bucketStart && o.CreatedAt < bucketEnd)
                    .Sum(o => o.Total);

                points.Add(new RevenuePointDto
                {
                    Label = labelFormatter(bucketStart),
                    Total = total
                });
            }

            return Ok(new RevenueSeriesDto
            {
                Period = normalized,
                Total = points.Sum(p => p.Total),
                Points = points
            });
        }

        private static DateTime StartOfWeek(DateTime date)
        {
            var diff = (7 + (date.DayOfWeek - DayOfWeek.Monday)) % 7;
            return date.AddDays(-1 * diff).Date;
        }

        public class RevenueSeriesDto
        {
            public string Period { get; set; } = "month";
            public decimal Total { get; set; }
            public List<RevenuePointDto> Points { get; set; } = new List<RevenuePointDto>();
        }

        public class RevenuePointDto
        {
            public string Label { get; set; } = string.Empty;
            public decimal Total { get; set; }
        }
    }
}
