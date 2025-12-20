import apiClient from './axios'

export const authService = {
  async login(username, password) {
    const response = await apiClient.post('/auth/login', {
      username,
      password
    })
    return response.data
  },

  async register(username, email, password, fullName) {
    const response = await apiClient.post('/auth/register', {
      username,
      email,
      password,
      fullName
    })
    return response.data
  },

  async refreshToken(refreshToken) {
    const body = refreshToken ? { refreshToken } : {}
    const response = await apiClient.post('/auth/refresh', body)
    return response.data
  },

  async revokeToken(refreshToken) {
    const response = await apiClient.post('/auth/revoke', {
      refreshToken
    })
    return response.data
  }
}

