import React, { useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Toast from './components/Toast'
import DefaultLayout from './layouts/DefaultLayout'
import BlankLayout from './layouts/BlankLayout'
import { ProtectedRoute } from './common/ProtectedRoute'
import { ROUTES } from './common/constants'
import { initScrollTokenRefresh, cleanupScrollTokenRefresh } from './common/tokenRefresh'

import Login from './views/Login'
import Register from './views/Register'
import About from './views/About'
import Dashboard from './views/user/Dashboard'
import AdminDashboard from './views/admin/Dashboard'
import StoriesList from './views/admin/stories/List'
import StoriesCreate from './views/admin/stories/Create'
import StoriesEdit from './views/admin/stories/Edit'
import UsersList from './views/admin/users/List'
import UsersEdit from './views/admin/users/Edit'
import CategoriesList from './views/admin/categories/List'
import CategoriesCreate from './views/admin/categories/Create'
import CategoriesEdit from './views/admin/categories/Edit'

function App() {
  useEffect(() => {
    initScrollTokenRefresh()
    
    return () => {
      cleanupScrollTokenRefresh()
    }
  }, [])

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
        
        <Route path={ROUTES.ABOUT} element={
          <DefaultLayout>
            <About />
          </DefaultLayout>
        } />
        
        <Route path={ROUTES.DASHBOARD} element={
          <ProtectedRoute>
            <DefaultLayout>
              <Dashboard />
            </DefaultLayout>
          </ProtectedRoute>
        } />
        
        <Route path={ROUTES.ADMIN} element={
          <ProtectedRoute requireAdmin={true}>
            <DefaultLayout>
              <AdminDashboard />
            </DefaultLayout>
          </ProtectedRoute>
        } />
        <Route path="/admin/stories/list" element={
          <ProtectedRoute requireAdmin={true}>
            <DefaultLayout>
              <StoriesList />
            </DefaultLayout>
          </ProtectedRoute>
        } />
        <Route path="/admin/stories/create" element={
          <ProtectedRoute requireAdmin={true}>
            <DefaultLayout>
              <StoriesCreate />
            </DefaultLayout>
          </ProtectedRoute>
        } />
        <Route path="/admin/stories/edit/:id" element={
          <ProtectedRoute requireAdmin={true}>
            <DefaultLayout>
              <StoriesEdit />
            </DefaultLayout>
          </ProtectedRoute>
        } />
        <Route path="/admin/users/list" element={
          <ProtectedRoute requireAdmin={true}>
            <DefaultLayout>
              <UsersList />
            </DefaultLayout>
          </ProtectedRoute>
        } />
        <Route path="/admin/users/edit/:id" element={
          <ProtectedRoute requireAdmin={true}>
            <DefaultLayout>
              <UsersEdit />
            </DefaultLayout>
          </ProtectedRoute>
        } />
        <Route path="/admin/categories/list" element={
          <ProtectedRoute requireAdmin={true}>
            <DefaultLayout>
              <CategoriesList />
            </DefaultLayout>
          </ProtectedRoute>
        } />
        <Route path="/admin/categories/create" element={
          <ProtectedRoute requireAdmin={true}>
            <DefaultLayout>
              <CategoriesCreate />
            </DefaultLayout>
          </ProtectedRoute>
        } />
        <Route path="/admin/categories/edit/:id" element={
          <ProtectedRoute requireAdmin={true}>
            <DefaultLayout>
              <CategoriesEdit />
            </DefaultLayout>
          </ProtectedRoute>
        } />
        
        <Route path={ROUTES.HOME} element={<Navigate to={ROUTES.DASHBOARD} replace />} />
      </Routes>
    </>
  )
}

export default App
