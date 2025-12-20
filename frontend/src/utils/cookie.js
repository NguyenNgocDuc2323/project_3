export const cookieUtils = {
  set(name, value, minutes = 1, options = {}) {
    const expires = new Date()
    expires.setTime(expires.getTime() + minutes * 60 * 1000)
    
    let cookieString = `${name}=${encodeURIComponent(value)}; expires=${expires.toUTCString()}; path=${options.path || '/'}`
    
    if (options.domain) {
      cookieString += `; domain=${options.domain}`
    }
    
    if (options.secure) {
      cookieString += '; secure'
    }
    
    if (options.sameSite) {
      cookieString += `; samesite=${options.sameSite}`
    }
    
    document.cookie = cookieString
  },
  
  get(name) {
    const nameEQ = name + '='
    const cookies = document.cookie.split(';')
    
    for (let i = 0; i < cookies.length; i++) {
      let cookie = cookies[i]
      while (cookie.charAt(0) === ' ') {
        cookie = cookie.substring(1, cookie.length)
      }
      if (cookie.indexOf(nameEQ) === 0) {
        return decodeURIComponent(cookie.substring(nameEQ.length, cookie.length))
      }
    }
    return null
  },
  
  remove(name, options = {}) {
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=${options.path || '/'}${options.domain ? `; domain=${options.domain}` : ''}`
  },
  
  exists(name) {
    return this.get(name) !== null
  }
}
