namespace Backend.Services
{
    public interface IPaymentService
    {
        string CreateVnpayPaymentUrl(int orderId, decimal amount, string ipAddress);
        Task<string> CreateZalopayPaymentUrl(int orderId, decimal amount);
        string CreateMomoPaymentUrl(int orderId, decimal amount);
        string CreatePaypalPaymentUrl(int orderId, decimal amount);
    }
}
