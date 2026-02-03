import React, { useState, useEffect } from 'react'
import { Container, Card, Button, Row, Col, Alert } from 'react-bootstrap'
import { useNavigate } from 'react-router-dom'
import { ROUTES } from '../../common/constants'
import './ThankYou.css'

const ThankYou = () => {
  const navigate = useNavigate()
  const [orderData, setOrderData] = useState(null)

  useEffect(() => {
    // Get order data from sessionStorage
    const storedOrder = sessionStorage.getItem('lastOrder')
    if (storedOrder) {
      try {
        setOrderData(JSON.parse(storedOrder))
        // Clear the stored order after reading
        sessionStorage.removeItem('lastOrder')
      } catch (error) {
        console.error('Error parsing order data:', error)
      }
    }
  }, [])

  const getPaymentMethodName = (method) => {
    switch (method) {
      case 'bank_transfer':
        return 'Chuyển khoản ngân hàng'
      case 'cod':
        return 'Thanh toán khi giao hàng (COD)'
      case 'vnpay':
        return 'Thanh toán qua VNPay'
      default:
        return method
    }
  }

  const getPaymentMethodIcon = (method) => {
    switch (method) {
      case 'bank_transfer':
        return 'bi-bank'
      case 'cod':
        return 'bi-truck'
      case 'vnpay':
        return 'bi-wallet2'
      default:
        return 'bi-credit-card'
    }
  }

  if (!orderData) {
    return (
      <Container className="py-5">
        <Alert variant="warning">
          <Alert.Heading>Không tìm thấy thông tin đơn hàng</Alert.Heading>
          <p>Vui lòng quay lại trang chủ hoặc kiểm tra đơn hàng của bạn.</p>
          <Button onClick={() => navigate(ROUTES.DASHBOARD)}>
            <i className="bi bi-house me-2"></i>
            Về trang chủ
          </Button>
        </Alert>
      </Container>
    )
  }

  return (
    <Container className="py-5">
      <div className="text-center mb-5">
        <div className="success-icon mb-3">
          <i className="bi bi-check-circle-fill"></i>
        </div>
        <h1 className="display-4 fw-bold text-success mb-3">
          Cảm ơn bạn đã đặt hàng!
        </h1>
        <p className="lead text-muted">
          Đơn hàng của bạn đã được tiếp nhận và đang được xử lý
        </p>
      </div>

      <Row className="justify-content-center">
        <Col lg={10}>
          {/* Order Summary */}
          <Card className="mb-4">
            <Card.Header className="bg-primary text-white">
              <h5 className="mb-0">
                <i className="bi bi-receipt me-2"></i>
                Thông tin đơn hàng
              </h5>
            </Card.Header>
            <Card.Body>
              <Row className="mb-4">
                <Col md={6}>
                  <div className="info-section">
                    <h6 className="section-title">
                      <i className="bi bi-calendar-event me-2"></i>
                      Ngày đặt hàng
                    </h6>
                    <p className="mb-0">
                      {new Date(orderData.createdAt).toLocaleString('vi-VN', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </Col>
                <Col md={6}>
                  <div className="info-section">
                    <h6 className="section-title">
                      <i className={`bi ${getPaymentMethodIcon(orderData.paymentMethod)} me-2`}></i>
                      Phương thức thanh toán
                    </h6>
                    <p className="mb-0">{getPaymentMethodName(orderData.paymentMethod)}</p>
                  </div>
                </Col>
              </Row>

              {/* Customer Information */}
              {orderData.customer && (
                <div className="info-section mb-4">
                  <h6 className="section-title">
                    <i className="bi bi-person me-2"></i>
                    Thông tin người nhận
                  </h6>
                  <Row>
                    <Col md={6} className="mb-2">
                      <strong>Họ và tên:</strong> {orderData.customer.fullName || orderData.customer.username || 'N/A'}
                    </Col>
                    <Col md={6} className="mb-2">
                      <strong>Email:</strong> {orderData.customer.email || 'N/A'}
                    </Col>
                    <Col md={6} className="mb-2">
                      <strong>Số điện thoại:</strong> {orderData.customer.phone || 'Chưa cập nhật'}
                    </Col>
                    <Col md={6} className="mb-2">
                      <strong>Địa chỉ:</strong> {orderData.customer.address || 'Chưa cập nhật'}
                    </Col>
                  </Row>
                </div>
              )}

              {/* Order Items */}
              <div className="order-items-section">
                <h6 className="section-title mb-3">
                  <i className="bi bi-bag me-2"></i>
                  Sản phẩm đã đặt ({orderData.items.length})
                </h6>
                <div className="order-items-list">
                  {orderData.items.map((item) => (
                    <div key={item.id} className="order-item-card">
                      <Row className="align-items-center">
                        <Col xs={3} md={2}>
                          <img
                            src={item.product?.imageUrl || 'https://via.placeholder.com/100'}
                            alt={item.product?.name || 'Product'}
                            className="order-item-image"
                            onError={(e) => {
                              e.target.src = 'https://via.placeholder.com/100'
                            }}
                          />
                        </Col>
                        <Col xs={9} md={6}>
                          <h6 className="order-item-name mb-1">
                            {item.product?.name || 'Sản phẩm'}
                          </h6>
                          <div className="text-muted small">
                            Mã: {item.product?.styleCode || 'N/A'}
                            {item.product?.category && (
                              <span className="ms-2">| {item.product.category.name}</span>
                            )}
                          </div>
                        </Col>
                        <Col xs={6} md={2} className="text-center">
                          <div className="text-muted small">Số lượng</div>
                          <div className="fw-bold">{item.quantity}</div>
                        </Col>
                        <Col xs={6} md={2} className="text-end">
                          <div className="text-muted small">Thành tiền</div>
                          <div className="fw-bold text-primary">
                            ${((item.product?.originalPrice || 0) * item.quantity).toFixed(2)}
                          </div>
                        </Col>
                      </Row>
                    </div>
                  ))}
                </div>
              </div>

              {/* Order Total */}
              <div className="order-total-section">
                <Row>
                  <Col md={6}></Col>
                  <Col md={6}>
                    <div className="total-breakdown">
                      <div className="d-flex justify-content-between mb-2">
                        <span>Tạm tính:</span>
                        <span>${orderData.subtotal.toFixed(2)}</span>
                      </div>
                      <div className="d-flex justify-content-between mb-2">
                        <span>Giảm giá:</span>
                        <span className="text-success">-${orderData.discount.toFixed(2)}</span>
                      </div>
                      <hr />
                      <div className="d-flex justify-content-between">
                        <strong>Tổng cộng:</strong>
                        <strong className="text-primary" style={{ fontSize: '1.25rem' }}>
                          ${orderData.total.toFixed(2)}
                        </strong>
                      </div>
                    </div>
                  </Col>
                </Row>
              </div>
            </Card.Body>
          </Card>

          {/* Action Buttons */}
          <div className="text-center">
            <Button
              variant="primary"
              size="lg"
              className="me-2"
              onClick={() => navigate(ROUTES.DASHBOARD)}
            >
              <i className="bi bi-house me-2"></i>
              Về trang chủ
            </Button>
            <Button
              variant="outline-primary"
              size="lg"
              onClick={() => navigate(ROUTES.SHOP)}
            >
              <i className="bi bi-bag me-2"></i>
              Tiếp tục mua sắm
            </Button>
          </div>
        </Col>
      </Row>
    </Container>
  )
}

export default ThankYou

