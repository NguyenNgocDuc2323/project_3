import apiClient from '../axios'

/**
 * User Story Service
 * Read-only operations for regular users
 */
export const userStoryService = {
  /**
   * Get all stories (optionally filter by featured)
   */
  async getAll(featured = false) {
    const response = await apiClient.get('/story', {
      params: { featured }
    })
    return response.data
  },

  /**
   * Get a single story by ID
   */
  async getById(id) {
    const response = await apiClient.get(`/story/${id}`)
    return response.data
  },

  /**
   * Get popular stories
   */
  async getPopular(limit = 5) {
    const response = await apiClient.get('/story/popular', {
      params: { limit }
    })
    return response.data
  },

  /**
   * Get statistics (read-only for users)
   */
  async getStats() {
    const response = await apiClient.get('/story/stats')
    return response.data
  }
}

