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
    role: 0,
    isActive: true,
    avatarUrl: '',
    address: '',
    city: '',
    state: '',
    mobileNumber: '',
    dateOfBirth: ''
  })
  const [selectedProvinceId, setSelectedProvinceId] = useState('')
  const [selectedWardId, setSelectedWardId] = useState('')
  const [loading, setLoading] = useState(false)
  const [loadingData, setLoadingData] = useState(true)
  const [errors, setErrors] = useState({})
  const [provinces, setProvinces] = useState([])
  const [wards, setWards] = useState([])
  const [passwordData, setPasswordData] = useState({
    newPassword: '',
    confirmPassword: ''
  })
  const [passwordErrors, setPasswordErrors] = useState({})
  const [changingPassword, setChangingPassword] = useState(false)
  const [avatarPreview, setAvatarPreview] = useState('')
  const [uploadingAvatar, setUploadingAvatar] = useState(false)

  // Filter wards based on selected province
  const filteredWards = useMemo(() => {
    if (!selectedProvinceId || !wards || !Array.isArray(wards)) return []
    return wards.filter(ward => ward.province_id === selectedProvinceId)
  }, [selectedProvinceId, wards])

  // Reset ward selection when province changes
  useEffect(() => {
    if (selectedProvinceId && filteredWards.length > 0 && form.state) {
      if (!filteredWards.find(w => w.name === form.state)) {
        setForm(prev => ({ ...prev, state: '' }))
      }
    }
  }, [selectedProvinceId, filteredWards, form.state])

  useEffect(() => {
    loadUser()
    loadProvincesAndWards()
  }, [id])

  const loadProvincesAndWards = async () => {
    try {
      const [provincesRes, wardsRes] = await Promise.all([
        fetch('/provinces.json'),
        fetch('/wards.json')
      ])
      const provincesData = await provincesRes.json()
      const wardsData = await wardsRes.json()
      setProvinces(provincesData)
      setWards(wardsData)
    } catch (error) {
      console.error('Error loading provinces/wards:', error)
    }
  }

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
        role: user.role || 0,
        isActive: user.isActive !== false,
        avatarUrl: user.avatarUrl || '',
        address: user.address || '',
        city: user.city || '',
        state: user.state || '',
        mobileNumber: user.mobileNumber || '',
        dateOfBirth: user.dateOfBirth ? new Date(user.dateOfBirth).toISOString().split('T')[0] : ''
      })

      // Set avatar preview
      if (user.avatarUrl) {
        let avatarUrl = user.avatarUrl
        if (!avatarUrl.startsWith('http')) {
          const avatarPath = avatarUrl.startsWith('/') ? avatarUrl : `/${avatarUrl}`
          avatarUrl = `http://localhost:5000${avatarPath}`
        }
        setAvatarPreview(avatarUrl)
      } else {
        setAvatarPreview('')
      }
      
      // Set selected province if city matches a province name
      if (user.city && provinces.length > 0) {
        const matchedProvince = provinces.find(p => p.name === user.city)
        if (matchedProvince) {
          setSelectedProvinceId(matchedProvince.id)
        }
      }
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

  useEffect(() => {
    // Set selected province when provinces are loaded and user has city
    if (provinces.length > 0 && form.city) {
      const matchedProvince = provinces.find(p => p.name === form.city)
      if (matchedProvince && !selectedProvinceId) {
        setSelectedProvinceId(matchedProvince.id)
      }
    }
  }, [provinces, form.city])

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
        avatarUrl: form.avatarUrl || null,
        address: form.address || null,
        city: form.city || null,
        state: form.state || null,
        mobileNumber: form.mobileNumber || null,
        dateOfBirth: form.dateOfBirth ? new Date(form.dateOfBirth).toISOString() : null,
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
    setSelectedProvinceId(provinceId)
    const selectedProvince = provinces.find(p => p.id === provinceId)
    setSelectedWardId('') // Reset ward when province changes
    setForm(prev => ({
      ...prev,
      city: selectedProvince ? selectedProvince.name : '',
      state: '' // Reset ward when province changes
    }))
  }

  const handleWardChange = (e) => {
    const wardId = e.target.value
    // Find ward from all wardsData (more reliable, similar to handleProvinceChange)
    const ward = wards.find(w => w.id === wardId)
    setSelectedWardId(wardId)
    setForm(prev => ({
      ...prev,
      state: ward?.name || ''
    }))
  }

  const handleAvatarFileChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      if (window.showToast) {
        window.showToast({
          severity: 'error',
          summary: 'Error',
          detail: 'Chỉ chấp nhận file ảnh (jpg, png, gif, webp)',
          life: 3000
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
          detail: 'Kích thước file không được vượt quá 5MB',
          life: 3000
        })
      }
      return
    }

    try {
      setUploadingAvatar(true)
      
      // Show preview
      const reader = new FileReader()
      reader.onload = (e) => {
        setAvatarPreview(e.target.result)
      }
      reader.readAsDataURL(file)

      // Upload file
      const response = await userService.uploadAvatar(id, file)
      
      if (response.data?.avatarUrl) {
        setForm(prev => ({
          ...prev,
          avatarUrl: response.data.avatarUrl
        }))
        if (window.showToast) {
          window.showToast({
            severity: 'success',
            summary: 'Success',
            detail: 'Avatar uploaded successfully',
            life: 3000
          })
        }
      }
    } catch (error) {
      console.error('Error uploading avatar:', error)
      const errorMessage = error.response?.data?.message || 'Failed to upload avatar'
      if (window.showToast) {
        window.showToast({
          severity: 'error',
          summary: 'Error',
          detail: errorMessage,
          life: 4000
        })
      }
      // Reset preview on error
      if (form.avatarUrl) {
        let avatarUrl = form.avatarUrl
        if (!avatarUrl.startsWith('http')) {
          const avatarPath = avatarUrl.startsWith('/') ? avatarUrl : `/${avatarUrl}`
          avatarUrl = `http://localhost:5000${avatarPath}`
        }
        setAvatarPreview(avatarUrl)
      } else {
        setAvatarPreview('')
      }
    } finally {
      setUploadingAvatar(false)
      // Reset file input
      e.target.value = ''
    }
  }

  const handlePasswordChange = (e) => {
    const { name, value } = e.target
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }))
    if (passwordErrors[name]) {
      setPasswordErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const validatePasswordForm = () => {
    const newErrors = {}
    
    if (!passwordData.newPassword || !passwordData.newPassword.trim()) {
      newErrors.newPassword = 'New password is required'
    } else if (passwordData.newPassword.length < 6) {
      newErrors.newPassword = 'New password must be at least 6 characters'
    }

    if (!passwordData.confirmPassword || !passwordData.confirmPassword.trim()) {
      newErrors.confirmPassword = 'Please confirm your new password'
    } else if (passwordData.newPassword !== passwordData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match'
    }

    setPasswordErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handlePasswordSubmit = async (e) => {
    e.preventDefault()
    
    if (!validatePasswordForm()) {
      return
    }

    try {
      setChangingPassword(true)
      await userService.changePassword(id, passwordData.newPassword)
      
      // Reset password form
      setPasswordData({
        newPassword: '',
        confirmPassword: ''
      })

      if (window.showToast) {
        window.showToast({
          severity: 'success',
          summary: 'Success',
          detail: 'Password changed successfully',
          life: 3000
        })
      }
    } catch (error) {
      console.error('Error changing password:', error)
      const errorMessage = error.response?.data?.message || 'Failed to change password'
      if (window.showToast) {
        window.showToast({
          severity: 'error',
          summary: 'Error',
          detail: errorMessage,
          life: 4000
        })
      }
    } finally {
      setChangingPassword(false)
    }
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
                    className="form-control"
                    id="username"
                    name="username"
                    value={form.username}
                    disabled
                  />
                  <small className="form-text text-muted">Username cannot be changed</small>
                </div>

                <div className="mb-3">
                  <label htmlFor="email" className="form-label">
                    Email <span className="text-danger">*</span>
                  </label>
                  <input
                    type="email"
                    className="form-control"
                    id="email"
                    name="email"
                    value={form.email}
                    disabled
                  />
                  <small className="form-text text-muted">Email cannot be changed</small>
                </div>

                <div className="row">
                  <div className="col-md-6 mb-3">
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

                  <div className="col-md-6 mb-3">
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
                      <option value="">Select Gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>

                <div className="row">
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
                      placeholder="e.g., 0123456789"
                    />
                  </div>
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
                    placeholder="Street address"
                  />
                </div>

                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label htmlFor="province" className="form-label">
                      <i className="bi bi-building me-2"></i>City/ Province
                    </label>
                    <select
                      className="form-control"
                      id="province"
                      value={selectedProvinceId}
                      onChange={handleProvinceChange}
                    >
                      <option value="">Select Province</option>
                      {provinces.map(province => (
                        <option key={province.id} value={province.id}>
                          {province.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="col-md-6 mb-3">
                    <label htmlFor="ward" className="form-label">
                      <i className="bi bi-geo me-2"></i>Ward/ Commune
                    </label>
                    <select
                      className="form-control"
                      id="ward"
                      value={form.state}
                      onChange={handleWardChange}
                      disabled={!selectedProvinceId}
                    >
                      <option value="">Select Ward</option>
                      {filteredWards.map(ward => (
                        <option key={ward.id} value={ward.name}>
                          {ward.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="mb-3">
                  <label htmlFor="avatarUrl" className="form-label">
                    Avatar URL
                  </label>
                  <div className="d-flex align-items-center gap-3 mb-2">
                    {avatarPreview && (
                      <div className="avatar-preview-container">
                        <img 
                          src={avatarPreview} 
                          alt="Avatar preview" 
                          className="rounded-circle border"
                          style={{ width: '80px', height: '80px', objectFit: 'cover' }}
                          onError={(e) => {
                            e.target.src = 'https://ui-avatars.com/api/?name=' + encodeURIComponent(form.fullName || form.username || 'User') + '&background=random'
                          }}
                        />
                      </div>
                    )}
                    <div className="flex-grow-1">
                      <input
                        type="url"
                        className="form-control"
                        id="avatarUrl"
                        name="avatarUrl"
                        value={form.avatarUrl}
                        onChange={handleChange}
                        placeholder="https://example.com/avatar.jpg hoặc chọn file từ máy tính"
                      />
                    </div>
                  </div>
                  <div className="d-flex gap-2">
                    <label htmlFor="avatarFile" className="btn btn-outline-primary btn-sm">
                      <i className="bi bi-upload me-2"></i>
                      {uploadingAvatar ? 'Đang tải...' : 'Chọn hình từ máy tính'}
                    </label>
                    <input
                      type="file"
                      id="avatarFile"
                      accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                      onChange={handleAvatarFileChange}
                      disabled={uploadingAvatar}
                      style={{ display: 'none' }}
                    />
                    {form.avatarUrl && (
                      <button
                        type="button"
                        className="btn btn-outline-danger btn-sm"
                        onClick={() => {
                          setForm(prev => ({ ...prev, avatarUrl: '' }))
                          setAvatarPreview('')
                        }}
                      >
                        <i className="bi bi-trash me-2"></i>
                        Xóa
                      </button>
                    )}
                  </div>
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

              {/* Change Password Section */}
              <hr className="my-4" />
              <div className="card border-warning">
                <div className="card-header bg-warning text-dark">
                  <h5 className="mb-0">
                    <i className="bi bi-key me-2"></i>
                    Change Password
                  </h5>
                </div>
                <div className="card-body">
                  <form onSubmit={handlePasswordSubmit}>
                    <div className="mb-3">
                      <label htmlFor="newPassword" className="form-label">
                        <i className="bi bi-lock-fill me-2"></i>New Password <span className="text-danger">*</span>
                      </label>
                      <input
                        type="password"
                        className={`form-control ${passwordErrors.newPassword ? 'is-invalid' : ''}`}
                        id="newPassword"
                        name="newPassword"
                        value={passwordData.newPassword}
                        onChange={handlePasswordChange}
                        required
                      />
                      {passwordErrors.newPassword && (
                        <div className="invalid-feedback">{passwordErrors.newPassword}</div>
                      )}
                      <small className="form-text text-muted">Password must be at least 6 characters</small>
                    </div>

                    <div className="mb-3">
                      <label htmlFor="confirmPassword" className="form-label">
                        <i className="bi bi-lock-fill me-2"></i>Confirm New Password <span className="text-danger">*</span>
                      </label>
                      <input
                        type="password"
                        className={`form-control ${passwordErrors.confirmPassword ? 'is-invalid' : ''}`}
                        id="confirmPassword"
                        name="confirmPassword"
                        value={passwordData.confirmPassword}
                        onChange={handlePasswordChange}
                        required
                      />
                      {passwordErrors.confirmPassword && (
                        <div className="invalid-feedback">{passwordErrors.confirmPassword}</div>
                      )}
                    </div>

                    <button
                      type="submit"
                      className="btn btn-warning"
                      disabled={changingPassword}
                    >
                      {changingPassword ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                          Changing...
                        </>
                      ) : (
                        <>
                          <i className="bi bi-key-fill me-2"></i>
                          Change Password
                        </>
                      )}
                    </button>
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
