import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { bannerService } from '../../../common/services'
import { ROUTES } from '../../../common/constants'
import ConfirmModal from '../../../components/common/ConfirmModal'
import './List.css'

const BannersList = () => {
  const navigate = useNavigate()
  const [banners, setBanners] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [confirm, setConfirm] = useState({ open: false, id: null, title: '' })
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    loadBanners()
  }, [])

  const loadBanners = async () => {
    try {
      setLoading(true)
      const response = await bannerService.getAll(false)
      setBanners(response.data || [])
    } catch (error) {
      console.error('Error loading banners:', error)
      if (window.showToast) {
        window.showToast({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load banners',
          life: 4000
        })
      }
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id, title) => {
    try {
      setIsDeleting(true)
      await bannerService.delete(id)
      if (window.showToast) {
        window.showToast({
          severity: 'success',
          summary: 'Success',
          detail: 'Banner deleted successfully',
          life: 3000
        })
      }
      loadBanners()
    } catch (error) {
      console.error('Error deleting banner:', error)
      if (window.showToast) {
        window.showToast({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to delete banner',
          life: 4000
        })
      }
    } finally {
      setIsDeleting(false)
      setConfirm({ open: false, id: null, title: '' })
    }
  }

  const getPlaceholderImage = (w = 80, h = 45) =>
    `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='${w}' height='${h}'%3E%3Crect width='100%25' height='100%25' fill='%23eee'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-size='10' fill='%23999'%3EImage%3C/text%3E%3C/svg%3E`

  const filteredBanners = banners.filter(b => {
    if (!searchTerm) return true
    const s = searchTerm.toLowerCase()
    return (
      (b.title && b.title.toLowerCase().includes(s)) ||
      (b.link && b.link.toLowerCase().includes(s))
    )
  })

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
    <div className="admin-banners-list">
      <ConfirmModal
        open={confirm.open}
        title="Delete banner"
        message={`Are you sure you want to delete banner "${confirm.title}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        confirmVariant="danger"
        loading={isDeleting}
        onCancel={() => setConfirm({ open: false, id: null, title: '' })}
        onConfirm={() => handleDelete(confirm.id, confirm.title)}
      />
      <div className="container my-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h1 className="display-6 fw-bold mb-2">
              <i className="bi bi-image me-2"></i>
              Manage Banners
            </h1>
            <p className="text-muted">Banners displayed on the homepage (hero carousel)</p>
          </div>
          <Link to={ROUTES.ADMIN_BANNERS_CREATE} className="btn btn-primary">
            <i className="bi bi-plus-circle me-2"></i>
            Add Banner
          </Link>
        </div>

        <div className="row mb-4">
          <div className="col-md-6">
            <div className="input-group">
              <span className="input-group-text"><i className="bi bi-search"></i></span>
              <input
                type="text"
                className="form-control"
                placeholder="Search by title or link..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="card shadow-sm">
          <div className="card-body p-0">
            <div className="table-responsive">
              <table className="table table-hover mb-0">
                <thead className="table-light">
                  <tr>
                    <th style={{ width: '120px' }}>Image</th>
                    <th>Title</th>
                    <th>Link</th>
                    <th>Order</th>
                    <th>Status</th>
                    <th style={{ width: '140px' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBanners.length > 0 ? (
                    filteredBanners.map(banner => (
                      <tr key={banner.id}>
                        <td>
                          <img
                            src={banner.imageUrl || getPlaceholderImage(120, 68)}
                            alt={banner.title}
                            className="img-thumbnail"
                            style={{ width: '120px', height: '68px', objectFit: 'cover' }}
                            onError={(e) => { e.target.src = getPlaceholderImage(120, 68) }}
                          />
                        </td>
                        <td>
                          <div className="fw-bold">{banner.title}</div>
                        </td>
                        <td>
                          {banner.link ? (
                            <a href={banner.link} target="_blank" rel="noopener noreferrer" className="text-truncate d-inline-block" style={{ maxWidth: '200px' }}>
                              {banner.link}
                            </a>
                          ) : (
                            <span className="text-muted">-</span>
                          )}
                        </td>
                        <td>{banner.sortOrder ?? 0}</td>
                        <td>
                          {banner.isActive ? (
                            <span className="badge bg-success">Active</span>
                          ) : (
                            <span className="badge bg-secondary">Hidden</span>
                          )}
                        </td>
                        <td>
                          <div className="btn-group btn-group-sm">
                            <button
                              className="btn btn-outline-primary"
                              onClick={() => navigate(ROUTES.ADMIN_BANNERS_EDIT + '/' + banner.id)}
                              title="Edit"
                            >
                              <i className="bi bi-pencil"></i>
                            </button>
                            <button
                              className="btn btn-outline-danger"
                              onClick={() => setConfirm({ open: true, id: banner.id, title: banner.title })}
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
                      <td colSpan="6" className="text-center py-5 text-muted">
                        <i className="bi bi-image display-4 d-block mb-2"></i>
                        No banners yet
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="mt-3 text-muted small">
          Showing {filteredBanners.length} of {banners.length} banners
        </div>
      </div>
    </div>
  )
}

export default BannersList
