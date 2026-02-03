import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { categoryService } from '../../common/services'

const CategoryManagement = () => {
  const navigate = useNavigate()
  const [stats, setStats] = useState({
    total: 0,
    recent: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    try {
      setLoading(true)
      const response = await categoryService.getAll()
      const categories = response.data || []
      const total = categories.length
      const recent = categories.filter(cat => {
        const createdAt = new Date(cat.createdAt)
        const weekAgo = new Date()
        weekAgo.setDate(weekAgo.getDate() - 7)
        return createdAt >= weekAgo
      }).length

      setStats({ total, recent })
    } catch (error) {
      console.error('Error loading category stats:', error)
    } finally {
      setLoading(false)
    }
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
    <div className="admin-category-management">
      <div className="container my-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h1 className="display-6 fw-bold mb-2">
              <i className="bi bi-tags me-2"></i>
              Quản lý Danh mục
            </h1>
            <p className="text-muted">Quản lý các danh mục sản phẩm trang sức</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="row mb-4">
          <div className="col-md-6">
            <div className="card shadow-sm border-primary">
              <div className="card-body text-center">
                <i className="bi bi-tags display-4 text-primary mb-3"></i>
                <h3 className="card-title">{stats.total}</h3>
                <p className="card-text text-muted">Tổng số danh mục</p>
              </div>
            </div>
          </div>
          <div className="col-md-6">
            <div className="card shadow-sm border-success">
              <div className="card-body text-center">
                <i className="bi bi-plus-circle display-4 text-success mb-3"></i>
                <h3 className="card-title">{stats.recent}</h3>
                <p className="card-text text-muted">Danh mục mới (7 ngày)</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="row">
          <div className="col-md-4 mb-3">
            <div className="card shadow-sm h-100">
              <div className="card-body text-center">
                <i className="bi bi-list-ul display-4 text-info mb-3"></i>
                <h5 className="card-title">Xem tất cả danh mục</h5>
                <p className="card-text text-muted">Danh sách tất cả danh mục với chức năng tìm kiếm và sắp xếp</p>
                <button
                  className="btn btn-info"
                  onClick={() => navigate('/admin/categories/list')}
                >
                  <i className="bi bi-eye me-2"></i>
                  Xem danh sách
                </button>
              </div>
            </div>
          </div>
          <div className="col-md-4 mb-3">
            <div className="card shadow-sm h-100">
              <div className="card-body text-center">
                <i className="bi bi-plus-circle display-4 text-success mb-3"></i>
                <h5 className="card-title">Tạo danh mục mới</h5>
                <p className="card-text text-muted">Thêm danh mục sản phẩm mới vào hệ thống</p>
                <button
                  className="btn btn-success"
                  onClick={() => navigate('/admin/categories/create')}
                >
                  <i className="bi bi-plus me-2"></i>
                  Tạo mới
                </button>
              </div>
            </div>
          </div>
          <div className="col-md-4 mb-3">
            <div className="card shadow-sm h-100">
              <div className="card-body text-center">
                <i className="bi bi-bar-chart display-4 text-warning mb-3"></i>
                <h5 className="card-title">Thống kê</h5>
                <p className="card-text text-muted">Xem báo cáo và thống kê về danh mục</p>
                <button
                  className="btn btn-warning"
                  disabled
                >
                  <i className="bi bi-graph-up me-2"></i>
                  Sắp có
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CategoryManagement