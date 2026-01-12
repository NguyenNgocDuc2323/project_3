import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getCurrentUser } from '../../common/utils'
import { storyService, userService, categoryService } from '../../common/services'
import { ROUTES } from '../../common/constants'
import './Dashboard.css'

const AdminDashboard = () => {
  const user = getCurrentUser()
  const [stats, setStats] = useState({
    totalStories: 0,
    totalUsers: 0,
    totalCategories: 0,
    totalViews: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    try {
      setLoading(true)
      const [storiesRes, usersRes, categoriesRes, storyStatsRes] = await Promise.all([
        storyService.getAll(),
        userService.getAll(),
        categoryService.getAll(),
        storyService.getStats()
      ])

      setStats({
        totalStories: storiesRes.data?.length || 0,
        totalUsers: usersRes.data?.length || 0,
        totalCategories: categoriesRes.data?.length || 0,
        totalViews: storyStatsRes.data?.totalViews || 0
      })
    } catch (error) {
      console.error('Error loading stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const quickActions = [
    {
      title: 'Manage Stories',
      description: 'View, create, edit, and delete stories',
      icon: 'bi bi-book',
      link: ROUTES.ADMIN_STORIES_LIST,
      color: 'primary',
      count: stats.totalStories
    },
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
      description: 'Organize story categories',
      icon: 'bi bi-tags',
      link: ROUTES.ADMIN_CATEGORIES_LIST,
      color: 'info',
      count: stats.totalCategories
    }
  ]

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
                    <div className="text-muted small mb-1">Total Stories</div>
                    <div className="h3 mb-0 fw-bold text-primary">{stats.totalStories}</div>
                  </div>
                  <div className="bg-primary bg-opacity-10 p-3 rounded">
                    <i className="bi bi-book text-primary" style={{ fontSize: '2rem' }}></i>
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
          <div className="col-md-3 col-sm-6">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <div className="text-muted small mb-1">Total Views</div>
                    <div className="h3 mb-0 fw-bold text-warning">{stats.totalViews.toLocaleString()}</div>
                  </div>
                  <div className="bg-warning bg-opacity-10 p-3 rounded">
                    <i className="bi bi-eye text-warning" style={{ fontSize: '2rem' }}></i>
                  </div>
                </div>
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
