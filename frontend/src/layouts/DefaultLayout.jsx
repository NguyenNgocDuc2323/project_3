import React from 'react'
import { useLocation, Outlet } from 'react-router-dom'
import AppHeader from '../components/layout/AppHeader'
import AppFooter from '../components/layout/AppFooter'
import HeroBanner from '../components/layout/HeroBanner'
import { ROUTES } from '../common/constants'
import './DefaultLayout.css'

const DefaultLayout = ({ children }) => {
  const location = useLocation()
  const isDashboard = location.pathname === ROUTES.DASHBOARD

  return (
    <div className="layout">
      <AppHeader />
      {isDashboard && <HeroBanner />}
      <main className="main">
        {children || <Outlet />}
      </main>
      <AppFooter />
    </div>
  )
}

export default DefaultLayout

