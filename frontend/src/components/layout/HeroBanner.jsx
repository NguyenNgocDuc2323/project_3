import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Carousel } from 'react-bootstrap'
import { bannerService } from '../../common/services'
import { ROUTES } from '../../common/constants'
import './HeroBanner.css'

const HeroBanner = () => {
  const navigate = useNavigate()
  const [banners, setBanners] = useState([])
  const [index, setIndex] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadBanners()
  }, [])

  const handleSelect = (selectedIndex) => {
    setIndex(selectedIndex)
  }

  const loadBanners = async () => {
    try {
      setLoading(true)
      const bannersRes = await bannerService.getAll(true)
      const list = bannersRes.data || []
      setBanners(list.map(b => ({
        id: b.id,
        imageUrl: b.imageUrl,
        link: b.link || null,
        title: b.title
      })))
    } catch (error) {
      console.error('Error loading banners:', error)
      setBanners([])
    } finally {
      setLoading(false)
    }
  }

  if (loading && banners.length === 0) {
    return (
      <div className="hero-banner position-relative" style={{ minHeight: 'calc(100vh - 115px)' }}>
        <div className="d-flex align-items-center justify-content-center h-100">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>
    )
  }

  if (!loading && banners.length === 0) {
    return null
  }

  return (
    <div className="hero-banner position-relative">
      <Carousel
        activeIndex={index}
        onSelect={handleSelect}
        interval={5000}
        fade
        controls={banners.length > 1}
        indicators={banners.length > 1}
      >
        {banners.map((banner) => (
          <Carousel.Item key={banner.id}>
            <div
              className="banner-slide position-relative"
              style={{
                backgroundImage: `url(${banner.imageUrl})`,
                backgroundSize: 'cover',
                backgroundRepeat: 'no-repeat',
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                backgroundPosition: 'center',
                minHeight: 'calc(100vh - 115px)',
                height: 'calc(100vh - 115px)'
              }}
              role="button"
              tabIndex={0}
              onClick={() => {
                if (banner.link) navigate(banner.link)
                else navigate(ROUTES.DASHBOARD)
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  if (banner.link) navigate(banner.link)
                  else navigate(ROUTES.DASHBOARD)
                }
              }}
              aria-label={banner.title || 'Banner'}
            >
            </div>
          </Carousel.Item>
        ))}
      </Carousel>
    </div>
  )
}

export default HeroBanner
