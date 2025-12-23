/**
 * Utility để theo dõi user interaction
 * Chỉ cho phép refresh token khi có thao tác từ người dùng
 */

let hasUserInteraction = false
let interactionListenersAttached = false

/**
 * Đánh dấu rằng đã có user interaction
 */
function markUserInteraction() {
  hasUserInteraction = true
}

/**
 * Kiểm tra xem đã có user interaction chưa
 * @returns {boolean}
 */
export function hasInteraction() {
  return hasUserInteraction
}

/**
 * Reset flag user interaction (sau khi đã refresh token)
 */
export function resetInteraction() {
  hasUserInteraction = false
}

/**
 * Khởi tạo lắng nghe các sự kiện user interaction
 */
export function initUserInteractionTracking() {
  if (interactionListenersAttached) {
    return
  }

  // Các sự kiện user interaction
  const events = [
    'click',
    'keydown',
    'mousemove',
    'touchstart',
    'scroll',
    'focus',
    'input'
  ]

  events.forEach(event => {
    document.addEventListener(event, markUserInteraction, { passive: true, once: false })
  })

  interactionListenersAttached = true
}

/**
 * Dọn dẹp event listeners
 */
export function cleanupUserInteractionTracking() {
  if (!interactionListenersAttached) {
    return
  }

  const events = [
    'click',
    'keydown',
    'mousemove',
    'touchstart',
    'scroll',
    'focus',
    'input'
  ]

  events.forEach(event => {
    document.removeEventListener(event, markUserInteraction)
  })

  interactionListenersAttached = false
  hasUserInteraction = false
}

