using Backend.Models;
using QuestPDF;
using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;

namespace Backend.Services;

public class InvoicePdfService : IInvoicePdfService
{
    static InvoicePdfService()
    {
        QuestPDF.Settings.License = LicenseType.Community;
    }

    public byte[] GenerateOrderInvoice(Order order)
    {
        var doc = Document.Create(container =>
        {
            container.Page(page =>
            {
                page.Size(PageSizes.A4);
                page.Margin(25);

                page.Header().Column(column =>
                {
                    column.Item().AlignCenter().Text("INVOICE").Bold().FontSize(18);
                    column.Item().AlignCenter().Text($"Order #{order.Id}").FontSize(12).Italic();
                });

                page.Content().PaddingVertical(15).Column(content =>
                {
                    content.Item().Row(row =>
                    {
                        row.RelativeItem().Column(col =>
                        {
                            col.Item().Text("Customer").Bold().FontSize(10);
                            col.Item().Text(order.User?.FullName ?? order.User?.Username ?? "—").FontSize(10);
                            col.Item().Text(order.User?.Email ?? "—").FontSize(9);
                            col.Item().Text(order.User?.Phone ?? "—").FontSize(9);
                            col.Item().PaddingTop(6).Text("Shipping address:").Bold().FontSize(9);
                            col.Item().Text(order.ShippingAddress ?? "—").FontSize(9);
                        });
                        row.RelativeItem().Column(col =>
                        {
                            col.Item().AlignRight().Text($"Order date: {order.CreatedAt:dd/MM/yyyy HH:mm}").FontSize(9);
                            col.Item().AlignRight().Text($"Payment: {order.PaymentMethod ?? "—"}").FontSize(9);
                            col.Item().AlignRight().Text($"Status: {order.Status}").FontSize(9);
                        });
                    });

                    content.Item().PaddingVertical(10).LineHorizontal(1).LineColor(Colors.Grey.Lighten2);

                    content.Item().Table(table =>
                    {
                        table.ColumnsDefinition(columns =>
                        {
                            columns.ConstantColumn(30);
                            columns.RelativeColumn(3);
                            columns.ConstantColumn(60);
                            columns.ConstantColumn(70);
                            columns.ConstantColumn(90);
                        });

                        table.Header(header =>
                        {
                            header.Cell().Background(Colors.Grey.Lighten3).Padding(6).Text("#").Bold().FontSize(9);
                            header.Cell().Background(Colors.Grey.Lighten3).Padding(6).Text("Product").Bold().FontSize(9);
                            header.Cell().Background(Colors.Grey.Lighten3).Padding(6).AlignRight().Text("Qty").Bold().FontSize(9);
                            header.Cell().Background(Colors.Grey.Lighten3).Padding(6).AlignRight().Text("Unit price").Bold().FontSize(9);
                            header.Cell().Background(Colors.Grey.Lighten3).Padding(6).AlignRight().Text("Total").Bold().FontSize(9);
                        });

                        var items = order.Items?.ToList() ?? new List<OrderItem>();
                        for (var i = 0; i < items.Count; i++)
                        {
                            var it = items[i];
                            var idx = i + 1;
                            var name = it.Product?.Name ?? $"Product #{it.ProductId}";
                            table.Cell().BorderBottom(0.5f).BorderColor(Colors.Grey.Lighten2).Padding(5).Text(idx.ToString()).FontSize(9);
                            table.Cell().BorderBottom(0.5f).BorderColor(Colors.Grey.Lighten2).Padding(5).Text(name).FontSize(9);
                            table.Cell().BorderBottom(0.5f).BorderColor(Colors.Grey.Lighten2).Padding(5).AlignRight().Text(it.Quantity.ToString()).FontSize(9);
                            table.Cell().BorderBottom(0.5f).BorderColor(Colors.Grey.Lighten2).Padding(5).AlignRight().Text(FormatVnd(it.UnitPrice)).FontSize(9);
                            table.Cell().BorderBottom(0.5f).BorderColor(Colors.Grey.Lighten2).Padding(5).AlignRight().Text(FormatVnd(it.TotalPrice)).FontSize(9);
                        }
                    });

                    content.Item().PaddingTop(12).Row(row =>
                    {
                        row.RelativeItem();
                        row.ConstantItem(180).Column(col =>
                        {
                            col.Item().Row(r =>
                            {
                                r.RelativeItem().Text("Subtotal:").FontSize(10);
                                r.ConstantItem(90).AlignRight().Text(FormatVnd(order.Subtotal)).FontSize(10);
                            });
                            col.Item().Row(r =>
                            {
                                r.RelativeItem().Text("Total:").Bold().FontSize(11);
                                r.ConstantItem(90).AlignRight().Text(FormatVnd(order.Total)).Bold().FontSize(11);
                            });
                        });
                    });

                    content.Item().PaddingTop(20).AlignCenter().Text("Thank you for your order!").Italic().FontSize(10);
                });
            });
        });

        return doc.GeneratePdf();
    }

    private static string FormatVnd(decimal value)
    {
        return value.ToString("N0") + " ₫";
    }
}
