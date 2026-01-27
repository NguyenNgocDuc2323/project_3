import React, { useState, useEffect } from 'react'
import { Navbar, Nav, NavDropdown, Container } from 'react-bootstrap'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { isAuthenticated, isAdmin, getCurrentUser, logout } from '../../common/utils'
import { categoryService } from '../../common/services'
import { ROUTES } from '../../common/constants'
import './AppHeader.css'

const AppHeader = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const [isScrolled, setIsScrolled] = useState(false)
  const [userInfo, setUserInfo] = useState(null)

  const [categoryTree, setCategoryTree] = useState([])
  const [isLoadingCategories, setIsLoadingCategories] = useState(false)

  const handleScroll = () => {
    setIsScrolled(window.scrollY > 20)
  }

  useEffect(() => {
    setUserInfo(getCurrentUser())
    window.addEventListener('scroll', handleScroll)
    handleScroll()

    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])

  useEffect(() => {
    const loadCategories = async () => {
      try {
        setIsLoadingCategories(true)
        const response = await categoryService.getTree()
        const categories = response.data || []
        setCategoryTree(categories)
      } catch (error) {
        console.error('Failed to load categories:', error)
      } finally {
        setIsLoadingCategories(false)
      }
    }

    loadCategories()
  }, [])

  useEffect(() => {
    setUserInfo(getCurrentUser())
  }, [location])

  const handleLogout = () => {
    logout()
    navigate(ROUTES.LOGIN)
  }

  const renderMenuItem = (item) => {
    if (typeof item === 'string') {
      return (
        <button type="button" className="mega-link" key={item}>
          {item}
        </button>
      )
    }

    return (
      <button type="button" className="mega-link" key={item.label}>
        {item.swatch && <span className="mega-swatch" style={{ background: item.swatch }}></span>}
        {item.label}
      </button>
    )
  }

  const menuItems = categoryTree.map((category) => {
    const hasChildren = Array.isArray(category.children) && category.children.length > 0
    const sections = hasChildren
      ? category.children.map((child) => ({
          title: child.name,
          items: (child.products || []).map((product) => product.name)
        }))
      : [
          {
            title: category.name,
            items: (category.products || []).map((product) => product.name)
          }
        ]

    return {
      label: category.name,
      sections
    }
  })

  return (
    <Navbar
      expand="lg"
      className={`yash-header ${isScrolled ? 'navbar-scrolled' : ''}`}
      variant="light"
    >
      <Navbar.Brand as={Link} to={ROUTES.DASHBOARD} className="yash-logo">
          Yash Gems & Jewelleries
        </Navbar.Brand>

        <Navbar.Toggle aria-controls="yash-navbar" />

        <Navbar.Collapse id="yash-navbar" className="yash-collapse">
          <Nav className="yash-nav">
            {menuItems.map((item) => (
              <div key={item.label} className="yash-nav-item">
                <Nav.Link as={Link} to={ROUTES.DASHBOARD} className="yash-nav-link">
                  {item.label}
                </Nav.Link>
                <div className="yash-mega">
                  <div className="yash-mega-inner">
                    <div className="yash-mega-grid">
                      {item.sections.map((section) => (
                        <div key={section.title} className="yash-mega-col">
                          <h6>{section.title}</h6>
                          <div className="yash-mega-list">
                            {section.items.map((menuItem) => renderMenuItem(menuItem))}
                          </div>
                        </div>
                      ))}
                    </div>
                    {isLoadingCategories && (
                      <div className="yash-mega-note">Loading categories...</div>
                    )}
                  </div>
                </div>
              </div>
            ))}
            {!isLoadingCategories && menuItems.length === 0 && (
              <div className="yash-mega-note">No categories yet</div>
            )}
            {isAdmin() && (
              <Nav.Link as={Link} to={ROUTES.ADMIN} className="yash-nav-link">
                Admin
              </Nav.Link>
            )}
          </Nav>

          <div className="yash-actions">
            <button type="button" className="yash-icon-btn" aria-label="Location">
              <i className="bi bi-geo-alt"></i>
            </button>
            {!isAuthenticated() ? (
              <button
                type="button"
                className="yash-icon-btn"
                aria-label="Sign in"
                onClick={() => navigate(ROUTES.LOGIN)}
              >
                <i className="bi bi-person"></i>
              </button>
            ) : (
              <NavDropdown
                title={<i className="bi bi-person"></i>}
                id="user-nav-dropdown"
                align="end"
                className="nav-icon-dropdown"
              >
                <NavDropdown.ItemText>
                  <div>
                    <strong>
                      <i className="bi bi-person me-1"></i>
                      {userInfo?.fullName || userInfo?.username || 'User'}
                    </strong>
                    {userInfo?.email && (
                      <div className="text-muted small">{userInfo.email}</div>
                    )}
                  </div>
                </NavDropdown.ItemText>
                <NavDropdown.Divider />
                <NavDropdown.Item onClick={() => {}}>
                  <i className="bi bi-person-gear me-2"></i>
                  Update Profile
                </NavDropdown.Item>
                <NavDropdown.Divider />
                <NavDropdown.Item onClick={handleLogout} className="text-danger">
                  <i className="bi bi-box-arrow-right me-2"></i>
                  Sign Out
                </NavDropdown.Item>
              </NavDropdown>
            )}
            <button type="button" className="yash-icon-btn yash-bag" aria-label="Bag">
              <i className="bi bi-bag"></i>
              <span className="yash-bag-count">0</span>
            </button>
          </div>
        </Navbar.Collapse>
    </Navbar>
  )
}

export default AppHeader
