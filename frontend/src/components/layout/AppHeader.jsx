import React, { useState, useEffect } from 'react'
import { Navbar, Nav, NavDropdown, Container, Button, Form } from 'react-bootstrap'
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
  const [cartItems, setCartItems] = useState([])
  const [selectedCartIds, setSelectedCartIds] = useState([])

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
    const updateCartData = async () => {
      if (!isAuthenticated()) {
        setCartCount(0)
        setCartItems([])
        return
      }

      const user = getCurrentUser()
      if (!user?.id) {
        setCartCount(0)
        setCartItems([])
        return
      }

      try {
        const [countRes, itemsRes] = await Promise.all([
          cartService.getCount(),
          cartService.getAll()
        ])
        setCartCount(countRes.data?.count || 0)
        setCartItems(itemsRes.data || [])
      } catch (error) {
        console.error('Failed to load cart data:', error)
        setCartCount(0)
        setCartItems([])
      }
    }

    updateCartData()
    window.addEventListener('cart:updated', updateCartData)
    window.addEventListener('storage', updateCartData)

    return () => {
      window.removeEventListener('cart:updated', updateCartData)
      window.removeEventListener('storage', updateCartData)
    }
  }, [])

  useEffect(() => {
    if (cartItems.length > 0) {
      setSelectedCartIds((prev) => {
        const idSet = new Set(cartItems.map((i) => i.id))
        const kept = prev.filter((id) => idSet.has(id))
        const added = cartItems.filter((i) => !prev.includes(i.id)).map((i) => i.id)
        return added.length > 0 ? [...kept, ...added] : kept.length > 0 ? kept : cartItems.map((i) => i.id)
      })
    } else {
      setSelectedCartIds([])
    }
  }, [cartItems])

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
      to: `${ROUTES.SHOP}?category=${category.id}`,
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
                <NavDropdown.Item onClick={() => navigate(ROUTES.PROFILE)}>
                  <i className="bi bi-person-circle me-2"></i>
                  Profile
                </NavDropdown.Item>
                <NavDropdown.Item onClick={() => navigate(ROUTES.USER_ORDERS_LIST)}>
                  <i className="bi bi-receipt me-2"></i>
                  My orders
                </NavDropdown.Item>
                <NavDropdown.Item onClick={() => navigate(ROUTES.ADDRESSES)}>
                  <i className="bi bi-geo-alt me-2"></i>
                  Address
                </NavDropdown.Item>
                <NavDropdown.Divider />
                <NavDropdown.Item onClick={handleLogout} className="text-danger">
                  <i className="bi bi-box-arrow-right me-2"></i>
                  Sign Out
                </NavDropdown.Item>
              </NavDropdown>
            )}
            <NavDropdown
              title={
                <div className="yash-bag-icon-wrapper">
                  <i className="bi bi-bag"></i>
                  <span className="yash-bag-count">{cartCount}</span>
                </div>
              }
              id="cart-nav-dropdown"
              align="end"
              className="nav-icon-dropdown cart-dropdown"
            >
              <div className="cart-dropdown-header p-3 border-bottom">
                <h6 className="mb-0 fw-bold text-uppercase small" style={{ letterSpacing: '0.1em' }}>Cart ({cartCount})</h6>
              </div>
              <div className="cart-dropdown-body" style={{ maxHeight: '350px', overflowY: 'auto' }}>
                {cartItems.length === 0 ? (
                  <div className="p-4 text-center text-muted">
                    <i className="bi bi-bag-x display-4 d-block mb-2"></i>
                    <p className="mb-0 small">Your cart is empty</p>
                  </div>
                ) : (
                  cartItems.map((item) => (
                    <div key={item.id} className="cart-dropdown-item p-3 d-flex gap-2 align-items-center border-bottom">
                      <Form.Check
                        type="checkbox"
                        id={`header-cart-${item.id}`}
                        checked={selectedCartIds.includes(item.id)}
                        onChange={() => {
                          setSelectedCartIds((prev) =>
                            prev.includes(item.id) ? prev.filter((id) => id !== item.id) : [...prev, item.id]
                          )
                        }}
                        onClick={(e) => e.stopPropagation()}
                        className="cart-dropdown-checkbox flex-shrink-0"
                        aria-label={`Select ${item.product?.name}`}
                      />
                      <img 
                        src={item.product?.imageUrl || 'https://via.placeholder.com/50'} 
                        alt={item.product?.name} 
                        style={{ width: '50px', height: '60px', objectFit: 'cover', flexShrink: 0 }}
                      />
                      <div className="flex-grow-1 min-width-0">
                        <h6 className="mb-1 text-truncate small fw-bold">{item.product?.name}</h6>
                        <div className="d-flex justify-content-between align-items-center">
                          <span className="text-muted extra-small">Qty: {item.quantity}</span>
                          <span className="fw-bold small">{(item.product?.mrp * item.quantity).toLocaleString('vi-VN')}₫</span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
              {cartItems.length > 0 && (
                <div className="cart-dropdown-footer p-3">
                  <div className="d-flex justify-content-between mb-3">
                    <span className="text-muted small">
                      {selectedCartIds.length > 0 ? `Subtotal (${selectedCartIds.length}):` : 'Subtotal:'}
                    </span>
                    <span className="fw-bold text-dark">
                      {(() => {
                        const selected = cartItems.filter((i) => selectedCartIds.includes(i.id))
                        return selected.reduce((total, item) => total + (item.product?.mrp ?? 0) * (item.quantity ?? 0), 0).toLocaleString('vi-VN') + '₫'
                      })()}
                    </span>
                  </div>
                  <div className="d-grid gap-2">
                    <Button variant="dark" size="sm" className="rounded-0 text-uppercase" style={{ letterSpacing: '0.1em', fontSize: '0.7rem' }} onClick={() => navigate(ROUTES.CART)}>
                      View cart
                    </Button>
                    <Button 
                      variant="outline-dark" 
                      size="sm" 
                      className="rounded-0 text-uppercase" 
                      style={{ letterSpacing: '0.1em', fontSize: '0.7rem' }} 
                      disabled={selectedCartIds.length === 0}
                      onClick={() => navigate(ROUTES.CHECKOUT, { state: { cartItemIds: selectedCartIds } })}
                    >
                      Checkout {selectedCartIds.length > 0 ? `(${selectedCartIds.length})` : ''}
                    </Button>
                  </div>
                </div>
              )}
            </NavDropdown>
          </div>
        </Navbar.Collapse>
    </Navbar>
  )
}

export default AppHeader
