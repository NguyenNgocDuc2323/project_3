import React, { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { ROUTES } from '../../common/constants'
import { getCurrentUser, isAuthenticated } from '../../common/utils'
import { cartService, favoriteService } from '../../common/services'
import { savePostLoginAction, savePostLoginRedirect } from '../../common/shopActions'
import './ProductCard.css'

const ProductCard = ({ product, showStats = false, onView }) => {
  const navigate = useNavigate()
  const location = useLocation()
  const [isFavorite, setIsFavorite] = useState(false)
  const [inCart, setInCart] = useState(false)

  const formatCurrency = (value) => {
    const amount = Number(value || 0)
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount)
  }

  const getPlaceholderImage = () => {
    return "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='300'%3E%3Crect width='200' height='300' fill='%23f6efe4'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='Arial' font-size='16' fill='%238a6d3b'%3E%F0%9F%92%8E Jewelry%3C/text%3E%3C/svg%3E"
  }

  useEffect(() => {
    setIsFavorite(!!(product.isFavorite || product.IsFavorite))
    setInCart(!!(product.isInCart || product.IsInCart))
  }, [product.id, product.isFavorite, product.IsFavorite, product.isInCart, product.IsInCart])

  const requireLogin = (type) => {
    savePostLoginAction({ type, productId: product.id })
    savePostLoginRedirect(`${location.pathname}${location.search}`)
    navigate(ROUTES.LOGIN)
  }

  const handleToggleFavorite = async (event) => {
    if (event) {
      event.stopPropagation()
    }
    if (!isAuthenticated()) {
      requireLogin('favorite')
      return
    }
    const user = getCurrentUser()
    if (!user?.id) {
      requireLogin('favorite')
      return
    }
    try {
      if (isFavorite) {
        await favoriteService.remove(product.id)
        setIsFavorite(false)
      } else {
        await favoriteService.add(product.id)
        setIsFavorite(true)
      }
    } catch (error) {
      console.error('Failed to update favorite:', error)
    }
  }

  const handleCartAction = async (event) => {
    if (event) {
      event.stopPropagation()
    }
    if (!isAuthenticated()) {
      requireLogin('cart')
      return
    }
    const user = getCurrentUser()
    if (!user?.id) {
      requireLogin('cart')
      return
    }
    try {
      if (inCart) {
        await cartService.remove(product.id)
        setInCart(false)
        window.dispatchEvent(new Event('cart:updated'))
        if (window.showToast) {
          window.showToast({
            severity: 'info',
            summary: 'Removed from cart',
            detail: `${product.name} removed from cart.`,
            life: 2000
          })
        }
        return
      }

      await cartService.add(product.id, 1)
      setInCart(true)
      window.dispatchEvent(new Event('cart:updated'))
      if (window.showToast) {
        window.showToast({
          severity: 'success',
          summary: 'Added to cart',
          detail: `${product.name} added to cart.`,
          life: 2000
        })
      }
    } catch (error) {
      console.error('Failed to update cart:', error)
      if (window.showToast) {
        window.showToast({
          severity: 'error',
          summary: 'Lỗi',
          detail: error.response?.data?.message || 'Không thể thêm sản phẩm vào giỏ hàng',
          life: 4000
        })
      }
    }
  }

  const originalPrice = Number(product.originalPrice || 0)
  const currentPrice = Number(product.mrp || 0)
  const showOriginal = originalPrice > currentPrice && originalPrice > 0

  return (
    <div className="product-card h-100">
      <div
        className="product-image-container"
        role="button"
        tabIndex={0}
        onClick={() => {
          if (onView) {
            onView(product)
          } else {
            navigate(`/products/${product.id}`)
          }
        }}
        onKeyDown={(event) => {
          if (event.key === 'Enter') {
            if (onView) {
              onView(product)
            } else {
              navigate(`/products/${product.id}`)
            }
          }
        }}
      >
        <img
          src={product.imageUrl || getPlaceholderImage()}
          className="product-image"
          alt={product.name}
          onError={(event) => {
            event.target.src = getPlaceholderImage()
          }}
        />
        <div className="product-actions">
          <button
            type="button"
            className={`action-icon favorite ${isFavorite ? 'active' : ''}`}
            aria-label="Add to favorites"
            onClick={handleToggleFavorite}
          >
            <i className={`bi ${isFavorite ? 'bi-heart-fill' : 'bi-heart'}`}></i>
          </button>
          <button
            type="button"
            className={`action-icon cart ${inCart ? 'active' : ''}`}
            aria-label="Add to cart"
            onClick={handleCartAction}
          >
            <i className={`bi ${inCart ? 'bi-bag-check-fill' : 'bi-bag-plus'}`}></i>
          </button>
        </div>
      </div>
      <div className="p-3">
        <h3
          className="product-title mb-2"
          title={product.name}
          onClick={() => {
            if (onView) {
              onView(product)
            } else {
              navigate(`/products/${product.id}`)
            }
          }}
        >
          {product.name}
        </h3>
        <div className="product-price">
          <span className="product-price-current">{formatCurrency(product.mrp)}</span>
          {showOriginal && (
            <span className="product-price-original">{formatCurrency(originalPrice)}</span>
          )}
        </div>
      </div>
    </div>
  )
}

export default ProductCard
