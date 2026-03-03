import React, { useEffect, useMemo, useState } from 'react'
import { Col, Container, Row } from 'react-bootstrap'
import { useSearchParams } from 'react-router-dom'
import { productService } from '../../common/services'
import ProductCard from '../../components/common/ProductCard'
import Pagination from '../../components/common/Pagination'
import './Shop.css'

const SHOP_PAGE_SIZE = 12

const Shop = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [priceMin, setPriceMin] = useState(0)
  const [priceMax, setPriceMax] = useState(0)
  const [selectedType, setSelectedType] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [sortBy, setSortBy] = useState('popular')
  const [showFilter, setShowFilter] = useState(false)
  const [showSort, setShowSort] = useState(false)
  const [openSections, setOpenSections] = useState({
    price: true,
    type: false,
    category: false
  })
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(SHOP_PAGE_SIZE)

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        const response = await productService.getAll()
        setProducts(response.data || [])
      } catch (error) {
        console.error('Failed to load shop data:', error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  const priceBounds = useMemo(() => {
    const prices = products.map((product) => Number(product.mrp || 0)).filter((value) => value > 0)
    if (prices.length === 0) {
      return { min: 0, max: 0 }
    }
    return {
      min: Math.min(...prices),
      max: Math.max(...prices)
    }
  }, [products])

  useEffect(() => {
    setSearchTerm(searchParams.get('q') || '')
    setSelectedType(searchParams.get('type') || '')
    setSelectedCategory(searchParams.get('category') || '')
    setSortBy(searchParams.get('sort') || 'popular')

    const minParam = searchParams.get('min')
    const maxParam = searchParams.get('max')
    const nextMin = minParam !== null ? Number(minParam) : priceBounds.min
    const nextMax = maxParam !== null ? Number(maxParam) : priceBounds.max
    if (!Number.isNaN(nextMin)) {
      setPriceMin(Math.min(nextMin, nextMax || nextMin))
    }
    if (!Number.isNaN(nextMax)) {
      setPriceMax(Math.max(nextMax, nextMin || nextMax))
    }
  }, [searchParams, priceBounds.min, priceBounds.max])

  const updateParams = (updates) => {
    const params = new URLSearchParams(searchParams)
    Object.entries(updates).forEach(([key, value]) => {
      if (value === undefined || value === null || value === '') {
        params.delete(key)
      } else {
        params.set(key, value)
      }
    })
    setSearchParams(params, { replace: true })
  }

  const typeOptions = useMemo(() => {
    const types = new Set()
    products.forEach((product) => {
      if (product.productType) {
        types.add(product.productType)
      }
    })
    return Array.from(types).sort((a, b) => a.localeCompare(b))
  }, [products])

  const categoryOptions = useMemo(() => {
    const map = new Map()
    products.forEach((product) => {
      if (product.categoryId) {
        const label = product.category?.name || `Category ${product.categoryId}`
        map.set(product.categoryId.toString(), label)
      }
    })
    return Array.from(map.entries())
      .map(([id, name]) => ({ id, name }))
      .sort((a, b) => a.name.localeCompare(b.name))
  }, [products])

  const filteredProducts = useMemo(() => {
    const searchValue = searchTerm.trim().toLowerCase()
    const minValue = Number(priceMin)
    const maxValue = Number(priceMax)

    const list = products.filter((product) => {
      const name = (product.name || '').toLowerCase()
      const type = (product.productType || '').toLowerCase()
      const price = Number(product.mrp || 0)
      const categoryMatch = selectedCategory
        ? product.categoryId?.toString() === selectedCategory
        : true
      const searchMatch = searchValue ? name.includes(searchValue) : true
      const typeMatch = selectedType ? type === selectedType.toLowerCase() : true
      const minMatch = Number.isFinite(minValue) ? price >= minValue : true
      const maxMatch = Number.isFinite(maxValue) && maxValue > 0 ? price <= maxValue : true

      return categoryMatch && searchMatch && typeMatch && minMatch && maxMatch
    })

    const sorted = [...list]
    switch (sortBy) {
      case 'price-asc':
        sorted.sort((a, b) => Number(a.mrp || 0) - Number(b.mrp || 0))
        break
      case 'price-desc':
        sorted.sort((a, b) => Number(b.mrp || 0) - Number(a.mrp || 0))
        break
      case 'newest':
        sorted.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
        break
      default:
        sorted.sort((a, b) => (b.views || 0) - (a.views || 0) || (b.likes || 0) - (a.likes || 0))
        break
    }

    return sorted
  }, [products, searchTerm, priceMin, priceMax, selectedType, selectedCategory, sortBy])

  const totalFiltered = filteredProducts.length
  const totalPages = Math.max(1, Math.ceil(totalFiltered / pageSize))
  const page = Math.max(1, Math.min(currentPage, totalPages))
  const paginatedProducts = useMemo(() => {
    const start = (page - 1) * pageSize
    return filteredProducts.slice(start, start + pageSize)
  }, [filteredProducts, page, pageSize])

  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, priceMin, priceMax, selectedType, selectedCategory, sortBy])

  const handleResetFilters = () => {
    setSearchTerm('')
    setPriceMin(priceBounds.min)
    setPriceMax(priceBounds.max)
    setSelectedType('')
    setSelectedCategory('')
    setSortBy('popular')
    updateParams({
      q: '',
      min: '',
      max: '',
      type: '',
      category: '',
      sort: ''
    })
  }

  const formatCurrency = (value) => {
    const amount = Number(value || 0)
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount)
  }

  const handleToggleSection = (key) => {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  const getPercent = (value) => {
    if (!priceBounds.max || priceBounds.max === priceBounds.min) return 0
    return ((value - priceBounds.min) / (priceBounds.max - priceBounds.min)) * 100
  }

  return (
    <Container className="shop-list-page py-4">
      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : (
        <>
          <div className="shop-toolbar">
            <div className="toolbar-left">
              <button
                type="button"
                className={`toolbar-button ${showFilter ? 'active' : ''}`}
                onClick={() => {
                  setShowFilter((prev) => !prev)
                  setShowSort(false)
                }}
              >
                <i className="bi bi-sliders"></i>
                Filters
              </button>
              <button
                type="button"
                className={`toolbar-button ${showSort ? 'active' : ''}`}
                onClick={() => {
                  setShowSort((prev) => !prev)
                  setShowFilter(false)
                }}
              >
                <i className="bi bi-arrow-down-up"></i>
                Sort
              </button>
            </div>
            <div className="toolbar-right">
              <span className="results-count">
                {totalFiltered} products
              </span>
            </div>
          </div>

          {showFilter && (
            <div className="shop-dropdown">
              <div className="shop-dropdown-panel">
                <div className="dropdown-header">
                  <span>Filters</span>
                  <button type="button" onClick={() => setShowFilter(false)}>
                    <i className="bi bi-x-lg"></i>
                  </button>
                </div>

                <div className="filter-block">
                  <label htmlFor="shop-search">Search by name</label>
                  <input
                    id="shop-search"
                    type="text"
                    value={searchTerm}
                    placeholder="Enter product name"
                    onChange={(event) => {
                      const value = event.target.value
                      setSearchTerm(value)
                      updateParams({ q: value })
                    }}
                  />
                </div>

                <button
                  type="button"
                  className="filter-section-toggle"
                  onClick={() => handleToggleSection('price')}
                >
                  Price
                  <span>{openSections.price ? '−' : '+'}</span>
                </button>
                {openSections.price && (
                  <div className="filter-section">
                    <div className="price-values">
                      <span>{formatCurrency(priceMin)}</span>
                      <span>{formatCurrency(priceMax)}</span>
                    </div>
                    <div className="price-slider">
                      <div className="range-track" />
                      <div
                        className="range-fill"
                        style={{
                          left: `${getPercent(priceMin)}%`,
                          width: `${getPercent(priceMax) - getPercent(priceMin)}%`
                        }}
                      />
                      <input
                        type="range"
                        min={priceBounds.min}
                        max={priceBounds.max}
                        step={1000}
                        value={priceMin}
                        className="range-input"
                        onChange={(event) => {
                          const value = Number(event.target.value)
                          const next = Math.min(value, priceMax)
                          setPriceMin(next)
                          updateParams({ min: next })
                        }}
                      />
                      <input
                        type="range"
                        min={priceBounds.min}
                        max={priceBounds.max}
                        step={1000}
                        value={priceMax}
                        className="range-input"
                        onChange={(event) => {
                          const value = Number(event.target.value)
                          const next = Math.max(value, priceMin)
                          setPriceMax(next)
                          updateParams({ max: next })
                        }}
                      />
                    </div>
                  </div>
                )}

                <button
                  type="button"
                  className="filter-section-toggle"
                  onClick={() => handleToggleSection('type')}
                >
                  Product type
                  <span>{openSections.type ? '−' : '+'}</span>
                </button>
                {openSections.type && (
                  <div className="filter-section">
                    <div className="filter-options">
                      <button
                        type="button"
                        className={`filter-option ${selectedType === '' ? 'active' : ''}`}
                        onClick={() => {
                          setSelectedType('')
                          updateParams({ type: '' })
                        }}
                      >
                        All
                      </button>
                      {typeOptions.map((type) => (
                        <button
                          key={type}
                          type="button"
                          className={`filter-option ${selectedType === type ? 'active' : ''}`}
                          onClick={() => {
                            setSelectedType(type)
                            updateParams({ type })
                          }}
                        >
                          {type}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <button
                  type="button"
                  className="filter-section-toggle"
                  onClick={() => handleToggleSection('category')}
                >
                  Category
                  <span>{openSections.category ? '−' : '+'}</span>
                </button>
                {openSections.category && (
                  <div className="filter-section">
                    <div className="filter-options">
                      <button
                        type="button"
                        className={`filter-option ${selectedCategory === '' ? 'active' : ''}`}
                        onClick={() => {
                          setSelectedCategory('')
                          updateParams({ category: '' })
                        }}
                      >
                        All
                      </button>
                      {categoryOptions.map((option) => (
                        <button
                          key={option.id}
                          type="button"
                          className={`filter-option ${selectedCategory === option.id ? 'active' : ''}`}
                          onClick={() => {
                            setSelectedCategory(option.id)
                            updateParams({ category: option.id })
                          }}
                        >
                          {option.name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="filter-actions">
                  <button type="button" className="filter-reset" onClick={handleResetFilters}>
                    Reset
                  </button>
                  <button type="button" className="filter-close" onClick={() => setShowFilter(false)}>
                    View products
                  </button>
                </div>
              </div>
            </div>
          )}

          {showSort && (
            <div className="shop-dropdown">
              <div className="shop-dropdown-panel">
                <div className="dropdown-header">
                  <span>Sort by</span>
                  <button type="button" onClick={() => setShowSort(false)}>
                    <i className="bi bi-x-lg"></i>
                  </button>
                </div>
                <div className="sort-options">
                  <button
                    type="button"
                    className={`sort-option ${sortBy === 'price-asc' ? 'active' : ''}`}
                    onClick={() => {
                      setSortBy('price-asc')
                      updateParams({ sort: 'price-asc' })
                    }}
                  >
                    Price: low to high
                  </button>
                  <button
                    type="button"
                    className={`sort-option ${sortBy === 'price-desc' ? 'active' : ''}`}
                    onClick={() => {
                      setSortBy('price-desc')
                      updateParams({ sort: 'price-desc' })
                    }}
                  >
                    Price: high to low
                  </button>
                  <button
                    type="button"
                    className={`sort-option ${sortBy === 'newest' ? 'active' : ''}`}
                    onClick={() => {
                      setSortBy('newest')
                      updateParams({ sort: 'newest' })
                    }}
                  >
                    Newest
                  </button>
                  <button
                    type="button"
                    className={`sort-option ${sortBy === 'popular' ? 'active' : ''}`}
                    onClick={() => {
                      setSortBy('popular')
                      updateParams({ sort: 'popular' })
                    }}
                  >
                    Most popular
                  </button>
                </div>
              </div>
            </div>
          )}

          <section className="shop-results">
            {totalFiltered === 0 ? (
              <div className="shop-empty">No matching products found.</div>
            ) : (
              <>
                <Row className="g-4">
                  {paginatedProducts.map((product) => (
                    <Col key={product.id} xs={6} md={4} lg={3}>
                      <ProductCard product={product} />
                    </Col>
                  ))}
                </Row>
                <Pagination
                  totalItems={totalFiltered}
                  currentPage={page}
                  pageSize={pageSize}
                  onPageChange={setCurrentPage}
                  onPageSizeChange={setPageSize}
                  showPageSizeSelect
                  pageSizeOptions={[12, 24, 48]}
                  label="products"
                />
              </>
            )}
          </section>
        </>
      )}
    </Container>
  )
}

export default Shop
