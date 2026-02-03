import React, { useState, useEffect } from 'react'
import { Container, Card, Button, Row, Col, Spinner, Form, Alert } from 'react-bootstrap'
import { useNavigate } from 'react-router-dom'
import { cartService, profileService } from '../../common/services'
import { ROUTES } from '../../common/constants'
import './Checkout.css'

const Checkout = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [cartItems, setCartItems] = useState([])
  const [profile, setProfile] = useState(null)
  const [paymentMethod, setPaymentMethod] = useState('cod') // Default to COD
  const [error, setError] = useState(null)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Load cart items and profile in parallel
      const [cartResponse, profileResponse] = await Promise.all([
        cartService.getAll(),
        profileService.get()
      ])

      const items = cartResponse.data || []
      if (items.length === 0) {
        setError('Giỏ hàng trống. Vui lòng thêm sản phẩm vào giỏ hàng trước khi thanh toán.')
        return
      }

      setCartItems(items)
      setProfile(profileResponse.data)
    } catch (error) {
      console.error('Error loading checkout data:', error)
      setError('Không thể tải thông tin. Vui lòng thử lại.')
      if (window.showToast) {
        window.showToast({
          severity: 'error',
          summary: 'Lỗi',
          detail: 'Không thể tải thông tin thanh toán',
          life: 4000
        })
      }
    } finally {
      setLoading(false)
    }
  }

  const calculateSubtotal = () => {
    return cartItems.reduce((total, item) => {
      const price = item.product?.mrp || 0
      return total + (price * item.quantity)
    }, 0)
  }

  const calculateDiscount = () => {
    const subtotal = calculateSubtotal()
    const total = calculateTotal()
    return subtotal - total
  }

  const calculateTotal = () => {
    return cartItems.reduce((total, item) => {
      const price = item.product?.originalPrice || 0
      return total + (price * item.quantity)
    }, 0)
  }

  const handlePaymentMethodChange = (method) => {
    setPaymentMethod(method)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Validate cart is not empty
    if (!cartItems || cartItems.length === 0) {
      if (window.showToast) {
        window.showToast({
          severity: 'error',
          summary: 'Lỗi',
          detail: 'Giỏ hàng trống. Vui lòng thêm sản phẩm vào giỏ hàng.',
          life: 4000
        })
      }
      return
    }

    try {
      setSubmitting(true)

      // Prepare order data
      const orderData = {
        items: cartItems,
        customer: profile,
        paymentMethod: paymentMethod,
        subtotal: calculateSubtotal(),
        discount: calculateDiscount(),
        total: calculateTotal(),
        createdAt: new Date().toISOString()
      }

      // Store order data in sessionStorage to pass to thank you page
      sessionStorage.setItem('lastOrder', JSON.stringify(orderData))

      // Clear cart when checkout is successful
      // This happens when user clicks "Xác nhận đặt hàng" button
      await cartService.clear()
      // Dispatch event to update cart count in header and dropdown
      window.dispatchEvent(new Event('cart:updated'))

      // Navigate to thank you page only after successful checkout
      navigate(ROUTES.THANK_YOU)
    } catch (error) {
      console.error('Error submitting order:', error)
      setSubmitting(false)
      if (window.showToast) {
        window.showToast({
          severity: 'error',
          summary: 'Lỗi',
          detail: error.response?.data?.message || 'Có lỗi xảy ra khi tạo đơn hàng. Giỏ hàng không bị xóa.',
          life: 4000
        })
      }
      // Don't clear cart if there's an error
      return
    }
  }

  if (loading) {
    return (
      <Container className="py-5">
        <div className="text-center">
          <Spinner animation="border" variant="primary" />
          <p className="mt-3 text-muted">Đang tải thông tin thanh toán...</p>
        </div>
      </Container>
    )
  }

  if (error && cartItems.length === 0) {
    return (
      <Container className="py-5">
        <Alert variant="danger">
          <Alert.Heading>Lỗi</Alert.Heading>
          <p>{error}</p>
          <Button onClick={() => navigate(ROUTES.CART)}>
            <i className="bi bi-arrow-left me-2"></i>
            Quay lại giỏ hàng
          </Button>
        </Alert>
      </Container>
    )
  }

  return (
    <Container className="py-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="display-5 fw-bold">
          <i className="bi bi-cart-check me-2"></i>
          Thanh toán
        </h1>
        <Button
          variant="outline-secondary"
          onClick={() => navigate(ROUTES.CART)}
        >
          <i className="bi bi-arrow-left me-2"></i>
          Quay lại giỏ hàng
        </Button>
      </div>

      <Row>
        <Col lg={8}>
          {/* Customer Information */}
          <Card className="mb-4">
            <Card.Header className="bg-primary text-white">
              <h5 className="mb-0">
                <i className="bi bi-person me-2"></i>
                Thông tin người mua hàng
              </h5>
            </Card.Header>
            <Card.Body>
              {profile ? (
                <div className="customer-info">
                  <Row>
                    <Col md={6} className="mb-3">
                      <strong>Họ và tên:</strong>
                      <p className="mb-0">{profile.fullName || profile.username || 'Chưa cập nhật'}</p>
                    </Col>
                    <Col md={6} className="mb-3">
                      <strong>Email:</strong>
                      <p className="mb-0">{profile.email}</p>
                    </Col>
                    <Col md={6} className="mb-3">
                      <strong>Số điện thoại:</strong>
                      <p className="mb-0">{profile.phone || 'Chưa cập nhật'}</p>
                    </Col>
                    <Col md={6} className="mb-3">
                      <strong>Địa chỉ:</strong>
                      <p className="mb-0">{profile.address || 'Chưa cập nhật'}</p>
                    </Col>
                  </Row>
                  <Button
                    variant="outline-primary"
                    size="sm"
                    onClick={() => navigate(ROUTES.EDIT_PROFILE)}
                  >
                    <i className="bi bi-pencil me-2"></i>
                    Cập nhật thông tin
                  </Button>
                </div>
              ) : (
                <Alert variant="warning">
                  Không thể tải thông tin người dùng. Vui lòng thử lại.
                </Alert>
              )}
            </Card.Body>
          </Card>

          {/* Payment Method */}
          <Card className="mb-4">
            <Card.Header className="bg-primary text-white">
              <h5 className="mb-0">
                <i className="bi bi-credit-card me-2"></i>
                Phương thức thanh toán
              </h5>
            </Card.Header>
            <Card.Body>
              <div className="payment-methods">
                <div 
                  className={`payment-option ${paymentMethod === 'bank_transfer' ? 'selected' : ''}`}
                  onClick={() => handlePaymentMethodChange('bank_transfer')}
                >
                  <Form.Check
                    type="radio"
                    id="payment-bank"
                    name="paymentMethod"
                    value="bank_transfer"
                    checked={paymentMethod === 'bank_transfer'}
                    onChange={(e) => handlePaymentMethodChange(e.target.value)}
                    label={
                      <div className="d-flex align-items-center">
                        <i className="bi bi-bank me-2" style={{ fontSize: '1.5rem', color: '#0d6efd' }}></i>
                        <div>
                          <strong>Chuyển khoản ngân hàng</strong>
                          <p className="text-muted small mb-0">Chuyển khoản qua tài khoản ngân hàng</p>
                        </div>
                      </div>
                    }
                  />
                </div>

                <div 
                  className={`payment-option ${paymentMethod === 'cod' ? 'selected' : ''}`}
                  onClick={() => handlePaymentMethodChange('cod')}
                >
                  <Form.Check
                    type="radio"
                    id="payment-cod"
                    name="paymentMethod"
                    value="cod"
                    checked={paymentMethod === 'cod'}
                    onChange={(e) => handlePaymentMethodChange(e.target.value)}
                    label={
                      <div className="d-flex align-items-center">
                        <i className="bi bi-truck me-2" style={{ fontSize: '1.5rem', color: '#198754' }}></i>
                        <div>
                          <strong>Thanh toán khi giao hàng (COD)</strong>
                          <p className="text-muted small mb-0">Thanh toán bằng tiền mặt khi nhận hàng</p>
                        </div>
                      </div>
                    }
                  />
                </div>

                <div 
                  className={`payment-option ${paymentMethod === 'vnpay' ? 'selected' : ''}`}
                  onClick={() => handlePaymentMethodChange('vnpay')}
                >
                  <Form.Check
                    type="radio"
                    id="payment-vnpay"
                    name="paymentMethod"
                    value="vnpay"
                    checked={paymentMethod === 'vnpay'}
                    onChange={(e) => handlePaymentMethodChange(e.target.value)}
                    label={
                      <div className="d-flex align-items-center">
                        <i className="bi bi-wallet2 me-2" style={{ fontSize: '1.5rem', color: '#dc3545' }}></i>
                        <div>
                          <strong>Thanh toán qua VNPay</strong>
                          <p className="text-muted small mb-0">Thanh toán trực tuyến qua cổng VNPay</p>
                        </div>
                      </div>
                    }
                  />
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={4}>
          {/* Order Summary */}
          <Card className="sticky-top" style={{ top: '20px' }}>
            <Card.Header className="bg-primary text-white">
              <h5 className="mb-0">
                <i className="bi bi-receipt me-2"></i>
                Tóm tắt đơn hàng
              </h5>
            </Card.Header>
            <Card.Body>
              <div className="order-items mb-3" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                {cartItems.map((item) => (
                  <div key={item.id} className="order-item mb-3 pb-3 border-bottom">
                    <div className="d-flex">
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
                      <div className="flex-grow-1">
                        <div className="fw-semibold" style={{ fontSize: '0.875rem' }}>
                          {item.product?.name || 'Sản phẩm'}
                        </div>
                        <div className="text-muted" style={{ fontSize: '0.75rem' }}>
                          ${(item.product?.originalPrice || 0).toFixed(2)} × {item.quantity}
                        </div>
                        <div className="text-primary fw-bold mt-1">
                          ${((item.product?.originalPrice || 0) * item.quantity).toFixed(2)}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="order-summary">
                <div className="d-flex justify-content-between mb-2">
                  <span>Tạm tính:</span>
                  <span>${calculateSubtotal().toFixed(2)}</span>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span>Giảm giá:</span>
                  <span className="text-success">-${calculateDiscount().toFixed(2)}</span>
                </div>
                <hr />
                <div className="d-flex justify-content-between mb-3">
                  <strong>Tổng cộng:</strong>
                  <strong className="text-primary" style={{ fontSize: '1.25rem' }}>
                    ${calculateTotal().toFixed(2)}
                  </strong>
                </div>
              </div>

              <Button
                variant="primary"
                size="lg"
                className="w-100"
                onClick={handleSubmit}
                disabled={submitting || cartItems.length === 0}
              >
                {submitting ? (
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
                    <i className="bi bi-check-circle me-2"></i>
                    Xác nhận đặt hàng
                  </>
                )}
              </Button>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  )
}

export default Checkout

