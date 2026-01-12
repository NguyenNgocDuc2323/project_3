import React, { useEffect, useRef } from 'react'

const Toast = () => {
  const toastContainerRef = useRef(null)

  useEffect(() => {
    if (!toastContainerRef.current) {
      const container = document.createElement('div')
      container.className = 'toast-container position-fixed top-0 end-0 p-3'
      container.style.zIndex = '9999'
      container.id = 'toast-container'
      document.body.appendChild(container)
      toastContainerRef.current = container
    }

    window.showToast = (options) => {
      const container = document.getElementById('toast-container') || toastContainerRef.current
      if (!container) return

      const { severity = 'info', summary = '', detail = '', life = 3000 } = options

      const alertClassMap = {
        success: 'success',
        error: 'danger',
        warn: 'warning',
        info: 'info'
      }
      const alertClass = alertClassMap[severity] || 'info'

      const toastId = `toast-${Date.now()}`
      const toastHtml = `
        <div id="${toastId}" class="toast" role="alert" aria-live="assertive" aria-atomic="true" data-bs-autohide="true" data-bs-delay="${life}">
          <div class="toast-header bg-${alertClass} text-white">
            <strong class="me-auto">${summary || 'Notification'}</strong>
            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="toast" aria-label="Close"></button>
          </div>
          <div class="toast-body">
            ${detail}
          </div>
        </div>
      `

      container.insertAdjacentHTML('beforeend', toastHtml)

      const toastElement = document.getElementById(toastId)
      if (toastElement && window.bootstrap) {
        const toast = new window.bootstrap.Toast(toastElement)
        toast.show()

        toastElement.addEventListener('hidden.bs.toast', () => {
          toastElement.remove()
        })
      }
    }

    return () => {
      delete window.showToast
    }
  }, [])

  return null
}

export default Toast

