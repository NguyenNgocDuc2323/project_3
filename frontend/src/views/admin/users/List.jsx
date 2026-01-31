import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { userService } from '../../../common/services'
import './List.css'

const UsersList = () => {
  const navigate = useNavigate()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

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

  const handleDelete = async (id, username) => {
    if (!window.confirm(`Are you sure you want to delete user "${username}"?`)) {
      return
    }

    try {
      await userService.delete(id)
      if (window.showToast) {
        window.showToast({
          severity: 'success',
          summary: 'Success',
          detail: 'User deleted successfully',
          life: 3000
        })
      }
      loadUsers()
    } catch (error) {
      console.error('Error deleting user:', error)
      if (window.showToast) {
        window.showToast({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to delete user',
          life: 4000
        })
      }
    }
  }

  const filteredUsers = users.filter(user => {
    if (!searchTerm) return true
    const search = searchTerm.toLowerCase()
    return (
      user.username?.toLowerCase().includes(search) ||
      user.email?.toLowerCase().includes(search) ||
      user.fullName?.toLowerCase().includes(search)
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
    <div className="admin-users-list">
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
            onClick={() => navigate('/admin/users/create')}
          >
<<<<<<< Updated upstream
            <i className="bi bi-plus-circle me-2"></i>
            Create User
=======
            <i className="bi bi-person-plus me-2"></i>
            Create New User
>>>>>>> Stashed changes
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
                    <th>Username</th>
                    <th>Full Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th style={{ width: '150px' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.length > 0 ? (
                    filteredUsers.map(user => (
                      <tr key={user.id}>
                        <td>{user.id}</td>
                        <td>
                          <div className="fw-bold">{user.username}</div>
                        </td>
                        <td>{user.fullName || '-'}</td>
                        <td>{user.email}</td>
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
                            <button
                              className="btn btn-outline-danger"
                              onClick={() => handleDelete(user.id, user.username)}
                              title="Delete"
                              disabled={user.role === 1}
                            >
                              <i className="bi bi-trash"></i>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" className="text-center py-5 text-muted">
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

        <div className="mt-3 text-muted small">
          Showing {filteredUsers.length} of {users.length} users
        </div>
      </div>
    </div>
  )
}

export default UsersList
