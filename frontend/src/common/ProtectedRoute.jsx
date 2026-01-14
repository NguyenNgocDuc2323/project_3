import React, { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { isAuthenticated, isAdmin } from './utils'
import { ROUTES } from './constants'
import { authService } from './services'

export const ProtectedRoute = ({ children, requireAdmin = false, requireUserOnly = false }) => {
  const [isChecking, setIsChecking] = useState(true)
  const [isAuth, setIsAuth] = useState(false)

  useEffect(() => {
    const checkAuth = async () => {
      if (!isAuthenticated()) {
        try {
          await authService.refreshToken()
          setIsAuth(isAuthenticated())
        } catch (error) {
          setIsAuth(false)
        }
      } else {
        setIsAuth(true)
      }
      setIsChecking(false)
    }

    checkAuth()
  }, [])

  if (isChecking) {
    return null
  }

  if (!isAuth) {
    return <Navigate to={ROUTES.LOGIN} replace />
  }

  if (requireAdmin && !isAdmin()) {
    return <Navigate to={ROUTES.DASHBOARD} replace />
  }

  if (requireUserOnly && isAdmin()) {
    return <Navigate to={ROUTES.ADMIN} replace />
  }

  return children
}

