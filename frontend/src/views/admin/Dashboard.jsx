import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getCurrentUser } from '../../common/utils'
import { userService, categoryService, analyticsService } from '../../common/services'
import { ROUTES } from '../../common/constants'
import './Dashboard.css'

const AdminDashboard = () => {
  const user = getCurrentUser()
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalCategories: 0
  })
  const [loading, setLoading] = useState(true)
  const [revenuePeriod, setRevenuePeriod] = useState('month')
  const [revenueData, setRevenueData] = useState({ total: 0, points: [] })
  const [revenueLoading, setRevenueLoading] = useState(true)

  useEffect(() => {
    loadStats()
  }, [])

  useEffect(() => {
    loadRevenue(revenuePeriod)
  }, [revenuePeriod])

  const loadStats = async () => {
    try {
      setLoading(true)
      const [usersRes, categoriesRes] = await Promise.all([
        userService.getAll(),
        categoryService.getAll()
      ])

      setStats({
        totalUsers: usersRes.data?.length || 0,
        totalCategories: categoriesRes.data?.length || 0
      })
    } catch (error) {
      console.error('Error loading stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadRevenue = async (period) => {
    try {
      setRevenueLoading(true)
      const response = await analyticsService.getRevenue(period)
      setRevenueData({
        total: response.data?.total || 0,
        points: response.data?.points || []
      })
    } catch (error) {
      console.error('Error loading revenue data:', error)
      setRevenueData({ total: 0, points: [] })
    } finally {
      setRevenueLoading(false)
    }
  }

  const formatCurrency = (value) => {
    const amount = Number(value || 0)
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(amount)
  }

  const quickActions = [
    {
      title: 'Manage Users',
      description: 'View and manage user accounts',
      icon: 'bi bi-people',
      link: ROUTES.ADMIN_USERS_LIST,
      color: 'success',
      count: stats.totalUsers
    },
    {
      title: 'Manage Categories',
      description: 'Organize jewelry categories',
      icon: 'bi bi-tags',
      link: ROUTES.ADMIN_CATEGORIES_LIST,
      color: 'info',
      count: stats.totalCategories
    }
  ]

  const chartItems = [
    {
      label: 'Users',
      value: stats.totalUsers,
      color: 'success'
    },
    {
      label: 'Categories',
      value: stats.totalCategories,
      color: 'info'
    }
  ]
  const chartMax = Math.max(1, ...chartItems.map((item) => item.value))

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
    <div className="admin-dashboard">
      <div className="container my-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h1 className="display-5 fw-bold mb-2">
              <i className="bi bi-speedometer2 me-2"></i>
              Admin Dashboard
            </h1>
            <p className="text-muted">
              Welcome back, <strong>{user?.fullName || user?.username}</strong>! Manage your platform.
            </p>
          </div>
        </div>

        <div className="row g-4 mb-5">
          <div className="col-md-3 col-sm-6">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <div className="text-muted small mb-1">Total Users</div>
                    <div className="h3 mb-0 fw-bold text-success">{stats.totalUsers}</div>
                  </div>
                  <div className="bg-success bg-opacity-10 p-3 rounded">
                    <i className="bi bi-people text-success" style={{ fontSize: '2rem' }}></i>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="col-md-3 col-sm-6">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <div className="text-muted small mb-1">Categories</div>
                    <div className="h3 mb-0 fw-bold text-info">{stats.totalCategories}</div>
                  </div>
                  <div className="bg-info bg-opacity-10 p-3 rounded">
                    <i className="bi bi-tags text-info" style={{ fontSize: '2rem' }}></i>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="row g-4 mb-5">
          <div className="col-12">
            <div className="card border-0 shadow-sm admin-revenue-card">
              <div className="card-body">
                <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-3">
                  <div>
                    <h3 className="fw-bold mb-1">
                      <i className="bi bi-bar-chart-line me-2"></i>
                      Revenue Overview
                    </h3>
                    <div className="text-muted small">Total: {formatCurrency(revenueData.total)}</div>
                  </div>
                  <div className="btn-group admin-range-tabs" role="group">
                    <button
                      type="button"
                      className={`btn btn-sm ${revenuePeriod === 'day' ? 'btn-dark' : 'btn-outline-secondary'}`}
                      onClick={() => setRevenuePeriod('day')}
                    >
                      Daily
                    </button>
                    <button
                      type="button"
                      className={`btn btn-sm ${revenuePeriod === 'week' ? 'btn-dark' : 'btn-outline-secondary'}`}
                      onClick={() => setRevenuePeriod('week')}
                    >
                      Weekly
                    </button>
                    <button
                      type="button"
                      className={`btn btn-sm ${revenuePeriod === 'month' ? 'btn-dark' : 'btn-outline-secondary'}`}
                      onClick={() => setRevenuePeriod('month')}
                    >
                      Monthly
                    </button>
                  </div>
                </div>

                {revenueLoading ? (
                  <div className="text-center py-4 text-muted">Loading chart...</div>
                ) : revenueData.points.length === 0 ? (
                  <div className="text-center py-4 text-muted">No revenue data yet.</div>
                ) : (
                  <div className="admin-revenue-chart">
                    {revenueData.points.map((point, index) => {
                      const max = Math.max(...revenueData.points.map((p) => p.total), 1)
                      const height = (point.total / max) * 100
                      const colors = [
                        'linear-gradient(180deg, #ff9a9e 0%, #fad0c4 100%)',
                        'linear-gradient(180deg, #a1c4fd 0%, #c2e9fb 100%)',
                        'linear-gradient(180deg, #fbc2eb 0%, #a6c1ee 100%)',
                        'linear-gradient(180deg, #fddb92 0%, #d1fdff 100%)',
                        'linear-gradient(180deg, #84fab0 0%, #8fd3f4 100%)',
                        'linear-gradient(180deg, #fccb90 0%, #d57eeb 100%)',
                        'linear-gradient(180deg, #e0c3fc 0%, #8ec5fc 100%)',
                        'linear-gradient(180deg, #f093fb 0%, #f5576c 100%)',
                        'linear-gradient(180deg, #4facfe 0%, #00f2fe 100%)',
                        'linear-gradient(180deg, #fa709a 0%, #fee140 100%)',
                        'linear-gradient(180deg, #30cfd0 0%, #330867 100%)',
                        'linear-gradient(180deg, #5ee7df 0%, #b490ca 100%)'
                      ]
                      return (
                        <div key={point.label} className="admin-revenue-item">
                          <div className="admin-revenue-bar">
                            <div
                              className="admin-revenue-fill"
                              style={{
                                height: `${height}%`,
                                background: colors[index % colors.length]
                              }}
                              title={`${point.label}: ${formatCurrency(point.total)}`}
                            ></div>
                          </div>
                          <div className="admin-revenue-label">{point.label}</div>
                          <div className="admin-revenue-value">{formatCurrency(point.total)}</div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="row g-4">
          <div className="col-12">
            <h3 className="fw-bold mb-4">
              <i className="bi bi-lightning-charge me-2"></i>
              Quick Actions
            </h3>
          </div>
          {quickActions.map((action, index) => (
            <div key={index} className="col-md-4">
              <Link to={action.link} className="text-decoration-none">
                <div className="card border-0 shadow-sm h-100 quick-action-card">
                  <div className="card-body p-4">
                    <div className="d-flex align-items-center mb-3">
                      <div className={`bg-${action.color} bg-opacity-10 p-3 rounded me-3`}>
                        <i className={`${action.icon} text-${action.color}`} style={{ fontSize: '2rem' }}></i>
                      </div>
                      <div>
                        <h5 className="card-title mb-0">{action.title}</h5>
                        <div className="badge bg-secondary">{action.count} items</div>
                      </div>
                    </div>
                    <p className="card-text text-muted mb-3">{action.description}</p>
                    <div className="text-primary fw-bold">
                      Manage <i className="bi bi-arrow-right ms-1"></i>
                    </div>
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard
