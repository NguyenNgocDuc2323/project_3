using System.Net;
using System.Security.Cryptography;
using System.Text;
using System.Web;
using Microsoft.Extensions.Options;

namespace Backend.Services
{
    public class PaymentService : IPaymentService
    {
        private readonly IConfiguration _configuration;

        public PaymentService(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        public string CreateVnpayPaymentUrl(int orderId, decimal amount, string ipAddress)
        {
            var vnpayConfig = _configuration.GetSection("Vnpay");
            var tmnCode = vnpayConfig["TmnCode"];
            var hashSecret = vnpayConfig["HashSecret"];
            var baseUrl = vnpayConfig["BaseUrl"];
            var returnUrl = vnpayConfig["ReturnUrl"];

            var payData = new SortedList<string, string>
            {
                { "vnp_Version", "2.1.0" },
                { "vnp_Command", "pay" },
                { "vnp_TmnCode", tmnCode },
                { "vnp_Amount", ((long)(amount * 100)).ToString() },
                { "vnp_CreateDate", DateTime.Now.ToString("yyyyMMddHHmmss") },
                { "vnp_CurrCode", "VND" },
                { "vnp_IpAddr", ipAddress },
                { "vnp_Locale", "vn" },
                { "vnp_OrderInfo", "Thanh toan don hang " + orderId },
                { "vnp_OrderType", "other" },
                { "vnp_ReturnUrl", returnUrl },
                { "vnp_TxnRef", orderId.ToString() }
            };

            StringBuilder data = new StringBuilder();
            foreach (KeyValuePair<string, string> kv in payData)
            {
                if (!string.IsNullOrEmpty(kv.Value))
                {
                    data.Append(WebUtility.UrlEncode(kv.Key) + "=" + WebUtility.UrlEncode(kv.Value) + "&");
                }
            }

            string queryString = data.ToString();
            string rawData = queryString.Remove(queryString.Length - 1);
            string secureHash = HmacSha512(hashSecret, rawData);

            return baseUrl + "?" + queryString + "vnp_SecureHash=" + secureHash;
        }

        public string CreateMomoPaymentUrl(int orderId, decimal amount)
        {
            var momoConfig = _configuration.GetSection("Momo");
            var baseUrl = momoConfig["BaseUrl"];
            return $"https://test-payment.momo.vn/pay?orderId={orderId}&amount={amount}";
        }

        public string CreatePaypalPaymentUrl(int orderId, decimal amount)
        {
            return $"https://www.sandbox.paypal.com/checkoutnow?orderId={orderId}&amount={amount}";
        }

        public async Task<string> CreateZalopayPaymentUrl(int orderId, decimal amount)
        {
            var config = _configuration.GetSection("ZaloPay");
            var appid = config["AppId"];
            var key1 = config["Key1"];
            var createOrderUrl = config["BaseUrl"];

            var param = new Dictionary<string, string>
            {
                { "app_id", appid },
                { "app_user", "YashGemsUser" },
                { "app_time", DateTimeOffset.Now.ToUnixTimeMilliseconds().ToString() },
                { "amount", ((long)amount).ToString() },
                { "app_trans_id", $"{DateTime.Now:yyMMdd}_{orderId}_{DateTimeOffset.Now.ToUnixTimeSeconds()}" },
                { "embed_data", "{}" },
                { "item", "[]" },
                { "description", $"Thanh toan don hang #{orderId}" },
                { "bank_code", "" }
            };

            var data = $"{param["app_id"]}|{param["app_trans_id"]}|{param["app_user"]}|{param["amount"]}|{param["app_time"]}|{param["embed_data"]}|{param["item"]}";
            param.Add("mac", HmacSha256(key1, data));

            using var client = new HttpClient();
            var content = new FormUrlEncodedContent(param);
            var response = await client.PostAsync(createOrderUrl, content);
            var result = await response.Content.ReadFromJsonAsync<ZaloPayResponse>();

            return result?.order_url ?? "";
        }

        private string HmacSha512(string key, string inputData)
        {
            var hash = new StringBuilder();
            byte[] keyBytes = Encoding.UTF8.GetBytes(key);
            byte[] inputBytes = Encoding.UTF8.GetBytes(inputData);
            using (var hmac = new HMACSHA512(keyBytes))
            {
                byte[] hashValue = hmac.ComputeHash(inputBytes);
                foreach (var theByte in hashValue)
                {
                    hash.Append(theByte.ToString("x2"));
                }
            }
            return hash.ToString();
        }

        private string HmacSha256(string key, string inputData)
        {
            var hash = new StringBuilder();
            byte[] keyBytes = Encoding.UTF8.GetBytes(key);
            byte[] inputBytes = Encoding.UTF8.GetBytes(inputData);
            using (var hmac = new HMACSHA256(keyBytes))
            {
                byte[] hashValue = hmac.ComputeHash(inputBytes);
                foreach (var theByte in hashValue)
                {
                    hash.Append(theByte.ToString("x2"));
                }
            }
            return hash.ToString();
        }

        public class ZaloPayResponse
        {
            public int return_code { get; set; }
            public string? return_message { get; set; }
            public int sub_return_code { get; set; }
            public string? sub_return_message { get; set; }
            public string? order_url { get; set; }
            public string? zp_trans_token { get; set; }
        }
    }
}
