import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Carousel } from 'react-bootstrap'
import { storyService } from '../../common/services'
import { ROUTES } from '../../common/constants'
import './HeroBanner.css'

const HeroBanner = () => {
  const navigate = useNavigate()
  const [stories, setStories] = useState([])
  const [index, setIndex] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadStories()
  }, [])

  const handleSelect = (selectedIndex) => {
    setIndex(selectedIndex)
  }

  const loadStories = async () => {
    try {
      setLoading(true)
      const featuredRes = await storyService.getAll(true)
      let storiesData = featuredRes.data || []
      
      if (storiesData.length === 0) {
        const allRes = await storyService.getAll()
        storiesData = allRes.data || []
      }

      storiesData = storiesData.slice(0, 4)

      setStories(storiesData)
    } catch (error) {
      console.error('Error loading stories:', error)
      setStories([])
    } finally {
      setLoading(false)
    }
  }

  const handleBannerClick = (story) => {
    if (story?.link) {
      navigate(story.link)
      return
    }

    navigate(ROUTES.DASHBOARD)
  }

  const banners = stories.map(story => ({
    id: story.id,
    imageUrl: story.imageUrl,
    buttonText: 'Shop Now',
    story: story
  }))

  if (loading && stories.length === 0) {
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
                backgroundPosition: 'center',
                minHeight: 'calc(100vh - 115px)',
                height: 'calc(100vh - 115px)'
              }}
            >
              <div className="banner-cta">
                <button
                  className="btn btn-primary btn-lg"
                  onClick={() => handleBannerClick(banner)}
                >
                  {banner.buttonText || 'Go to Shop'}
                  <i className="bi bi-arrow-right ms-2"></i>
                </button>
              </div>
            </div>
          </Carousel.Item>
        ))}
      </Carousel>
    </div>
  )
}

export default HeroBanner
