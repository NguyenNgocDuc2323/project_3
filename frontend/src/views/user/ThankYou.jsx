import React, { useEffect, useState, useRef } from 'react'
import { Container, Row, Col, Card, Button, Alert } from 'react-bootstrap'
import { useNavigate, useLocation } from 'react-router-dom'
import { ROUTES } from '../../common/constants'
import { cartService } from '../../common/services'
import './ThankYou.css'

const ThankYou = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const [orderInfo, setOrderInfo] = useState(null)
  const cartClearedRef = useRef(false) // Đảm bảo chỉ xóa giỏ hàng một lần

  useEffect(() => {
    // Get order info from navigation state or query params
    const state = location.state
    if (state) {
      setOrderInfo({
        orderId: state.orderId,
        items: state.items || [],
        totalAmount: state.totalAmount || 0,
        orderDate: new Date().toLocaleString('vi-VN')
      })
    } else {
      // If no state, try to get from query params
      const params = new URLSearchParams(location.search)
      const orderId = params.get('orderId')
      if (orderId) {
        setOrderInfo({
          orderId,
          items: [],
          totalAmount: 0,
          orderDate: new Date().toLocaleString('vi-VN')
        })
      }
    }
  }, [location])

  // Xóa giỏ hàng khi thanh toán thành công
  useEffect(() => {
    const clearCartAfterPayment = async () => {
      // Chỉ xóa giỏ hàng nếu có orderInfo và chưa xóa lần nào
      if (orderInfo && !cartClearedRef.current) {
        try {
          await cartService.clearCart()
          cartClearedRef.current = true
          console.log('Giỏ hàng đã được xóa sau khi thanh toán thành công')
          // Trigger window event để AppHeader cập nhật cart count
          window.dispatchEvent(new Event('cartUpdated'))
        } catch (error) {
          console.error('Lỗi khi xóa giỏ hàng:', error)
          // Không hiển thị lỗi cho user vì thanh toán đã thành công
        }
      }
    }

    clearCartAfterPayment()
  }, [orderInfo])

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
      return 'https://via.placeholder.com/100?text=No+Image'
    }
    if (imageUrl.startsWith('http')) {
      return imageUrl
    }
    const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:5000'
    return `${apiBase}${imageUrl}`
  }

  if (!orderInfo) {
    return (
      <Container className="py-5">
        <Card>
          <Card.Body className="text-center py-5">
            <Alert variant="warning">
              <h4>Không tìm thấy thông tin đơn hàng</h4>
              <p>Vui lòng quay lại trang chủ hoặc kiểm tra email của bạn để xem chi tiết đơn hàng.</p>
            </Alert>
            <Button variant="primary" onClick={() => navigate(ROUTES.DASHBOARD)}>
              <i className="bi bi-house me-2"></i>
              Về trang chủ
            </Button>
          </Card.Body>
        </Card>
      </Container>
    )
  }

  return (
    <Container className="py-5">
      <Row>
        <Col md={8} className="mx-auto">
          <Card className="shadow-sm thank-you-card">
            <Card.Body className="text-center py-5">
              <div className="success-icon mb-4">
                <i className="bi bi-check-circle-fill"></i>
              </div>
              <h1 className="mb-3">Cảm ơn bạn đã mua sắm!</h1>
              <p className="lead text-muted mb-4">
                Đơn hàng của bạn đã được xác nhận thành công
              </p>

              <Alert variant="success" className="text-start">
                <h5 className="mb-3">
                  <i className="bi bi-info-circle me-2"></i>
                  Thông tin đơn hàng
                </h5>
                <div className="order-details">
                  <div className="mb-2">
                    <strong>Mã đơn hàng:</strong> {orderInfo.orderId}
                  </div>
                  <div className="mb-2">
                    <strong>Ngày đặt hàng:</strong> {orderInfo.orderDate}
                  </div>
                  <div className="mb-2">
                    <strong>Tổng tiền:</strong>{' '}
                    <span className="text-primary fs-5">
                      {formatCurrency(orderInfo.totalAmount)}
                    </span>
                  </div>
                </div>
              </Alert>

              {orderInfo.items && orderInfo.items.length > 0 && (
                <Card className="mt-4">
                  <Card.Header>
                    <h5 className="mb-0">Sản phẩm đã mua</h5>
                  </Card.Header>
                  <Card.Body>
                    <div className="order-items">
                      {orderInfo.items.map((item, index) => (
                        <div key={index} className="order-item d-flex align-items-center gap-3 mb-3 pb-3 border-bottom">
                          <div className="order-item-image">
                            <img
                              src={getProductImageUrl(item.productImageUrl)}
                              alt={item.productName}
                              className="rounded"
                              style={{ width: '80px', height: '80px', objectFit: 'cover' }}
                              onError={(e) => {
                                e.target.src = 'https://via.placeholder.com/80?text=No+Image'
                              }}
                            />
                          </div>
                          <div className="flex-grow-1">
                            <h6 className="mb-1">{item.productName}</h6>
                            <p className="text-muted mb-0">
                              Số lượng: {item.quantity} × {formatCurrency(item.productMRP)}
                            </p>
                          </div>
                          <div className="text-end">
                            <strong>{formatCurrency(item.subtotal)}</strong>
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card.Body>
                </Card>
              )}

              <div className="mt-4">
                <p className="text-muted">
                  <i className="bi bi-envelope me-2"></i>
                  Chúng tôi đã gửi email xác nhận đơn hàng đến địa chỉ email của bạn.
                </p>
                <p className="text-muted">
                  <i className="bi bi-truck me-2"></i>
                  Đơn hàng sẽ được giao trong vòng 3-5 ngày làm việc.
                </p>
              </div>

              <div className="mt-5 d-flex gap-3 justify-content-center">
                <Button
                  variant="outline-primary"
                  size="lg"
                  onClick={() => navigate(ROUTES.DASHBOARD)}
                >
                  <i className="bi bi-house me-2"></i>
                  Về trang chủ
                </Button>
                <Button
                  variant="primary"
                  size="lg"
                  onClick={() => navigate(ROUTES.CART)}
                >
                  <i className="bi bi-cart me-2"></i>
                  Xem giỏ hàng
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  )
}

export default ThankYou

