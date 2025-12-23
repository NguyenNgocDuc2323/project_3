import apiClient from './axios'

export const categoryService = {
  async getAll() {
    const response = await apiClient.get('/category')
    return response.data
  },

  async getById(id) {
    const response = await apiClient.get(`/category/${id}`)
    return response.data
  },

  async create(category) {
    const response = await apiClient.post('/category', category)
    return response.data
  },

  async update(id, category) {
    const response = await apiClient.put(`/category/${id}`, category)
    return response.data
  },

  async delete(id) {
    await apiClient.delete(`/category/${id}`)
  }
}

