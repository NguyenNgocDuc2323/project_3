import React, { useState, useEffect, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { userService } from '../../../common/services'
import provincesData from '../../../data/provinces.json'
import wardsData from '../../../data/wards.json'

const UsersEdit = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [form, setForm] = useState({
    username: '',
    email: '',
    fullName: '',
    gender: '',
    address: '',
    city: '',
    state: '',
    mobileNumber: '',
    dateOfBirth: '',
    isActive: true
  })
  const [selectedProvinceId, setSelectedProvinceId] = useState('')
  const [selectedWardId, setSelectedWardId] = useState('')
  const [loading, setLoading] = useState(false)
  const [loadingData, setLoadingData] = useState(true)
  const [errors, setErrors] = useState({})

  // Filter wards based on selected province
  const filteredWards = useMemo(() => {
    if (!selectedProvinceId || !wardsData || !Array.isArray(wardsData)) return []
    const filtered = wardsData.filter(ward => ward.province_id === selectedProvinceId)
    return filtered
  }, [selectedProvinceId])

  useEffect(() => {
    loadUser()
  }, [id])

  const loadUser = async () => {
    try {
      setLoadingData(true)
      const response = await userService.getById(id)
      const user = response.data
      
      // Find province ID from city name
      const province = provincesData.find(p => p.name === user.city)
      const provinceId = province?.id || ''
      setSelectedProvinceId(provinceId)

      // Find ward ID from state name - only if we have a province selected
      let wardId = ''
      if (user.state && provinceId) {
        // Filter wards by province first, then find by name
        const provinceWards = wardsData.filter(w => w.province_id === provinceId)
        const ward = provinceWards.find(w => w.name === user.state)
        wardId = ward?.id || ''
      }
      setSelectedWardId(wardId)

      setForm({
        username: user.username || '',
        email: user.email || '',
        fullName: user.fullName || '',
        gender: user.gender || '',
        address: user.address || '',
        city: user.city || '',
        state: user.state || '',
        mobileNumber: user.mobileNumber || '',
        dateOfBirth: user.dateOfBirth ? new Date(user.dateOfBirth).toISOString().split('T')[0] : '',
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
      // Format data similar to UpdateProfile.jsx
      const updateData = {
        fullName: form.fullName,
        gender: form.gender || null,
        address: form.address || null,
        city: form.city || null,
        state: form.state || null,
        mobileNumber: form.mobileNumber || null,
        dateOfBirth: form.dateOfBirth ? new Date(form.dateOfBirth) : null,
        isActive: form.isActive
      }

      console.log('Sending update request:', updateData)
      const response = await userService.update(id, updateData)
      console.log('Update response:', response)
      console.log('Update response data:', response.data)
      console.log('Update response data - FullName:', response.data?.fullName)
      console.log('Update response data - Gender:', response.data?.gender)
      console.log('Update response data - City:', response.data?.city)
      console.log('Update response data - State:', response.data?.state)
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
      console.error('Update user error:', error)
      console.error('Error response:', error.response)
      const errorMessage = error.response?.data?.message || error.response?.data?.error || error.message || 'Failed to update user'
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
                  />
                  {errors.email && (
                    <div className="invalid-feedback">{errors.email}</div>
                  )}
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
            </div>
          </div>
        </div>
        </div>
      </div>
    </div>
  )
}

export default UsersEdit
