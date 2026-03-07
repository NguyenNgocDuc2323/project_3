import React, { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { ROUTES } from '../../../common/constants'
import { userService } from '../../../common/services'
import ConfirmModal from '../../../components/common/ConfirmModal'
import Pagination, { DEFAULT_PAGE_SIZE } from '../../../components/common/Pagination'
import './List.css'

const UsersList = () => {
  const navigate = useNavigate()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [confirmDisable, setConfirmDisable] = useState({ open: false, id: null, username: '' })
  const [togglingActive, setTogglingActive] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE)

  useEffect(() => {
    loadUsers()
  }, [])

  const loadUsers = async () => {
    try {
      setLoading(true)
      const response = await userService.getAll()
      setUsers(response.data || [])
    } catch (error) {
      console.error('Error loading users:', error)
      if (window.showToast) {
        window.showToast({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load users',
          life: 4000
        })
      }
    } finally {
      setLoading(false)
    }
  }

  const handleSetActive = async (id, isActive) => {
    try {
      setTogglingActive(true)
      await userService.update(id, { isActive })
      if (window.showToast) {
        window.showToast({
          severity: 'success',
          summary: 'Success',
          detail: isActive ? 'Account has been activated.' : 'Account has been disabled.',
          life: 3000
        })
      }
      setUsers(prev => prev.map(u => u.id === id ? { ...u, isActive } : u))
    } catch (error) {
      console.error('Error updating user active:', error)
      if (window.showToast) {
        window.showToast({
          severity: 'error',
          summary: 'Error',
          detail: error?.response?.data?.message || 'Failed to update status.',
          life: 4000
        })
      }
    } finally {
      setTogglingActive(false)
      setConfirmDisable({ open: false, id: null, username: '' })
    }
  }

  const filteredUsers = useMemo(() => users.filter(user => {
    if (!searchTerm) return true
    const search = searchTerm.toLowerCase()
    return (
      user.username?.toLowerCase().includes(search) ||
      user.email?.toLowerCase().includes(search) ||
      user.fullName?.toLowerCase().includes(search)
    )
  }), [users, searchTerm])

  const totalFiltered = filteredUsers.length
  const paginatedUsers = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return filteredUsers.slice(start, start + pageSize)
  }, [filteredUsers, currentPage, pageSize])

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
    <div className="admin-users-list">
      <ConfirmModal
        open={confirmDisable.open}
        title="Disable account"
        message={confirmDisable.username ? `Are you sure you want to disable the account "${confirmDisable.username}"? The user will not be able to log in until an admin reactivates it.` : 'Are you sure you want to disable this account?'}
        confirmText="Disable"
        cancelText="Cancel"
        confirmVariant="warning"
        loading={togglingActive}
        onCancel={() => setConfirmDisable({ open: false, id: null, username: '' })}
        onConfirm={() => handleSetActive(confirmDisable.id, false)}
      />
      <div className="container my-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h1 className="display-6 fw-bold mb-2">
              <i className="bi bi-people me-2"></i>
              Manage Users
            </h1>
            <p className="text-muted">View and manage user accounts</p>
          </div>
          <button
            className="btn btn-primary"
            onClick={() => navigate(ROUTES.ADMIN_USERS_CREATE)}
          >
            <i className="bi bi-plus-circle me-2"></i>
            Create User
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
                placeholder="Search users by name, email, or username..."
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
                    <th>Avatar</th>
                    <th>Username</th>
                    <th>Full Name</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Gender</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th style={{ width: '150px' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.length > 0 ? (
                    paginatedUsers.map(user => {
                      const getAvatarUrl = () => {
                        if (user.avatarUrl) {
                          if (user.avatarUrl.startsWith('http://') || user.avatarUrl.startsWith('https://')) {
                            return user.avatarUrl
                          }
                          const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:5000'
                          const avatarPath = user.avatarUrl.startsWith('/') ? user.avatarUrl : `/${user.avatarUrl}`
                          return `${apiBase}${avatarPath}`
                        }
                        return `https://ui-avatars.com/api/?name=${encodeURIComponent(user.fullName || user.username || 'User')}&background=random`
                      }
                      
                      return (
                        <tr key={user.id}>
                          <td>{user.id}</td>
                          <td>
                            <img
                              src={getAvatarUrl()}
                              alt={user.username}
                              style={{
                                width: '40px',
                                height: '40px',
                                borderRadius: '50%',
                                objectFit: 'cover'
                              }}
                            />
                          </td>
                          <td>
                            <div className="fw-bold">{user.username}</div>
                          </td>
                          <td>{user.fullName || '-'}</td>
                          <td>{user.email}</td>
                          <td>{user.phone || '-'}</td>
                          <td>{user.gender || '-'}</td>
                          <td>
                            {user.role === 1 ? (
                              <span className="badge bg-danger">Admin</span>
                            ) : (
                              <span className="badge bg-success">User</span>
                            )}
                          </td>
                          <td>
                            {user.isActive !== false ? (
                              <span className="badge bg-success">
                                <i className="bi bi-check-circle me-1"></i>
                                Active
                              </span>
                            ) : (
                              <span className="badge bg-secondary">
                                <i className="bi bi-x-circle me-1"></i>
                                Inactive
                              </span>
                            )}
                          </td>
                          <td>
                            <div className="btn-group btn-group-sm" role="group">
                              <button
                                className="btn btn-outline-primary"
                                onClick={() => navigate(`/admin/users/edit/${user.id}`)}
                                title="Edit"
                              >
                                <i className="bi bi-pencil"></i>
                              </button>
                              {user.role !== 1 && (
                                user.isActive !== false ? (
                                  <button
                                    className="btn btn-outline-warning"
                                    onClick={() => setConfirmDisable({ open: true, id: user.id, username: user.username })}
                                    title="Disable account"
                                    disabled={togglingActive}
                                  >
                                    <i className="bi bi-person-x me-1"></i>
                                    Disable
                                  </button>
                                ) : (
                                  <button
                                    className="btn btn-outline-success"
                                    onClick={() => handleSetActive(user.id, true)}
                                    title="Activate account"
                                    disabled={togglingActive}
                                  >
                                    <i className="bi bi-person-check me-1"></i>
                                    Activate
                                  </button>
                                )
                              )}
                            </div>
                          </td>
                        </tr>
                      )
                    })
                  ) : (
                    <tr>
                      <td colSpan="10" className="text-center py-5 text-muted">
                        <i className="bi bi-inbox display-4 d-block mb-2"></i>
                        No users found
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
          label="users"
        />
      </div>
    </div>
  )
}

export default UsersList
