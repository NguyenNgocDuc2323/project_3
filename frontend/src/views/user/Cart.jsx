import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { cartService } from '../../common/services'
import { ROUTES } from '../../common/constants'
import { API_BASE_URL } from '../../common/constants'
import './Cart.css'

const Cart = () => {
  const navigate = useNavigate()
  const [cartItems, setCartItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [draggedIndex, setDraggedIndex] = useState(null)

  useEffect(() => {
    loadCart()
  }, [])

  const loadCart = async () => {
    try {
      setLoading(true)
      const response = await cartService.getAll()
      setCartItems(response.data || [])
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
    } finally {
      setLoading(false)
    }
  }

  const handleRemove = async (productId) => {
    if (!window.confirm('Are you sure you want to remove this item from cart?')) {
      return
    }

    try {
      await cartService.remove(productId)
      setCartItems(prev => prev.filter(item => item.productId !== productId))
      window.dispatchEvent(new Event('cart:updated'))
      if (window.showToast) {
        window.showToast({
          severity: 'success',
          summary: 'Removed',
          detail: 'Item removed from cart',
          life: 2000
        })
      }
    } catch (error) {
      console.error('Error removing item:', error)
      if (window.showToast) {
        window.showToast({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to remove item',
          life: 4000
        })
      }
    }
  }

  const handleQuantityChange = async (productId, newQuantity) => {
    if (newQuantity < 1) {
      handleRemove(productId)
      return
    }

    try {
      setUpdating(true)
      await cartService.update(productId, newQuantity)
      setCartItems(prev =>
        prev.map(item =>
          item.productId === productId
            ? { ...item, quantity: newQuantity }
            : item
        )
      )
      window.dispatchEvent(new Event('cart:updated'))
    } catch (error) {
      console.error('Error updating quantity:', error)
      if (window.showToast) {
        window.showToast({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to update quantity',
          life: 4000
        })
      }
    } finally {
      setUpdating(false)
    }
  }

  const handleDragStart = (e, index) => {
    setDraggedIndex(index)
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/html', e.target)
    e.target.style.opacity = '0.5'
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  const handleDragEnd = (e) => {
    e.target.style.opacity = '1'
    setDraggedIndex(null)
  }

  const handleDrop = (e, dropIndex) => {
    e.preventDefault()
    if (draggedIndex === null || draggedIndex === dropIndex) {
      return
    }

    const newItems = [...cartItems]
    const draggedItem = newItems[draggedIndex]
    newItems.splice(draggedIndex, 1)
    newItems.splice(dropIndex, 0, draggedItem)
    setCartItems(newItems)
    setDraggedIndex(null)
  }

  const calculateSubtotal = () => {
    return cartItems.reduce((sum, item) => {
      const price = Number(item.product?.mrp || 0)
      return sum + price * item.quantity
    }, 0)
  }

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(value)
  }

  const getProductImage = (product) => {
    if (product?.imageUrl) {
      if (product.imageUrl.startsWith('http')) {
        return product.imageUrl
      }
      return `${API_BASE_URL.replace('/api', '')}${product.imageUrl}`
    }
    return 'https://via.placeholder.com/150'
  }

  if (loading) {
    return (
      <div className="cart-page">
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

  const subtotal = calculateSubtotal()
  const shipping = subtotal > 0 ? 10 : 0
  const total = subtotal + shipping

  return (
    <div className="cart-page">
      <div className="container my-5">
        <h1 className="display-6 fw-bold mb-4">
          <i className="bi bi-cart me-2"></i>
          Shopping Cart
        </h1>

        {cartItems.length === 0 ? (
          <div className="card shadow-sm">
            <div className="card-body text-center py-5">
              <i className="bi bi-cart-x display-1 text-muted d-block mb-3"></i>
              <h3 className="mb-3">Your cart is empty</h3>
              <p className="text-muted mb-4">Add some items to your cart to continue shopping</p>
              <button
                className="btn btn-primary"
                onClick={() => navigate(ROUTES.SHOP)}
              >
                <i className="bi bi-arrow-left me-2"></i>
                Continue Shopping
              </button>
            </div>
          </div>
        ) : (
          <div className="row">
            <div className="col-lg-8">
              <div className="card shadow-sm mb-4">
                <div className="card-body">
                  <div className="cart-items">
                    {cartItems.map((item, index) => (
                      <div
                        key={item.id}
                        className={`cart-item ${draggedIndex === index ? 'dragging' : ''}`}
                        draggable
                        onDragStart={(e) => handleDragStart(e, index)}
                        onDragOver={handleDragOver}
                        onDragEnd={handleDragEnd}
                        onDrop={(e) => handleDrop(e, index)}
                      >
                        <div className="cart-item-image">
                          <img
                            src={getProductImage(item.product)}
                            alt={item.product?.name || 'Product'}
                            onError={(e) => {
                              e.target.src = 'https://via.placeholder.com/150'
                            }}
                          />
                        </div>
                        <div className="cart-item-details">
                          <h5 className="mb-2">{item.product?.name || 'Product'}</h5>
                          <p className="text-muted small mb-2">
                            Style: {item.product?.styleCode || 'N/A'}
                          </p>
                          <div className="d-flex align-items-center gap-3">
                            <div className="quantity-controls">
                              <button
                                className="btn btn-sm btn-outline-secondary"
                                onClick={() => handleQuantityChange(item.productId, item.quantity - 1)}
                                disabled={updating}
                              >
                                <i className="bi bi-dash"></i>
                              </button>
                              <span className="mx-3">{item.quantity}</span>
                              <button
                                className="btn btn-sm btn-outline-secondary"
                                onClick={() => handleQuantityChange(item.productId, item.quantity + 1)}
                                disabled={updating}
                              >
                                <i className="bi bi-plus"></i>
                              </button>
                            </div>
                            <div className="cart-item-price">
                              {formatCurrency(Number(item.product?.mrp || 0) * item.quantity)}
                            </div>
                          </div>
                        </div>
                        <div className="cart-item-actions">
                          <button
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => handleRemove(item.productId)}
                            title="Remove"
                          >
                            <i className="bi bi-trash"></i>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="col-lg-4">
              <div className="card shadow-sm">
                <div className="card-body">
                  <h5 className="mb-4">Order Summary</h5>
                  <div className="order-summary">
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
                    <button
                      className="btn btn-primary w-100"
                      onClick={() => navigate(ROUTES.CHECKOUT)}
                    >
                      <i className="bi bi-credit-card me-2"></i>
                      Proceed to Checkout
                    </button>
                    <button
                      className="btn btn-outline-secondary w-100 mt-2"
                      onClick={() => navigate(ROUTES.SHOP)}
                    >
                      <i className="bi bi-arrow-left me-2"></i>
                      Continue Shopping
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Cart

