import React, { useState } from 'react'
import AdminSidebar from '../components/layout/AdminSidebar'
import './AdminLayout.css'

const AdminLayout = ({ children }) => {
  const [isMobileOpen, setIsMobileOpen] = useState(false)

  return (
    <div className="admin-layout">
      <AdminSidebar isMobileOpen={isMobileOpen} onMobileToggle={setIsMobileOpen} />
      <div className="admin-content">
        <button 
          className="mobile-menu-toggle"
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          aria-label="Toggle menu"
        >
          <i className="bi bi-list"></i>
        </button>
        <div className="admin-main">
          {children}
        </div>
      </div>
    </div>
  )
}

export default AdminLayout
