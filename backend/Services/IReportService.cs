using Backend.Services;

namespace Backend.Services
{
    public interface IReportService
    {
        Task<SalesSummaryDto> GetSalesSummaryAsync(DateTime? fromUtc, DateTime? toUtc);
        Task<ChartDataDto> GetChartDataAsync(DateTime? fromUtc, DateTime? toUtc);
        Task<IReadOnlyList<ProductSalesDto>> GetProductSalesAsync(DateTime? fromUtc, DateTime? toUtc, int top);
        Task<IReadOnlyList<UserSalesDto>> GetUserSalesAsync(DateTime? fromUtc, DateTime? toUtc, int top);
        Task<IReadOnlyList<InvoiceDto>> GetInvoicesAsync(DateTime? fromUtc, DateTime? toUtc, string? status);
    }

    public class ChartDataDto
    {
        public List<RevenueByMonthDto> RevenueByMonth { get; set; } = new();
        public List<OrdersByStatusDto> OrdersByStatus { get; set; } = new();
    }

    public class RevenueByMonthDto
    {
        public string Month { get; set; } = string.Empty;
        public int Year { get; set; }
        public decimal Revenue { get; set; }
        public int OrderCount { get; set; }
    }

    public class OrdersByStatusDto
    {
        public string Status { get; set; } = string.Empty;
        public int Count { get; set; }
    }

    public class SalesSummaryDto
    {
        public DateTime? From { get; set; }
        public DateTime? To { get; set; }
        public decimal TotalRevenue { get; set; }
        public int OrdersCount { get; set; }
        public int CustomersCount { get; set; }
        public decimal AverageOrderValue { get; set; }
        public int PaidOrdersCount { get; set; }
    }

    public class ProductSalesDto
    {
        public int ProductId { get; set; }
        public string ProductName { get; set; } = string.Empty;
        public string? ImageUrl { get; set; }
        public int Quantity { get; set; }
        public decimal Revenue { get; set; }
    }

    public class UserSalesDto
    {
        public int UserId { get; set; }
        public string? Username { get; set; }
        public string? FullName { get; set; }
        public string? Email { get; set; }
        public int OrdersCount { get; set; }
        public decimal TotalSpent { get; set; }
        public decimal AverageOrderValue { get; set; }
    }

    public class InvoiceDto
    {
        public int PaymentId { get; set; }
        public int OrderId { get; set; }
        public int UserId { get; set; }
        public string? Username { get; set; }
        public string? FullName { get; set; }
        public decimal Amount { get; set; }
        public string Currency { get; set; } = "VND";
        public string Status { get; set; } = string.Empty;
        public string? Provider { get; set; }
        public string? Method { get; set; }
        public string? Reference { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? PaidAt { get; set; }
    }
}

