using Backend.Data;
using Backend.Models;
using Microsoft.EntityFrameworkCore;

namespace Backend.Services
{
    public class ReportService : IReportService
    {
        private readonly ApplicationDbContext _context;

        public ReportService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<SalesSummaryDto> GetSalesSummaryAsync(DateTime? fromUtc, DateTime? toUtc)
        {
            var query = _context.Orders.AsNoTracking().AsQueryable();

            query = query.Where(o => o.Status != "Cancelled");

            if (fromUtc.HasValue)
            {
                query = query.Where(o => o.CreatedAt >= fromUtc.Value);
            }

            if (toUtc.HasValue)
            {
                query = query.Where(o => o.CreatedAt <= toUtc.Value);
            }

            var orders = await query.ToListAsync();

            var totalRevenue = orders.Sum(o => o.Total);
            var ordersCount = orders.Count;
            var customersCount = orders.Select(o => o.UserId).Distinct().Count();
            var paidOrdersCount = orders.Count(o => o.Status == "Paid" || o.Status == "Completed");
            var averageOrderValue = ordersCount > 0 ? totalRevenue / ordersCount : 0m;

            return new SalesSummaryDto
            {
                From = fromUtc,
                To = toUtc,
                TotalRevenue = totalRevenue,
                OrdersCount = ordersCount,
                CustomersCount = customersCount,
                PaidOrdersCount = paidOrdersCount,
                AverageOrderValue = averageOrderValue
            };
        }

        public async Task<ChartDataDto> GetChartDataAsync(DateTime? fromUtc, DateTime? toUtc)
        {
            var query = _context.Orders.AsNoTracking()
                .Where(o => o.Status != "Cancelled");

            if (fromUtc.HasValue)
                query = query.Where(o => o.CreatedAt >= fromUtc.Value);
            if (toUtc.HasValue)
                query = query.Where(o => o.CreatedAt <= toUtc.Value);

            var orders = await query.ToListAsync();

            var revenueByMonth = orders
                .GroupBy(o => new { Year = o.CreatedAt.Year, Month = o.CreatedAt.Month })
                .OrderBy(g => g.Key.Year).ThenBy(g => g.Key.Month)
                .Select(g => new RevenueByMonthDto
                {
                    Year = g.Key.Year,
                    Month = new DateTime(g.Key.Year, g.Key.Month, 1).ToString("MMM"),
                    Revenue = g.Sum(o => o.Total),
                    OrderCount = g.Count()
                })
                .ToList();

            var ordersByStatus = orders
                .GroupBy(o => o.Status ?? "Unknown")
                .Select(g => new OrdersByStatusDto { Status = g.Key, Count = g.Count() })
                .OrderByDescending(x => x.Count)
                .ToList();

            return new ChartDataDto
            {
                RevenueByMonth = revenueByMonth,
                OrdersByStatus = ordersByStatus
            };
        }

        public async Task<IReadOnlyList<ProductSalesDto>> GetProductSalesAsync(DateTime? fromUtc, DateTime? toUtc, int top)
        {
            if (top <= 0)
            {
                top = 10;
            }

            var query = _context.OrderItems
                .AsNoTracking()
                .Include(oi => oi.Order)
                .Include(oi => oi.Product)
                .Where(oi => oi.Order != null && oi.Order.Status != "Cancelled");

            if (fromUtc.HasValue)
            {
                query = query.Where(oi => oi.Order!.CreatedAt >= fromUtc.Value);
            }

            if (toUtc.HasValue)
            {
                query = query.Where(oi => oi.Order!.CreatedAt <= toUtc.Value);
            }

            var grouped = await query
                .GroupBy(oi => new { oi.ProductId, oi.Product!.Name, oi.Product.ImageUrl })
                .Select(g => new ProductSalesDto
                {
                    ProductId = g.Key.ProductId,
                    ProductName = g.Key.Name,
                    ImageUrl = g.Key.ImageUrl,
                    Quantity = g.Sum(x => x.Quantity),
                    Revenue = g.Sum(x => x.TotalPrice)
                })
                .OrderByDescending(x => x.Revenue)
                .ThenByDescending(x => x.Quantity)
                .Take(top)
                .ToListAsync();

            return grouped;
        }

        public async Task<IReadOnlyList<UserSalesDto>> GetUserSalesAsync(DateTime? fromUtc, DateTime? toUtc, int top)
        {
            if (top <= 0)
            {
                top = 10;
            }

            var query = _context.Orders
                .AsNoTracking()
                .Include(o => o.User)
                .Where(o => o.Status != "Cancelled");

            if (fromUtc.HasValue)
            {
                query = query.Where(o => o.CreatedAt >= fromUtc.Value);
            }

            if (toUtc.HasValue)
            {
                query = query.Where(o => o.CreatedAt <= toUtc.Value);
            }

            var grouped = await query
                .GroupBy(o => new { o.UserId, o.User!.Username, o.User.FullName, o.User.Email })
                .Select(g => new UserSalesDto
                {
                    UserId = g.Key.UserId,
                    Username = g.Key.Username,
                    FullName = g.Key.FullName,
                    Email = g.Key.Email,
                    OrdersCount = g.Count(),
                    TotalSpent = g.Sum(x => x.Total),
                    AverageOrderValue = g.Count() > 0 ? g.Sum(x => x.Total) / g.Count() : 0m
                })
                .OrderByDescending(x => x.TotalSpent)
                .ThenByDescending(x => x.OrdersCount)
                .Take(top)
                .ToListAsync();

            return grouped;
        }

        public async Task<IReadOnlyList<InvoiceDto>> GetInvoicesAsync(DateTime? fromUtc, DateTime? toUtc, string? status)
        {
            var payments = _context.Payments
                .AsNoTracking()
                .Include(p => p.User)
                .Include(p => p.Order)
                .AsQueryable();

            if (!string.IsNullOrWhiteSpace(status))
            {
                var normalized = status.Trim();
                payments = payments.Where(p => p.Status == normalized);
            }

            if (fromUtc.HasValue)
            {
                payments = payments.Where(p => p.CreatedAt >= fromUtc.Value);
            }

            if (toUtc.HasValue)
            {
                payments = payments.Where(p => p.CreatedAt <= toUtc.Value);
            }

            var result = await payments
                .OrderByDescending(p => p.CreatedAt)
                .Select(p => new InvoiceDto
                {
                    PaymentId = p.Id,
                    OrderId = p.OrderId,
                    UserId = p.UserId,
                    Username = p.User != null ? p.User.Username : null,
                    FullName = p.User != null ? p.User.FullName : null,
                    Amount = p.Amount,
                    Currency = p.Currency,
                    Status = p.Status,
                    Provider = p.Provider,
                    Method = p.Method,
                    Reference = p.Reference,
                    CreatedAt = p.CreatedAt,
                    PaidAt = p.PaidAt
                })
                .ToListAsync();

            return result;
        }
    }
}

