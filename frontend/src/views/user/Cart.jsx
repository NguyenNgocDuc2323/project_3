import React, { useState, useEffect } from 'react'
import { Container, Card, Button, Row, Col, Spinner, Alert } from 'react-bootstrap'
import { useNavigate } from 'react-router-dom'
import { cartService } from '../../common/services'
import { ROUTES } from '../../common/constants'
import './Cart.css'

const Cart = () => {
  const navigate = useNavigate()
  const [cartItems, setCartItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [draggedItem, setDraggedItem] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    loadCart()
  }, [])

  const loadCart = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await cartService.getAll()
      setCartItems(response.data || [])
    } catch (error) {
      console.error('Error loading cart:', error)
      setError('Không thể tải giỏ hàng. Vui lòng thử lại.')
      if (window.showToast) {
        window.showToast({
          severity: 'error',
          summary: 'Lỗi',
          detail: 'Không thể tải giỏ hàng',
          life: 4000
        })
      }
    } finally {
      setLoading(false)
    }
  }

  const handleQuantityChange = async (productId, newQuantity) => {
    if (newQuantity < 1) {
      return
    }

    try {
      setUpdating(true)
      await cartService.update(productId, newQuantity)
      
      // Update local state
      setCartItems(prevItems =>
        prevItems.map(item =>
          (item.productId || item.ProductId) === productId
            ? { ...item, quantity: newQuantity }
            : item
        )
      )

      // Refresh cart count in header
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
      setUpdating(false)
    }
  }

  const handleRemove = async (productId) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa sản phẩm này khỏi giỏ hàng?')) {
      return
    }

    try {
      setUpdating(true)
      await cartService.remove(productId)
      
      // Update local state
      setCartItems(prevItems => prevItems.filter(item => (item.productId || item.ProductId) !== productId))

      // Refresh cart count in header
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
      setUpdating(false)
    }
  }

  // Drag and Drop handlers
  const handleDragStart = (e, item) => {
    setDraggedItem(item)
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/html', e.target.outerHTML)
    e.target.style.opacity = '0.5'
  }

  const handleDragEnd = (e) => {
    e.target.style.opacity = '1'
    setDraggedItem(null)
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  const handleDrop = async (e, targetItem) => {
    e.preventDefault()
    
    if (!draggedItem || draggedItem.id === targetItem.id) {
      return
    }

    // Reorder items
    const draggedIndex = cartItems.findIndex(item => item.id === draggedItem.id)
    const targetIndex = cartItems.findIndex(item => item.id === targetItem.id)

    const newItems = [...cartItems]
    const [removed] = newItems.splice(draggedIndex, 1)
    newItems.splice(targetIndex, 0, removed)

    // Update local state only (no need to save order to database)
    setCartItems(newItems)
  }

  const calculateTotal = () => {
    return cartItems.reduce((total, item) => {
      const price = item.product?.originalPrice || 0
      return total + (price * item.quantity)
    }, 0)
  }

  const calculateSubtotal = () => {
    return cartItems.reduce((total, item) => {
      const price = item.product?.mrp || 0
      return total + (price * item.quantity)
    }, 0)
  }

  if (loading) {
    return (
      <Container className="py-5">
        <div className="text-center">
          <Spinner animation="border" variant="primary" />
          <p className="mt-3 text-muted">Đang tải giỏ hàng...</p>
        </div>
      </Container>
    )
  }

  if (error) {
    return (
      <Container className="py-5">
        <Alert variant="danger">
          <Alert.Heading>Lỗi</Alert.Heading>
          <p>{error}</p>
          <Button onClick={loadCart}>Thử lại</Button>
        </Alert>
      </Container>
    )
  }

  return (
    <Container className="py-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="display-5 fw-bold">
          <i className="bi bi-cart me-2"></i>
          Giỏ hàng của tôi
        </h1>
        {cartItems.length > 0 && (
          <Button
            variant="outline-primary"
            onClick={() => navigate(ROUTES.SHOP)}
          >
            <i className="bi bi-arrow-left me-2"></i>
            Tiếp tục mua sắm
          </Button>
        )}
      </div>

      {cartItems.length === 0 ? (
        <Card className="text-center py-5">
          <Card.Body>
            <i className="bi bi-cart-x" style={{ fontSize: '5rem', color: '#dee2e6' }}></i>
            <h3 className="mt-3 text-muted">Giỏ hàng trống</h3>
            <p className="text-muted">Bạn chưa có sản phẩm nào trong giỏ hàng</p>
            <Button
              variant="primary"
              size="lg"
              onClick={() => navigate(ROUTES.SHOP)}
            >
              <i className="bi bi-bag me-2"></i>
              Bắt đầu mua sắm
            </Button>
          </Card.Body>
        </Card>
      ) : (
        <Row>
          <Col lg={8}>
            <Card>
              <Card.Header className="bg-light">
                <h5 className="mb-0">
                  <i className="bi bi-list-ul me-2"></i>
                  Sản phẩm ({cartItems.length})
                </h5>
                <small className="text-muted">
                  Kéo thả để sắp xếp lại thứ tự
                </small>
              </Card.Header>
              <Card.Body className="p-0">
                <div className="cart-items-list">
                  {cartItems.map((item, index) => (
                    <div
                      key={item.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, item)}
                      onDragEnd={handleDragEnd}
                      onDragOver={handleDragOver}
                      onDrop={(e) => handleDrop(e, item)}
                      className={`cart-item ${draggedItem?.id === item.id ? 'dragging' : ''}`}
                    >
                      <div className="cart-item-image">
                        <img
                          src={item.product?.imageUrl || 'https://via.placeholder.com/150'}
                          alt={item.product?.name || 'Product'}
                          onError={(e) => {
                            e.target.src = 'https://via.placeholder.com/150'
                          }}
                        />
                      </div>
                      <div className="cart-item-details">
                        <h6 className="cart-item-name">
                          {item.product?.name || 'Sản phẩm không xác định'}
                        </h6>
                        <div className="cart-item-meta">
                          <span className="text-muted">
                            Mã: {item.product?.styleCode || 'N/A'}
                          </span>
                          {item.product?.category && (
                            <span className="text-muted ms-2">
                              | {item.product.category.name}
                            </span>
                          )}
                        </div>
                        <div className="cart-item-price">
                          <span className="price-current">
                            ${(item.product?.originalPrice || 0).toFixed(2)}
                          </span>
                          {item.product?.mrp && item.product.mrp > item.product.originalPrice && (
                            <span className="price-old ms-2">
                              ${item.product.mrp.toFixed(2)}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="cart-item-actions">
                        <div className="quantity-controls">
                          <Button
                            variant="outline-dark"
                            size="sm"
                            onClick={() => handleQuantityChange(item.productId || item.ProductId, item.quantity - 1)}
                            disabled={updating || item.quantity <= 1}
                            className="quantity-btn"
                          >
                            <i className="bi bi-dash-lg"></i>
                          </Button>
                          <span className="quantity-value">{item.quantity}</span>
                          <Button
                            variant="outline-dark"
                            size="sm"
                            onClick={() => handleQuantityChange(item.productId || item.ProductId, item.quantity + 1)}
                            disabled={updating}
                            className="quantity-btn"
                          >
                            <i className="bi bi-plus-lg"></i>
                          </Button>
                        </div>
                        <Button
                          variant="outline-danger"
                          size="sm"
                          onClick={() => handleRemove(item.productId || item.ProductId)}
                          disabled={updating}
                          className="mt-2"
                        >
                          <i className="bi bi-trash me-1"></i>
                          Xóa
                        </Button>
                      </div>
                      <div className="cart-item-drag-handle">
                        <i className="bi bi-grip-vertical"></i>
                      </div>
                    </div>
                  ))}
                </div>
              </Card.Body>
            </Card>
          </Col>
          <Col lg={4}>
            <Card className="sticky-top" style={{ top: '20px' }}>
              <Card.Header className="bg-primary text-white">
                <h5 className="mb-0">
                  <i className="bi bi-calculator me-2"></i>
                  Tổng thanh toán
                </h5>
              </Card.Header>
              <Card.Body>
                <div className="d-flex justify-content-between mb-2">
                  <span>Tạm tính:</span>
                  <span>${calculateSubtotal().toFixed(2)}</span>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span>Giảm giá:</span>
                  <span className="text-success">
                    -${(calculateSubtotal() - calculateTotal()).toFixed(2)}
                  </span>
                </div>
                <hr />
                <div className="d-flex justify-content-between mb-3">
                  <strong>Tổng cộng:</strong>
                  <strong className="text-primary" style={{ fontSize: '1.25rem' }}>
                    ${calculateTotal().toFixed(2)}
                  </strong>
                </div>
                <Button
                  variant="primary"
                  size="lg"
                  className="w-100"
                  disabled={updating || cartItems.length === 0}
                  onClick={() => navigate(ROUTES.CHECKOUT)}
                >
                  {updating ? (
                    <>
                      <Spinner
                        animation="border"
                        size="sm"
                        className="me-2"
                      />
                      Đang xử lý...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-credit-card me-2"></i>
                      Thanh toán
                    </>
                  )}
                </Button>
                <Button
                  variant="outline-secondary"
                  size="lg"
                  className="w-100 mt-2"
                  onClick={() => navigate(ROUTES.SHOP)}
                >
                  <i className="bi bi-arrow-left me-2"></i>
                  Tiếp tục mua sắm
                </Button>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}
    </Container>
  )
}

export default Cart

