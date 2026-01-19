import React, { useState, useEffect } from 'react'
import { Card, Row, Col, Container, Badge, Button } from 'react-bootstrap'
import { productService } from '../../common/services'
import ChatBox from '../../components/ChatBox/ChatBox'
import './Dashboard.css'

const Dashboard = () => {
  const FACEBOOK_URL = 'https://facebook.com/'
  const ZALO_URL = 'https://zalo.me/'

  const [allProducts, setAllProducts] = useState([])
  const [featuredProducts, setFeaturedProducts] = useState([])
  const [popularProducts, setPopularProducts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      
      const productsResponse = await productService.getAll()
      const products = productsResponse.data || []
      setAllProducts(products)
      
      const featured = products.filter(p => p.isFeatured || p.IsFeatured).slice(0, 6)
      setFeaturedProducts(featured)
      
      const popular = [...products]
        .sort((a, b) => (b.views || 0) - (a.views || 0))
        .slice(0, 6)
      setPopularProducts(popular)
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatNumber = (num) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M'
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K'
    return num?.toString() || '0'
  }

  const getPlaceholderImage = () => {
    return "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='300'%3E%3Crect width='200' height='300' fill='%23e9ecef'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='Arial' font-size='16' fill='%236c757d'%3E📖 Book%3C/text%3E%3C/svg%3E"
  }

  const ProductCard = ({ product }) => (
    <Col xs={6} sm={4} md={3} lg={3} className="mb-4">
      <Card className="product-card h-100 shadow-sm">
        <div className="product-image-container">
          <Card.Img 
            variant="top" 
            src={product.imageUrl || getPlaceholderImage()}
            className="product-image"
            onError={(e) => {
              e.target.src = getPlaceholderImage()
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
        </div>
        <Card.Body className="d-flex flex-column p-3">
          <Card.Title className="product-title mb-2" title={product.title}>
            {product.title?.length > 30 
              ? `${product.title.substring(0, 30)}...` 
              : product.title}
          </Card.Title>
          <Card.Text className="product-author text-muted small mb-2">
            <i className="bi bi-person me-1"></i>
            {product.author || 'Unknown Author'}
          </Card.Text>
          <div className="product-stats d-flex justify-content-between align-items-center mb-2 small text-muted">
            <span>
              <i className="bi bi-eye me-1"></i>
              {formatNumber(product.views || 0)}
            </span>
            <span>
              <i className="bi bi-heart me-1"></i>
              {formatNumber(product.likes || 0)}
            </span>
          </div>
          <Button variant="primary" size="sm" className="mt-auto">
            <i className="bi bi-eye me-1"></i>View Details
          </Button>
        </Card.Body>
      </Card>
    </Col>
  )

  return (
    <Container fluid className="py-4">
      {featuredProducts.length > 0 && (
        <section className="mb-5">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
              <h2 className="h3 fw-bold mb-1">
                <i className="bi bi-star-fill text-warning me-2"></i>
                Featured Books
              </h2>
              <p className="text-muted mb-0">Handpicked selections for you</p>
            </div>
          </div>
          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : (
            <Row>
              {featuredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </Row>
          )}
        </section>
      )}

      {popularProducts.length > 0 && (
        <section className="mb-5">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
              <h2 className="h3 fw-bold mb-1">
                <i className="bi bi-fire text-danger me-2"></i>
                Popular Books
              </h2>
              <p className="text-muted mb-0">Most viewed this week</p>
            </div>
          </div>
          <Row>
            {popularProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </Row>
        </section>
      )}

      <section className="mb-5">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h2 className="h3 fw-bold mb-1">
              <i className="bi bi-bookshelf me-2"></i>
              All Books
            </h2>
            <p className="text-muted mb-0">Browse our complete collection ({allProducts.length} books)</p>
          </div>
        </div>
        
        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        ) : allProducts.length === 0 ? (
          <Card className="text-center py-5">
            <Card.Body>
              <i className="bi bi-inbox display-1 text-muted d-block mb-3"></i>
              <p className="lead text-muted mb-0">No books available</p>
            </Card.Body>
          </Card>
        ) : (
          <Row>
            {allProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </Row>
        )}
      </section>

      <div className="contact-float" aria-label="Contact quick actions">
        <ChatBox />
        <a
          className="contact-btn contact-facebook"
          href={FACEBOOK_URL}
          target="_blank"
          rel="noreferrer"
          aria-label="Contact via Facebook"
          title="Facebook"
        >
          <i className="bi bi-facebook"></i>
        </a>
        <a
          className="contact-btn contact-zalo"
          href={ZALO_URL}
          target="_blank"
          rel="noreferrer"
          aria-label="Contact via Zalo"
          title="Zalo"
        >
          <span className="zalo-badge">Z</span>
        </a>
      </div>
    </Container>
  )
}

export default Dashboard
