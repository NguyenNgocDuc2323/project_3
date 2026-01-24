import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { storyService } from '../../../common/services'
import { ROUTES } from '../../../common/constants'
import './List.css'

const StoriesList = () => {
  const navigate = useNavigate()
  const [stories, setStories] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')

  useEffect(() => {
    loadStories()
  }, [])

  const loadStories = async () => {
    try {
      setLoading(true)
      const response = await storyService.getAll()
      setStories(response.data || [])
    } catch (error) {
      console.error('Error loading guides:', error)
      if (window.showToast) {
        window.showToast({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load guides',
          life: 4000
        })
      }
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Are you sure you want to delete "${title}"?`)) {
      return
    }

    try {
      await storyService.delete(id)
      if (window.showToast) {
        window.showToast({
          severity: 'success',
          summary: 'Success',
          detail: 'Story deleted successfully',
          life: 3000
        })
      }
      loadStories()
    } catch (error) {
      console.error('Error deleting guide:', error)
      if (window.showToast) {
        window.showToast({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to delete guide',
          life: 4000
        })
      }
    }
  }

  const filteredStories = stories.filter(story => {
    const matchesCategory = selectedCategory === 'all' || story.category === selectedCategory
    const matchesSearch = !searchTerm || 
      story.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      story.author.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesCategory && matchesSearch
  })

  const uniqueCategories = ['all', ...new Set(stories.map(s => s.category).filter(Boolean))]

  const getPlaceholderImage = (width = 60, height = 60) => {
    return `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='${width}' height='${height}'%3E%3Crect width='${width}' height='${height}' fill='%23f6efe4'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='Arial' font-size='12' fill='%238a6d3b'%3E%F0%9F%92%8E%3C/text%3E%3C/svg%3E`
  }

  if (loading) {
    return (
      <div className="container my-5">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="admin-stories-list">
      <div className="container my-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h1 className="display-6 fw-bold mb-2">
              <i className="bi bi-gem me-2"></i>
              Manage Gem Guides
            </h1>
            <p className="text-muted">Create, edit, and delete jewelry insights</p>
          </div>
          <Link to="/admin/stories/create" className="btn btn-primary">
            <i className="bi bi-plus-circle me-2"></i>
            Create New Guide
          </Link>
        </div>

        <div className="row mb-4">
          <div className="col-md-6 mb-3 mb-md-0">
            <div className="input-group">
              <span className="input-group-text">
                <i className="bi bi-search"></i>
              </span>
              <input
                type="text"
                className="form-control"
                placeholder="Search guides..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="col-md-6">
            <div className="input-group">
              <span className="input-group-text">
                <i className="bi bi-funnel"></i>
              </span>
              <select
                className="form-select"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                {uniqueCategories.map(cat => (
                  <option key={cat} value={cat}>
                    {cat === 'all' ? 'All Topics' : cat}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="card shadow-sm">
          <div className="card-body p-0">
            <div className="table-responsive">
              <table className="table table-hover mb-0">
                <thead className="table-light">
                  <tr>
                    <th style={{ width: '80px' }}>Image</th>
                    <th>Title</th>
                    <th>Author</th>
                    <th>Topic</th>
                    <th>Views</th>
                    <th>Likes</th>
                    <th>Featured</th>
                    <th style={{ width: '150px' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStories.length > 0 ? (
                    filteredStories.map(story => (
                      <tr key={story.id}>
                        <td>
                          <img
                            src={story.imageUrl || getPlaceholderImage(60, 60)}
                            alt={story.title}
                            className="img-thumbnail"
                            style={{ width: '60px', height: '60px', objectFit: 'cover' }}
                            onError={(e) => {
                              e.target.src = getPlaceholderImage(60, 60)
                            }}
                          />
                        </td>
                        <td>
                          <div className="fw-bold">{story.title}</div>
                          {story.description && (
                            <small className="text-muted d-block" style={{ maxWidth: '300px' }}>
                              {story.description.length > 50 
                                ? `${story.description.substring(0, 50)}...` 
                                : story.description}
                            </small>
                          )}
                        </td>
                        <td>{story.author}</td>
                        <td>
                          {story.category ? (
                            <span className="badge bg-primary">{story.category}</span>
                          ) : (
                            <span className="text-muted">-</span>
                          )}
                        </td>
                        <td>
                          <i className="bi bi-eye me-1"></i>
                          {story.views || 0}
                        </td>
                        <td>
                          <i className="bi bi-heart me-1"></i>
                          {story.likes || 0}
                        </td>
                        <td>
                          {story.isFeatured ? (
                            <span className="badge bg-warning text-dark">
                              <i className="bi bi-star-fill me-1"></i>
                              Yes
                            </span>
                          ) : (
                            <span className="badge bg-secondary">No</span>
                          )}
                        </td>
                        <td>
                          <div className="btn-group btn-group-sm" role="group">
                            <button
                              className="btn btn-outline-primary"
                              onClick={() => navigate(`/admin/stories/edit/${story.id}`)}
                              title="Edit"
                            >
                              <i className="bi bi-pencil"></i>
                            </button>
                            <button
                              className="btn btn-outline-danger"
                              onClick={() => handleDelete(story.id, story.title)}
                              title="Delete"
                            >
                              <i className="bi bi-trash"></i>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="8" className="text-center py-5 text-muted">
                        <i className="bi bi-inbox display-4 d-block mb-2"></i>
                        No guides found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="mt-3 text-muted small">
          Showing {filteredStories.length} of {stories.length} guides
        </div>
      </div>
    </div>
  )
}

export default StoriesList
