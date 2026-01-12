import React from 'react'
import { Navigate } from 'react-router-dom'
import { isAuthenticated, isAdmin } from './utils'
import { ROUTES } from './constants'

export const ProtectedRoute = ({ children, requireAdmin = false }) => {
  if (!isAuthenticated()) {
    return <Navigate to={ROUTES.LOGIN} replace />
  }

  if (requireAdmin && !isAdmin()) {
    return <Navigate to={ROUTES.DASHBOARD} replace />
  }

  return children
}

