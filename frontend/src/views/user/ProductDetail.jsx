import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { Badge, Button } from 'react-bootstrap'
import { ROUTES } from '../../common/constants'
import { cartService, productService } from '../../common/services'
import { getCurrentUser, isAuthenticated } from '../../common/utils'
import { savePostLoginAction, savePostLoginRedirect } from '../../common/shopActions'
import './ProductDetail.css'

const ProductDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()

  const [product, setProduct] = useState(null)
  const [related, setRelated] = useState([])
  const [loading, setLoading] = useState(true)

  const materialOptions = useMemo(() => {
    const base = ['10K', '14K', '18K']
    const available = new Set()
    const goldCarat = product?.goldCarat?.toUpperCase()
    const materialName = product?.materialName?.toUpperCase()

    if (goldCarat) {
      available.add(goldCarat)
    }
    if (materialName) {
      available.add(materialName)
    }

    const options = base.map((value) => ({
      value,
      label: value,
      enabled: available.size > 0 ? available.has(value) : false
    }))

    if (materialName && !base.includes(materialName)) {
      options.unshift({
        value: materialName,
        label: product?.materialName || materialName,
        enabled: true
      })
    }

    return options
  }, [product])

  const colorOptions = useMemo(() => {
    const base = [
      { value: 'yellow', label: 'Yellow Gold', swatch: '#d9b37a' },
      { value: 'rose', label: 'Rose Gold', swatch: '#e5b3a6' },
      { value: 'white', label: 'White Gold', swatch: '#e7e7e7' }
    ]
    const colorName = (product?.metalColorName || '').toLowerCase()
    const customHex = product?.metalColorHex || ''
    const available = new Set()

    if (colorName) {
      if (colorName.includes('yellow')) available.add('yellow')
      if (colorName.includes('rose')) available.add('rose')
      if (colorName.includes('white')) available.add('white')
    }

    const mapped = base.map((option) => ({
      ...option,
      enabled: available.size > 0 ? available.has(option.value) : false
    }))

    if (available.size === 0 && colorName) {
      mapped.unshift({
        value: 'custom',
        label: product?.metalColorName || 'Metal',
        swatch: customHex || '#d9b37a',
        enabled: true
      })
    }

    return mapped
  }, [product])

  const sizeOptions = useMemo(() => {
    const base = ['5', '6', '7', '8', '9', '10', '11']
    const available = new Map()
    const apiSizes = product?.sizeOptions || []
    apiSizes.forEach((option) => {
      if (option?.name) {
        available.set(option.name.toString(), Number(option.priceMultiplier || 1))
      }
    })
    if (available.size === 0) {
      ;(product?.sizes || []).forEach((size) => {
        if (size !== null && size !== undefined) {
          available.set(size.toString(), 1)
        }
      })
    }
    return base.map((value) => ({
      value,
      label: value,
      enabled: available.size > 0 ? available.has(value) : false,
      multiplier: available.get(value) ?? 1
    }))
  }, [product])

  const [selectedMaterial, setSelectedMaterial] = useState('')
  const [selectedColor, setSelectedColor] = useState('')
  const [selectedSize, setSelectedSize] = useState('')
  const [activeImage, setActiveImage] = useState(0)
  const [openPolicy, setOpenPolicy] = useState('delivery')

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true)
        const response = await productService.getById(id)
        setProduct(response.data || null)
      } catch (error) {
        console.error('Failed to load product:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchProduct()
  }, [id])

  useEffect(() => {
    const fetchRelated = async () => {
      try {
        const response = await productService.getPopular(8)
        setRelated((response.data || []).filter(item => item.id?.toString() !== id))
      } catch (error) {
        console.error('Failed to load related products:', error)
      }
    }

    fetchRelated()
  }, [id])

  const pickDefault = (options, current) => {
    const enabledValues = options.filter((option) => option.enabled).map((option) => option.value)
    if (current && enabledValues.includes(current)) {
      return current
    }
    return enabledValues[0] || ''
  }

  useEffect(() => {
    if (!product) return

    const materialQuery = (searchParams.get('material') || '').toUpperCase()
    const colorQuery = (searchParams.get('color') || '').toLowerCase()

    setSelectedMaterial(pickDefault(materialOptions, materialQuery))
    setSelectedColor(pickDefault(colorOptions, colorQuery))
    setSelectedSize(pickDefault(sizeOptions, selectedSize))
    setActiveImage(0)
  }, [product, searchParams, materialOptions, colorOptions, sizeOptions])

  const images = useMemo(() => {
    const list = product?.images || product?.productImages || []
    if (Array.isArray(list) && list.length > 0) {
      return list
    }
    if (product?.imageUrl) {
      return [product.imageUrl]
    }
    return []
  }, [product])

  const updateQuery = (key, value) => {
    const next = new URLSearchParams(searchParams)
    next.set(key, value)
    setSearchParams(next, { replace: true })
  }

  const formatCurrency = (value) => {
    const amount = Number(value || 0)
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(amount)
  }

  const handleAddToCart = async () => {
    if (!isAuthenticated()) {
      savePostLoginAction({ type: 'cart', productId: product?.id })
      savePostLoginRedirect(`${window.location.pathname}${window.location.search}`)
      navigate(ROUTES.LOGIN)
      return
    }
    const user = getCurrentUser()
    if (!user?.id) {
      savePostLoginAction({ type: 'cart', productId: product?.id })
      savePostLoginRedirect(`${window.location.pathname}${window.location.search}`)
      navigate(ROUTES.LOGIN)
      return
    }
    try {
      await cartService.add(product.id, 1)
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
      console.error('Failed to add to cart:', error)
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

  if (loading) {
    return (
      <div className="product-detail-page">
        <div className="product-detail-loading">Loading...</div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="product-detail-page">
        <div className="product-detail-loading">Product not found.</div>
      </div>
    )
  }

  const materialMultiplier = selectedMaterial ? Number(product?.materialPriceMultiplier || 1) : 1
  const colorMultiplier = selectedColor ? Number(product?.metalColorPriceMultiplier || 1) : 1
  const sizeMultiplier = selectedSize
    ? Number(sizeOptions.find((option) => option.value === selectedSize)?.multiplier || 1)
    : 1
  const adjustedPrice = Number(product.mrp || 0) * materialMultiplier * colorMultiplier * sizeMultiplier
  const adjustedOriginal = Number(product.originalPrice || 0) * materialMultiplier * colorMultiplier * sizeMultiplier
  const showOriginal = adjustedOriginal > adjustedPrice && adjustedOriginal > 0

  return (
    <div className="product-detail-page">
      <div className="product-detail-breadcrumb">
        <button type="button" onClick={() => navigate(ROUTES.SHOP)}>Shop</button>
        <span>/</span>
        <span>{product.category?.name || 'Category'}</span>
      </div>

      <div className="product-detail-grid">
        <div className="product-detail-gallery">
          <div className="product-detail-thumbs">
            {images.map((src, index) => (
              <button
                key={`${src}-${index}`}
                type="button"
                className={`thumb-button ${index === activeImage ? 'active' : ''}`}
                onClick={() => setActiveImage(index)}
              >
                <img src={src} alt={product.name} />
              </button>
            ))}
          </div>
          <div className="product-detail-main">
            <img src={images[activeImage] || product.imageUrl} alt={product.name} />
          </div>
        </div>

        <div className="product-detail-info">
          <h1>{product.name}</h1>
          <div className="product-detail-price">
            <span className="product-detail-price-current">{formatCurrency(adjustedPrice)}</span>
            {showOriginal && (
              <span className="product-detail-price-original">{formatCurrency(adjustedOriginal)}</span>
            )}
          </div>

          <div className="product-detail-meta">
            <div>
              <span>Type</span>
              <strong>{product.productType || 'Jewelry'}</strong>
            </div>
            <div>
              <span>Brand</span>
              <strong>{product.brand || 'Yash Signature'}</strong>
            </div>
            <div>
              <span>Collection</span>
              <strong>{product.category?.name || 'Signature'}</strong>
            </div>
            <div>
              <span>Style Code</span>
              <strong>{product.styleCode || product.id}</strong>
            </div>
          </div>

          <div className="product-detail-section">
            <p>Material</p>
            <div className="option-group">
              {materialOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  className={`option-pill ${selectedMaterial === option.value ? 'active' : ''} ${option.enabled ? '' : 'disabled'}`}
                  disabled={!option.enabled}
                  onClick={() => {
                    setSelectedMaterial(option.value)
                    updateQuery('material', option.value.toLowerCase())
                  }}
                >
                  {option.label}
                </button>
              ))}
            </div>
            <small>
              {selectedMaterial
                ? `Selected: ${materialOptions.find(o => o.value === selectedMaterial)?.label || selectedMaterial}`
                : 'Not available'}
            </small>
          </div>

          <div className="product-detail-section">
            <p>Metal Color</p>
            <div className="option-group color-group">
              {colorOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  className={`color-swatch ${selectedColor === option.value ? 'active' : ''} ${option.enabled ? '' : 'disabled'}`}
                  disabled={!option.enabled}
                  onClick={() => {
                    setSelectedColor(option.value)
                    updateQuery('color', option.value)
                  }}
                >
                  <span style={{ backgroundColor: option.swatch }}></span>
                  {option.label}
                </button>
              ))}
            </div>
            <small>
              {selectedColor
                ? `Selected: ${colorOptions.find(o => o.value === selectedColor)?.label || selectedColor}`
                : 'Not available'}
            </small>
          </div>

          <div className="product-detail-section">
            <p>Ring Size</p>
            <div className="option-group">
              {sizeOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  className={`option-pill ${selectedSize === option.value ? 'active' : ''} ${option.enabled ? '' : 'disabled'}`}
                  disabled={!option.enabled}
                  onClick={() => setSelectedSize(option.value)}
                >
                  {option.label}
                </button>
              ))}
            </div>
            <small>
              {selectedSize ? `Selected: ${selectedSize}` : 'Not available'}
            </small>
          </div>

          <Button className="product-detail-cta" onClick={handleAddToCart}>
            Add to cart
          </Button>

          <div className="product-detail-note">
            Price may vary based on material and size.
          </div>

          <div className="product-detail-actions">
            <button
              type="button"
              className={`policy-item ${openPolicy === 'delivery' ? 'active' : ''}`}
              onClick={() => setOpenPolicy(openPolicy === 'delivery' ? '' : 'delivery')}
            >
              <span>
                <i className="bi bi-truck"></i>
                Nationwide delivery
              </span>
              <i className={`bi ${openPolicy === 'delivery' ? 'bi-chevron-up' : 'bi-chevron-down'}`}></i>
            </button>
            {openPolicy === 'delivery' && (
              <div className="policy-content">
                Fast nationwide shipping, safely packed.
              </div>
            )}

            <button
              type="button"
              className={`policy-item ${openPolicy === 'exchange' ? 'active' : ''}`}
              onClick={() => setOpenPolicy(openPolicy === 'exchange' ? '' : 'exchange')}
            >
              <span>
                <i className="bi bi-arrow-repeat"></i>
                Flexible exchange
              </span>
              <i className={`bi ${openPolicy === 'exchange' ? 'bi-chevron-up' : 'bi-chevron-down'}`}></i>
            </button>
            {openPolicy === 'exchange' && (
              <div className="policy-content">
                Easy exchange within a flexible window.
              </div>
            )}

            <button
              type="button"
              className={`policy-item ${openPolicy === 'warranty' ? 'active' : ''}`}
              onClick={() => setOpenPolicy(openPolicy === 'warranty' ? '' : 'warranty')}
            >
              <span>
                <i className="bi bi-shield-check"></i>
                Lifetime warranty
              </span>
              <i className={`bi ${openPolicy === 'warranty' ? 'bi-chevron-up' : 'bi-chevron-down'}`}></i>
            </button>
            {openPolicy === 'warranty' && (
              <div className="policy-content">
                Lifetime warranty on craftsmanship.
              </div>
            )}
          </div>
        </div>
      </div>

      <section className="product-detail-related">
        <h2>You may also like</h2>
        <div className="related-grid">
          {related.slice(0, 4).map((item) => (
            <div key={item.id} className="related-card">
              <div className="related-image">
                <img src={item.imageUrl} alt={item.name} />
                {(item.isFeatured || item.IsFeatured) && (
                  <Badge bg="warning">Best Selling</Badge>
                )}
              </div>
              <div className="related-info">
                <h3>{item.name}</h3>
                <div>{formatCurrency(item.mrp)}</div>
                <button type="button" onClick={() => navigate(`/products/${item.id}`)}>
                  View details
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

export default ProductDetail
