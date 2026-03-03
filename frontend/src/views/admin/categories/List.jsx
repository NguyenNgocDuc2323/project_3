import React, { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { categoryService } from '../../../common/services'
import ConfirmModal from '../../../components/common/ConfirmModal'
import Pagination, { DEFAULT_PAGE_SIZE } from '../../../components/common/Pagination'
import './List.css'

const CategoriesList = () => {
  const navigate = useNavigate()
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [confirm, setConfirm] = useState({ open: false, id: null, name: '' })
  const [isDeleting, setIsDeleting] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE)

  useEffect(() => {
    loadCategories()
  }, [])

  const loadCategories = async () => {
    try {
      setLoading(true)
      const response = await categoryService.getAll()
      setCategories(response.data || [])
    } catch (error) {
      console.error('Error loading categories:', error)
      if (window.showToast) {
        window.showToast({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load categories',
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
      await categoryService.delete(id)
      if (window.showToast) {
        window.showToast({
          severity: 'success',
          summary: 'Success',
          detail: 'Category deleted successfully',
          life: 3000
        })
      }
      loadCategories()
    } catch (error) {
      console.error('Error deleting category:', error)
      if (window.showToast) {
        window.showToast({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to delete category',
          life: 4000
        })
      }
    } finally {
      setIsDeleting(false)
      setConfirm({ open: false, id: null, name: '' })
    }
  }

  const filteredCategories = useMemo(() => categories.filter(category => {
    if (!searchTerm) return true
    const search = searchTerm.toLowerCase()
    return (
      category.name?.toLowerCase().includes(search) ||
      category.description?.toLowerCase().includes(search)
    )
  }), [categories, searchTerm])

  const totalFiltered = filteredCategories.length
  const paginatedCategories = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return filteredCategories.slice(start, start + pageSize)
  }, [filteredCategories, currentPage, pageSize])

  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm])

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
    <div className="admin-categories-list">
      <ConfirmModal
        open={confirm.open}
        title="Delete category"
        message={`Are you sure you want to delete category "${confirm.name}"? This action cannot be undone.`}
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
              <i className="bi bi-tags me-2"></i>
              Manage Categories
            </h1>
            <p className="text-muted">Organize jewelry categories</p>
          </div>
          <button
            className="btn btn-primary"
            onClick={() => navigate('/admin/categories/create')}
          >
            <i className="bi bi-plus-circle me-2"></i>
            Create New Category
          </button>
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
                placeholder="Search categories..."
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
                    <th>ID</th>
                    <th>Name</th>
                    <th>Description</th>
                    <th>Created At</th>
                    <th style={{ width: '150px' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCategories.length > 0 ? (
                    filteredCategories.map(category => (
                      <tr key={category.id}>
                        <td>{category.id}</td>
                        <td>
                          <div className="fw-bold">
                        <i className="bi bi-tag-fill text-primary me-2"></i>
                            {category.name}
                          </div>
                        </td>
                        <td>
                          {category.description || (
                            <span className="text-muted">-</span>
                          )}
                        </td>
                        <td>
                          {category.createdAt ? (
                            new Date(category.createdAt).toLocaleDateString()
                          ) : (
                            <span className="text-muted">-</span>
                          )}
                        </td>
                        <td>
                          <div className="btn-group btn-group-sm" role="group">
                            <button
                              className="btn btn-outline-primary"
                              onClick={() => navigate(`/admin/categories/edit/${category.id}`)}
                              title="Edit"
                            >
                              <i className="bi bi-pencil"></i>
                            </button>
                            <button
                              className="btn btn-outline-danger"
                              onClick={() => setConfirm({ open: true, id: category.id, name: category.name })}
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
                      <td colSpan="5" className="text-center py-5 text-muted">
                        <i className="bi bi-inbox display-4 d-block mb-2"></i>
                        No categories found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <Pagination
          totalItems={totalFiltered}
          currentPage={currentPage}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          onPageSizeChange={setPageSize}
          showPageSizeSelect
          label="categories"
        />
      </div>
    </div>
  )
}

export default CategoriesList
