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

  const navItems = [
    { to: ROUTES.DASHBOARD, label: 'Shop', icon: 'bi bi-gem', hasCategories: true },
    { to: ROUTES.ABOUT, label: 'About', icon: 'bi bi-info-circle' }
  ]

  const [productCategories, setProductCategories] = useState([])
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
        const response = await categoryService.getAll()
        const categories = response.data || []
        setProductCategories(categories)
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

  return (
    <Navbar 
      expand="lg" 
      className={`custom-navbar p-0 fixed-top ${isScrolled ? 'navbar-scrolled' : ''}`}
      variant="light"
    >
      <Container>
        <Navbar.Brand as={Link} to={ROUTES.DASHBOARD} className="d-flex align-items-center">
          <span className="me-2" style={{ fontSize: '1.1rem' }}>💎</span>
          <div>
            <div className="fw-bold" style={{ fontSize: '1rem', lineHeight: '1.2' }}>Yash Gems & Jewelleries</div>
          </div>
        </Navbar.Brand>

        <Navbar.Toggle aria-controls="basic-navbar-nav" />

        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            {navItems.map(item => (
              item.hasCategories ? (
                <div key={item.to} className="nav-category-trigger">
                  <Nav.Link
                    as={Link}
                    to={item.to}
                    active={location.pathname === item.to}
                  >
                    <i className={`${item.icon} me-1`}></i>
                    {item.label}
                  </Nav.Link>
                  <div className="nav-category-menu">
                    <div className="menu-inner">
                      <h6>Categories</h6>
                      <div className="menu-grid">
                        {isLoadingCategories ? (
                          <span className="category-item">Loading...</span>
                        ) : productCategories.length === 0 ? (
                          <span className="category-item">No categories</span>
                        ) : (
                          productCategories.map((category) => (
                            <button
                              key={category.id || category.name}
                              type="button"
                              className="category-item"
                            >
                              {category.name || category.title}
                            </button>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <Nav.Link
                  key={item.to}
                  as={Link}
                  to={item.to}
                  active={location.pathname === item.to}
                >
                  <i className={`${item.icon} me-1`}></i>
                  {item.label}
                </Nav.Link>
              )
            ))}
            {isAdmin() && (
              <Nav.Link as={Link} to={ROUTES.ADMIN}>
                <i className="bi bi-gear me-1"></i>
                Admin
              </Nav.Link>
            )}
          </Nav>

          <Nav className="nav-actions">
            <button
              type="button"
              className="nav-icon-btn"
              aria-label="Search"
              onClick={() => navigate(ROUTES.DASHBOARD)}
            >
              <i className="bi bi-search"></i>
            </button>
            {!isAuthenticated() ? (
              <button
                type="button"
                className="nav-icon-btn"
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
            <button
              type="button"
              className="nav-icon-btn"
              aria-label="Cart"
            >
              <i className="bi bi-bag"></i>
              <span className="cart-count">0</span>
            </button>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  )
}

export default AppHeader
