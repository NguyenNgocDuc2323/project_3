import apiClient from '../axios'

export const adminUserService = {
  async getAll() {
    const response = await apiClient.get('/admin/users')
    return response.data
  },

  async getById(id) {
    const response = await apiClient.get(`/admin/users/${id}`)
    return response.data
  },

  async update(id, user) {
    const response = await apiClient.put(`/admin/users/${id}`, user)
    return response.data
  },

  async delete(id) {
    await apiClient.delete(`/admin/users/${id}`)
  },

  async getStats() {
    const response = await apiClient.get('/admin/users/stats')
    return response.data
  }
}

