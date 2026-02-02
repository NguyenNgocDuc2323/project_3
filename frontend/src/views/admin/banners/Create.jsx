import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { bannerService } from '../../../common/services'
import { ROUTES } from '../../../common/constants'

const BannersCreate = () => {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    title: '',
    imageUrl: '',
    link: '',
    sortOrder: 0,
    isActive: true
  })
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})

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
      const payload = {
        title: form.title.trim(),
        imageUrl: form.imageUrl.trim(),
        link: form.link?.trim() || null,
        sortOrder: parseInt(form.sortOrder, 10) || 0,
        isActive: form.isActive
      }
      await bannerService.create(payload)
      if (window.showToast) {
        window.showToast({
          severity: 'success',
          summary: 'Success',
          detail: 'Banner created successfully',
          life: 3000
        })
      }
      navigate(ROUTES.ADMIN_BANNERS_LIST)
    } catch (error) {
      console.error('Banner creation error:', error)
      let msg = 'Failed to create banner'
      if (error.response?.data) {
        if (error.response.data.message) {
          msg = error.response.data.message
        } else if (error.response.data.errors) {
          const errorList = Object.values(error.response.data.errors).flat().join(', ')
          msg = errorList || msg
        }
      }
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

  return (
    <div className="admin-form-container">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-lg-8">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h1 className="display-6 fw-bold">
                <i className="bi bi-plus-circle me-2"></i>
                Add Banner
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
                          Add Banner
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

export default BannersCreate
