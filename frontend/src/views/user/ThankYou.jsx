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
      case 'bank':
        return 'Bank transfer'
      case 'cod':
        return 'Cash on Delivery (COD)'
      case 'vnpay':
        return 'VNPay'
      default:
        return method
    }
  }

  const getPaymentMethodIcon = (method) => {
    switch (method) {
      case 'bank_transfer':
      case 'bank':
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
          <Alert.Heading>Order information not found</Alert.Heading>
          <p>Please go back to the dashboard or check your orders.</p>
          <Button onClick={() => navigate(ROUTES.DASHBOARD)}>
            <i className="bi bi-house me-2"></i>
            Go to dashboard
          </Button>
        </Alert>
      </Container>
    )
  }

  const subtotal = Number(orderData.subtotal ?? 0)
  const discount = Number(orderData.discount ?? 0)
  const total = Number(orderData.total ?? (subtotal - discount))
  const items = Array.isArray(orderData.items) ? orderData.items : []

  return (
    <Container className="py-5">
      <div className="text-center mb-5">
        <div className="success-icon mb-3">
          <i className="bi bi-check-circle-fill"></i>
        </div>
        <h1 className="display-4 fw-bold text-success mb-3">
          Thank you for your order!
        </h1>
        <p className="lead text-muted">
          Your order has been received and is being processed.
        </p>
      </div>

      <Row className="justify-content-center">
        <Col lg={10}>
          {/* Order Summary */}
          <Card className="mb-4">
            <Card.Header className="bg-primary text-white">
              <h5 className="mb-0">
                <i className="bi bi-receipt me-2"></i>
                Order details
              </h5>
            </Card.Header>
            <Card.Body>
              <Row className="mb-4">
                <Col md={6}>
                  <div className="info-section">
                    <h6 className="section-title">
                      <i className="bi bi-calendar-event me-2"></i>
                      Order date
                    </h6>
                    <p className="mb-0">
                      {new Date(orderData.createdAt).toLocaleString('en-US', {
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
                      Payment method
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
                    Recipient information
                  </h6>
                  <Row>
                    <Col md={6} className="mb-2">
                      <strong>Full name:</strong> {orderData.customer.fullName || orderData.customer.username || 'N/A'}
                    </Col>
                    <Col md={6} className="mb-2">
                      <strong>Email:</strong> {orderData.customer.email || 'N/A'}
                    </Col>
                    <Col md={6} className="mb-2">
                      <strong>Phone:</strong> {orderData.customer.phone || 'Not provided'}
                    </Col>
                    <Col md={6} className="mb-2">
                      <strong>Address:</strong> {orderData.customer.address || 'Not provided'}
                    </Col>
                  </Row>
                </div>
              )}

              {/* Order Items */}
              <div className="order-items-section">
                <h6 className="section-title mb-3">
                  <i className="bi bi-bag me-2"></i>
                  Items ordered ({items.length})
                </h6>
                <div className="order-items-list">
                  {items.map((item) => (
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
                            {item.product?.name || 'Product'}
                          </h6>
                          <div className="text-muted small">
                            SKU: {item.product?.styleCode || 'N/A'}
                            {item.product?.category && (
                              <span className="ms-2">| {item.product.category.name}</span>
                            )}
                          </div>
                        </Col>
                        <Col xs={6} md={2} className="text-center">
                          <div className="text-muted small">Quantity</div>
                          <div className="fw-bold">{item.quantity}</div>
                        </Col>
                        <Col xs={6} md={2} className="text-end">
                          <div className="text-muted small">Line total</div>
                          <div className="fw-bold text-primary">
                            {((item.product?.mrp ?? item.product?.originalPrice ?? 0) * (item.quantity ?? 0)).toLocaleString('en-US')}₫
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
                        <span>Subtotal:</span>
                        <span>{subtotal.toLocaleString('en-US')}₫</span>
                      </div>
                      <div className="d-flex justify-content-between mb-2">
                        <span>Discount:</span>
                        <span className="text-success">-{discount.toLocaleString('en-US')}₫</span>
                      </div>
                      <hr />
                      <div className="d-flex justify-content-between">
                        <strong>Total:</strong>
                        <strong className="text-primary" style={{ fontSize: '1.25rem' }}>
                          {total.toLocaleString('en-US')}₫
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
              Go to dashboard
            </Button>
            <Button
              variant="outline-primary"
              size="lg"
              onClick={() => navigate(ROUTES.SHOP)}
            >
              <i className="bi bi-bag me-2"></i>
              Continue shopping
            </Button>
          </div>
        </Col>
      </Row>
    </Container>
  )
}

export default ThankYou

