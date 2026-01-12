import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { storyService } from '../../../common/services'

const StoriesEdit = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [form, setForm] = useState({
    title: '',
    author: '',
    description: '',
    imageUrl: '',
    category: '',
    isFeatured: false
  })
  const [loading, setLoading] = useState(false)
  const [loadingData, setLoadingData] = useState(true)
  const [errors, setErrors] = useState({})

  useEffect(() => {
    loadStory()
  }, [id])

  const loadStory = async () => {
    try {
      setLoadingData(true)
      const response = await storyService.getById(id)
      const story = response.data
      setForm({
        title: story.title || '',
        author: story.author || '',
        description: story.description || '',
        imageUrl: story.imageUrl || '',
        category: story.category || '',
        isFeatured: story.isFeatured || false
      })
    } catch (error) {
      console.error('Error loading story:', error)
      if (window.showToast) {
        window.showToast({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load story',
          life: 4000
        })
      }
      navigate('/admin/stories/list')
    } finally {
      setLoadingData(false)
    }
  }

  const validateForm = () => {
    const newErrors = {}

    if (!form.title.trim()) {
      newErrors.title = 'Title is required'
    }

    if (!form.author.trim()) {
      newErrors.author = 'Author is required'
    }

    if (!form.imageUrl.trim()) {
      newErrors.imageUrl = 'Image URL is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setLoading(true)
    setErrors({})

    try {
      await storyService.update(id, { ...form, id: parseInt(id) })
      if (window.showToast) {
        window.showToast({
          severity: 'success',
          summary: 'Success',
          detail: 'Story updated successfully',
          life: 3000
        })
      }
      navigate('/admin/stories/list')
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to update story'
      setErrors({ general: errorMessage })
      if (window.showToast) {
        window.showToast({
          severity: 'error',
          summary: 'Error',
          detail: errorMessage,
          life: 4000
        })
      }
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  if (loadingData) {
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
    <div className="admin-form-container">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-lg-8">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h1 className="display-6 fw-bold">
              <i className="bi bi-pencil me-2"></i>
              Edit Story
            </h1>
            <button
              className="btn btn-outline-secondary"
              onClick={() => navigate('/admin/stories/list')}
            >
              <i className="bi bi-arrow-left me-2"></i>
              Back to List
            </button>
          </div>

          <div className="card shadow-sm">
            <div className="card-body p-4">
              {errors.general && (
                <div className="alert alert-danger" role="alert">
                  {errors.general}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label htmlFor="title" className="form-label">
                    Title <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    className={`form-control ${errors.title ? 'is-invalid' : ''}`}
                    id="title"
                    name="title"
                    value={form.title}
                    onChange={handleChange}
                    placeholder="Enter story title"
                  />
                  {errors.title && (
                    <div className="invalid-feedback">{errors.title}</div>
                  )}
                </div>

                <div className="mb-3">
                  <label htmlFor="author" className="form-label">
                    Author <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    className={`form-control ${errors.author ? 'is-invalid' : ''}`}
                    id="author"
                    name="author"
                    value={form.author}
                    onChange={handleChange}
                    placeholder="Enter author name"
                  />
                  {errors.author && (
                    <div className="invalid-feedback">{errors.author}</div>
                  )}
                </div>

                <div className="mb-3">
                  <label htmlFor="description" className="form-label">
                    Description
                  </label>
                  <textarea
                    className="form-control"
                    id="description"
                    name="description"
                    rows="4"
                    value={form.description}
                    onChange={handleChange}
                    placeholder="Enter story description"
                  />
                </div>

                <div className="mb-3">
                  <label htmlFor="imageUrl" className="form-label">
                    Image URL <span className="text-danger">*</span>
                  </label>
                  <input
                    type="url"
                    className={`form-control ${errors.imageUrl ? 'is-invalid' : ''}`}
                    id="imageUrl"
                    name="imageUrl"
                    value={form.imageUrl}
                    onChange={handleChange}
                    placeholder="https://example.com/image.jpg"
                  />
                  {errors.imageUrl && (
                    <div className="invalid-feedback">{errors.imageUrl}</div>
                  )}
                  {form.imageUrl && (
                    <div className="mt-2">
                      <img
                        src={form.imageUrl}
                        alt="Preview"
                        className="img-thumbnail"
                        style={{ maxHeight: '200px' }}
                        onError={(e) => {
                          e.target.style.display = 'none'
                        }}
                      />
                    </div>
                  )}
                </div>

                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label htmlFor="category" className="form-label">
                      Category
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="category"
                      name="category"
                      value={form.category}
                      onChange={handleChange}
                      placeholder="e.g., Fiction, Adventure"
                    />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label d-block">Options</label>
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="isFeatured"
                        name="isFeatured"
                        checked={form.isFeatured}
                        onChange={handleChange}
                      />
                      <label className="form-check-label" htmlFor="isFeatured">
                        <i className="bi bi-star-fill text-warning me-1"></i>
                        Featured Story
                      </label>
                    </div>
                  </div>
                </div>

                <div className="d-flex gap-2 justify-content-end mt-4">
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={() => navigate('/admin/stories/list')}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                        Updating...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-check-circle me-2"></i>
                        Update Story
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
        </div>
      </div>
    </div>
  )
}

export default StoriesEdit
