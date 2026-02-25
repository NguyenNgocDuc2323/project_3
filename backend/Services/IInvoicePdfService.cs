using Backend.Models;

namespace Backend.Services;

public interface IInvoicePdfService
{
    byte[] GenerateOrderInvoice(Order order);
}
