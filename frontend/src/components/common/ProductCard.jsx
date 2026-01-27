import React, { useEffect, useState } from 'react'
import { Badge, Button, Card } from 'react-bootstrap'
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
  const [favoriteCount, setFavoriteCount] = useState(
    Number(product.favoriteCount ?? product.likes ?? 0)
  )

  const formatNumber = (num) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M'
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K'
    return num?.toString() || '0'
  }

  const formatCurrency = (value) => {
    const amount = Number(value || 0)
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(amount)
  }

  const getRatingValue = () => {
    const rating =
      product.rating ??
      product.averageRating ??
      product.ratingValue ??
      4.8
    return Math.min(Math.max(Number(rating) || 0, 0), 5)
  }

  const renderStars = (value) => {
    const fullStars = Math.floor(value)
    const hasHalf = value - fullStars >= 0.5
    const totalStars = 5
    const emptyStars = totalStars - fullStars - (hasHalf ? 1 : 0)

    return (
      <>
        {Array.from({ length: fullStars }).map((_, index) => (
          <i key={`star-full-${index}`} className="bi bi-star-fill"></i>
        ))}
        {hasHalf && <i className="bi bi-star-half"></i>}
        {Array.from({ length: emptyStars }).map((_, index) => (
          <i key={`star-empty-${index}`} className="bi bi-star"></i>
        ))}
      </>
    )
  }

  const getPlaceholderImage = () => {
    return "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='300'%3E%3Crect width='200' height='300' fill='%23f6efe4'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='Arial' font-size='16' fill='%238a6d3b'%3E%F0%9F%92%8E Jewelry%3C/text%3E%3C/svg%3E"
  }

  useEffect(() => {
    setFavoriteCount(Number(product.favoriteCount ?? product.likes ?? 0))
  }, [product.id, product.favoriteCount, product.likes])

  useEffect(() => {
    let isMounted = true

    const loadStatus = async () => {
      if (!isAuthenticated()) {
        if (isMounted) {
          setIsFavorite(false)
          setInCart(false)
        }
        return
      }

      const user = getCurrentUser()
      if (!user?.id) {
        if (isMounted) {
          setIsFavorite(false)
          setInCart(false)
        }
        return
      }

      try {
        const [favoriteResponse, cartResponse] = await Promise.all([
          favoriteService.contains(product.id),
          cartService.contains(product.id)
        ])

        if (isMounted) {
          setIsFavorite(!!favoriteResponse.data?.isFavorite)
          setInCart(!!cartResponse.data?.inCart)
        }
      } catch (error) {
        if (isMounted) {
          setIsFavorite(false)
          setInCart(false)
        }
        console.error('Failed to load product actions:', error)
      }
    }

    loadStatus()

    return () => {
      isMounted = false
    }
  }, [product.id])

  const requireLogin = (type) => {
    savePostLoginAction({ type, productId: product.id })
    savePostLoginRedirect(`${location.pathname}${location.search}`)
    navigate(ROUTES.LOGIN)
  }

  const handleToggleFavorite = async () => {
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
        setFavoriteCount((prev) => Math.max(prev - 1, 0))
      } else {
        await favoriteService.add(product.id)
        setIsFavorite(true)
        setFavoriteCount((prev) => prev + 1)
      }
    } catch (error) {
      console.error('Failed to update favorite:', error)
    }
  }

  const handleCartAction = async () => {
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
    }
  }

  return (
    <Card className="product-card h-100 shadow-sm">
      <div className="product-image-container">
        <Card.Img
          variant="top"
          src={product.imageUrl || getPlaceholderImage()}
          className="product-image"
          onError={(event) => {
            event.target.src = getPlaceholderImage()
          }}
        />
        {(product.isFeatured || product.IsFeatured) && (
          <Badge bg="warning" className="position-absolute top-0 end-0 m-2">
            <i className="bi bi-star-fill me-1"></i>Featured
          </Badge>
        )}
        {product.category && (
          <Badge bg="secondary" className="position-absolute top-0 start-0 m-2">
            {product.category.name || 'Uncategorized'}
          </Badge>
        )}
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
      <Card.Body className="d-flex flex-column p-3">
        <Card.Title className="product-title mb-2" title={product.name}>
          {product.name?.length > 30 ? `${product.name.substring(0, 30)}...` : product.name}
        </Card.Title>
        <Card.Text className="product-author text-muted small mb-2">
          <i className="bi bi-gem me-1"></i>
          {product.brand || 'Yash Signature'} • {product.productType || 'Jewelry'}
        </Card.Text>
        {showStats && (
          <div className="product-stats d-flex justify-content-between align-items-center mb-2 small text-muted">
            <span>
              <span className="me-1 text-warning">{renderStars(getRatingValue())}</span>
              {getRatingValue().toFixed(1)}
            </span>
            <span>
              <i className="bi bi-heart me-1"></i>
              {formatNumber(favoriteCount)}
            </span>
          </div>
        )}
        <div className="product-price fw-bold text-dark mb-2">
          {formatCurrency(product.mrp)}
        </div>
        <Button
          variant="outline-dark"
          size="sm"
          className="mt-auto"
          onClick={() => onView?.(product)}
        >
          View Details
        </Button>
      </Card.Body>
    </Card>
  )
}

export default ProductCard
