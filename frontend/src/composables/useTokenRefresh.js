import { ref } from 'vue'
import { authService } from '@/api/authService'
import { cookieUtils } from '@/utils/cookie'

let refreshInterval = null
const isRefreshing = ref(false)

export function useTokenRefresh() {
  const startAutoRefresh = () => {
    stopAutoRefresh()
    
    refreshInterval = setInterval(async () => {
      if (isRefreshing.value) return
      
      try {
        isRefreshing.value = true
        const response = await authService.refreshToken(null)
        
        if (response.accessToken) {
          const accessTokenExpirationMinutes = 15
          cookieUtils.set('accessToken', response.accessToken, accessTokenExpirationMinutes)
        }
        
        if (response.refreshToken) {
          const refreshTokenExpirationDays = 7
          const refreshTokenExpirationMinutes = refreshTokenExpirationDays * 24 * 60
          cookieUtils.set('refreshToken', response.refreshToken, refreshTokenExpirationMinutes)
        }
        
        if (response.user) {
          localStorage.setItem('user', JSON.stringify(response.user))
        }
      } catch (error) {
        cookieUtils.remove('accessToken')
        cookieUtils.remove('refreshToken')
        localStorage.removeItem('user')
        stopAutoRefresh()
        
        if (window.location.pathname !== '/login') {
          window.location.href = '/login'
        }
      } finally {
        isRefreshing.value = false
      }
    }, 60000)
  }
  
  const stopAutoRefresh = () => {
    if (refreshInterval) {
      clearInterval(refreshInterval)
      refreshInterval = null
    }
  }
  
  const refreshTokenNow = async () => {
    if (isRefreshing.value) return
    
    try {
      isRefreshing.value = true
      const response = await authService.refreshToken(null)
      
      if (response.accessToken) {
        const accessTokenExpirationMinutes = 15
        cookieUtils.set('accessToken', response.accessToken, accessTokenExpirationMinutes)
      }
      
      if (response.refreshToken) {
        const refreshTokenExpirationDays = 7
        const refreshTokenExpirationMinutes = refreshTokenExpirationDays * 24 * 60
        cookieUtils.set('refreshToken', response.refreshToken, refreshTokenExpirationMinutes)
      }
      
      if (response.user) {
        localStorage.setItem('user', JSON.stringify(response.user))
      }
      
      return response
    } catch (error) {
      throw error
    } finally {
      isRefreshing.value = false
    }
  }
  
  return {
    startAutoRefresh,
    stopAutoRefresh,
    refreshTokenNow,
    isRefreshing
  }
}
