import React, { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { getCurrentUser, logout } from '../../common/utils'
import { ROUTES } from '../../common/constants'
import './AdminSidebar.css'

const AdminSidebar = ({ isMobileOpen, onMobileToggle }) => {
  const location = useLocation()
  const navigate = useNavigate()
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [expandedItems, setExpandedItems] = useState({})
  const user = getCurrentUser()

  const menuItems = [
    {
      title: 'Dashboard',
      icon: 'bi bi-speedometer2',
      path: ROUTES.ADMIN,
      exact: true
    },
    {
      title: 'Users',
      icon: 'bi bi-people',
      path: '/admin/users/list'
    },
    {
      title: 'Categories',
      icon: 'bi bi-tags',
      path: '/admin/categories/list',
      children: [
        { title: 'All Categories', path: '/admin/categories/list' },
        { title: 'Create Category', path: '/admin/categories/create' }
      ]
    },
    {
      title: 'Products',
      icon: 'bi bi-gem',
      path: ROUTES.ADMIN_PRODUCTS_LIST,
      children: [
        { title: 'All Products', path: ROUTES.ADMIN_PRODUCTS_LIST },
        { title: 'Create Product', path: ROUTES.ADMIN_PRODUCTS_CREATE }
      ]
    },
    {
      title: 'Banner',
      icon: 'bi bi-image',
      path: '/admin/banners/list',
      children: [
        { title: 'All Banners', path: '/admin/banners/list' },
        { title: 'Create Banner', path: '/admin/banners/create' }
      ]
    }
  ]

  const isActive = (path, exact = false) => {
    if (exact) {
      return location.pathname === path
    }
    return location.pathname.startsWith(path)
  }

  const hasActiveChild = (children) => {
    if (!children) return false
    return children.some(child => location.pathname === child.path)
  }

  const toggleExpanded = (itemPath) => {
    setExpandedItems(prev => ({
      ...prev,
      [itemPath]: !prev[itemPath]
    }))
  }

  const handleLogout = () => {
    logout()
    navigate(ROUTES.LOGIN)
  }

  // Auto-expand items with active children
  React.useEffect(() => {
    menuItems.forEach(item => {
      if (item.children && hasActiveChild(item.children)) {
        setExpandedItems(prev => ({
          ...prev,
          [item.path]: true
        }))
      }
    })
  }, [location.pathname])

  // Close mobile sidebar when route changes
  React.useEffect(() => {
    if (onMobileToggle) {
      onMobileToggle(false)
    }
  }, [location.pathname, onMobileToggle])

  return (
    <>
      {/* Mobile overlay */}
      {isMobileOpen && (
        <div 
          className="sidebar-overlay"
          onClick={() => onMobileToggle && onMobileToggle(false)}
        />
      )}
      <div className={`admin-sidebar ${isCollapsed ? 'collapsed' : ''} ${isMobileOpen ? 'mobile-open' : ''}`}>
      <div className="sidebar-header">
        <div className="sidebar-brand">
          <span className="brand-icon">💎</span>
          {!isCollapsed && <span className="brand-text">Yash Gems</span>}
        </div>
        <button
          className="sidebar-toggle"
          onClick={() => setIsCollapsed(!isCollapsed)}
          title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <i className={`bi ${isCollapsed ? 'bi-chevron-right' : 'bi-chevron-left'}`}></i>
        </button>
      </div>

      <div className="sidebar-menu">
        {menuItems.map((item, index) => {
          const isItemActive = isActive(item.path, item.exact) || hasActiveChild(item.children)
          const isExpanded = expandedItems[item.path] || false
          const hasChildren = item.children && item.children.length > 0
          
          return (
            <div key={index} className="menu-item-wrapper">
              <div className="menu-item-container">
                {hasChildren ? (
                  <>
                    {isCollapsed ? (
                      <Link
                        to={item.path}
                        className={`menu-item ${isItemActive ? 'active' : ''}`}
                        title={item.title}
                      >
                        <i className={item.icon}></i>
                      </Link>
                    ) : (
                      <button
                        className={`menu-item ${isItemActive ? 'active' : ''} has-children`}
                        onClick={(e) => {
                          e.preventDefault()
                          toggleExpanded(item.path)
                        }}
                      >
                        <i className={item.icon}></i>
                        <span>{item.title}</span>
                        <i className={`bi ${isExpanded ? 'bi-chevron-up' : 'bi-chevron-down'} dropdown-icon`}></i>
                      </button>
                    )}
                  </>
                ) : (
                  <Link
                    to={item.path}
                    className={`menu-item ${isItemActive ? 'active' : ''}`}
                  >
                    <i className={item.icon}></i>
                    {!isCollapsed && <span>{item.title}</span>}
                  </Link>
                )}
              </div>
              {hasChildren && !isCollapsed && isExpanded && (
                <div className="submenu">
                  {item.children.map((child, childIndex) => (
                    <Link
                      key={childIndex}
                      to={child.path}
                      className={`submenu-item ${isActive(child.path, true) ? 'active' : ''}`}
                    >
                      {child.title}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>

      <div className="sidebar-footer">
        <div className="user-info">
          <div className="user-avatar">
            <i className="bi bi-person-circle"></i>
          </div>
          {!isCollapsed && (
            <div className="user-details">
              <div className="user-name">{user?.fullName || user?.username || 'Admin'}</div>
              <div className="user-role">Administrator</div>
            </div>
          )}
        </div>
        <button className="logout-btn" onClick={handleLogout}>
          <i className="bi bi-box-arrow-right"></i>
          {!isCollapsed && <span>Logout</span>}
        </button>
      </div>
    </div>
    </>
  )
}

export default AdminSidebar
