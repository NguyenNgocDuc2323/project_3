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
import Gemstones from './views/Gemstones'
import Contact from './views/Contact'
import DiamondInfo from './views/user/DiamondInfo'
import Dashboard from './views/user/Dashboard'
import Shop from './views/user/Shop'
import ProductDetail from './views/user/ProductDetail'
import Profile from './views/user/Profile'
import EditProfile from './views/user/EditProfile'
import AddressManagement from './views/user/AddressManagement'
import Cart from './views/user/Cart'
import Checkout from './views/user/Checkout'
import PaymentCallback from './views/user/PaymentCallback'
import UserOrdersList from './views/user/orders/List'
import UserOrderDetail from './views/user/orders/Detail'
import AdminDashboard from './views/admin/Dashboard'
import UsersList from './views/admin/users/List'
import UsersEdit from './views/admin/users/Edit'
import CategoriesList from './views/admin/categories/List'
import CategoriesCreate from './views/admin/categories/Create'
import CategoriesEdit from './views/admin/categories/Edit'
import ProductsList from './views/admin/products/List'
import ProductsCreate from './views/admin/products/Create'
import ProductsEdit from './views/admin/products/Edit'
import BannersList from './views/admin/banners/List'
import BannersCreate from './views/admin/banners/Create'
import BannersEdit from './views/admin/banners/Edit'
import OrdersList from './views/admin/orders/List'
import OrderDetail from './views/admin/orders/Detail'

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
      const user = getCurrentUser()
      const hasAccessToken = isAuthenticated()

      if (user && !hasAccessToken) {
        try {
          await authService.refreshToken()
        } catch (error) {
          // If refresh fails with 401, it means the session is dead
          if (error.response?.status === 401) {
            authService.logout()
          }
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

        <Route path="/gemstones" element={
          <DefaultLayout>
            <Gemstones />
          </DefaultLayout>
        } />

        <Route path={ROUTES.DIAMOND_INFO} element={
          <DefaultLayout>
            <DiamondInfo />
          </DefaultLayout>
        } />

        <Route path="/contact" element={
          <DefaultLayout>
            <Contact />
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

        <Route path={ROUTES.PROFILE} element={
          <ProtectedRoute>
            <DefaultLayout>
              <Profile />
            </DefaultLayout>
          </ProtectedRoute>
        } />

        <Route path={ROUTES.EDIT_PROFILE} element={
          <ProtectedRoute>
            <DefaultLayout>
              <EditProfile />
            </DefaultLayout>
          </ProtectedRoute>
        } />

        <Route path={ROUTES.ADDRESSES} element={
          <ProtectedRoute>
            <DefaultLayout>
              <AddressManagement />
            </DefaultLayout>
          </ProtectedRoute>
        } />

        <Route path={ROUTES.CART} element={
          <ProtectedRoute>
            <DefaultLayout>
              <Cart />
            </DefaultLayout>
          </ProtectedRoute>
        } />

        <Route path={ROUTES.CHECKOUT} element={
          <ProtectedRoute>
            <DefaultLayout>
              <Checkout />
            </DefaultLayout>
          </ProtectedRoute>
        } />

        <Route path={ROUTES.USER_ORDERS_LIST} element={
          <ProtectedRoute>
            <DefaultLayout>
              <UserOrdersList />
            </DefaultLayout>
          </ProtectedRoute>
        } />
        <Route path={ROUTES.USER_ORDERS_DETAIL + '/:id'} element={
          <ProtectedRoute>
            <DefaultLayout>
              <UserOrderDetail />
            </DefaultLayout>
          </ProtectedRoute>
        } />

        <Route path="/checkout/payment-callback" element={
          <ProtectedRoute>
            <DefaultLayout>
              <PaymentCallback />
            </DefaultLayout>
          </ProtectedRoute>
        } />
        
        <Route path={ROUTES.ADMIN} element={
          <ProtectedRoute requireAdmin={true}>
            <AdminLayout>
              <AdminDashboard />
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
        <Route path={ROUTES.ADMIN_PRODUCTS_LIST} element={
          <ProtectedRoute requireAdmin={true}>
            <AdminLayout>
              <ProductsList />
            </AdminLayout>
          </ProtectedRoute>
        } />
        <Route path={ROUTES.ADMIN_PRODUCTS_CREATE} element={
          <ProtectedRoute requireAdmin={true}>
            <AdminLayout>
              <ProductsCreate />
            </AdminLayout>
          </ProtectedRoute>
        } />
        <Route path={ROUTES.ADMIN_PRODUCTS_EDIT + '/:id'} element={
          <ProtectedRoute requireAdmin={true}>
            <AdminLayout>
              <ProductsEdit />
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

        <Route path={ROUTES.ADMIN_ORDERS_LIST} element={
          <ProtectedRoute requireAdmin={true}>
            <AdminLayout>
              <OrdersList />
            </AdminLayout>
          </ProtectedRoute>
        } />
        <Route path={ROUTES.ADMIN_ORDERS_DETAIL + '/:id'} element={
          <ProtectedRoute requireAdmin={true}>
            <AdminLayout>
              <OrderDetail />
            </AdminLayout>
          </ProtectedRoute>
        } />
        
        <Route path={ROUTES.HOME} element={<HomeRedirect />} />
      </Routes>
    </>
  )
}

export default App
