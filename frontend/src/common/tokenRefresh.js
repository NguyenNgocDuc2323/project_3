import { cookieUtils } from './utils'
import { TOKEN_EXPIRATION } from './constants'
import axios from 'axios'
import { API_BASE_URL } from './constants'

let scrollRefreshTimeout = null
let isRefreshingOnScroll = false
let lastScrollTime = 0

const refreshClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: true
})

const refreshTokenOnScroll = async () => {
  if (isRefreshingOnScroll) {
    return
  }

  isRefreshingOnScroll = true

  try {
    const response = await refreshClient.post('/auth/refresh', {})
    
    const newAccessToken = response.data?.accessToken || response.data?.AccessToken
    
    if (newAccessToken) {
      cookieUtils.set('accessToken', newAccessToken, TOKEN_EXPIRATION.ACCESS_TOKEN_MINUTES)
    }
  } catch (error) {
    console.error('Error refreshing token on scroll:', error)
  } finally {
    isRefreshingOnScroll = false
  }
}

const handleScroll = () => {
  const now = Date.now()
  
  if (scrollRefreshTimeout) {
    clearTimeout(scrollRefreshTimeout)
  }

  scrollRefreshTimeout = setTimeout(() => {
    if (lastScrollTime > 0) {
      refreshTokenOnScroll()
    }
    lastScrollTime = now
  }, 2000)
}

export const initScrollTokenRefresh = () => {
  if (window._scrollTokenRefreshInitialized) {
    return
  }

  window.addEventListener('scroll', handleScroll, { passive: true })
  window._scrollTokenRefreshInitialized = true
}

export const cleanupScrollTokenRefresh = () => {
  if (scrollRefreshTimeout) {
    clearTimeout(scrollRefreshTimeout)
  }
  window.removeEventListener('scroll', handleScroll)
  window._scrollTokenRefreshInitialized = false
}
