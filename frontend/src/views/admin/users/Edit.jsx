import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { userService } from '../../../common/services'

const UsersEdit = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [form, setForm] = useState({
    username: '',
    email: '',
    fullName: '',
    gender: '',
    address: '',
    phone: '',
    dateOfBirth: '',
    role: 2,
    isActive: true
  })
  const [loading, setLoading] = useState(false)
  const [loadingData, setLoadingData] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [changingPassword, setChangingPassword] = useState(false)
  const [errors, setErrors] = useState({})
  const [passwordErrors, setPasswordErrors] = useState({})
  const [avatarFile, setAvatarFile] = useState(null)
  const [avatarPreview, setAvatarPreview] = useState(null)
  const [user, setUser] = useState(null)
  const [passwordData, setPasswordData] = useState({
    newPassword: '',
    confirmPassword: ''
  })

  useEffect(() => {
    loadUser()
  }, [id])

  const normalizeGender = (value) => {
    if (!value) return ''
    const normalized = String(value).toLowerCase()
    if (normalized === 'nam' || normalized === 'male') return 'Male'
    if (normalized === 'nữ' || normalized === 'nu' || normalized === 'female') return 'Female'
    if (normalized === 'khac' || normalized === 'other') return 'Other'
    return String(value)
  }

  const loadUser = async () => {
    try {
      setLoadingData(true)
      const response = await userService.getById(id)
      const user = response.data
      
      const formatDateForInput = (dateString) => {
        if (!dateString) return ''
        const date = new Date(dateString)
        if (isNaN(date.getTime())) return ''
        return date.toISOString().split('T')[0]
      }
      
      setUser(user)
      setForm({
        username: user.username || '',
        email: user.email || '',
        fullName: user.fullName || '',
        gender: normalizeGender(user.gender),
        address: user.address || '',
        phone: user.phone || '',
        dateOfBirth: formatDateForInput(user.dateOfBirth),
        role: user.role || 2,
        isActive: user.isActive !== false
      })
    } catch (error) {
      console.error('Error loading user:', error)
      if (window.showToast) {
        window.showToast({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load user',
          life: 4000
        })
      }
      navigate('/admin/users/list')
    } finally {
      setLoadingData(false)
    }
  }

  const validateForm = () => {
    const newErrors = {}

    if (!form.username.trim()) {
      newErrors.username = 'Username is required'
    }

    if (!form.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(form.email)) {
      newErrors.email = 'Email is invalid'
    }

    if (form.fullName && form.fullName.length > 100) {
      newErrors.fullName = 'Full name must not exceed 100 characters'
    }

    if (form.gender && form.gender.length > 20) {
      newErrors.gender = 'Gender must not exceed 20 characters'
    }

    if (form.address && form.address.length > 500) {
      newErrors.address = 'Address must not exceed 500 characters'
    }

    if (form.phone && form.phone.length > 20) {
      newErrors.phone = 'Phone must not exceed 20 characters'
    }

    if (form.dateOfBirth) {
      const dateOfBirth = new Date(form.dateOfBirth)
      const today = new Date()
      today.setHours(23, 59, 59, 999) // Set to end of today
      if (dateOfBirth > today) {
        newErrors.dateOfBirth = 'Date of birth cannot be in the future'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setLoading(true)
    setErrors({})

    try {
      const updateData = {
        fullName: form.fullName || null,
        gender: form.gender || null,
        address: form.address || null,
        phone: form.phone || null,
        dateOfBirth: form.dateOfBirth ? new Date(form.dateOfBirth).toISOString() : null,
        isActive: form.isActive
      }
      
      await userService.update(id, updateData)
      if (window.showToast) {
        window.showToast({
          severity: 'success',
          summary: 'Success',
          detail: 'User updated successfully',
          life: 3000
        })
      }
      navigate('/admin/users/list')
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to update user'
      const fieldErrors = {}
      if (errorMessage === 'Phone already exists') {
        fieldErrors.phone = form.phone?.trim()
          ? `Phone number "${form.phone.trim()}" already exists in the system.`
          : 'This phone number already exists in the system.'
      } else {
        fieldErrors.general = errorMessage
      }
      setErrors(fieldErrors)
      if (window.showToast) {
        window.showToast({
          severity: 'error',
          summary: 'Error',
          detail: errorMessage,
          life: 4000
        })
      }
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : (type === 'number' ? parseInt(value) : value)
    }))
    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null
      }))
    }
  }

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      if (window.showToast) {
        window.showToast({
          severity: 'error',
          summary: 'Error',
          detail: 'Only image files are allowed (jpg, png, gif, webp)',
          life: 4000
        })
      }
      return
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      if (window.showToast) {
        window.showToast({
          severity: 'error',
          summary: 'Error',
          detail: 'File size must not exceed 5MB',
          life: 4000
        })
      }
      return
    }

    try {
      setUploading(true)
      await userService.uploadAvatar(id, file)
      if (window.showToast) {
        window.showToast({
          severity: 'success',
          summary: 'Success',
          detail: 'Avatar uploaded successfully',
          life: 3000
        })
      }
      // Reload user data to get new avatar URL
      await loadUser()
    } catch (error) {
      console.error('Error uploading avatar:', error)
      if (window.showToast) {
        window.showToast({
          severity: 'error',
          summary: 'Error',
          detail: error.response?.data?.message || 'Failed to upload avatar',
          life: 4000
        })
      }
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  const handlePasswordChange = (e) => {
    const { name, value } = e.target
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }))
    // Clear error when user types
    if (passwordErrors[name]) {
      setPasswordErrors(prev => ({
        ...prev,
        [name]: null
      }))
    }
  }

  const validatePasswordForm = () => {
    const newErrors = {}
    
    if (!passwordData.newPassword) {
      newErrors.newPassword = 'Please enter a new password'
    } else if (passwordData.newPassword.length < 6) {
      newErrors.newPassword = 'New password must be at least 6 characters'
    }

    if (!passwordData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your new password'
    } else if (passwordData.newPassword !== passwordData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match'
    }

    setPasswordErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleChangePassword = async (e) => {
    e.preventDefault()
    
    if (!validatePasswordForm()) {
      return
    }

    try {
      setChangingPassword(true)
      await userService.changePassword(id, passwordData.newPassword)
      if (window.showToast) {
        window.showToast({
          severity: 'success',
          summary: 'Success',
          detail: 'Password changed successfully',
          life: 3000
        })
      }
      
      // Clear password fields
      setPasswordData({
        newPassword: '',
        confirmPassword: ''
      })
    } catch (error) {
      console.error('Error changing password:', error)
      if (window.showToast) {
        window.showToast({
          severity: 'error',
          summary: 'Error',
          detail: error.response?.data?.message || 'Failed to change password',
          life: 4000
        })
      }
    } finally {
      setChangingPassword(false)
    }
  }

  const getAvatarUrl = () => {
    if (user?.avatarUrl) {
      if (user.avatarUrl.startsWith('http://') || user.avatarUrl.startsWith('https://')) {
        return user.avatarUrl
      }
      const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:5000'
      const avatarPath = user.avatarUrl.startsWith('/') ? user.avatarUrl : `/${user.avatarUrl}`
      return `${apiBase}${avatarPath}`
    }
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.fullName || user?.username || 'User')}&background=random`
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
          <div className="col-lg-8">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h1 className="display-6 fw-bold">
              <i className="bi bi-pencil me-2"></i>
              Edit User
            </h1>
            <button
              className="btn btn-outline-secondary"
              onClick={() => navigate('/admin/users/list')}
            >
              <i className="bi bi-arrow-left me-2"></i>
              Back to List
            </button>
          </div>

          <div className="card shadow-sm">
            <div className="card-body p-4">
              {errors.general && (
                <div className="alert alert-danger" role="alert">
                  {errors.general}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                {/* Avatar Upload Section */}
                <div className="text-center mb-4">
                  <div className="mb-3">
                    <img
                      src={getAvatarUrl()}
                      alt="Avatar"
                      style={{
                        width: '120px',
                        height: '120px',
                        borderRadius: '50%',
                        objectFit: 'cover',
                        border: '3px solid #dee2e6'
                      }}
                    />
                    {uploading && (
                      <div className="mt-2">
                        <div className="spinner-border spinner-border-sm text-primary" role="status">
                          <span className="visually-hidden">Uploading...</span>
                        </div>
                      </div>
                    )}
                  </div>
                  <div>
                    <input
                      type="file"
                      id="avatar-input"
                      accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                      onChange={handleAvatarChange}
                      style={{ display: 'none' }}
                      disabled={uploading}
                    />
                    <button
                      type="button"
                      className="btn btn-outline-primary btn-sm"
                      onClick={() => document.getElementById('avatar-input')?.click()}
                      disabled={uploading}
                    >
                      <i className="bi bi-camera me-2"></i>
                      {uploading ? 'Uploading...' : 'Change avatar'}
                    </button>
                  </div>
                  <p className="text-muted small mt-2 mb-0">
                    Accepted: JPG, PNG, GIF, WEBP (max 5MB)
                  </p>
                </div>

                <hr className="my-4" />

                <div className="mb-3">
                  <label htmlFor="username" className="form-label">
                    Username
                  </label>
                  <input
                    type="text"
                    className="form-control bg-light"
                    id="username"
                    name="username"
                    value={form.username}
                    disabled
                  />
                  <small className="text-muted">Username cannot be changed</small>
                </div>

                <div className="mb-3">
                  <label htmlFor="email" className="form-label">
                    Email
                  </label>
                  <input
                    type="email"
                    className="form-control bg-light"
                    id="email"
                    name="email"
                    value={form.email}
                    disabled
                  />
                  <small className="text-muted">Email cannot be changed</small>
                </div>

                <div className="mb-3">
                  <label htmlFor="fullName" className="form-label">
                    Full Name
                  </label>
                  <input
                    type="text"
                    className={`form-control ${errors.fullName ? 'is-invalid' : ''}`}
                    id="fullName"
                    name="fullName"
                    value={form.fullName}
                    onChange={handleChange}
                    placeholder="Enter full name"
                    maxLength={100}
                  />
                  {errors.fullName && (
                    <div className="invalid-feedback">{errors.fullName}</div>
                  )}
                </div>

                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label htmlFor="gender" className="form-label">
                      Gender
                    </label>
                    <select
                      className={`form-select ${errors.gender ? 'is-invalid' : ''}`}
                      id="gender"
                      name="gender"
                      value={form.gender}
                      onChange={handleChange}
                    >
                      <option value="">Select gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                    {errors.gender && (
                      <div className="invalid-feedback">{errors.gender}</div>
                    )}
                  </div>
                  <div className="col-md-6 mb-3">
                    <label htmlFor="dateOfBirth" className="form-label">
                      Date of Birth
                    </label>
                    <input
                      type="date"
                      className={`form-control ${errors.dateOfBirth ? 'is-invalid' : ''}`}
                      id="dateOfBirth"
                      name="dateOfBirth"
                      value={form.dateOfBirth}
                      onChange={handleChange}
                      max={new Date().toISOString().split('T')[0]}
                    />
                    {errors.dateOfBirth && (
                      <div className="invalid-feedback">{errors.dateOfBirth}</div>
                    )}
                  </div>
                </div>

                <div className="mb-3">
                  <label htmlFor="phone" className="form-label">
                    Phone
                  </label>
                  <input
                    type="tel"
                    className={`form-control ${errors.phone ? 'is-invalid' : ''}`}
                    id="phone"
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="Enter phone number"
                    maxLength={20}
                  />
                  {errors.phone && (
                    <div className="invalid-feedback">{errors.phone}</div>
                  )}
                </div>

                <div className="mb-3">
                  <label htmlFor="address" className="form-label">
                    Address
                  </label>
                  <textarea
                    className={`form-control ${errors.address ? 'is-invalid' : ''}`}
                    id="address"
                    name="address"
                    rows="3"
                    value={form.address}
                    onChange={handleChange}
                    placeholder="Enter address"
                    maxLength={500}
                  />
                  {errors.address && (
                    <div className="invalid-feedback">{errors.address}</div>
                  )}
                </div>

                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label htmlFor="role" className="form-label">
                      Role
                    </label>
                    <select
                      className="form-select"
                      id="role"
                      name="role"
                      value={form.role}
                      onChange={handleChange}
                      disabled={form.role === 1}
                    >
                      <option value={2}>User</option>
                      <option value={1}>Admin</option>
                    </select>
                    {form.role === 1 && (
                      <small className="text-muted">Cannot change admin role</small>
                    )}
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label d-block">Status</label>
                    <div className="form-check form-switch">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="isActive"
                        name="isActive"
                        checked={form.isActive}
                        onChange={handleChange}
                      />
                      <label className="form-check-label" htmlFor="isActive">
                        {form.isActive ? (
                          <span className="text-success">
                            <i className="bi bi-check-circle me-1"></i>
                            Active
                          </span>
                        ) : (
                          <span className="text-secondary">
                            <i className="bi bi-x-circle me-1"></i>
                            Inactive
                          </span>
                        )}
                      </label>
                    </div>
                  </div>
                </div>

                <div className="d-flex gap-2 justify-content-end mt-4">
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={() => navigate('/admin/users/list')}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                        Updating...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-check-circle me-2"></i>
                        Update User
                      </>
                    )}
                  </button>
                </div>
              </form>

              <hr className="my-4" />

              {/* Change Password Section */}
              <div className="card border-warning">
                <div className="card-header bg-warning text-dark">
                  <h5 className="mb-0">
                    <i className="bi bi-shield-lock me-2"></i>
                    Change Password
                  </h5>
                </div>
                <div className="card-body">
                  <form onSubmit={handleChangePassword}>
                    <div className="mb-3">
                      <label htmlFor="newPassword" className="form-label">
                        <i className="bi bi-key me-2"></i>
                        New Password
                      </label>
                      <input
                        type="password"
                        className={`form-control ${passwordErrors.newPassword ? 'is-invalid' : ''}`}
                        id="newPassword"
                        name="newPassword"
                        value={passwordData.newPassword}
                        onChange={handlePasswordChange}
                        placeholder="Enter new password (min 6 characters)"
                        disabled={changingPassword}
                      />
                      {passwordErrors.newPassword && (
                        <div className="invalid-feedback">{passwordErrors.newPassword}</div>
                      )}
                    </div>

                    <div className="mb-3">
                      <label htmlFor="confirmPassword" className="form-label">
                        <i className="bi bi-key-fill me-2"></i>
                        Confirm New Password
                      </label>
                      <input
                        type="password"
                        className={`form-control ${passwordErrors.confirmPassword ? 'is-invalid' : ''}`}
                        id="confirmPassword"
                        name="confirmPassword"
                        value={passwordData.confirmPassword}
                        onChange={handlePasswordChange}
                        placeholder="Re-enter new password"
                        disabled={changingPassword}
                      />
                      {passwordErrors.confirmPassword && (
                        <div className="invalid-feedback">{passwordErrors.confirmPassword}</div>
                      )}
                    </div>

                    <div className="d-grid">
                      <button
                        type="submit"
                        className="btn btn-warning"
                        disabled={changingPassword}
                      >
                        {changingPassword ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                            Changing password...
                          </>
                        ) : (
                          <>
                            <i className="bi bi-shield-check me-2"></i>
                            Change Password
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
      </div>
    </div>
  )
}

export default UsersEdit
