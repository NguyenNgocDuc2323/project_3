import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { cartService, profileService, orderService } from '../../common/services'
import { ROUTES } from '../../common/constants'
import { API_BASE_URL } from '../../common/constants'
import { isAuthenticated } from '../../common/utils'
import './Checkout.css'

const Checkout = () => {
  const navigate = useNavigate()
  const [cartItems, setCartItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    paymentMethod: '' // 'bank_transfer', 'cod', 'vnpay'
  })
  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate(ROUTES.LOGIN)
      return
    }
    loadCart()
    loadProfile()
  }, [])

  const loadCart = async () => {
    try {
      setLoading(true)
      const response = await cartService.getAll()
      setCartItems(response.data || [])
      
      if (!response.data || response.data.length === 0) {
        if (window.showToast) {
          window.showToast({
            severity: 'warn',
            summary: 'Empty Cart',
            detail: 'Your cart is empty. Please add items to cart first.',
            life: 3000
          })
        }
        navigate(ROUTES.CART)
      }
    } catch (error) {
      console.error('Error loading cart:', error)
      if (window.showToast) {
        window.showToast({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load cart',
          life: 4000
        })
      }
      navigate(ROUTES.CART)
    } finally {
      setLoading(false)
    }
  }

  const loadProfile = async () => {
    try {
      const response = await profileService.get()
      const profile = response.data
      
      if (profile) {
        setForm(prev => ({
          ...prev,
          fullName: profile.fullName || prev.fullName,
          email: profile.email || prev.email,
          phone: profile.mobileNumber || prev.phone,
          address: profile.address || prev.address,
          city: profile.city || prev.city,
          state: profile.state || prev.state
        }))
      }
    } catch (error) {
      console.error('Error loading profile:', error)
      // Don't show error toast, just use empty form
      // User can still fill in manually
    }
  }

  const formatCurrency = (value) => {
    const amount = Number(value || 0)
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(amount)
  }

  const calculateTotals = () => {
    const subtotal = cartItems.reduce((sum, item) => {
      const price = Number(item.product?.originalPrice || item.product?.mrp || 0)
      return sum + (price * item.quantity)
    }, 0)
    const shipping = subtotal > 0 ? 10 : 0 // $10 shipping fee
    const total = subtotal + shipping
    return { subtotal, shipping, total }
  }

  const validateForm = () => {
    const newErrors = {}
    
    if (!form.fullName.trim()) {
      newErrors.fullName = 'Full name is required'
    }
    
    if (!form.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = 'Invalid email format'
    }
    
    if (!form.phone.trim()) {
      newErrors.phone = 'Phone number is required'
    }
    
    if (!form.address.trim()) {
      newErrors.address = 'Address is required'
    }
    
    if (!form.city.trim()) {
      newErrors.city = 'City is required'
    }
    
    if (!form.state.trim()) {
      newErrors.state = 'State/Ward is required'
    }
    
    if (!form.paymentMethod) {
      newErrors.paymentMethod = 'Please select a payment method'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm(prev => ({
      ...prev,
      [name]: value
    }))
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }
    
    setSubmitting(true)
    
    try {
      const { subtotal, shipping, total } = calculateTotals()
      
      // Create order
      const orderData = {
        shippingAddress: `${form.address}, ${form.state}, ${form.city}`,
        paymentMethod: form.paymentMethod,
        subtotal: subtotal,
        total: total,
        items: cartItems.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: Number(item.product?.originalPrice || item.product?.mrp || 0)
        }))
      }
      
      // Call order API
      const response = await orderService.create(orderData)
      const order = response.data
      
      // For now, all payment methods are successful
      // Clear cart
      await cartService.clearAll()
      window.dispatchEvent(new Event('cart:updated'))
      
      // Show success message
      if (window.showToast) {
        window.showToast({
          severity: 'success',
          summary: 'Order Placed',
          detail: 'Your order has been placed successfully!',
          life: 3000
        })
      }
      
      // Navigate to thank you page
      navigate(ROUTES.THANK_YOU, { state: { orderId: order.id } })
      
    } catch (error) {
      console.error('Error creating order:', error)
      if (window.showToast) {
        window.showToast({
          severity: 'error',
          summary: 'Error',
          detail: error.message || 'Failed to create order. Please try again.',
          life: 4000
        })
      }
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="checkout-page">
        <div className="container my-5">
          <div className="text-center">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const { subtotal, shipping, total } = calculateTotals()

  return (
    <div className="checkout-page">
      <div className="container my-5">
        <h1 className="mb-4">
          <i className="bi bi-cart-check me-2"></i>
          Checkout
        </h1>
        
        <div className="row">
          <div className="col-lg-8">
            <div className="card shadow-sm mb-4">
              <div className="card-body">
                <h5 className="card-title mb-4">Shipping Information</h5>
                <form onSubmit={handleSubmit}>
                  <div className="row mb-3">
                    <div className="col-md-6">
                      <label htmlFor="fullName" className="form-label">
                        Full Name
                      </label>
                      <input
                        type="text"
                        className={`form-control ${errors.fullName ? 'is-invalid' : ''}`}
                        id="fullName"
                        name="fullName"
                        value={form.fullName}
                        readOnly
                        style={{ backgroundColor: '#e9ecef', cursor: 'not-allowed' }}
                        required
                      />
                      {errors.fullName && (
                        <div className="invalid-feedback">{errors.fullName}</div>
                      )}
                    </div>
                    <div className="col-md-6">
                      <label htmlFor="email" className="form-label">
                        Email
                      </label>
                      <input
                        type="email"
                        className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                        id="email"
                        name="email"
                        value={form.email}
                        readOnly
                        style={{ backgroundColor: '#e9ecef', cursor: 'not-allowed' }}
                        required
                      />
                      {errors.email && (
                        <div className="invalid-feedback">{errors.email}</div>
                      )}
                    </div>
                  </div>
                  
                  <div className="row mb-3">
                    <div className="col-md-6">
                      <label htmlFor="phone" className="form-label">
                        Phone Number <span className="text-danger">*</span>
                      </label>
                      <input
                        type="tel"
                        className={`form-control ${errors.phone ? 'is-invalid' : ''}`}
                        id="phone"
                        name="phone"
                        value={form.phone}
                        onChange={handleChange}
                        required
                      />
                      {errors.phone && (
                        <div className="invalid-feedback">{errors.phone}</div>
                      )}
                    </div>
                    <div className="col-md-6">
                      <label htmlFor="city" className="form-label">
                        City/Province <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        className={`form-control ${errors.city ? 'is-invalid' : ''}`}
                        id="city"
                        name="city"
                        value={form.city}
                        onChange={handleChange}
                        required
                      />
                      {errors.city && (
                        <div className="invalid-feedback">{errors.city}</div>
                      )}
                    </div>
                  </div>
                  
                  <div className="row mb-3">
                    <div className="col-md-6">
                      <label htmlFor="state" className="form-label">
                        State/Ward <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        className={`form-control ${errors.state ? 'is-invalid' : ''}`}
                        id="state"
                        name="state"
                        value={form.state}
                        onChange={handleChange}
                        required
                      />
                      {errors.state && (
                        <div className="invalid-feedback">{errors.state}</div>
                      )}
                    </div>
                    <div className="col-md-6">
                      <label htmlFor="address" className="form-label">
                        Address <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        className={`form-control ${errors.address ? 'is-invalid' : ''}`}
                        id="address"
                        name="address"
                        value={form.address}
                        onChange={handleChange}
                        required
                      />
                      {errors.address && (
                        <div className="invalid-feedback">{errors.address}</div>
                      )}
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <label className="form-label">
                      Payment Method <span className="text-danger">*</span>
                    </label>
                    <div className="payment-methods">
                      <div className="form-check mb-2">
                        <input
                          className="form-check-input"
                          type="radio"
                          name="paymentMethod"
                          id="paymentBankTransfer"
                          value="bank_transfer"
                          checked={form.paymentMethod === 'bank_transfer'}
                          onChange={handleChange}
                        />
                        <label className="form-check-label" htmlFor="paymentBankTransfer">
                          <i className="bi bi-bank me-2"></i>
                          Bank Transfer (Chuyển khoản)
                        </label>
                      </div>
                      <div className="form-check mb-2">
                        <input
                          className="form-check-input"
                          type="radio"
                          name="paymentMethod"
                          id="paymentCOD"
                          value="cod"
                          checked={form.paymentMethod === 'cod'}
                          onChange={handleChange}
                        />
                        <label className="form-check-label" htmlFor="paymentCOD">
                          <i className="bi bi-cash-coin me-2"></i>
                          Cash on Delivery (Thanh toán khi nhận hàng)
                        </label>
                      </div>
                      <div className="form-check">
                        <input
                          className="form-check-input"
                          type="radio"
                          name="paymentMethod"
                          id="paymentVNPay"
                          value="vnpay"
                          checked={form.paymentMethod === 'vnpay'}
                          onChange={handleChange}
                        />
                        <label className="form-check-label" htmlFor="paymentVNPay">
                          <i className="bi bi-credit-card me-2"></i>
                          VNPay
                        </label>
                      </div>
                    </div>
                    {errors.paymentMethod && (
                      <div className="text-danger small mt-1">{errors.paymentMethod}</div>
                    )}
                  </div>
                  
                  <div className="d-flex justify-content-between">
                    <button
                      type="button"
                      className="btn btn-outline-secondary"
                      onClick={() => navigate(ROUTES.CART)}
                    >
                      <i className="bi bi-arrow-left me-2"></i>
                      Back to Cart
                    </button>
                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={submitting}
                    >
                      {submitting ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                          Processing...
                        </>
                      ) : (
                        <>
                          <i className="bi bi-check-circle me-2"></i>
                          Place Order
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
          
          <div className="col-lg-4">
            <div className="card shadow-sm">
              <div className="card-body">
                <h5 className="mb-4">Order Summary</h5>
                <div className="order-summary">
                  {cartItems.map((item) => (
                    <div key={item.productId} className="d-flex justify-content-between mb-2">
                      <span>
                        {item.product?.name} x {item.quantity}
                      </span>
                      <span>
                        {formatCurrency(
                          Number(item.product?.originalPrice || item.product?.mrp || 0) * item.quantity
                        )}
                      </span>
                    </div>
                  ))}
                  <hr />
                  <div className="d-flex justify-content-between mb-2">
                    <span>Subtotal</span>
                    <span>{formatCurrency(subtotal)}</span>
                  </div>
                  <div className="d-flex justify-content-between mb-2">
                    <span>Shipping</span>
                    <span>{formatCurrency(shipping)}</span>
                  </div>
                  <hr />
                  <div className="d-flex justify-content-between mb-4">
                    <strong>Total</strong>
                    <strong>{formatCurrency(total)}</strong>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Checkout

