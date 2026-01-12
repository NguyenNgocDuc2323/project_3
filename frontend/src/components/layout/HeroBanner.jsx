import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Carousel } from 'react-bootstrap'
import { storyService } from '../../common/services'
import './HeroBanner.css'

const HeroBanner = () => {
  const navigate = useNavigate()
  const [stories, setStories] = useState([])
  const [index, setIndex] = useState(0)
  const [loading, setLoading] = useState(true)

  const defaultBookImages = [
    'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=1600&h=600&fit=crop&q=80',
    'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=1600&h=600&fit=crop&q=80',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1600&h=600&fit=crop&q=80',
    'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=1600&h=600&fit=crop&q=80',
    'https://images.unsplash.com/photo-1512820790803-83ca750da396?w=1600&h=600&fit=crop&q=80',
    'https://images.unsplash.com/photo-1516979187457-637abb4f9353?w=1600&h=600&fit=crop&q=80'
  ]

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
      
      storiesData = storiesData.map((story, index) => ({
        ...story,
        imageUrl: story.imageUrl || defaultBookImages[index % defaultBookImages.length]
      }))

      setStories(storiesData)
    } catch (error) {
      console.error('Error loading stories:', error)
      setStories([])
    } finally {
      setLoading(false)
    }
  }

  const handleBannerClick = (story) => {
    if (story.id) {
      if (window.showToast) {
        window.showToast({
          severity: 'info',
          summary: 'Story',
          detail: `Opening ${story.title}...`,
          life: 3000
        })
      }
    } else if (story.link) {
      navigate(story.link)
    }
  }

  const defaultBanners = [
    {
      id: 1,
      title: 'Discover Amazing Stories',
      subtitle: 'Welcome to Story Reader',
      description: 'Explore thousands of captivating stories from talented authors around the world',
      imageUrl: defaultBookImages[0],
      buttonText: 'Start Reading',
      link: '/dashboard'
    },
    {
      id: 2,
      title: 'Featured Stories Collection',
      subtitle: 'Curated for You',
      description: 'Handpicked stories that will take you on incredible journeys',
      imageUrl: defaultBookImages[1],
      buttonText: 'View Stories',
      link: '/dashboard'
    }
  ]

  const banners = stories.length > 0 
    ? stories.map(story => ({
        id: story.id,
        title: story.title,
        subtitle: `by ${story.author}`,
        description: story.description || 'Discover this amazing story',
        imageUrl: story.imageUrl,
        buttonText: 'Read Now',
        story: story
      }))
    : defaultBanners

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
              <div className="banner-overlay position-absolute top-0 start-0 w-100 h-100 bg-dark opacity-50"></div>
              <Carousel.Caption>
                <div className="banner-content">
                  <div className="container">
                    <h2 className="display-4 fw-bold mb-3">{banner.title}</h2>
                    <p className="h5 mb-2">{banner.subtitle}</p>
                    <p className="lead mb-4" style={{ maxWidth: '700px', margin: '0 auto' }}>
                      {banner.description}
                    </p>
                    <button
                      className="btn btn-primary btn-lg"
                      onClick={() => handleBannerClick(banner)}
                    >
                      {banner.buttonText || 'Explore Now'}
                      <i className="bi bi-arrow-right ms-2"></i>
                    </button>
                  </div>
                </div>
              </Carousel.Caption>
            </div>
          </Carousel.Item>
        ))}
      </Carousel>
    </div>
  )
}

export default HeroBanner
