import React, { useState, useEffect } from 'react'
import { Card, Row, Col, Container, Badge, Button } from 'react-bootstrap'
import { productService } from '../../common/services'
import ChatBox from '../../components/ChatBox/ChatBox'
import ProductCard from '../../components/common/ProductCard'
import './Dashboard.css'

const Dashboard = () => {
  const FACEBOOK_URL = 'https://facebook.com/'
  const ZALO_URL = 'https://zalo.me/'

  const [allProducts, setAllProducts] = useState([])
  const [featuredProducts, setFeaturedProducts] = useState([])
  const [popularProducts, setPopularProducts] = useState([])
  const [loading, setLoading] = useState(true)

  const categoryHighlights = [
    {
      title: 'Engagement ring',
      subtitle: 'Shimmering promise of love',
      imageUrl: 'https://images.unsplash.com/photo-1766910700357-a5f517a512b4?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
    },
    {
      title: 'Wedding rings',
      subtitle: 'Elegant pairs for forever',
      imageUrl: 'https://images.unsplash.com/photo-1554047310-ab6170fc7b10?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
    },
    {
      title: 'Diamond jewelry',
      subtitle: 'Brilliance for every day',
      imageUrl: 'https://images.unsplash.com/photo-1668619322826-c98b77b9c125?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
    }
  ]

  const featureBanners = [
    {
      title: 'Engagement ring',
      description: 'A shimmering ring opening the path to a journey of perfect love.',
      imageUrl: 'https://images.unsplash.com/photo-1518370265276-f22b706aeac8?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
    },
    {
      title: 'Wedding ring',
      description: 'A symbol of love and commitment, when two hearts unite as one.',
      imageUrl: 'https://images.unsplash.com/photo-1632406475389-7ac505467d45?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
    }
  ]

  const spotlightBanner = {
    title: 'GIA Diamond',
    description: 'Natural diamonds tailored specifically for your signature brilliance.',
    imageUrl: 'https://www.valmand.com/image/cache/wp/gj/Inele%20de%20logodna%20cu%20diamante/side%20stones/i4644/26.06.202502016-1600x1600-copy-750x750.webp'
  }

  const collectionTiles = [
    {
      title: 'Cutting-edge wedding ring',
      imageUrl: 'https://princessjewelry.com/cdn/shop/files/MRDTI-003-8Y.jpg?height=720&v=1753304007'
    },
    {
      title: 'Eternity',
      imageUrl: 'https://images.unsplash.com/photo-1763120471664-46e3b1e19aa5?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8ZXRlcm5pdHklMjByaW5nfGVufDB8fDB8fHww'
    },
    {
      title: 'Best selling',
      imageUrl: 'https://www.newworlddiamonds.com/cdn/shop/files/abigail-solitaire-engagement-ring-1-0-ct-igi-certified-for-ring-gemstone-jewelry-1_700x700.jpg?v=1757003094'
    },
    {
      title: 'New collection',
      imageUrl: 'https://www.mohanajewels.com/cdn/shop/files/N.14.2.png?v=1753243379&width=713'
    }
  ]

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

  const formatCurrency = (value) => {
    const amount = Number(value || 0)
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount)
  }

  return (
    <Container fluid className="dashboard-page py-4">
      <section className="home-showcase container">
        <div className="showcase-grid">
          <div className="showcase-main">
            <div className="category-grid">
              {categoryHighlights.map((item) => (
                <div key={item.title} className="category-card">
                  <div
                    className="category-image"
                    style={{ backgroundImage: `url(${item.imageUrl})` }}
                    aria-hidden="true"
                  />
                  <div className="category-content">
                    <h3>{item.title}</h3>
                    <p>{item.subtitle}</p>
                    <span className="category-cta">Explore now</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="feature-split">
              {featureBanners.map((banner) => (
                <div key={banner.title} className="feature-card">
                  <img src={banner.imageUrl} alt={banner.title} />
                  <div className="feature-text">
                    <h3>{banner.title}</h3>
                    <p>{banner.description}</p>
                    <button className="btn btn-outline-dark btn-sm" type="button">
                      View more
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="diamond-spotlight">
              <div className="spotlight-text">
                <h2>{spotlightBanner.title}</h2>
                <p>{spotlightBanner.description}</p>
                <button className="btn btn-outline-dark btn-sm" type="button">
                  View more
                </button>
              </div>
              <img src={spotlightBanner.imageUrl} alt={spotlightBanner.title} />
            </div>

            <div className="collection-strip">
              {collectionTiles.map((tile) => (
                <div key={tile.title} className="collection-card">
                  <img src={tile.imageUrl} alt={tile.title} />
                  <p>{tile.title}</p>
                </div>
              ))}
            </div>
          </div>

          <aside className="showcase-sidebar">
            <div className="sidebar-card promo-card">
              <img
                src="https://media.tiffany.com/is/image/tco/2024_MDAY_MWTS_988x988_NecklacesPendants-1"
                alt="Luxury gold and diamond"
              />
              <div className="promo-content">
                <h4>Premium advice</h4>
                <p>Curated gold and diamond gifts for every celebration.</p>
                <div className="promo-form">
                  <input type="text" placeholder="Full name" aria-label="Full name" />
                  <input type="tel" placeholder="Phone number" aria-label="Phone number" />
                  <button className="btn btn-dark btn-sm" type="button">
                    Get advice now
                  </button>
                </div>
              </div>
            </div>

            <div className="sidebar-card ad-card">
              <div className="ad-header">
                <span className="tag">Top Search</span>
                <span className="tag muted">24K</span>
              </div>
              <h5>New season highlights</h5>
              <p>Minimal designs with premium finish, ready for gifting.</p>
              <img
                src="https://image.brilliantearth.com/cdn-cgi/image/width=443,height=513,quality=100,format=auto/https://cdn.builder.io/api/v1/image/assets%2F9f2a69003c86470ea05deb9ecb9887be%2Fdbcb471c39254ed2b364bc2753159fe9"
                alt="Diamond rings"
              />
              <button className="btn btn-outline-dark btn-sm w-100" type="button">
                Explore collection
              </button>
            </div>

            <div className="sidebar-card quick-info">
              <h5>Quick concierge</h5>
              <p>Call 1900 232 354 or chat for bespoke sizing and delivery.</p>
              <div className="info-list">
                <span>Free engraving</span>
                <span>Flexible exchange</span>
                <span>Certified diamonds</span>
              </div>
            </div>
          </aside>
        </div>
      </section>
      {featuredProducts.length > 0 && (
        <section className="mb-5 container">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
              <h2 className="h3 fw-bold mb-1">
                <i className="bi bi-star-fill text-warning me-2"></i>
                Featured Jewelry
              </h2>
              <p className="text-muted mb-0">Handpicked brilliance for you</p>
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
                <Col key={product.id} xs={6} sm={4} md={3} lg={3} className="mb-4">
                  <ProductCard product={product} showStats={true} />
                </Col>
              ))}
            </Row>
          )}
        </section>
      )}

      {popularProducts.length > 0 && (
        <section className="mb-5 container">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
              <h2 className="h3 fw-bold mb-1">
                <i className="bi bi-fire text-danger me-2"></i>
                Most Admired
              </h2>
              <p className="text-muted mb-0">Most viewed this week</p>
            </div>
          </div>
          <Row>
            {popularProducts.map((product) => (
              <Col key={product.id} xs={6} sm={4} md={3} lg={3} className="mb-4">
                <ProductCard product={product} showStats={true} />
              </Col>
            ))}
          </Row>
        </section>
      )}

      <section className="mb-5 container">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h2 className="h3 fw-bold mb-1">
              <i className="bi bi-bookshelf me-2"></i>
              All Jewelry
            </h2>
            <p className="text-muted mb-0">Browse our complete collection ({allProducts.length} pieces)</p>
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
              <p className="lead text-muted mb-0">No jewelry available</p>
            </Card.Body>
          </Card>
        ) : (
          <Row>
            {allProducts.map((product) => (
              <Col key={product.id} xs={6} sm={4} md={3} lg={3} className="mb-4">
                <ProductCard product={product} showStats={true} />
              </Col>
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
