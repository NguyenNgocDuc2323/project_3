import apiClient from './axios'

class BaseService {
  constructor(endpoint) {
    this.endpoint = endpoint
  }

  async getAll(params = {}) {
    return await apiClient.get(this.endpoint, { params })
  }

  async getById(id) {
    return await apiClient.get(`${this.endpoint}/${id}`)
  }

  async create(data) {
    return await apiClient.post(this.endpoint, data)
  }

  async update(id, data) {
    return await apiClient.put(`${this.endpoint}/${id}`, data)
  }

  async delete(id) {
    return await apiClient.delete(`${this.endpoint}/${id}`)
  }
}

export default BaseService

