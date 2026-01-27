import React, { useEffect, useMemo, useState } from 'react'
import { Card, Col, Container, Form, Row, Button } from 'react-bootstrap'
import { useSearchParams } from 'react-router-dom'
import { categoryService, productService } from '../../common/services'
import ProductCard from '../../components/common/ProductCard'
import './Shop.css'

const Shop = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)

  const [searchTerm, setSearchTerm] = useState('')
  const [minPrice, setMinPrice] = useState('')
  const [maxPrice, setMaxPrice] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [selectedType, setSelectedType] = useState('')
  const [sortBy, setSortBy] = useState('newest')

  useEffect(() => {
    const categoryId = searchParams.get('category')
    if (categoryId) {
      setSelectedCategory(categoryId)
    }
  }, [searchParams])

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        const [productsResponse, categoriesResponse] = await Promise.all([
          productService.getAll(),
          categoryService.getAll()
        ])
        setProducts(productsResponse.data || [])
        setCategories(categoriesResponse.data || [])
      } catch (error) {
        console.error('Failed to load shop data:', error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  const productTypes = useMemo(() => {
    const types = products
      .map((product) => product.productType)
      .filter(Boolean)
    return Array.from(new Set(types)).sort()
  }, [products])

  const filteredProducts = useMemo(() => {
    let result = [...products]

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase()
      result = result.filter((product) => product.name?.toLowerCase().includes(term))
    }

    if (selectedCategory) {
      result = result.filter((product) => {
        const categoryId = product.category?.id || product.categoryId
        return String(categoryId) === String(selectedCategory)
      })
    }

    if (selectedType) {
      result = result.filter((product) => product.productType === selectedType)
    }

    const min = Number(minPrice)
    const max = Number(maxPrice)
    if (!Number.isNaN(min) && minPrice !== '') {
      result = result.filter((product) => Number(product.mrp || 0) >= min)
    }
    if (!Number.isNaN(max) && maxPrice !== '') {
      result = result.filter((product) => Number(product.mrp || 0) <= max)
    }

    switch (sortBy) {
      case 'price-asc':
        result.sort((a, b) => Number(a.mrp || 0) - Number(b.mrp || 0))
        break
      case 'price-desc':
        result.sort((a, b) => Number(b.mrp || 0) - Number(a.mrp || 0))
        break
      case 'views':
        result.sort((a, b) => (b.views || 0) - (a.views || 0))
        break
      case 'name':
        result.sort((a, b) => (a.name || '').localeCompare(b.name || ''))
        break
      default:
        result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        break
    }

    return result
  }, [products, searchTerm, selectedCategory, selectedType, minPrice, maxPrice, sortBy])

  const handleCategoryChange = (value) => {
    setSelectedCategory(value)
    if (value) {
      setSearchParams({ category: value })
    } else {
      setSearchParams({})
    }
  }

  const clearFilters = () => {
    setSearchTerm('')
    setMinPrice('')
    setMaxPrice('')
    setSelectedCategory('')
    setSelectedType('')
    setSortBy('newest')
    setSearchParams({})
  }

  return (
    <Container className="shop-page py-4">
      <div className="shop-hero">
        <div className="shop-breadcrumb">Home / Shop</div>
        <h1>Shop</h1>
        <p className="shop-description">
          Discover our curated selection of diamond and gold jewellery. Use the filters
          to find the perfect piece.
        </p>
      </div>

      <div className="shop-layout">
        <aside className="shop-sidebar">
          <Card className="shop-filter-card">
            <Card.Body>
              <h5 className="mb-3">Filters</h5>

              <Form.Group className="mb-3">
                <Form.Label>Search by name</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Search products"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                />
              </Form.Group>

              <div className="filter-section">
                <h6>Category</h6>
                <Form.Select
                  value={selectedCategory}
                  onChange={(event) => handleCategoryChange(event.target.value)}
                >
                  <option value="">All categories</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </Form.Select>
              </div>

              <div className="filter-section">
                <h6>Product type</h6>
                <Form.Select
                  value={selectedType}
                  onChange={(event) => setSelectedType(event.target.value)}
                >
                  <option value="">All types</option>
                  {productTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </Form.Select>
              </div>

              <div className="filter-section">
                <h6>Price range</h6>
                <Row className="g-2">
                  <Col>
                    <Form.Control
                      type="number"
                      min="0"
                      placeholder="Min"
                      value={minPrice}
                      onChange={(event) => setMinPrice(event.target.value)}
                    />
                  </Col>
                  <Col>
                    <Form.Control
                      type="number"
                      min="0"
                      placeholder="Max"
                      value={maxPrice}
                      onChange={(event) => setMaxPrice(event.target.value)}
                    />
                  </Col>
                </Row>
              </div>

              <Button variant="outline-dark" size="sm" onClick={clearFilters}>
                Clear filters
              </Button>
            </Card.Body>
          </Card>
        </aside>

        <section className="shop-content">
          <div className="shop-toolbar">
            <div className="shop-count text-muted">
              {loading ? 'Loading products...' : `Showing ${filteredProducts.length} products`}
            </div>
            <Form.Select
              className="shop-sort"
              value={sortBy}
              onChange={(event) => setSortBy(event.target.value)}
            >
              <option value="newest">Newest</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="views">Most Viewed</option>
              <option value="name">Name A-Z</option>
            </Form.Select>
          </div>

          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : filteredProducts.length === 0 ? (
            <Card className="text-center py-5">
              <Card.Body>
                <p className="text-muted mb-0">No products match your filters.</p>
              </Card.Body>
            </Card>
          ) : (
            <Row className="g-4">
              {filteredProducts.map((product) => (
                <Col key={product.id} xs={6} md={4} lg={3}>
                  <ProductCard product={product} />
                </Col>
              ))}
            </Row>
          )}
        </section>
      </div>
    </Container>
  )
}

export default Shop
