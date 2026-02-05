import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { categoryService, productService } from '../../../common/services'
import { ROUTES } from '../../../common/constants'

const ProductsEdit = () => {
  const { id } = useParams()
  const navigate = useNavigate()

  const [categories, setCategories] = useState([])
  const [loadingData, setLoadingData] = useState(true)
  const [loading, setLoading] = useState(false)

  const [form, setForm] = useState({
    name: '',
    styleCode: '',
    productType: '',
    brand: '',
    goldCarat: '',
    mrp: '',
    originalPrice: '',
    imageUrl: '',
    categoryId: '',
    isFeatured: false
  })

  const [errors, setErrors] = useState({})

  useEffect(() => {
    const loadAll = async () => {
      try {
        setLoadingData(true)

        const [categoriesRes, productsRes] = await Promise.all([
          categoryService.getAll(),
          // Use list endpoint to avoid incrementing views (GET /products/{id} increases views)
          productService.getAll()
        ])

        const cats = categoriesRes.data || []
        setCategories(cats)

        const products = productsRes.data || []
        const p = products.find((item) => item.id === parseInt(id, 10))
        if (!p) {
          throw new Error('Product not found')
        }

        setForm({
          name: p.name || '',
          styleCode: p.styleCode || '',
          productType: p.productType || '',
          brand: p.brand || '',
          goldCarat: p.goldCarat || '',
          mrp: p.mrp ?? '',
          originalPrice: p.originalPrice ?? '',
          imageUrl: p.imageUrl || '',
          categoryId: p.categoryId ? p.categoryId.toString() : '',
          isFeatured: !!p.isFeatured
        })
      } catch (error) {
        console.error('Error loading product:', error)
        if (window.showToast) {
          window.showToast({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to load product',
            life: 4000
          })
        }
        navigate(ROUTES.ADMIN_PRODUCTS_LIST)
      } finally {
        setLoadingData(false)
      }
    }

    loadAll()
  }, [id, navigate])

  const validateForm = () => {
    const newErrors = {}

    if (!form.name.trim()) newErrors.name = 'Product name is required'
    if (!form.styleCode.trim()) newErrors.styleCode = 'Style code is required'
    if (!form.productType.trim()) newErrors.productType = 'Product type is required'
    if (!form.brand.trim()) newErrors.brand = 'Brand is required'
    if (!form.goldCarat.trim()) newErrors.goldCarat = 'Gold carat is required'
    if (!form.imageUrl.trim()) newErrors.imageUrl = 'Image URL is required'

    const mrpValue = Number(form.mrp)
    if (form.mrp !== '' && (Number.isNaN(mrpValue) || mrpValue < 0)) {
      newErrors.mrp = 'MRP must be a valid non-negative number'
    }
    const originalValue = Number(form.originalPrice)
    if (form.originalPrice !== '' && (Number.isNaN(originalValue) || originalValue < 0)) {
      newErrors.originalPrice = 'Original price must be a valid non-negative number'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const extractApiError = (error, fallback = 'Failed to update product') => {
    if (!error?.response?.data) return fallback
    const data = error.response.data
    if (typeof data === 'string') return data
    if (data.message) return data.message
    if (data.title && data.errors) {
      const list = Object.values(data.errors).flat().join(', ')
      return list || fallback
    }
    return fallback
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validateForm()) return

    setLoading(true)
    setErrors({})
    try {
      const payload = {
        id: parseInt(id, 10),
        name: form.name.trim(),
        styleCode: form.styleCode.trim(),
        productType: form.productType.trim(),
        brand: form.brand.trim(),
        goldCarat: form.goldCarat.trim(),
        mrp: form.mrp === '' ? 0 : Number(form.mrp),
        originalPrice: form.originalPrice === '' ? 0 : Number(form.originalPrice),
        imageUrl: form.imageUrl.trim(),
        categoryId: form.categoryId ? parseInt(form.categoryId, 10) : null,
        isFeatured: !!form.isFeatured
      }

      await productService.update(id, payload)
      if (window.showToast) {
        window.showToast({
          severity: 'success',
          summary: 'Success',
          detail: 'Product updated successfully',
          life: 3000
        })
      }
      navigate(ROUTES.ADMIN_PRODUCTS_LIST)
    } catch (error) {
      console.error('Product update error:', error)
      const msg = extractApiError(error)
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
    setForm((prev) => ({
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
          <div className="col-lg-10">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h1 className="display-6 fw-bold">
                <i className="bi bi-pencil me-2"></i>
                Edit Product
              </h1>
              <button
                className="btn btn-outline-secondary"
                onClick={() => navigate(ROUTES.ADMIN_PRODUCTS_LIST)}
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
                  <div className="row">
                    <div className="col-md-8 mb-3">
                      <label htmlFor="name" className="form-label">
                        Product Name <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        className={`form-control ${errors.name ? 'is-invalid' : ''}`}
                        id="name"
                        name="name"
                        value={form.name}
                        onChange={handleChange}
                      />
                      {errors.name && <div className="invalid-feedback">{errors.name}</div>}
                    </div>

                    <div className="col-md-4 mb-3">
                      <label htmlFor="styleCode" className="form-label">
                        Style Code <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        className={`form-control ${errors.styleCode ? 'is-invalid' : ''}`}
                        id="styleCode"
                        name="styleCode"
                        value={form.styleCode}
                        onChange={handleChange}
                      />
                      {errors.styleCode && <div className="invalid-feedback">{errors.styleCode}</div>}
                    </div>
                  </div>

                  <div className="row">
                    <div className="col-md-4 mb-3">
                      <label htmlFor="productType" className="form-label">
                        Product Type <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        className={`form-control ${errors.productType ? 'is-invalid' : ''}`}
                        id="productType"
                        name="productType"
                        value={form.productType}
                        onChange={handleChange}
                      />
                      {errors.productType && <div className="invalid-feedback">{errors.productType}</div>}
                    </div>

                    <div className="col-md-4 mb-3">
                      <label htmlFor="brand" className="form-label">
                        Brand <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        className={`form-control ${errors.brand ? 'is-invalid' : ''}`}
                        id="brand"
                        name="brand"
                        value={form.brand}
                        onChange={handleChange}
                      />
                      {errors.brand && <div className="invalid-feedback">{errors.brand}</div>}
                    </div>

                    <div className="col-md-4 mb-3">
                      <label htmlFor="goldCarat" className="form-label">
                        Gold Carat <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        className={`form-control ${errors.goldCarat ? 'is-invalid' : ''}`}
                        id="goldCarat"
                        name="goldCarat"
                        value={form.goldCarat}
                        onChange={handleChange}
                      />
                      {errors.goldCarat && <div className="invalid-feedback">{errors.goldCarat}</div>}
                    </div>
                  </div>

                  <div className="row">
                    <div className="col-md-4 mb-3">
                      <label htmlFor="mrp" className="form-label">MRP</label>
                      <input
                        type="number"
                        className={`form-control ${errors.mrp ? 'is-invalid' : ''}`}
                        id="mrp"
                        name="mrp"
                        value={form.mrp}
                        onChange={handleChange}
                        min="0"
                        step="0.01"
                      />
                      {errors.mrp && <div className="invalid-feedback">{errors.mrp}</div>}
                    </div>

                    <div className="col-md-4 mb-3">
                      <label htmlFor="originalPrice" className="form-label">Original Price</label>
                      <input
                        type="number"
                        className={`form-control ${errors.originalPrice ? 'is-invalid' : ''}`}
                        id="originalPrice"
                        name="originalPrice"
                        value={form.originalPrice}
                        onChange={handleChange}
                        min="0"
                        step="0.01"
                      />
                      {errors.originalPrice && <div className="invalid-feedback">{errors.originalPrice}</div>}
                    </div>

                    <div className="col-md-4 mb-3">
                      <label htmlFor="categoryId" className="form-label">Category</label>
                      <select
                        className="form-select"
                        id="categoryId"
                        name="categoryId"
                        value={form.categoryId}
                        onChange={handleChange}
                      >
                        <option value="">No category</option>
                        {categories.map((c) => (
                          <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="mb-3">
                    <label htmlFor="imageUrl" className="form-label">
                      Main Image URL <span className="text-danger">*</span>
                    </label>
                    <input
                      type="url"
                      className={`form-control ${errors.imageUrl ? 'is-invalid' : ''}`}
                      id="imageUrl"
                      name="imageUrl"
                      value={form.imageUrl}
                      onChange={handleChange}
                    />
                    {errors.imageUrl && <div className="invalid-feedback">{errors.imageUrl}</div>}
                    {form.imageUrl && (
                      <div className="mt-2">
                        <img
                          src={form.imageUrl}
                          alt="Preview"
                          className="img-thumbnail"
                          style={{ maxHeight: '220px' }}
                          onError={(e) => { e.target.style.display = 'none' }}
                        />
                      </div>
                    )}
                  </div>

                  <div className="mb-3">
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
                        Featured product
                      </label>
                    </div>
                  </div>

                  <div className="d-flex gap-2 justify-content-end mt-4">
                    <button
                      type="button"
                      className="btn btn-outline-secondary"
                      onClick={() => navigate(ROUTES.ADMIN_PRODUCTS_LIST)}
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
                          Update Product
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

export default ProductsEdit

