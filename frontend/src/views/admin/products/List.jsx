import React, { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { productService } from '../../../common/services'
import { ROUTES } from '../../../common/constants'
import ConfirmModal from '../../../components/common/ConfirmModal'
import './List.css'

const ProductsList = () => {
  const navigate = useNavigate()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [confirm, setConfirm] = useState({ open: false, id: null, name: '' })
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    loadProducts()
  }, [])

  const loadProducts = async () => {
    try {
      setLoading(true)
      const response = await productService.getAll()
      setProducts(response.data || [])
    } catch (error) {
      console.error('Error loading products:', error)
      if (window.showToast) {
        window.showToast({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load products',
          life: 4000
        })
      }
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id, name) => {
    try {
      setIsDeleting(true)
      await productService.delete(id)
      if (window.showToast) {
        window.showToast({
          severity: 'success',
          summary: 'Success',
          detail: 'Product deleted successfully',
          life: 3000
        })
      }
      loadProducts()
    } catch (error) {
      console.error('Error deleting product:', error)
      if (window.showToast) {
        window.showToast({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to delete product',
          life: 4000
        })
      }
    } finally {
      setIsDeleting(false)
      setConfirm({ open: false, id: null, name: '' })
    }
  }

  const getPlaceholderImage = (w = 80, h = 80) =>
    `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='${w}' height='${h}'%3E%3Crect width='100%25' height='100%25' fill='%23eee'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-size='10' fill='%23999'%3EImage%3C/text%3E%3C/svg%3E`

  const formatCurrency = (value) => {
    const amount = Number(value || 0)
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(amount)
  }

  const filteredProducts = useMemo(() => {
    if (!searchTerm) return products
    const s = searchTerm.toLowerCase()
    return products.filter((p) => {
      const name = (p.name || '').toLowerCase()
      const style = (p.styleCode || '').toLowerCase()
      const type = (p.productType || '').toLowerCase()
      const brand = (p.brand || '').toLowerCase()
      const category = (p.category?.name || '').toLowerCase()
      return (
        name.includes(s) ||
        style.includes(s) ||
        type.includes(s) ||
        brand.includes(s) ||
        category.includes(s)
      )
    })
  }, [products, searchTerm])

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
    <div className="admin-products-list">
      <ConfirmModal
        open={confirm.open}
        title="Delete product"
        message={`Are you sure you want to delete product "${confirm.name}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        confirmVariant="danger"
        loading={isDeleting}
        onCancel={() => setConfirm({ open: false, id: null, name: '' })}
        onConfirm={() => handleDelete(confirm.id, confirm.name)}
      />
      <div className="container my-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h1 className="display-6 fw-bold mb-2">
              <i className="bi bi-gem me-2"></i>
              Manage Products
            </h1>
            <p className="text-muted">Create, edit, and organize your catalog</p>
          </div>
          <Link to={ROUTES.ADMIN_PRODUCTS_CREATE} className="btn btn-primary">
            <i className="bi bi-plus-circle me-2"></i>
            Create Product
          </Link>
        </div>

        <div className="row mb-4">
          <div className="col-md-6">
            <div className="input-group">
              <span className="input-group-text">
                <i className="bi bi-search"></i>
              </span>
              <input
                type="text"
                className="form-control"
                placeholder="Search by name, style code, type, brand, category..."
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
                    <th style={{ width: '110px' }}>Image</th>
                    <th>Name</th>
                    <th>Style</th>
                    <th>Type</th>
                    <th>Brand</th>
                    <th>Category</th>
                    <th className="text-end">MRP</th>
                    <th>Featured</th>
                    <th style={{ width: '150px' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.length > 0 ? (
                    filteredProducts.map((p) => (
                      <tr key={p.id}>
                        <td>
                          <img
                            src={p.imageUrl || getPlaceholderImage(96, 96)}
                            alt={p.name}
                            className="img-thumbnail"
                            style={{ width: '96px', height: '96px', objectFit: 'cover' }}
                            onError={(e) => { e.target.src = getPlaceholderImage(96, 96) }}
                          />
                        </td>
                        <td>
                          <div className="fw-bold">{p.name}</div>
                          <div className="text-muted small">
                            ID: {p.id}
                          </div>
                        </td>
                        <td>{p.styleCode || <span className="text-muted">-</span>}</td>
                        <td>{p.productType || <span className="text-muted">-</span>}</td>
                        <td>{p.brand || <span className="text-muted">-</span>}</td>
                        <td>{p.category?.name || (p.categoryId ? `Category ${p.categoryId}` : <span className="text-muted">-</span>)}</td>
                        <td className="text-end">{formatCurrency(p.mrp)}</td>
                        <td>
                          {p.isFeatured ? (
                            <span className="badge bg-warning text-dark">Yes</span>
                          ) : (
                            <span className="badge bg-secondary">No</span>
                          )}
                        </td>
                        <td>
                          <div className="btn-group btn-group-sm" role="group">
                            <button
                              className="btn btn-outline-primary"
                              onClick={() => navigate(`${ROUTES.ADMIN_PRODUCTS_EDIT}/${p.id}`)}
                              title="Edit"
                            >
                              <i className="bi bi-pencil"></i>
                            </button>
                            <button
                              className="btn btn-outline-danger"
                              onClick={() => setConfirm({ open: true, id: p.id, name: p.name })}
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
                      <td colSpan="9" className="text-center py-5 text-muted">
                        <i className="bi bi-inbox display-4 d-block mb-2"></i>
                        No products found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="mt-3 text-muted small">
          Showing {filteredProducts.length} of {products.length} products
        </div>
      </div>
    </div>
  )
}

export default ProductsList

