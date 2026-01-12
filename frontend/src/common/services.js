import apiClient from './api'
import { cookieUtils, storageUtils } from './utils'
import { TOKEN_EXPIRATION } from './constants'

export const authService = {
  async login(username, password) {
    const response = await apiClient.post('/auth/login', {
      username,
      password
    })
    
    if (response.data.accessToken) {
      cookieUtils.set('accessToken', response.data.accessToken, TOKEN_EXPIRATION.ACCESS_TOKEN_MINUTES)
    }
    if (response.data.refreshToken) {
      const refreshMinutes = TOKEN_EXPIRATION.REFRESH_TOKEN_DAYS * 24 * 60
      cookieUtils.set('refreshToken', response.data.refreshToken, refreshMinutes)
    }
    if (response.data.user) {
      storageUtils.set('user', response.data.user)
    }
    
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

  async refreshToken() {
    const refreshToken = cookieUtils.get('refreshToken')
    
    if (!refreshToken) {
      throw new Error('No refresh token available')
    }
    
    const response = await apiClient.post('/auth/refresh', {
      refreshToken: refreshToken
    })
    
    if (response.data.accessToken) {
      cookieUtils.set('accessToken', response.data.accessToken, TOKEN_EXPIRATION.ACCESS_TOKEN_MINUTES)
    }
    if (response.data.refreshToken) {
      const refreshMinutes = TOKEN_EXPIRATION.REFRESH_TOKEN_DAYS * 24 * 60
      cookieUtils.set('refreshToken', response.data.refreshToken, refreshMinutes)
    }
    
    return response.data
  },

  logout() {
    cookieUtils.remove('accessToken')
    cookieUtils.remove('refreshToken')
    storageUtils.remove('user')
  }
}

export const storyService = {
  getAll(featured = null) {
    const params = featured !== null ? { featured } : {}
    return apiClient.get('/stories', { params })
  },
  
  getById(id) {
    return apiClient.get(`/stories/${id}`)
  },
  
  getPopular(limit = 5) {
    return apiClient.get('/stories/popular', { params: { limit } })
  },
  
  getStats() {
    return apiClient.get('/stories/stats')
  },
  
  create(data) {
    return apiClient.post('/stories', data)
  },
  
  update(id, data) {
    return apiClient.put(`/stories/${id}`, data)
  },
  
  delete(id) {
    return apiClient.delete(`/stories/${id}`)
  }
}

export const userService = {
  getAll() {
    return apiClient.get('/admin/users')
  },
  
  getById(id) {
    return apiClient.get(`/admin/users/${id}`)
  },
  
  update(id, data) {
    return apiClient.put(`/admin/users/${id}`, data)
  },
  
  delete(id) {
    return apiClient.delete(`/admin/users/${id}`)
  }
}

export const categoryService = {
  getAll() {
    return apiClient.get('/categories')
  },
  
  create(data) {
    return apiClient.post('/categories', data)
  },
  
  update(id, data) {
    return apiClient.put(`/categories/${id}`, data)
  },
  
  delete(id) {
    return apiClient.delete(`/categories/${id}`)
  }
}

export const productService = {
  getAll(featured = null, categoryId = null) {
    const params = {}
    if (featured !== null) params.featured = featured
    if (categoryId !== null) params.categoryId = categoryId
    return apiClient.get('/products', { params })
  },
  
  getById(id) {
    return apiClient.get(`/products/${id}`)
  },
  
  getPopular(limit = 5) {
    return apiClient.get('/products/popular', { params: { limit } })
  },
  
  create(data) {
    return apiClient.post('/products', data)
  },
  
  update(id, data) {
    return apiClient.put(`/products/${id}`, data)
  },
  
  delete(id) {
    return apiClient.delete(`/products/${id}`)
  }
}
