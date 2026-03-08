import React, { useEffect, useMemo, useState } from 'react'
import { productService, reviewService } from '../../../common/services'
import ConfirmModal from '../../../components/common/ConfirmModal'
import Pagination, { DEFAULT_PAGE_SIZE } from '../../../components/common/Pagination'
import './List.css'

const AdminReviewsList = () => {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [reviews, setReviews] = useState([])
  const [stats, setStats] = useState({ count: 0, average: 0 })
  const [loadingReviews, setLoadingReviews] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState({ open: false, id: null, username: '' })
  const [deleting, setDeleting] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE)

  useEffect(() => {
    loadProducts()
  }, [])

  const loadProducts = async () => {
    try {
      setLoading(true)
      const res = await productService.getAll()
      setProducts(res.data || [])
    } catch (err) {
      console.error('Failed to load products', err)
      if (window.showToast) {
        window.showToast({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load products',
          life: 4000
        })
      }
      setProducts([])
    } finally {
      setLoading(false)
    }
  }

  const loadReviewsForProduct = async (product) => {
    if (!product?.id) return
    setSelectedProduct(product)
    try {
      setLoadingReviews(true)
      const [listRes, statsRes] = await Promise.all([
        reviewService.getByProduct(product.id),
        reviewService.getProductStats(product.id)
      ])
      setReviews(listRes.data || [])
      setStats(statsRes.data || { count: 0, average: 0 })
    } catch (err) {
      console.error('Failed to load reviews', err)
      setReviews([])
      setStats({ count: 0, average: 0 })
      if (window.showToast) {
        window.showToast({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load reviews',
          life: 4000
        })
      }
    } finally {
      setLoadingReviews(false)
    }
  }

  const handleDeleteReview = async (id, username) => {
    try {
      setDeleting(true)
      await reviewService.delete(id)
      if (selectedProduct) {
        await loadReviewsForProduct(selectedProduct)
      }
      if (window.showToast) {
        window.showToast({
          severity: 'success',
          summary: 'Deleted',
          detail: 'Review has been deleted.',
          life: 3000
        })
      }
    } catch (err) {
      console.error('Failed to delete review', err)
      if (window.showToast) {
        window.showToast({
          severity: 'error',
          summary: 'Error',
          detail: err.response?.data?.message || 'Unable to delete review',
          life: 4000
        })
      }
    } finally {
      setDeleting(false)
      setConfirmDelete({ open: false, id: null, username: '' })
    }
  }

  const getPlaceholderImage = (w = 48, h = 48) =>
    `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='${w}' height='${h}'%3E%3Crect width='100%25' height='100%25' fill='%23eee'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-size='10' fill='%23999'%3EImg%3C/text%3E%3C/svg%3E`

  const totalProducts = products.length
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return products.slice(start, start + pageSize)
  }, [products, currentPage, pageSize])

  return (
    <div className="admin-reviews container my-4">
      <div className="mb-4">
        <h1 className="display-6 fw-bold mb-1">
          <i className="bi bi-star me-2"></i>
          Manage reviews
        </h1>
        <p className="text-muted mb-0">
          Select a product to view and manage its reviews.
        </p>
      </div>

      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body">
          <div className="table-responsive">
            <table className="table align-middle admin-reviews-table">
              <thead>
                <tr>
                  <th style={{ width: 60 }}>#</th>
                  <th>Product</th>
                  <th className="text-end" style={{ width: 140 }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={3} className="text-center py-4">
                      <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                      </div>
                    </td>
                  </tr>
                ) : totalProducts === 0 ? (
                  <tr>
                    <td colSpan={3} className="text-center py-4 text-muted">
                      No products yet.
                    </td>
                  </tr>
                ) : (
                  paginatedProducts.map((product, index) => (
                    <tr
                      key={product.id}
                      className={selectedProduct?.id === product.id ? 'table-active' : ''}
                    >
                      <td>{(currentPage - 1) * pageSize + index + 1}</td>
                      <td>
                        <div className="d-flex align-items-center">
                          <img
                            src={product.imageUrl || product.images?.[0] || getPlaceholderImage()}
                            alt={product.name}
                            className="admin-reviews-product-img me-3 rounded"
                          />
                          <div>
                            <div className="fw-semibold">{product.name}</div>
                            <div className="text-muted small">ID: {product.id}</div>
                          </div>
                        </div>
                      </td>
                      <td className="text-end">
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-primary"
                          onClick={() => loadReviewsForProduct(product)}
                        >
                          <i className="bi bi-star me-1"></i>
                          View reviews
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
</table>
            </div>
          </div>
        </div>

        <Pagination
          totalItems={totalProducts}
          currentPage={currentPage}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          onPageSizeChange={setPageSize}
          showPageSizeSelect
          label="products"
        />

      {selectedProduct && (
        <div className="card border-0 shadow-sm">
          <div className="card-header bg-light d-flex justify-content-between align-items-center">
            <h5 className="mb-0">
              <i className="bi bi-chat-quote me-2"></i>
              Reviews: {selectedProduct.name}
            </h5>
            <button
              type="button"
              className="btn btn-sm btn-outline-secondary"
              onClick={() => {
                setSelectedProduct(null)
                setReviews([])
                setStats({ count: 0, average: 0 })
              }}
            >
              Close
            </button>
          </div>
          <div className="card-body">
            {loadingReviews ? (
              <div className="text-center py-4">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              </div>
            ) : (
              <>
                <div className="admin-reviews-stats mb-4">
                  <span className="admin-reviews-stars" title={`${stats.average} / 5`}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <i
                        key={star}
                        className={`bi ${star <= stats.average ? 'bi-star-fill' : 'bi-star'}`}
                      />
                    ))}
                  </span>
                  <span className="text-muted ms-2">
                    {stats.count} reviews · Average {stats.average}/5
                  </span>
                </div>
                {reviews.length === 0 ? (
                  <p className="text-muted mb-0">No reviews for this product yet.</p>
                ) : (
                  <div className="admin-reviews-list">
                    {reviews.map((r) => (
                      <div key={r.id} className="admin-review-item">
                        <div className="d-flex justify-content-between align-items-start flex-wrap gap-2">
                          <div>
                            <span className="fw-semibold">{r.username || 'User'}</span>
                            <span className="admin-review-item-stars ms-2">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <i
                                  key={star}
                                  className={`bi ${star <= r.rating ? 'bi-star-fill' : 'bi-star'}`}
                                />
                              ))}
                            </span>
                            <span className="text-muted small ms-2">
                              {r.createdAt
                                ? new Date(r.createdAt).toLocaleString('en-US', {
                                    day: '2-digit',
                                    month: '2-digit',
                                    year: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })
                                : ''}
                            </span>
                          </div>
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => setConfirmDelete({ open: true, id: r.id, username: r.username || 'User' })}
                          >
                            <i className="bi bi-trash"></i> Delete
                          </button>
                        </div>
                        {r.comment && (
                          <p className="admin-review-comment mb-0 mt-2">{r.comment}</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}

      <ConfirmModal
        open={confirmDelete.open}
        title="Delete review"
        message={`Are you sure you want to delete the review by "${confirmDelete.username}"?`}
        confirmText="Delete"
        variant="danger"
        onConfirm={() => handleDeleteReview(confirmDelete.id, confirmDelete.username)}
        onCancel={() => setConfirmDelete({ open: false, id: null, username: '' })}
        loading={deleting}
      />
    </div>
  )
}

export default AdminReviewsList
