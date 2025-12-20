import axios from 'axios'
import { cookieUtils } from '@/utils/cookie'

const apiClient = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: true
})

apiClient.interceptors.request.use(
  (config) => {
    const token = cookieUtils.get('accessToken')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

apiClient.interceptors.response.use(
  (response) => {
    return response
  },
  async (error) => {
    if (error.response?.status === 401) {
      try {
        const { authService } = await import('./authService')
        const response = await authService.refreshToken(null)
        
        if (response && response.accessToken) {
          const accessTokenExpirationMinutes = 15
          cookieUtils.set('accessToken', response.accessToken, accessTokenExpirationMinutes)
          
          if (response.refreshToken) {
            const refreshTokenExpirationDays = 7
            const refreshTokenExpirationMinutes = refreshTokenExpirationDays * 24 * 60
            cookieUtils.set('refreshToken', response.refreshToken, refreshTokenExpirationMinutes)
          }
          
          error.config.headers.Authorization = `Bearer ${response.accessToken}`
          return apiClient.request(error.config)
        }
        
        await new Promise(resolve => setTimeout(resolve, 100))
        const newToken = cookieUtils.get('accessToken')
        if (newToken) {
          error.config.headers.Authorization = `Bearer ${newToken}`
          return apiClient.request(error.config)
        }
      } catch (refreshError) {
        cookieUtils.remove('accessToken')
        cookieUtils.remove('refreshToken')
        localStorage.removeItem('user')
        if (window.location.pathname !== '/login') {
          window.location.href = '/login'
        }
      }
    }
    return Promise.reject(error)
  }
)

export default apiClient

