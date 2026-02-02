import React, { useEffect, useState } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Toast from './components/Toast'
import DefaultLayout from './layouts/DefaultLayout'
import AdminLayout from './layouts/AdminLayout'
import BlankLayout from './layouts/BlankLayout'
import { ProtectedRoute } from './common/ProtectedRoute'
import { ROUTES } from './common/constants'
import { initScrollTokenRefresh, cleanupScrollTokenRefresh } from './common/tokenRefresh'
import { isAuthenticated, isAdmin, getCurrentUser } from './common/utils'
import { authService } from './common/services'

import Login from './views/Login'
import Register from './views/Register'
import ForgotPassword from './views/ForgotPassword'
import ResetPassword from './views/ResetPassword'
import About from './views/About'
import Dashboard from './views/user/Dashboard'
import Shop from './views/user/Shop'
import ProductDetail from './views/user/ProductDetail'
import AdminDashboard from './views/admin/Dashboard'
import StoriesList from './views/admin/stories/List'
import StoriesCreate from './views/admin/stories/Create'
import StoriesEdit from './views/admin/stories/Edit'
import UsersList from './views/admin/users/List'
import UsersEdit from './views/admin/users/Edit'
import CategoriesList from './views/admin/categories/List'
import CategoriesCreate from './views/admin/categories/Create'
import CategoriesEdit from './views/admin/categories/Edit'
import BannersList from './views/admin/banners/List'
import BannersCreate from './views/admin/banners/Create'
import BannersEdit from './views/admin/banners/Edit'

// Component để redirect từ HOME
const HomeRedirect = () => {
  if (isAdmin()) {
    return <Navigate to={ROUTES.ADMIN} replace />
  }

  return <Navigate to={ROUTES.DASHBOARD} replace />
}

function App() {
  const [isInitializing, setIsInitializing] = useState(true)

  useEffect(() => {
    const initializeAuth = async () => {
      const hasSession = isAuthenticated() || !!getCurrentUser()
      if (hasSession && !isAuthenticated()) {
        try {
          await authService.refreshToken()
        } catch (error) {
          console.error('Failed to refresh token on app init:', error)
        }
      }
      setIsInitializing(false)
    }

    initializeAuth()
    initScrollTokenRefresh()
    
    return () => {
      cleanupScrollTokenRefresh()
    }
  }, [])

  if (isInitializing) {
    return null
  }

  return (
    <>
      <Toast />
      <Routes>
        <Route path={ROUTES.LOGIN} element={
          <BlankLayout>
            <Login />
          </BlankLayout>
        } />
        <Route path={ROUTES.REGISTER} element={
          <BlankLayout>
            <Register />
          </BlankLayout>
        } />
        <Route path={ROUTES.FORGOT_PASSWORD} element={
          <BlankLayout>
            <ForgotPassword />
          </BlankLayout>
        } />
        <Route path={ROUTES.RESET_PASSWORD} element={
          <BlankLayout>
            <ResetPassword />
          </BlankLayout>
        } />
        
        <Route path={ROUTES.ABOUT} element={
          <DefaultLayout>
            <About />
          </DefaultLayout>
        } />
        
        <Route path={ROUTES.DASHBOARD} element={
          <DefaultLayout>
            <Dashboard />
          </DefaultLayout>
        } />

        <Route path={ROUTES.SHOP} element={
          <DefaultLayout>
            <Shop />
          </DefaultLayout>
        } />

        <Route path={ROUTES.PRODUCT_DETAIL} element={
          <DefaultLayout>
            <ProductDetail />
          </DefaultLayout>
        } />
        
        <Route path={ROUTES.ADMIN} element={
          <ProtectedRoute requireAdmin={true}>
            <AdminLayout>
              <AdminDashboard />
            </AdminLayout>
          </ProtectedRoute>
        } />
        <Route path="/admin/stories/list" element={
          <ProtectedRoute requireAdmin={true}>
            <AdminLayout>
              <StoriesList />
            </AdminLayout>
          </ProtectedRoute>
        } />
        <Route path="/admin/stories/create" element={
          <ProtectedRoute requireAdmin={true}>
            <AdminLayout>
              <StoriesCreate />
            </AdminLayout>
          </ProtectedRoute>
        } />
        <Route path="/admin/stories/edit/:id" element={
          <ProtectedRoute requireAdmin={true}>
            <AdminLayout>
              <StoriesEdit />
            </AdminLayout>
          </ProtectedRoute>
        } />
        <Route path="/admin/users/list" element={
          <ProtectedRoute requireAdmin={true}>
            <AdminLayout>
              <UsersList />
            </AdminLayout>
          </ProtectedRoute>
        } />
        <Route path="/admin/users/edit/:id" element={
          <ProtectedRoute requireAdmin={true}>
            <AdminLayout>
              <UsersEdit />
            </AdminLayout>
          </ProtectedRoute>
        } />
        <Route path="/admin/categories/list" element={
          <ProtectedRoute requireAdmin={true}>
            <AdminLayout>
              <CategoriesList />
            </AdminLayout>
          </ProtectedRoute>
        } />
        <Route path="/admin/categories/create" element={
          <ProtectedRoute requireAdmin={true}>
            <AdminLayout>
              <CategoriesCreate />
            </AdminLayout>
          </ProtectedRoute>
        } />
        <Route path="/admin/categories/edit/:id" element={
          <ProtectedRoute requireAdmin={true}>
            <AdminLayout>
              <CategoriesEdit />
            </AdminLayout>
          </ProtectedRoute>
        } />
        <Route path={ROUTES.ADMIN_BANNERS_LIST} element={
          <ProtectedRoute requireAdmin={true}>
            <AdminLayout>
              <BannersList />
            </AdminLayout>
          </ProtectedRoute>
        } />
        <Route path={ROUTES.ADMIN_BANNERS_CREATE} element={
          <ProtectedRoute requireAdmin={true}>
            <AdminLayout>
              <BannersCreate />
            </AdminLayout>
          </ProtectedRoute>
        } />
        <Route path={ROUTES.ADMIN_BANNERS_EDIT + '/:id'} element={
          <ProtectedRoute requireAdmin={true}>
            <AdminLayout>
              <BannersEdit />
            </AdminLayout>
          </ProtectedRoute>
        } />
        
        <Route path={ROUTES.HOME} element={<HomeRedirect />} />
      </Routes>
    </>
  )
}

export default App
