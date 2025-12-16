using Backend.Models;

namespace Backend.Services
{
    public interface IExampleService
    {
        Task<IEnumerable<ExampleModel>> GetAllAsync();
        Task<ExampleModel?> GetByIdAsync(int id);
        Task<ExampleModel> CreateAsync(ExampleModel model);
        Task<bool> UpdateAsync(ExampleModel model);
        Task<bool> DeleteAsync(int id);
    }
}

