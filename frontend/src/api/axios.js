import axios from 'axios'
import { cookieUtils } from '@/utils/cookie'
import { hasInteraction, resetInteraction, initUserInteractionTracking } from '@/utils/userInteraction'

if (typeof window !== 'undefined') {
  initUserInteractionTracking()
}

const apiClient = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: true
})

// Flag để tránh refresh token đồng thời
let isRefreshing = false
// Queue các request đang chờ refresh token
let failedQueue = []

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error)
    } else {
      prom.resolve(token)
    }
  })
  
  failedQueue = []
}

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
    const originalRequest = error.config

    // Chỉ xử lý 401 Unauthorized
    if (error.response?.status === 401 && !originalRequest._retry) {
      // Kiểm tra xem đã có user interaction chưa
      if (!hasInteraction()) {
        // Chưa có user interaction, không refresh token
        console.warn('[Axios] 401 Unauthorized nhưng chưa có user interaction. Yêu cầu đăng nhập lại.')
        cookieUtils.remove('accessToken')
        cookieUtils.remove('refreshToken')
        localStorage.removeItem('user')
        if (window.location.pathname !== '/login') {
          window.location.href = '/login'
        }
        return Promise.reject(error)
      }

      // Đã có user interaction, tiến hành refresh token
      if (isRefreshing) {
        // Đang refresh, thêm vào queue
        return new Promise((resolve, reject) => {
          failedQueue.push({ 
            resolve, 
            reject,
            request: originalRequest 
          })
        })
          .then(token => {
            originalRequest.headers.Authorization = `Bearer ${token}`
            return apiClient.request(originalRequest)
          })
          .catch(err => {
            return Promise.reject(err)
          })
      }

      originalRequest._retry = true
      isRefreshing = true

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
          
          // Reset interaction flag sau khi refresh thành công
          resetInteraction()
          
          // Xử lý queue
          processQueue(null, response.accessToken)
          
          // Retry request ban đầu
          originalRequest.headers.Authorization = `Bearer ${response.accessToken}`
          return apiClient.request(originalRequest)
        }
        
        // Nếu không có accessToken trong response, thử lấy từ cookie
        await new Promise(resolve => setTimeout(resolve, 100))
        const newToken = cookieUtils.get('accessToken')
        if (newToken) {
          resetInteraction()
          processQueue(null, newToken)
          originalRequest.headers.Authorization = `Bearer ${newToken}`
          return apiClient.request(originalRequest)
        }
        
        throw new Error('Không thể lấy access token mới')
      } catch (refreshError) {
        // Refresh token thất bại
        processQueue(refreshError, null)
        cookieUtils.remove('accessToken')
        cookieUtils.remove('refreshToken')
        localStorage.removeItem('user')
        resetInteraction()
        
        if (window.location.pathname !== '/login') {
          window.location.href = '/login'
        }
        
        return Promise.reject(refreshError)
      } finally {
        isRefreshing = false
      }
    }
    
    return Promise.reject(error)
  }
)

export default apiClient

