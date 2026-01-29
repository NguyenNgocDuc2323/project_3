import React, { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { userService } from '../../../common/services'
import provincesData from '../../../data/provinces.json'
import wardsData from '../../../data/wards.json'
import './Create.css'

const UsersCreate = () => {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    gender: '',
    address: '',
    city: '',
    state: '',
    mobileNumber: '',
    dateOfBirth: '',
    role: 2,
    isActive: true
  })
  const [selectedProvinceId, setSelectedProvinceId] = useState('')
  const [selectedWardId, setSelectedWardId] = useState('')
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})

  // Filter wards based on selected province
  const filteredWards = useMemo(() => {
    if (!selectedProvinceId || !wardsData || !Array.isArray(wardsData)) return []
    const filtered = wardsData.filter(ward => ward.province_id === selectedProvinceId)
    return filtered
  }, [selectedProvinceId])

  const validateForm = () => {
    const newErrors = {}

    if (!form.username.trim()) {
      newErrors.username = 'Username is required'
    } else if (form.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters'
    }

    if (!form.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(form.email)) {
      newErrors.email = 'Email is invalid'
    }

    if (!form.password) {
      newErrors.password = 'Password is required'
    } else if (form.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters'
    }

    if (form.password !== form.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match'
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
      const { confirmPassword, ...submitData } = form
      // Format dateOfBirth if provided
      if (submitData.dateOfBirth) {
        submitData.dateOfBirth = new Date(submitData.dateOfBirth).toISOString()
      }
      // Convert empty strings to null for optional fields
      if (!submitData.gender) submitData.gender = null
      if (!submitData.address) submitData.address = null
      if (!submitData.city) submitData.city = null
      if (!submitData.state) submitData.state = null
      if (!submitData.mobileNumber) submitData.mobileNumber = null
      if (!submitData.dateOfBirth) submitData.dateOfBirth = null
      await userService.create(submitData)
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
      const errorMessage = error.response?.data?.message || 'Failed to create user'
      setErrors({ general: errorMessage })
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
  }

  const handleProvinceChange = (e) => {
    const provinceId = e.target.value
    const province = provincesData.find(p => p.id === provinceId)
    setSelectedProvinceId(provinceId)
    setSelectedWardId('') // Reset ward when province changes
    setForm(prev => ({
      ...prev,
      city: province?.name || '',
      state: '' // Reset state when province changes
    }))
  }

  const handleWardChange = (e) => {
    const wardId = e.target.value
    // Find ward from all wardsData (more reliable, similar to handleProvinceChange)
    const ward = wardsData.find(w => w.id === wardId)
    setSelectedWardId(wardId)
    setForm(prev => ({
      ...prev,
      state: ward?.name || ''
    }))
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

                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label htmlFor="username" className="form-label">
                      Username <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      className={`form-control ${errors.username ? 'is-invalid' : ''}`}
                      id="username"
                      name="username"
                      value={form.username}
                      onChange={handleChange}
                      placeholder="Enter username"
                      required
                    />
                    {errors.username && (
                      <div className="invalid-feedback">{errors.username}</div>
                    )}
                  </div>

                  <div className="mb-3">
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
                      required
                    />
                    {errors.email && (
                      <div className="invalid-feedback">{errors.email}</div>
                    )}
                  </div>

                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label htmlFor="password" className="form-label">
                        Password <span className="text-danger">*</span>
                      </label>
                      <input
                        type="password"
                        className={`form-control ${errors.password ? 'is-invalid' : ''}`}
                        id="password"
                        name="password"
                        value={form.password}
                        onChange={handleChange}
                        placeholder="Enter password"
                        required
                      />
                      {errors.password && (
                        <div className="invalid-feedback">{errors.password}</div>
                      )}
                    </div>

                    <div className="col-md-6 mb-3">
                      <label htmlFor="confirmPassword" className="form-label">
                        Confirm Password <span className="text-danger">*</span>
                      </label>
                      <input
                        type="password"
                        className={`form-control ${errors.confirmPassword ? 'is-invalid' : ''}`}
                        id="confirmPassword"
                        name="confirmPassword"
                        value={form.confirmPassword}
                        onChange={handleChange}
                        placeholder="Confirm password"
                        required
                      />
                      {errors.confirmPassword && (
                        <div className="invalid-feedback">{errors.confirmPassword}</div>
                      )}
                    </div>
                  </div>

                  <div className="mb-3">
                    <label htmlFor="fullName" className="form-label">
                      Full Name
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="fullName"
                      name="fullName"
                      value={form.fullName}
                      onChange={handleChange}
                      placeholder="Enter full name"
                    />
                  </div>

                  <div className="mb-3">
                    <label htmlFor="gender" className="form-label">
                      Gender
                    </label>
                    <select
                      className="form-select"
                      id="gender"
                      name="gender"
                      value={form.gender}
                      onChange={handleChange}
                    >
                      <option value="">-- Chọn giới tính --</option>
                      <option value="Nam">Nam</option>
                      <option value="Nữ">Nữ</option>
                      <option value="Khác">Khác</option>
                    </select>
                  </div>

                  <div className="mb-3">
                    <label htmlFor="address" className="form-label">
                      Address
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="address"
                      name="address"
                      value={form.address}
                      onChange={handleChange}
                      placeholder="Enter address"
                    />
                  </div>

                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label htmlFor="city" className="form-label">
                        City/Province
                      </label>
                      <select
                        className="form-select"
                        id="city"
                        name="city"
                        value={selectedProvinceId}
                        onChange={handleProvinceChange}
                      >
                        <option value="">-- Chọn Tỉnh/Thành phố --</option>
                        {provincesData.map(province => (
                          <option key={province.id} value={province.id}>
                            {province.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="col-md-6 mb-3">
                      <label htmlFor="state" className="form-label">
                        Wards
                      </label>
                      <select
                        className="form-select"
                        id="state"
                        name="state"
                        value={selectedWardId || ''}
                        onChange={handleWardChange}
                        disabled={!selectedProvinceId}
                      >
                        <option value="">-- Chọn Phường/Xã --</option>
                        {filteredWards && filteredWards.length > 0 ? (
                          filteredWards.map(ward => (
                            <option key={ward.id} value={ward.id}>
                              {ward.name}
                            </option>
                          ))
                        ) : selectedProvinceId ? (
                          <option value="" disabled>Không có dữ liệu</option>
                        ) : null}
                      </select>
                    </div>
                  </div>

                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label htmlFor="mobileNumber" className="form-label">
                        Mobile Number
                      </label>
                      <input
                        type="tel"
                        className="form-control"
                        id="mobileNumber"
                        name="mobileNumber"
                        value={form.mobileNumber}
                        onChange={handleChange}
                        placeholder="Enter mobile number"
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label htmlFor="dateOfBirth" className="form-label">
                        Date of Birth
                      </label>
                      <input
                        type="date"
                        className="form-control"
                        id="dateOfBirth"
                        name="dateOfBirth"
                        value={form.dateOfBirth}
                        onChange={handleChange}
                      />
                    </div>
                  </div>

                  <hr className="my-4" />

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
                          {form.isActive ? 'Active' : 'Inactive'}
                        </label>
                      </div>
                    </div>
                  </div>

                  <div className="d-grid gap-2 d-md-flex justify-content-md-end">
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
                          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                          Creating...
                        </>
                      ) : (
                        <>
                          <i className="bi bi-check-lg me-2"></i>
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

