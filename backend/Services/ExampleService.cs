using Backend.Models;
using Backend.Repositories;

namespace Backend.Services
{
    public class ExampleService : IExampleService
    {
        private readonly IRepository<ExampleModel> _repository;

        public ExampleService(IRepository<ExampleModel> repository)
        {
            _repository = repository;
        }

        public async Task<IEnumerable<ExampleModel>> GetAllAsync()
        {
            return await _repository.GetAllAsync();
        }

        public async Task<ExampleModel?> GetByIdAsync(int id)
        {
            return await _repository.GetByIdAsync(id);
        }

        public async Task<ExampleModel> CreateAsync(ExampleModel model)
        {
            model.CreatedAt = DateTime.UtcNow;
            return await _repository.CreateAsync(model);
        }

        public async Task<bool> UpdateAsync(ExampleModel model)
        {
            var existing = await _repository.GetByIdAsync(model.Id);
            if (existing == null)
            {
                return false;
            }

            model.UpdatedAt = DateTime.UtcNow;
            return await _repository.UpdateAsync(model);
        }

        public async Task<bool> DeleteAsync(int id)
        {
            return await _repository.DeleteAsync(id);
        }
    }
}

