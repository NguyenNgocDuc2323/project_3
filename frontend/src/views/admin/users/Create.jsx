import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { userService } from '../../../common/services'
import './Create.css'

const UsersCreate = () => {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
    fullName: '',
    gender: '',
    address: '',
    phone: '',
    dateOfBirth: '',
    role: 2,
    isActive: true
  })
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [errors, setErrors] = useState({})
  const [avatarFile, setAvatarFile] = useState(null)
  const [avatarPreview, setAvatarPreview] = useState(null)

  const validateForm = () => {
    const newErrors = {}

    if (form.username.trim() && form.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters'
    } else if (form.username.trim() && form.username.length > 50) {
      newErrors.username = 'Username must not exceed 50 characters'
    }

    if (!form.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(form.email)) {
      newErrors.email = 'Email is invalid'
    }

    if (!form.password.trim()) {
      newErrors.password = 'Password is required'
    } else if (form.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters'
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
      if (dateOfBirth > new Date()) {
        newErrors.dateOfBirth = 'Date of birth cannot be in the future'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleAvatarChange = (e) => {
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

    setAvatarFile(file)
    
    // Create preview
    const reader = new FileReader()
    reader.onloadend = () => {
      setAvatarPreview(reader.result)
    }
    reader.readAsDataURL(file)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setLoading(true)
    setErrors({})

    try {
      const createData = {
        username: form.username.trim() || null,
        email: form.email,
        password: form.password.trim() || undefined,
        fullName: form.fullName || null,
        gender: form.gender || null,
        address: form.address || null,
        phone: form.phone || null,
        dateOfBirth: form.dateOfBirth ? new Date(form.dateOfBirth).toISOString() : null,
        role: form.role,
        isActive: form.isActive
      }
      
      const response = await userService.create(createData)
      const newUser = response.data
      
      // Upload avatar if provided
      if (avatarFile && newUser?.id) {
        try {
          setUploading(true)
          await userService.uploadAvatar(newUser.id, avatarFile)
        } catch (avatarError) {
          console.error('Error uploading avatar:', avatarError)
          // Don't fail the whole operation if avatar upload fails
          if (window.showToast) {
            window.showToast({
              severity: 'warn',
              summary: 'Warning',
              detail: 'User created but avatar upload failed',
              life: 4000
            })
          }
        } finally {
          setUploading(false)
        }
      }
      
      if (window.showToast) {
        window.showToast({
          severity: 'success',
          summary: 'Success',
          detail: 'User created successfully',
          life: 3000
        })
      }
      navigate('/admin/users/list')
    } catch (error) {
      const data = error.response?.data
      const fieldErrors = {}

      // Backend trả về nhiều lỗi: { message, errors: { email: "...", phone: "...", ... } }
      if (data && typeof data === 'object' && data.errors && typeof data.errors === 'object') {
        Object.assign(fieldErrors, data.errors)
        if (Object.keys(fieldErrors).length > 0 && !fieldErrors.general) {
          fieldErrors.general = data.message || 'Please fix the errors below.'
        }
      } else {
        // Một lỗi (backward compatible)
        let msg = 'Failed to create user'
        if (data !== undefined && data !== null) {
          if (typeof data === 'string') msg = data
          else if (typeof data === 'object' && (data.message != null || data.Message != null))
            msg = String(data.message ?? data.Message ?? '')
        }
        if (msg === 'Email already exists' || /email.*already|already.*email/i.test(msg)) {
          fieldErrors.email = form.email?.trim()
            ? `Email "${form.email.trim()}" already exists in the system.`
            : 'This email already exists in the system.'
        } else if (msg === 'Phone already exists' || /phone.*already|already.*phone/i.test(msg)) {
          fieldErrors.phone = form.phone?.trim()
            ? `Phone number "${form.phone.trim()}" already exists in the system.`
            : 'This phone number already exists in the system.'
        } else if (msg === 'Username already exists' || /username.*already|already.*username/i.test(msg)) {
          fieldErrors.username = form.username?.trim()
            ? `Username "${form.username.trim()}" already exists.`
            : 'This username already exists.'
        } else if (msg === 'Password is required' || /password.*required/i.test(msg)) {
          fieldErrors.password = 'Password is required'
        } else {
          fieldErrors.general = msg
        }
      }

      setErrors(fieldErrors)
      if (window.showToast) {
        const detail = fieldErrors.general || (typeof data?.message === 'string' ? data.message : 'Please fix the errors below.')
        window.showToast({
          severity: 'error',
          summary: 'Validation failed',
          detail,
          life: 5000
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

  return (
    <div className="admin-form-container">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-lg-8">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h1 className="display-6 fw-bold">
              <i className="bi bi-person-plus me-2"></i>
              Create User
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

              <form className="admin-users-create-form" onSubmit={handleSubmit}>
                {/* Avatar Upload Section */}
                <div className="text-center mb-4">
                  <div className="mb-3">
                    {avatarPreview ? (
                      <img
                        src={avatarPreview}
                        alt="Avatar preview"
                        style={{
                          width: '120px',
                          height: '120px',
                          borderRadius: '50%',
                          objectFit: 'cover',
                          border: '3px solid #dee2e6'
                        }}
                      />
                    ) : (
                      <div
                        style={{
                          width: '120px',
                          height: '120px',
                          borderRadius: '50%',
                          backgroundColor: '#f8f9fa',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          margin: '0 auto',
                          border: '3px solid #dee2e6'
                        }}
                      >
                        <i className="bi bi-person-circle" style={{ fontSize: '80px', color: '#6c757d' }}></i>
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
                      {avatarFile ? 'Change avatar' : 'Choose avatar'}
                    </button>
                    {avatarFile && (
                      <button
                        type="button"
                        className="btn btn-outline-danger btn-sm ms-2"
                        onClick={() => {
                          setAvatarFile(null)
                          setAvatarPreview(null)
                          const input = document.getElementById('avatar-input')
                          if (input) input.value = ''
                        }}
                      >
                        <i className="bi bi-x-circle me-2"></i>
                        Remove
                      </button>
                    )}
                  </div>
                  <p className="text-muted small mt-2 mb-0">
                    Accepted: JPG, PNG, GIF, WEBP (max 5MB)
                  </p>
                </div>

                <hr className="my-4" />

                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label htmlFor="username" className="form-label">
                      Username
                    </label>
                    <input
                      type="text"
                      className={`form-control ${errors.username ? 'is-invalid' : ''}`}
                      id="username"
                      name="username"
                      value={form.username || ''}
                      onChange={handleChange}
                      placeholder="Enter your email"
                      maxLength={50}
                      autoComplete="off"
                    />
                    {errors.username && (
                      <div className="invalid-feedback">{errors.username}</div>
                    )}
                  </div>

                  <div className="col-md-6 mb-3">
                    <label htmlFor="email" className="form-label">
                      Email <span className="text-danger">*</span>
                    </label>
                    <input
                      type="email"
                      className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                      id="email"
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      placeholder="Enter email"
                    />
                    {errors.email && (
                      <div className="invalid-feedback field-error-text" role="alert">{errors.email}</div>
                    )}
                  </div>
                </div>

                <div className="mb-3">
                  <label htmlFor="password" className="form-label">
                    Password <span className="text-danger">*</span>
                  </label>
                  <input
                    type="password"
                    className={`form-control ${errors.password ? 'is-invalid' : ''}`}
                    id="password"
                    name="password"
                    value={form.password || ''}
                    onChange={handleChange}
                    autoComplete="new-password"
                  />
                  {errors.password && (
                    <div className="invalid-feedback field-error-text" role="alert">{errors.password}</div>
                  )}
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
                    <div className="invalid-feedback field-error-text" role="alert">{errors.phone}</div>
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
                    >
                      <option value={2}>User</option>
                      <option value={1}>Admin</option>
                    </select>
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
                        Creating...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-check-circle me-2"></i>
                        Create User
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

export default UsersCreate

