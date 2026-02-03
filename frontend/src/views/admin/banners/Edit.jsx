import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { bannerService } from '../../../common/services'
import { ROUTES } from '../../../common/constants'

const BannersEdit = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [form, setForm] = useState({
    title: '',
    imageUrl: '',
    link: '',
    sortOrder: 0,
    isActive: true
  })
  const [loading, setLoading] = useState(false)
  const [loadingData, setLoadingData] = useState(true)
  const [errors, setErrors] = useState({})

  useEffect(() => {
    loadBanner()
  }, [id])

  const loadBanner = async () => {
    try {
      setLoadingData(true)
      const response = await bannerService.getById(id)
      const b = response.data
      setForm({
        title: b.title || '',
        imageUrl: b.imageUrl || '',
        link: b.link || '',
        sortOrder: b.sortOrder ?? 0,
        isActive: b.isActive !== false
      })
    } catch (error) {
      console.error('Error loading banner:', error)
      if (window.showToast) {
        window.showToast({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load banner',
          life: 4000
        })
      }
      navigate(ROUTES.ADMIN_BANNERS_LIST)
    } finally {
      setLoadingData(false)
    }
  }

  const validateForm = () => {
    const newErrors = {}
    if (!form.title.trim()) newErrors.title = 'Title is required'
    if (!form.imageUrl.trim()) newErrors.imageUrl = 'Image URL is required'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validateForm()) return
    setLoading(true)
    setErrors({})
    try {
      await bannerService.update(id, {
        id: parseInt(id, 10),
        ...form,
        sortOrder: parseInt(form.sortOrder, 10) || 0
      })
      if (window.showToast) {
        window.showToast({
          severity: 'success',
          summary: 'Success',
          detail: 'Banner updated successfully',
          life: 3000
        })
      }
      navigate(ROUTES.ADMIN_BANNERS_LIST)
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to update banner'
      setErrors({ general: msg })
      if (window.showToast) {
        window.showToast({ severity: 'error', summary: 'Error', detail: msg, life: 4000 })
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
                Edit Banner
              </h1>
              <button
                className="btn btn-outline-secondary"
                onClick={() => navigate(ROUTES.ADMIN_BANNERS_LIST)}
              >
                <i className="bi bi-arrow-left me-2"></i>
                Back to List
              </button>
            </div>

            <div className="card shadow-sm">
              <div className="card-body p-4">
                {errors.general && (
                  <div className="alert alert-danger" role="alert">{errors.general}</div>
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
                      placeholder="e.g. Seasonal promotion"
                    />
                    {errors.title && <div className="invalid-feedback">{errors.title}</div>}
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
                      placeholder="https://example.com/banner.jpg"
                    />
                    {errors.imageUrl && <div className="invalid-feedback">{errors.imageUrl}</div>}
                    {form.imageUrl && (
                      <div className="mt-2">
                        <img
                          src={form.imageUrl}
                          alt="Preview"
                          className="img-thumbnail"
                          style={{ maxHeight: '200px' }}
                          onError={(e) => { e.target.style.display = 'none' }}
                        />
                      </div>
                    )}
                  </div>

                  <div className="mb-3">
                    <label htmlFor="link" className="form-label">Link (optional)</label>
                    <input
                      type="url"
                      className="form-control"
                      id="link"
                      name="link"
                      value={form.link}
                      onChange={handleChange}
                      placeholder="https://..."
                    />
                  </div>

                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label htmlFor="sortOrder" className="form-label">Display order</label>
                      <input
                        type="number"
                        className="form-control"
                        id="sortOrder"
                        name="sortOrder"
                        value={form.sortOrder}
                        onChange={handleChange}
                        min="0"
                      />
                    </div>
                    <div className="col-md-6 mb-3 d-flex align-items-end">
                      <div className="form-check">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id="isActive"
                          name="isActive"
                          checked={form.isActive}
                          onChange={handleChange}
                        />
                        <label className="form-check-label" htmlFor="isActive">
                          Show on homepage
                        </label>
                      </div>
                    </div>
                  </div>

                  <div className="d-flex gap-2 justify-content-end mt-4">
                    <button
                      type="button"
                      className="btn btn-outline-secondary"
                      onClick={() => navigate(ROUTES.ADMIN_BANNERS_LIST)}
                    >
                      Cancel
                    </button>
                    <button type="submit" className="btn btn-primary" disabled={loading}>
                      {loading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                          Saving...
                        </>
                      ) : (
                        <>
                          <i className="bi bi-check-circle me-2"></i>
                          Update
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

export default BannersEdit
