import React, { useState, useEffect } from 'react'
import { Container, Row, Col, Form, Button, Card, ListGroup, Image, Badge } from 'react-bootstrap'
import { useLocation, useNavigate } from 'react-router-dom'
import { cartService, orderService, addressService, productService } from '../../common/services'
import { ROUTES } from '../../common/constants'
import { getCurrentUser } from '../../common/utils'
import { clearBuyNowItem, getBuyNowItem, saveBuyNowItem } from '../../common/shopActions'
import './Checkout.css'

const Checkout = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const user = getCurrentUser()
  const [cartItems, setCartItems] = useState([])
  const [cartItemIdsForCheckout, setCartItemIdsForCheckout] = useState(() => location.state?.cartItemIds ?? null)
  const [addresses, setAddresses] = useState([])
  const [selectedAddressId, setSelectedAddressId] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [errors, setErrors] = useState({})
  const [isBuyNow, setIsBuyNow] = useState(false)
  const [buyNowItem, setBuyNowItem] = useState(null)

  const effectiveCartItems = cartItemIdsForCheckout?.length
    ? cartItems.filter((i) => cartItemIdsForCheckout.includes(i.id))
    : cartItems
  
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
    loadAddresses()
    const initialBuyNow = location.state?.buyNow || getBuyNowItem()
    if (initialBuyNow?.productId) {
      setIsBuyNow(true)
      setBuyNowItem({
        productId: Number(initialBuyNow.productId),
        quantity: Number(initialBuyNow.quantity || 1)
      })
      saveBuyNowItem(initialBuyNow)
      loadBuyNowProduct(initialBuyNow)
      return
    }
    loadCart()
  }, [])

  const loadBuyNowProduct = async (item) => {
    try {
      setIsLoading(true)
      const response = await productService.getById(item.productId)
      const product = response.data
      if (!product) {
        throw new Error('Product not found')
      }
      const quantity = Number(item.quantity || 1)
      setCartItems([{
        id: `buy-now-${product.id}`,
        productId: product.id,
        quantity: quantity > 0 ? quantity : 1,
        product
      }])
    } catch (error) {
      console.error('Failed to load buy-now product:', error)
      clearBuyNowItem()
      window.showToast?.({
        severity: 'error',
        summary: 'Error',
        detail: 'Unable to start checkout for this item'
      })
      navigate(ROUTES.SHOP)
    } finally {
      setIsLoading(false)
    }
  }

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
      const idsFromState = location.state?.cartItemIds
      if (idsFromState?.length) setCartItemIdsForCheckout(idsFromState)

      const effective = idsFromState?.length ? items.filter((i) => idsFromState.includes(i.id)) : items
      if (effective.length === 0) {
        window.showToast?.({
          severity: 'error',
          summary: idsFromState?.length ? 'Selected items unavailable' : 'Empty Cart',
          detail: idsFromState?.length ? 'Some selected items may have been removed. Please try again from cart.' : 'Your cart is empty'
        })
        navigate(ROUTES.CART)
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
    const nextValue = name === 'phone'
      ? String(value || '').replace(/\D/g, '').slice(0, 10)
      : value
    setFormData(prev => ({
      ...prev,
      [name]: nextValue
    }))
    setErrors(prev => ({ ...prev, [name]: undefined }))
  }

  const calculateSubtotal = () => {
    return effectiveCartItems.reduce((acc, item) => acc + ((item.product?.mrp ?? 0) * (item.quantity ?? 0)), 0)
  }

  const calculateShipping = () => {
    return formData.shippingMethod === 'express' ? 25000 : 0
  }

  const calculatePaymentFee = () => {
    // COD handling fee
    return formData.paymentMethod === 'cod' ? 15000 : 0
  }

  const calculateTotal = () => {
    return calculateSubtotal() + calculateShipping() + calculatePaymentFee()
  }

  const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email || '').trim())

  const hasDigits = (value) => /\d/.test(String(value || ''))

  const validate = () => {
    const next = {}
    const email = String(formData.email || '').trim()
    if (!email) next.email = 'Email is required'
    else if (!isValidEmail(email)) next.email = 'Please enter a valid email address'
    else if (email.length > 255) next.email = 'Email must be 255 characters or less'

    const firstName = String(formData.firstName || '').trim()
    if (!firstName) next.firstName = 'First name is required'
    else if (firstName.length < 2) next.firstName = 'First name must be at least 2 characters'
    else if (firstName.length > 100) next.firstName = 'First name must be 100 characters or less'
    else if (hasDigits(firstName)) next.firstName = 'First name must not contain numbers'

    const lastName = String(formData.lastName || '').trim()
    if (!lastName) next.lastName = 'Last name is required'
    else if (lastName.length < 2) next.lastName = 'Last name must be at least 2 characters'
    else if (lastName.length > 100) next.lastName = 'Last name must be 100 characters or less'
    else if (hasDigits(lastName)) next.lastName = 'Last name must not contain numbers'

    const address = String(formData.address || '').trim()
    if (!address) next.address = 'Street address is required'
    else if (address.length < 5) next.address = 'Street address must be at least 5 characters'
    else if (address.length > 500) next.address = 'Street address must be 500 characters or less'

    const city = String(formData.city || '').trim()
    if (!city) next.city = 'City is required'
    else if (city.length < 2) next.city = 'City must be at least 2 characters'
    else if (city.length > 100) next.city = 'City must be 100 characters or less'

    const phone = String(formData.phone || '').trim()
    if (!phone) {
      next.phone = 'Phone number is required'
    } else if (!/^\d{10}$/.test(phone)) {
      next.phone = 'Phone number must be exactly 10 digits'
    }
    if (!String(formData.paymentMethod || '').trim()) next.paymentMethod = 'Payment method is required'
    return next
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    try {
      const nextErrors = validate()
      setErrors(nextErrors)
      if (Object.keys(nextErrors).length > 0) {
        window.showToast?.({
          severity: 'error',
          summary: 'Missing information',
          detail: 'Please fill in all required fields (*)'
        })
        return
      }

      if (isBuyNow && !buyNowItem) {
        window.showToast?.({
          severity: 'error',
          summary: 'Error',
          detail: 'Buy now item not found. Please try again.'
        })
        return
      }

      setIsProcessing(true)
      
      const orderData = {
        shippingAddress: `${formData.address}, ${formData.city}`,
        shippingMethod: formData.shippingMethod,
        paymentMethod: formData.paymentMethod,
        phone: String(formData.phone || '').trim()
      }
      if (cartItemIdsForCheckout?.length && !isBuyNow) {
        orderData.cartItemIds = cartItemIdsForCheckout
      }

      const response = isBuyNow && buyNowItem
        ? await orderService.buyNow({
            ...orderData,
            productId: buyNowItem.productId,
            quantity: buyNowItem.quantity || 1
          })
        : await orderService.create(orderData)
      
      if (response.data) {
        const { order, paymentUrl } = response.data
        
        window.showToast?.({
          severity: 'success',
          summary: 'Success',
          detail: 'Order placed successfully!'
        })
        
        // If there's a payment URL, redirect to it
        if (paymentUrl) {
          clearBuyNowItem()
          window.showToast?.({
            severity: 'info',
            summary: 'Redirecting',
            detail: `Redirecting to ${formData.paymentMethod.toUpperCase()}...`
          })
          
          setTimeout(() => {
            window.location.href = paymentUrl
          }, 1500)
        } else {
          // For COD or methods without redirect: clear cart, save order for thank-you page, then go to thank-you
          const pricing = response.data.pricing || {}
          const lastOrder = {
            orderId: response.data.order?.id,
            createdAt: response.data.order?.createdAt || new Date().toISOString(),
            paymentMethod: response.data.order?.paymentMethod || formData.paymentMethod,
            customer: {
              fullName: [formData.firstName, formData.lastName].filter(Boolean).join(' ') || user?.name || user?.username || user?.email || 'N/A',
              username: user?.username,
              email: formData.email || user?.email || 'N/A',
              phone: formData.phone || '',
              address: [formData.address, formData.city].filter(Boolean).join(', ') || response.data.order?.shippingAddress || ''
            },
            subtotal: Number(pricing.subtotal ?? response.data.order?.subtotal ?? 0),
            discount: 0,
            total: Number(pricing.total ?? response.data.order?.total ?? 0),
            items: effectiveCartItems.map((item, index) => ({
              id: item.id || `item-${index}`,
              product: {
                name: item.product?.name,
                imageUrl: item.product?.imageUrl,
                styleCode: item.product?.styleCode,
                category: item.product?.category,
                mrp: item.product?.mrp,
                originalPrice: item.product?.mrp
              },
              quantity: item.quantity ?? 1
            }))
          }
          sessionStorage.setItem('lastOrder', JSON.stringify(lastOrder))
          if (!isBuyNow) {
            window.dispatchEvent(new Event('cart:updated'))
          } else {
            clearBuyNowItem()
          }
          navigate(ROUTES.CHECKOUT_THANK_YOU)
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
                  <h3 className="section-title">Choose a shipping address</h3>
                  <div className="address-selection-grid mb-3">
                    {addresses.map((addr) => (
                      <div 
                        key={addr.id} 
                        className={`address-select-card ${selectedAddressId === addr.id ? 'active' : ''}`}
                        onClick={() => handleAddressSelect(addr.id)}
                      >
                        <div className="d-flex justify-content-between">
                          <span className="fw-bold">{addr.receiverName}</span>
                          {addr.isDefault && <Badge bg="dark" className="extra-small">Default</Badge>}
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
                    <i className="bi bi-gear-fill me-1"></i> Manage addresses
                  </Button>
                </section>
              )}

              {/* Shipping Information */}
              <section className="checkout-section mb-5">
                <h3 className="section-title">Shipping information</h3>
                <Row className="g-3">
                  <Col md={12}>
                    <Form.Group>
                      <Form.Label>
                        Email address <span className="text-danger">*</span>
                      </Form.Label>
                      <Form.Control 
                        type="email" 
                        name="email" 
                        value={formData.email} 
                        onChange={handleInputChange} 
                        required 
                        className="yash-input"
                        isInvalid={!!errors.email}
                        maxLength={255}
                        placeholder="name@example.com"
                      />
                      <Form.Control.Feedback type="invalid">{errors.email}</Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>
                        First name <span className="text-danger">*</span>
                      </Form.Label>
                      <Form.Control 
                        type="text" 
                        name="firstName" 
                        value={formData.firstName} 
                        onChange={handleInputChange} 
                        required 
                        className="yash-input"
                        isInvalid={!!errors.firstName}
                        maxLength={100}
                        placeholder="Enter first name"
                      />
                      <Form.Control.Feedback type="invalid">{errors.firstName}</Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>
                        Last name <span className="text-danger">*</span>
                      </Form.Label>
                      <Form.Control 
                        type="text" 
                        name="lastName" 
                        value={formData.lastName} 
                        onChange={handleInputChange} 
                        required 
                        className="yash-input"
                        isInvalid={!!errors.lastName}
                        maxLength={100}
                        placeholder="Enter last name"
                      />
                      <Form.Control.Feedback type="invalid">{errors.lastName}</Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                  <Col md={12}>
                    <Form.Group>
                      <Form.Label>
                        Street address <span className="text-danger">*</span>
                      </Form.Label>
                      <Form.Control 
                        type="text" 
                        name="address" 
                        value={formData.address} 
                        onChange={handleInputChange} 
                        required 
                        className="yash-input"
                        isInvalid={!!errors.address}
                        maxLength={500}
                        placeholder="House number, street name..."
                      />
                      <Form.Control.Feedback type="invalid">{errors.address}</Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                  <Col md={12}>
                    <Form.Group>
                      <Form.Label>
                        City <span className="text-danger">*</span>
                      </Form.Label>
                      <Form.Control 
                        type="text" 
                        name="city" 
                        value={formData.city} 
                        onChange={handleInputChange} 
                        required 
                        className="yash-input"
                        isInvalid={!!errors.city}
                        maxLength={100}
                        placeholder="City / Province"
                      />
                      <Form.Control.Feedback type="invalid">{errors.city}</Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                  <Col md={12}>
                    <Form.Group>
                      <Form.Label>
                        Phone number <span className="text-danger">*</span>
                      </Form.Label>
                      <Form.Control 
                        type="tel" 
                        name="phone" 
                        value={formData.phone} 
                        onChange={handleInputChange} 
                        required 
                        className="yash-input"
                        isInvalid={!!errors.phone}
                        inputMode="numeric"
                        pattern="\d{10}"
                        maxLength={10}
                        placeholder="10 digits"
                      />
                      <Form.Control.Feedback type="invalid">{errors.phone}</Form.Control.Feedback>
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
                    <span className="option-price">25,000₫</span>
                  </div>
                </div>
              </section>

              {/* Payment Method */}
              <section className="checkout-section mb-5">
                <h3 className="section-title">
                  Payment method <span className="text-danger">*</span>
                </h3>
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
                    className={`payment-card ${formData.paymentMethod === 'bank' ? 'active' : ''}`}
                    onClick={() => setFormData(prev => ({ ...prev, paymentMethod: 'bank' }))}
                  >
                    <div className="payment-logo-container">
                      <i className="bi bi-bank"></i>
                      <span>Bank transfer (VietQR)</span>
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
                {errors.paymentMethod ? (
                  <div className="text-danger small mt-2">{errors.paymentMethod}</div>
                ) : null}
              </section>
            </Col>

            <Col lg={5}>
              <div className="order-summary-sticky">
                <Card className="summary-card border-0">
                  <Card.Body className="p-4">
                    <h3 className="summary-title mb-4">Order Summary</h3>
                    
                    <div className="summary-items mb-4">
                      {effectiveCartItems.map((item) => (
                        <div key={item.id} className="summary-item mb-3">
                          <div className="item-image">
                            <Image src={item.product.imageUrl} rounded />
                            <span className="item-qty">{item.quantity}</span>
                          </div>
                          <div className="item-details">
                            <h6 className="item-name">{item.product.name}</h6>
                            <p className="item-price">{(item.product.mrp * item.quantity).toLocaleString('en-US')}₫</p>
                          </div>
                        </div>
                      ))}
                    </div>

                    <hr className="my-4" />

                    <div className="summary-row mb-2">
                      <span>Subtotal</span>
                      <span>{calculateSubtotal().toLocaleString('en-US')}₫</span>
                    </div>
                    <div className="summary-row mb-2">
                      <span>Shipping</span>
                      <span>{calculateShipping() === 0 ? 'Free' : `${calculateShipping().toLocaleString('en-US')}₫`}</span>
                    </div>
                    {calculatePaymentFee() > 0 && (
                      <div className="summary-row mb-2">
                        <span>COD fee</span>
                        <span>{calculatePaymentFee().toLocaleString('en-US')}₫</span>
                      </div>
                    )}
                    <div className="summary-row total-row mt-3">
                      <span>Total</span>
                      <span>{calculateTotal().toLocaleString('en-US')}₫</span>
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
