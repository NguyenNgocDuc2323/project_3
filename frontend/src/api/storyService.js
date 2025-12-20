import apiClient from './axios'

export const storyService = {
  async getAll(featured = false) {
    const response = await apiClient.get('/story', {
      params: { featured }
    })
    return response.data
  },

  async getById(id) {
    const response = await apiClient.get(`/story/${id}`)
    return response.data
  },

  async getPopular(limit = 5) {
    const response = await apiClient.get('/story/popular', {
      params: { limit }
    })
    return response.data
  },

  async getStats() {
    const response = await apiClient.get('/story/stats')
    return response.data
  }
}



