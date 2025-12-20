import apiClient from '../axios'

/**
 * Admin Story Service
 * Full CRUD operations for administrators
 */
export const adminStoryService = {
  /**
   * Get all stories for admin management
   */
  async getAll() {
    const response = await apiClient.get('/admin/stories')
    return response.data
  },

  /**
   * Get a single story by ID
   */
  async getById(id) {
    const response = await apiClient.get(`/admin/stories/${id}`)
    return response.data
  },

  /**
   * Update a story
   */
  async update(id, story) {
    const response = await apiClient.put(`/admin/stories/${id}`, story)
    return response.data
  },

  /**
   * Delete a story
   */
  async delete(id) {
    const response = await apiClient.delete(`/admin/stories/${id}`)
    return response.data
  },

  /**
   * Get admin statistics
   */
  async getStats() {
    const response = await apiClient.get('/admin/stories/stats')
    return response.data
  }
}

