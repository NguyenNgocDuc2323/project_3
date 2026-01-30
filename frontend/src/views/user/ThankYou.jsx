import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom'
import { cartService, orderService } from '../../common/services'
import { ROUTES } from '../../common/constants'
import { API_BASE_URL } from '../../common/constants'
import { isAuthenticated } from '../../common/utils'
import './ThankYou.css'

const ThankYou = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const [orderInfo, setOrderInfo] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check authentication first
    if (!isAuthenticated()) {
      navigate(ROUTES.LOGIN)
      return
    }
    const clearCart = async () => {
      try {
        await cartService.clearAll()
        window.dispatchEvent(new Event('cart:updated'))
      } catch (error) {
        // Ignore errors when clearing cart (might already be cleared)
        console.error('Error clearing cart:', error)
      }
    }
    clearCart()

    // Get orderId from location state, URL params, or localStorage
    const orderId = location.state?.orderId || searchParams.get('orderId')
    
    if (orderId) {
      loadOrderDetails(orderId)
    } else {
      setLoading(false)
    }
  }, [location.state, searchParams, navigate])

  const loadOrderDetails = async (orderId) => {
    try {
      setLoading(true)
      const response = await orderService.getById(orderId)
      setOrderInfo(response.data)
    } catch (error) {
      console.error('Error loading order details:', error)
      
      // If 401 Unauthorized, redirect to login
      if (error.response?.status === 401) {
        if (window.showToast) {
          window.showToast({
            severity: 'error',
            summary: 'Unauthorized',
            detail: 'Please login to view order details',
            life: 3000
          })
        }
        navigate(ROUTES.LOGIN)
        return
      }
      
      if (window.showToast) {
        window.showToast({
          severity: 'error',
          summary: 'Error',
          detail: error.response?.data?.message || 'Failed to load order details',
          life: 4000
        })
      }
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(value || 0)
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getPaymentMethodName = (method) => {
    const methods = {
      'bank_transfer': 'Bank Transfer (Chuyển khoản)',
      'cod': 'Cash on Delivery (Thanh toán khi nhận hàng)',
      'vnpay': 'VNPay'
    }
    return methods[method] || method || 'N/A'
  }

  const getProductImageUrl = (product) => {
    if (!product) return null
    if (product.imageUrl) {
      if (product.imageUrl.startsWith('http')) {
        return product.imageUrl
      }
      return `${API_BASE_URL.replace('/api', '')}${product.imageUrl}`
    }
    return null
  }

  if (loading) {
    return (
      <div className="thank-you-page">
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

  return (
    <div className="thank-you-page">
      <div className="container my-5">
        <div className="row justify-content-center">
          <div className="col-lg-10">
            <div className="card shadow-lg border-0">
              <div className="card-body text-center p-5">
                <div className="thank-you-icon mb-4">
                  <i className="bi bi-check-circle-fill text-success" style={{ fontSize: '4rem' }}></i>
                </div>
                <h1 className="display-4 fw-bold mb-3">Thank You!</h1>
                <p className="lead text-muted mb-4">
                  Your order has been placed successfully
                </p>

                {orderInfo && (
                  <div className="order-info mt-4">
                    <div className="card bg-light">
                      <div className="card-body">
                        <h5 className="mb-4">
                          <i className="bi bi-receipt me-2"></i>
                          Order Details
                        </h5>
                        <div className="row text-start mb-4">
                          <div className="col-md-6 mb-3">
                            <strong>Order ID:</strong>
                            <div className="text-muted">#{orderInfo.id || 'N/A'}</div>
                          </div>
                          <div className="col-md-6 mb-3">
                            <strong>Order Date:</strong>
                            <div className="text-muted">{formatDate(orderInfo.createdAt)}</div>
                          </div>
                          <div className="col-md-6 mb-3">
                            <strong>Status:</strong>
                            <div className="text-muted">
                              <span className={`badge bg-${orderInfo.status === 'Pending' ? 'warning' : orderInfo.status === 'Completed' ? 'success' : 'info'}`}>
                                {orderInfo.status || 'Pending'}
                              </span>
                            </div>
                          </div>
                          <div className="col-md-6 mb-3">
                            <strong>Payment Method:</strong>
                            <div className="text-muted">{getPaymentMethodName(orderInfo.paymentMethod)}</div>
                          </div>
                          {orderInfo.shippingAddress && (
                            <div className="col-12 mb-3">
                              <strong>Shipping Address:</strong>
                              <div className="text-muted">{orderInfo.shippingAddress}</div>
                            </div>
                          )}
                        </div>

                        {orderInfo.items && orderInfo.items.length > 0 && (
                          <div className="order-items mt-4">
                            <h6 className="mb-3">Order Items:</h6>
                            <div className="table-responsive">
                              <table className="table table-bordered">
                                <thead>
                                  <tr>
                                    <th>Product</th>
                                    <th>Quantity</th>
                                    <th>Unit Price</th>
                                    <th>Total</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {orderInfo.items.map((item) => (
                                    <tr key={item.id}>
                                      <td>
                                        <div className="d-flex align-items-center">
                                          {getProductImageUrl(item.product) && (
                                            <img
                                              src={getProductImageUrl(item.product)}
                                              alt={item.productName}
                                              className="me-3"
                                              style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '4px' }}
                                            />
                                          )}
                                          <div>
                                            <div className="fw-bold">{item.productName}</div>
                                            {item.productId && (
                                              <small className="text-muted">ID: {item.productId}</small>
                                            )}
                                          </div>
                                        </div>
                                      </td>
                                      <td>{item.quantity}</td>
                                      <td>{formatCurrency(item.unitPrice)}</td>
                                      <td className="fw-bold">{formatCurrency(item.totalPrice)}</td>
                                    </tr>
                                  ))}
                                </tbody>
                                <tfoot>
                                  <tr>
                                    <td colSpan="3" className="text-end"><strong>Subtotal:</strong></td>
                                    <td><strong>{formatCurrency(orderInfo.subtotal)}</strong></td>
                                  </tr>
                                  <tr>
                                    <td colSpan="3" className="text-end"><strong>Shipping:</strong></td>
                                    <td><strong>{formatCurrency((orderInfo.total || 0) - (orderInfo.subtotal || 0))}</strong></td>
                                  </tr>
                                  <tr className="table-primary">
                                    <td colSpan="3" className="text-end"><strong>Total:</strong></td>
                                    <td><strong className="fs-5">{formatCurrency(orderInfo.total)}</strong></td>
                                  </tr>
                                </tfoot>
                              </table>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                <div className="mt-5">
                  <p className="mb-4">
                    We've sent a confirmation email with your order details.
                    You will receive an update when your order ships.
                  </p>
                  <div className="d-flex gap-3 justify-content-center flex-wrap">
                    <button
                      className="btn btn-primary btn-lg"
                      onClick={() => navigate(ROUTES.DASHBOARD)}
                    >
                      <i className="bi bi-house me-2"></i>
                      Go to Dashboard
                    </button>
                    <button
                      className="btn btn-outline-primary btn-lg"
                      onClick={() => navigate(ROUTES.SHOP)}
                    >
                      <i className="bi bi-bag me-2"></i>
                      Continue Shopping
                    </button>
                  </div>
                </div>

                <div className="mt-5 pt-4 border-top">
                  <h6 className="mb-3">What's Next?</h6>
                  <div className="row text-start">
                    <div className="col-md-4 mb-3">
                      <div className="d-flex align-items-start">
                        <i className="bi bi-envelope-check text-primary fs-4 me-3"></i>
                        <div>
                          <strong>Email Confirmation</strong>
                          <p className="small text-muted mb-0">
                            Check your email for order confirmation
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-4 mb-3">
                      <div className="d-flex align-items-start">
                        <i className="bi bi-truck text-primary fs-4 me-3"></i>
                        <div>
                          <strong>Order Processing</strong>
                          <p className="small text-muted mb-0">
                            We'll process your order within 24 hours
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-4 mb-3">
                      <div className="d-flex align-items-start">
                        <i className="bi bi-box-seam text-primary fs-4 me-3"></i>
                        <div>
                          <strong>Shipping</strong>
                          <p className="small text-muted mb-0">
                            You'll receive tracking info once shipped
                          </p>
                        </div>
                      </div>
                    </div>
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

export default ThankYou

