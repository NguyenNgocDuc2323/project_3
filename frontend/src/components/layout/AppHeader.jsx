import React, { useState, useEffect } from 'react'
import { Navbar, Nav, NavDropdown, Container } from 'react-bootstrap'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { isAuthenticated, isAdmin, getCurrentUser, logout } from '../../common/utils'
import { cartService, categoryService } from '../../common/services'
import { ROUTES } from '../../common/constants'
import logo from '../../assets/images/logo.png'
import './AppHeader.css'

const AppHeader = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const [isScrolled, setIsScrolled] = useState(false)
  const [userInfo, setUserInfo] = useState(null)
  const [cartCount, setCartCount] = useState(0)

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

  useEffect(() => {
    const updateCartCount = async () => {
      if (!isAuthenticated()) {
        setCartCount(0)
        return
      }

      const user = getCurrentUser()
      if (!user?.id) {
        setCartCount(0)
        return
      }

      try {
        const response = await cartService.getCount()
        setCartCount(response.data?.count || 0)
      } catch (error) {
        console.error('Failed to load cart count:', error)
        setCartCount(0)
      }
    }

    updateCartCount()
    window.addEventListener('cart:updated', updateCartCount)
    window.addEventListener('storage', updateCartCount)

    return () => {
      window.removeEventListener('cart:updated', updateCartCount)
      window.removeEventListener('storage', updateCartCount)
    }
  }, [])

  const handleLogout = () => {
    logout()
    navigate(ROUTES.LOGIN)
  }

  const renderMenuItem = (item) => {
    if (typeof item === 'string') {
      return (
        <span className="mega-link" key={item}>
          {item}
        </span>
      )
    }

    return (
      <Link className="mega-link" key={item.label} to={item.to}>
        {item.label}
      </Link>
    )
  }

  const menuItems = categoryTree.map((category) => {
    const hasChildren = Array.isArray(category.children) && category.children.length > 0
    const childItems = hasChildren
      ? category.children.map((child) => ({
          label: child.name,
          to: `${ROUTES.SHOP}?category=${child.id}`
        }))
      : [
          {
            label: category.name,
            to: `${ROUTES.SHOP}?category=${category.id}`
          }
        ]

    return {
      label: category.name,
      to: ROUTES.SHOP,
      sections: [
        {
          title: 'Categories',
          items: childItems
        }
      ]
    }
  })

  return (
    <Navbar
      expand="lg"
      className={`yash-header ${isScrolled ? 'navbar-scrolled' : ''}`}
      variant="light"
    >
      <Navbar.Brand as={Link} to={ROUTES.DASHBOARD} className="yash-logo">
          <img src={logo} alt="Yash Gems & Jewelleries" />
        </Navbar.Brand>

        <Navbar.Toggle aria-controls="yash-navbar" className="yash-toggle" />

        <Navbar.Collapse id="yash-navbar" className="yash-collapse">
          <Nav className="yash-nav">
            <Nav.Link 
              as={Link} 
              to={ROUTES.SHOP} 
              className="yash-nav-link"
              active={location.pathname === ROUTES.SHOP && !location.search}
            >
              Shop
            </Nav.Link>
            <Nav.Link 
              as={Link} 
              to="/contact" 
              className="yash-nav-link"
              active={location.pathname === '/contact'}
            >
              Contact
            </Nav.Link>
            {menuItems.map((item) => {
              const currentCategoryId = new URLSearchParams(location.search).get('category');
              
              const isItemActive = categoryTree.some(cat => 
                cat.name === item.label && 
                (currentCategoryId === String(cat.id) || 
                 cat.children?.some(child => currentCategoryId === String(child.id)))
              );

              return (
                <div key={item.label} className="yash-nav-item">
                  <Nav.Link 
                    as={Link} 
                    to={item.to} 
                    className="yash-nav-link"
                    active={isItemActive}
                  >
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
              )
            })}
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
                style={{fontSize: '1.5rem'}}
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
              <span className="yash-bag-count">{cartCount}</span>
            </button>
          </div>
        </Navbar.Collapse>
    </Navbar>
  )
}

export default AppHeader
