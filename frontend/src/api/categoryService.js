import apiClient from './axios'

export const categoryService = {
  async getAll() {
    const response = await apiClient.get('/category')
    return response.data
  },

  async getById(id) {
    const response = await apiClient.get(`/category/${id}`)
    return response.data
  }
}

