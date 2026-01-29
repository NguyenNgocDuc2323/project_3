import React, { useState, useEffect } from 'react'
import { Container, Row, Col, Card, Button, Spinner, Badge, Alert, Modal } from 'react-bootstrap'
import { useNavigate } from 'react-router-dom'
import { cartService } from '../../common/services'
import { showToast } from '../../common/utils'
import { ROUTES } from '../../common/constants'
import './Cart.css'

const Cart = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [cart, setCart] = useState(null)
  const [draggedItem, setDraggedItem] = useState(null)
  const [showClearModal, setShowClearModal] = useState(false)

  useEffect(() => {
    loadCart()
  }, [])

  const loadCart = async () => {
    try {
      setLoading(true)
      const response = await cartService.getCart()
      setCart(response.data)
    } catch (error) {
      console.error('Error loading cart:', error)
      showToast('Không thể tải giỏ hàng', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleQuantityChange = async (itemId, newQuantity) => {
    if (newQuantity < 1) {
      return
    }

    try {
      await cartService.updateItemQuantity(itemId, newQuantity)
      await loadCart()
      showToast('Cập nhật số lượng thành công', 'success')
    } catch (error) {
      console.error('Error updating quantity:', error)
      showToast(error.response?.data?.message || 'Có lỗi xảy ra', 'error')
    }
  }

  const handleRemoveItem = async (itemId) => {
    try {
      await cartService.removeItem(itemId)
      await loadCart()
      showToast('Đã xóa sản phẩm khỏi giỏ hàng', 'success')
    } catch (error) {
      console.error('Error removing item:', error)
      showToast('Có lỗi xảy ra khi xóa sản phẩm', 'error')
    }
  }

  const handleClearCart = async () => {
    try {
      await cartService.clearCart()
      setShowClearModal(false)
      await loadCart()
      showToast('Đã xóa tất cả sản phẩm khỏi giỏ hàng', 'success')
    } catch (error) {
      console.error('Error clearing cart:', error)
      showToast('Có lỗi xảy ra khi xóa giỏ hàng', 'error')
    }
  }

  const handleCheckout = () => {
    if (!cart || cart.items.length === 0) {
      showToast('Giỏ hàng trống', 'error')
      return
    }
    // Navigate to checkout or thank you page
    // For now, we'll simulate a successful payment
    navigate(ROUTES.THANK_YOU, { 
      state: { 
        orderId: `ORD-${Date.now()}`,
        items: cart.items,
        totalAmount: cart.totalAmount
      } 
    })
  }

  // Drag and Drop handlers
  const handleDragStart = (e, item) => {
    setDraggedItem(item)
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/html', e.target)
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

  const handleDrop = async (e, targetItemId) => {
    e.preventDefault()
    
    if (!draggedItem || draggedItem.id === targetItemId) {
      return
    }

    // Reorder items (for visual effect)
    // In a real scenario, you might want to save the order
    const items = [...cart.items]
    const draggedIndex = items.findIndex(item => item.id === draggedItem.id)
    const targetIndex = items.findIndex(item => item.id === targetItemId)
    
    if (draggedIndex !== -1 && targetIndex !== -1) {
      const [removed] = items.splice(draggedIndex, 1)
      items.splice(targetIndex, 0, removed)
      
      setCart(prev => ({
        ...prev,
        items
      }))
      
      showToast('Đã sắp xếp lại giỏ hàng', 'success')
    }
  }

  const formatCurrency = (value) => {
    const amount = Number(value || 0)
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      maximumFractionDigits: 0
    }).format(amount)
  }

  const getProductImageUrl = (imageUrl) => {
    if (!imageUrl) {
      return 'https://via.placeholder.com/150?text=No+Image'
    }
    if (imageUrl.startsWith('http')) {
      return imageUrl
    }
    const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:5000'
    return `${apiBase}${imageUrl}`
  }

  if (loading) {
    return (
      <Container className="py-5">
        <div className="text-center">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Đang tải...</span>
          </Spinner>
        </div>
      </Container>
    )
  }

  if (!cart || cart.items.length === 0) {
    return (
      <Container className="py-5">
        <Card className="text-center py-5">
          <Card.Body>
            <i className="bi bi-cart-x display-1 text-muted"></i>
            <h3 className="mt-3">Giỏ hàng trống</h3>
            <p className="text-muted">Bạn chưa có sản phẩm nào trong giỏ hàng</p>
            <Button variant="primary" onClick={() => navigate(ROUTES.DASHBOARD)}>
              <i className="bi bi-arrow-left me-2"></i>
              Tiếp tục mua sắm
            </Button>
          </Card.Body>
        </Card>
      </Container>
    )
  }

  return (
    <Container className="py-5">
      <Row>
        <Col lg={8}>
          <Card className="shadow-sm mb-4">
            <Card.Header className="d-flex justify-content-between align-items-center">
              <h4 className="mb-0">
                <i className="bi bi-cart-check me-2"></i>
                Giỏ hàng của tôi ({cart.totalItems} sản phẩm)
              </h4>
              <Button
                variant="outline-danger"
                size="sm"
                onClick={() => setShowClearModal(true)}
              >
                <i className="bi bi-trash me-1"></i>
                Xóa tất cả
              </Button>
            </Card.Header>
            <Card.Body>
              <div className="cart-items">
                {cart.items.map((item, index) => (
                  <div
                    key={item.id}
                    className={`cart-item ${draggedItem?.id === item.id ? 'dragging' : ''}`}
                    draggable
                    onDragStart={(e) => handleDragStart(e, item)}
                    onDragEnd={handleDragEnd}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, item.id)}
                  >
                    <div className="cart-item-image">
                      <img
                        src={getProductImageUrl(item.productImageUrl)}
                        alt={item.productName}
                        onError={(e) => {
                          e.target.src = 'https://via.placeholder.com/150?text=No+Image'
                        }}
                      />
                    </div>
                    <div className="cart-item-details">
                      <h5>{item.productName}</h5>
                      <p className="text-muted mb-2">
                        Giá: {formatCurrency(item.productMRP)}
                      </p>
                      <div className="d-flex align-items-center gap-3">
                        <div className="quantity-controls">
                          <Button
                            variant="outline-secondary"
                            size="sm"
                            onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                          >
                            <i className="bi bi-dash"></i>
                          </Button>
                          <span className="mx-3 fw-bold">{item.quantity}</span>
                          <Button
                            variant="outline-secondary"
                            size="sm"
                            onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                          >
                            <i className="bi bi-plus"></i>
                          </Button>
                        </div>
                        <Badge bg="primary" className="fs-6">
                          {formatCurrency(item.subtotal)}
                        </Badge>
                      </div>
                    </div>
                    <div className="cart-item-actions">
                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() => handleRemoveItem(item.id)}
                      >
                        <i className="bi bi-trash"></i>
                      </Button>
                      <div className="drag-handle mt-2">
                        <i className="bi bi-grip-vertical text-muted"></i>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col lg={4}>
          <Card className="shadow-sm sticky-top" style={{ top: '20px' }}>
            <Card.Header>
              <h5 className="mb-0">Tóm tắt đơn hàng</h5>
            </Card.Header>
            <Card.Body>
              <div className="d-flex justify-content-between mb-3">
                <span>Tổng số sản phẩm:</span>
                <strong>{cart.totalItems}</strong>
              </div>
              <div className="d-flex justify-content-between mb-3">
                <span>Tạm tính:</span>
                <strong>{formatCurrency(cart.totalAmount)}</strong>
              </div>
              <hr />
              <div className="d-flex justify-content-between mb-4">
                <h5>Tổng cộng:</h5>
                <h5 className="text-primary">{formatCurrency(cart.totalAmount)}</h5>
              </div>
              <Button
                variant="primary"
                size="lg"
                className="w-100"
                onClick={handleCheckout}
              >
                <i className="bi bi-credit-card me-2"></i>
                Thanh toán
              </Button>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Clear Cart Modal */}
      <Modal show={showClearModal} onHide={() => setShowClearModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Xác nhận xóa giỏ hàng</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Bạn có chắc chắn muốn xóa tất cả sản phẩm khỏi giỏ hàng?
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowClearModal(false)}>
            Hủy
          </Button>
          <Button variant="danger" onClick={handleClearCart}>
            Xóa tất cả
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  )
}

export default Cart

