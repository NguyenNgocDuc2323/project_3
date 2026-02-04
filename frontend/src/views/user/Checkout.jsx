import React, { useState, useEffect } from 'react'
import { Container, Row, Col, Form, Button, Card, ListGroup, Image, Badge } from 'react-bootstrap'
import { useNavigate } from 'react-router-dom'
import { cartService, orderService, addressService } from '../../common/services'
import { ROUTES } from '../../common/constants'
import { getCurrentUser } from '../../common/utils'
import './Checkout.css'

const Checkout = () => {
  const navigate = useNavigate()
  const user = getCurrentUser()
  const [cartItems, setCartItems] = useState([])
  const [addresses, setAddresses] = useState([])
  const [selectedAddressId, setSelectedAddressId] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  
  const [formData, setFormData] = useState({
    email: user?.email || '',
    firstName: '',
    lastName: '',
    address: '',
    city: '',
    phone: '',
    shippingMethod: 'standard',
    paymentMethod: 'vnpay'
  })

  useEffect(() => {
    loadCart()
    loadAddresses()
  }, [])

  const loadAddresses = async () => {
    try {
      const response = await addressService.getAll()
      const addrList = response.data || []
      setAddresses(addrList)
      
      const defaultAddr = addrList.find(a => a.isDefault) || addrList[0]
      if (defaultAddr) {
        setSelectedAddressId(defaultAddr.id)
        applyAddress(defaultAddr)
      }
    } catch (error) {
      console.error('Error loading addresses:', error)
    }
  }

  const applyAddress = (addr) => {
    setFormData(prev => ({
      ...prev,
      firstName: addr.receiverName.split(' ')[0] || '',
      lastName: addr.receiverName.split(' ').slice(1).join(' ') || '',
      address: addr.addressLine,
      city: addr.city,
      phone: addr.phone
    }))
  }

  const handleAddressSelect = (addrId) => {
    setSelectedAddressId(addrId)
    const addr = addresses.find(a => a.id === addrId)
    if (addr) {
      applyAddress(addr)
    }
  }

  const loadCart = async () => {
    try {
      setIsLoading(true)
      const response = await cartService.getAll()
      const items = response.data || []
      setCartItems(items)
      
      if (items.length === 0) {
        window.showToast?.({
          severity: 'error',
          summary: 'Empty Cart',
          detail: 'Your cart is empty'
        })
        navigate(ROUTES.SHOP)
      }
    } catch (error) {
      console.error('Failed to load cart:', error)
      window.showToast?.({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to load cart items'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const calculateSubtotal = () => {
    return cartItems.reduce((acc, item) => acc + (item.product.mrp * item.quantity), 0)
  }

  const calculateShipping = () => {
    return formData.shippingMethod === 'express' ? 25000 : 0
  }

  const calculateTotal = () => {
    return calculateSubtotal() + calculateShipping()
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    try {
      setIsProcessing(true)
      
      const orderData = {
        shippingAddress: `${formData.address}, ${formData.city}`,
        paymentMethod: formData.paymentMethod,
      }

      const response = await orderService.create(orderData)
      
      if (response.data) {
        const { order, paymentUrl } = response.data
        
        window.showToast?.({
          severity: 'success',
          summary: 'Success',
          detail: 'Order placed successfully!'
        })
        
        // If there's a payment URL, redirect to it
        if (paymentUrl) {
          window.showToast?.({
            severity: 'info',
            summary: 'Redirecting',
            detail: `Redirecting to ${formData.paymentMethod.toUpperCase()}...`
          })
          
          setTimeout(() => {
            window.location.href = paymentUrl
          }, 1500)
        } else {
          // For COD or methods without redirect, clear cart and go to dashboard
          await cartService.clear()
          window.dispatchEvent(new Event('cart:updated'))
          navigate(ROUTES.DASHBOARD)
        }
      }
    } catch (error) {
      console.error('Failed to place order:', error)
      window.showToast?.({
        severity: 'error',
        summary: 'Error',
        detail: error.response?.data || 'Failed to place order. Please try again.'
      })
    } finally {
      setIsProcessing(false)
    }
  }

  if (isLoading) {
    return (
      <Container className="py-5 text-center">
        <div className="spinner-border text-dark" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </Container>
    )
  }

  return (
    <div className="checkout-page">
      <Container className="py-5">
        <h1 className="checkout-title mb-5">Secure Checkout</h1>
        
        <Form onSubmit={handleSubmit}>
          <Row>
            <Col lg={7}>
              {/* Address Selection */}
              {addresses.length > 0 && (
                <section className="checkout-section mb-4">
                  <h3 className="section-title">Chọn địa chỉ giao hàng</h3>
                  <div className="address-selection-grid mb-3">
                    {addresses.map((addr) => (
                      <div 
                        key={addr.id} 
                        className={`address-select-card ${selectedAddressId === addr.id ? 'active' : ''}`}
                        onClick={() => handleAddressSelect(addr.id)}
                      >
                        <div className="d-flex justify-content-between">
                          <span className="fw-bold">{addr.receiverName}</span>
                          {addr.isDefault && <Badge bg="dark" className="extra-small">Mặc định</Badge>}
                        </div>
                        <p className="small mb-0 text-muted">{addr.phone}</p>
                        <p className="small mb-0 text-truncate">{addr.addressLine}, {addr.city}</p>
                      </div>
                    ))}
                  </div>
                  <Button 
                    variant="outline-dark" 
                    className="rounded-0 px-3 py-1 text-uppercase extra-small fw-bold mt-2" 
                    onClick={() => navigate(ROUTES.ADDRESSES)}
                  >
                    <i className="bi bi-gear-fill me-1"></i> Quản lý địa chỉ
                  </Button>
                </section>
              )}

              {/* Shipping Information */}
              <section className="checkout-section mb-5">
                <h3 className="section-title">Thông tin giao hàng</h3>
                <Row className="g-3">
                  <Col md={12}>
                    <Form.Group>
                      <Form.Label>Email Address</Form.Label>
                      <Form.Control 
                        type="email" 
                        name="email" 
                        value={formData.email} 
                        onChange={handleInputChange} 
                        required 
                        className="yash-input"
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>First Name</Form.Label>
                      <Form.Control 
                        type="text" 
                        name="firstName" 
                        value={formData.firstName} 
                        onChange={handleInputChange} 
                        required 
                        className="yash-input"
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>Last Name</Form.Label>
                      <Form.Control 
                        type="text" 
                        name="lastName" 
                        value={formData.lastName} 
                        onChange={handleInputChange} 
                        required 
                        className="yash-input"
                      />
                    </Form.Group>
                  </Col>
                  <Col md={12}>
                    <Form.Group>
                      <Form.Label>Street Address</Form.Label>
                      <Form.Control 
                        type="text" 
                        name="address" 
                        value={formData.address} 
                        onChange={handleInputChange} 
                        required 
                        className="yash-input"
                      />
                    </Form.Group>
                  </Col>
                  <Col md={12}>
                    <Form.Group>
                      <Form.Label>City</Form.Label>
                      <Form.Control 
                        type="text" 
                        name="city" 
                        value={formData.city} 
                        onChange={handleInputChange} 
                        required 
                        className="yash-input"
                      />
                    </Form.Group>
                  </Col>
                  <Col md={12}>
                    <Form.Group>
                      <Form.Label>Phone Number</Form.Label>
                      <Form.Control 
                        type="tel" 
                        name="phone" 
                        value={formData.phone} 
                        onChange={handleInputChange} 
                        required 
                        className="yash-input"
                      />
                    </Form.Group>
                  </Col>
                </Row>
              </section>

              {/* Shipping Method */}
              <section className="checkout-section mb-5">
                <h3 className="section-title">Shipping Method</h3>
                <div className="shipping-options">
                  <div 
                    className={`shipping-card ${formData.shippingMethod === 'standard' ? 'active' : ''}`}
                    onClick={() => setFormData(prev => ({ ...prev, shippingMethod: 'standard' }))}
                  >
                    <div className="option-info">
                      <span className="option-name">Standard Delivery</span>
                      <span className="option-desc">3-5 Business Days</span>
                    </div>
                    <span className="option-price">Free</span>
                  </div>
                  <div 
                    className={`shipping-card ${formData.shippingMethod === 'express' ? 'active' : ''}`}
                    onClick={() => setFormData(prev => ({ ...prev, shippingMethod: 'express' }))}
                  >
                    <div className="option-info">
                      <span className="option-name">Express Delivery</span>
                      <span className="option-desc">1-2 Business Days</span>
                    </div>
                    <span className="option-price">{formData.shippingMethod === 'express' ? '25.000₫' : 'Miễn phí'}</span>
                  </div>
                </div>
              </section>

              {/* Payment Method */}
              <section className="checkout-section mb-5">
                <h3 className="section-title">Payment Method</h3>
                <div className="payment-options">
                  <div 
                    className={`payment-card ${formData.paymentMethod === 'vnpay' ? 'active' : ''}`}
                    onClick={() => setFormData(prev => ({ ...prev, paymentMethod: 'vnpay' }))}
                  >
                    <div className="payment-logo-container">
                      <i className="bi bi-wallet2"></i>
                      <span>VNPAY (ATM / QR Code)</span>
                    </div>
                  </div>
                  <div 
                    className={`payment-card ${formData.paymentMethod === 'zalopay' ? 'active' : ''}`}
                    onClick={() => setFormData(prev => ({ ...prev, paymentMethod: 'zalopay' }))}
                  >
                    <div className="payment-logo-container">
                      <i className="bi bi-chat-fill text-primary"></i>
                      <span>Ví ZaloPay / Zalo</span>
                    </div>
                  </div>
                  <div 
                    className={`payment-card ${formData.paymentMethod === 'bank' ? 'active' : ''}`}
                    onClick={() => setFormData(prev => ({ ...prev, paymentMethod: 'bank' }))}
                  >
                    <div className="payment-logo-container">
                      <i className="bi bi-bank"></i>
                      <span>Chuyển khoản ngân hàng (VietQR)</span>
                    </div>
                  </div>
                  <div 
                    className={`payment-card ${formData.paymentMethod === 'cod' ? 'active' : ''}`}
                    onClick={() => setFormData(prev => ({ ...prev, paymentMethod: 'cod' }))}
                  >
                    <div className="payment-logo-container">
                      <i className="bi bi-truck"></i>
                      <span>Cash on Delivery (COD)</span>
                    </div>
                  </div>
                </div>
              </section>
            </Col>

            <Col lg={5}>
              <div className="order-summary-sticky">
                <Card className="summary-card border-0">
                  <Card.Body className="p-4">
                    <h3 className="summary-title mb-4">Order Summary</h3>
                    
                    <div className="summary-items mb-4">
                      {cartItems.map((item) => (
                        <div key={item.id} className="summary-item mb-3">
                          <div className="item-image">
                            <Image src={item.product.imageUrl} rounded />
                            <span className="item-qty">{item.quantity}</span>
                          </div>
                          <div className="item-details">
                            <h6 className="item-name">{item.product.name}</h6>
                            <p className="item-price">{(item.product.mrp * item.quantity).toLocaleString('vi-VN')}₫</p>
                          </div>
                        </div>
                      ))}
                    </div>

                    <hr className="my-4" />

                    <div className="summary-row mb-2">
                      <span>Subtotal</span>
                      <span>{calculateSubtotal().toLocaleString('vi-VN')}₫</span>
                    </div>
                    <div className="summary-row mb-2">
                      <span>Shipping</span>
                      <span>{calculateShipping() === 0 ? 'Free' : `${calculateShipping().toLocaleString('vi-VN')}₫`}</span>
                    </div>
                    <div className="summary-row total-row mt-3">
                      <span>Total</span>
                      <span>{calculateTotal().toLocaleString('vi-VN')}₫</span>
                    </div>

                    <Button 
                      variant="dark" 
                      type="submit" 
                      className="w-100 mt-4 checkout-btn"
                      disabled={isProcessing}
                    >
                      {isProcessing ? 'Processing...' : 'Complete Order'}
                    </Button>
                    
                    <p className="security-note mt-3 text-center">
                      <i className="bi bi-lock-fill me-2"></i>
                      Secure encrypted transaction
                    </p>
                  </Card.Body>
                </Card>
              </div>
            </Col>
          </Row>
        </Form>
      </Container>
    </div>
  )
}

export default Checkout
