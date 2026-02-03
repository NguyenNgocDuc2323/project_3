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
  const [cartItems, setCartItems] = useState([])
  const [loadingCart, setLoadingCart] = useState(false)
  const [updatingCart, setUpdatingCart] = useState(false)

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

  const loadCartItems = async () => {
    if (!isAuthenticated()) {
      setCartItems([])
      return
    }

    try {
      setLoadingCart(true)
      const response = await cartService.getAll()
      setCartItems(response.data || [])
    } catch (error) {
      console.error('Failed to load cart items:', error)
      setCartItems([])
    } finally {
      setLoadingCart(false)
    }
  }

  useEffect(() => {
    const updateCartCount = async () => {
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
        // Load both count and items in parallel
        const [countResponse, itemsResponse] = await Promise.all([
          cartService.getCount(),
          cartService.getAll()
        ])
        const count = countResponse.data?.count || 0
        const items = itemsResponse.data || []
        
        setCartCount(count)
        setCartItems(items)
        
        // Debug log
        if (count > 0 && items.length === 0) {
          console.warn('Cart count is', count, 'but items array is empty. Response:', itemsResponse)
        }
      } catch (error) {
        console.error('Failed to load cart:', error)
        setCartCount(0)
        setCartItems([])
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

  const handleCartDropdownToggle = (isOpen) => {
    if (isOpen && isAuthenticated()) {
      loadCartItems()
    }
  }

  const handleQuantityChange = async (productId, newQuantity) => {
    if (newQuantity < 1) {
      return
    }

    try {
      setUpdatingCart(true)
      await cartService.update(productId, newQuantity)
      await loadCartItems()
      window.dispatchEvent(new Event('cart:updated'))
      
      if (window.showToast) {
        window.showToast({
          severity: 'success',
          summary: 'Thành công',
          detail: 'Đã cập nhật số lượng',
          life: 2000
        })
      }
    } catch (error) {
      console.error('Error updating quantity:', error)
      if (window.showToast) {
        window.showToast({
          severity: 'error',
          summary: 'Lỗi',
          detail: error.response?.data?.message || 'Không thể cập nhật số lượng',
          life: 4000
        })
      }
    } finally {
      setUpdatingCart(false)
    }
  }

  const handleRemoveItem = async (productId) => {
    try {
      setUpdatingCart(true)
      await cartService.remove(productId)
      await loadCartItems()
      window.dispatchEvent(new Event('cart:updated'))
      
      if (window.showToast) {
        window.showToast({
          severity: 'success',
          summary: 'Thành công',
          detail: 'Đã xóa sản phẩm khỏi giỏ hàng',
          life: 2000
        })
      }
    } catch (error) {
      console.error('Error removing item:', error)
      if (window.showToast) {
        window.showToast({
          severity: 'error',
          summary: 'Lỗi',
          detail: error.response?.data?.message || 'Không thể xóa sản phẩm',
          life: 4000
        })
      }
    } finally {
      setUpdatingCart(false)
    }
  }

  const calculateTotal = () => {
    return cartItems.reduce((total, item) => {
      const price = item.product?.originalPrice || 0
      return total + (price * item.quantity)
    }, 0)
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
                <NavDropdown.Item onClick={() => navigate(ROUTES.PROFILE)}>
                  <i className="bi bi-person-gear me-2"></i>
                  Profile
                </NavDropdown.Item>
                <NavDropdown.Divider />
                <NavDropdown.Item onClick={handleLogout} className="text-danger">
                  <i className="bi bi-box-arrow-right me-2"></i>
                  Sign Out
                </NavDropdown.Item>
              </NavDropdown>
            )}
            {isAuthenticated() ? (
              <NavDropdown
                title={
                  <span className="yash-icon-btn yash-bag" style={{ position: 'relative' }}>
                    <i className="bi bi-bag"></i>
                    {cartCount > 0 && (
                      <span className="yash-bag-count">{cartCount}</span>
                    )}
                  </span>
                }
                id="cart-nav-dropdown"
                align="end"
                className="nav-icon-dropdown"
                onToggle={handleCartDropdownToggle}
              >
                <NavDropdown.ItemText>
                  <div className="d-flex justify-content-between align-items-center">
                    <strong>
                      <i className="bi bi-cart me-2"></i>
                      Giỏ hàng ({cartItems.length})
                    </strong>
                  </div>
                </NavDropdown.ItemText>
                <NavDropdown.Divider />
                {loadingCart ? (
                  <NavDropdown.ItemText>
                    <div className="text-center py-3">
                      <div className="spinner-border spinner-border-sm text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                      </div>
                    </div>
                  </NavDropdown.ItemText>
                ) : cartItems.length === 0 ? (
                  <NavDropdown.ItemText>
                    <div className="text-center py-3 text-muted">
                      <i className="bi bi-cart-x" style={{ fontSize: '2rem' }}></i>
                      <p className="mb-0 mt-2">Giỏ hàng trống</p>
                    </div>
                  </NavDropdown.ItemText>
                ) : (
                  <>
                    <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                      {cartItems.map((item) => (
                        <div key={item.id} className="cart-dropdown-item">
                          <div className="d-flex align-items-center p-2">
                            <img
                              src={item.product?.imageUrl || 'https://via.placeholder.com/60'}
                              alt={item.product?.name || 'Product'}
                              style={{
                                width: '60px',
                                height: '60px',
                                objectFit: 'cover',
                                borderRadius: '4px',
                                marginRight: '12px'
                              }}
                              onError={(e) => {
                                e.target.src = 'https://via.placeholder.com/60'
                              }}
                            />
                            <div className="flex-grow-1" style={{ minWidth: 0 }}>
                              <div className="fw-semibold" style={{ fontSize: '0.875rem' }}>
                                {item.product?.name || 'Sản phẩm'}
                              </div>
                              <div className="text-muted" style={{ fontSize: '0.75rem' }}>
                                ${(item.product?.originalPrice || 0).toFixed(2)} × {item.quantity}
                              </div>
                              <div className="d-flex align-items-center gap-2 mt-1">
                                <button
                                  className="btn btn-sm btn-outline-secondary p-0"
                                  style={{ width: '24px', height: '24px', fontSize: '0.75rem' }}
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleQuantityChange(item.productId || item.ProductId, item.quantity - 1)
                                  }}
                                  disabled={updatingCart || item.quantity <= 1}
                                >
                                  <i className="bi bi-dash"></i>
                                </button>
                                <span style={{ fontSize: '0.875rem', minWidth: '24px', textAlign: 'center' }}>
                                  {item.quantity}
                                </span>
                                <button
                                  className="btn btn-sm btn-outline-secondary p-0"
                                  style={{ width: '24px', height: '24px', fontSize: '0.75rem' }}
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleQuantityChange(item.productId || item.ProductId, item.quantity + 1)
                                  }}
                                  disabled={updatingCart}
                                >
                                  <i className="bi bi-plus"></i>
                                </button>
                                <button
                                  className="btn btn-sm btn-link text-danger p-0 ms-auto"
                                  style={{ fontSize: '0.75rem' }}
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleRemoveItem(item.productId || item.ProductId)
                                  }}
                                  disabled={updatingCart}
                                >
                                  <i className="bi bi-trash"></i>
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <NavDropdown.Divider />
                    <NavDropdown.ItemText>
                      <div className="d-flex justify-content-between align-items-center px-2 mb-2">
                        <strong>Tổng cộng:</strong>
                        <strong className="text-primary">${calculateTotal().toFixed(2)}</strong>
                      </div>
                    </NavDropdown.ItemText>
                    <NavDropdown.Item
                      onClick={() => navigate(ROUTES.CART)}
                      className="text-center bg-primary text-white"
                      style={{ margin: '0 8px 8px 8px', borderRadius: '4px' }}
                    >
                      <i className="bi bi-credit-card me-2"></i>
                      Thanh toán
                    </NavDropdown.Item>
                  </>
                )}
              </NavDropdown>
            ) : (
              <button 
                type="button" 
                className="yash-icon-btn yash-bag" 
                aria-label="Bag"
                onClick={() => navigate(ROUTES.LOGIN)}
              >
                <i className="bi bi-bag"></i>
              </button>
            )}
          </div>
        </Navbar.Collapse>
    </Navbar>
  )
}

export default AppHeader
