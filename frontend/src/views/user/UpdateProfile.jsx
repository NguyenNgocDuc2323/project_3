import React, { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { profileService } from '../../common/services'
import { ROUTES } from '../../common/constants'
import { API_BASE_URL } from '../../common/constants'
import { isAuthenticated } from '../../common/utils'
import provincesData from '../../data/provinces.json'
import wardsData from '../../data/wards.json'
import './UpdateProfile.css'

const UpdateProfile = () => {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    address: '',
    city: '',
    state: '',
    mobileNumber: '',
    dateOfBirth: '',
    gender: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [avatar, setAvatar] = useState(null)
  const [avatarPreview, setAvatarPreview] = useState(null)
  const [loading, setLoading] = useState(false)
  const [loadingData, setLoadingData] = useState(true)
  const [errors, setErrors] = useState({})
  const [profile, setProfile] = useState(null)
  const [selectedProvinceId, setSelectedProvinceId] = useState('')
  const [selectedWardId, setSelectedWardId] = useState('')

  // Filter wards based on selected province
  const filteredWards = useMemo(() => {
    if (!selectedProvinceId || !wardsData || !Array.isArray(wardsData)) return []
    const filtered = wardsData.filter(ward => ward.province_id === selectedProvinceId)
    return filtered
  }, [selectedProvinceId])

  useEffect(() => {
    loadProfile()
  }, [])

  const loadProfile = async () => {
    try {
      setLoadingData(true)
      
      // Check authentication first
      if (!isAuthenticated()) {
        navigate(ROUTES.LOGIN)
        return
      }

      const response = await profileService.get()
      const data = response.data
      setProfile(data)
      // Find province ID from city name
      const province = provincesData.find(p => p.name === data.city)
      const provinceId = province?.id || ''
      setSelectedProvinceId(provinceId)

      // Find ward ID from state name - only if we have a province selected
      let wardId = ''
      if (data.state && provinceId) {
        // Filter wards by province first, then find by name
        const provinceWards = wardsData.filter(w => w.province_id === provinceId)
        const ward = provinceWards.find(w => w.name === data.state)
        wardId = ward?.id || ''
      }
      setSelectedWardId(wardId)

      setForm({
        fullName: data.fullName || '',
        email: data.email || '',
        address: data.address || '',
        city: data.city || '',
        state: data.state || '',
        mobileNumber: data.mobileNumber || '',
        dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth).toISOString().split('T')[0] : '',
        gender: data.gender || '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      })
      if (data.avatarUrl) {
        if (data.avatarUrl.startsWith('http')) {
          setAvatarPreview(data.avatarUrl)
        } else {
          setAvatarPreview(`${API_BASE_URL.replace('/api', '')}${data.avatarUrl}`)
        }
      }
    } catch (error) {
      console.error('Error loading profile:', error)
      
      // If 401 Unauthorized, redirect to login
      if (error.response?.status === 401) {
        if (window.showToast) {
          window.showToast({
            severity: 'error',
            summary: 'Unauthorized',
            detail: 'Please login to update your profile',
            life: 3000
          })
        }
        navigate(ROUTES.LOGIN)
        return
      }

      if (window.showToast) {
        window.showToast({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load profile',
          life: 4000
        })
      }
      navigate(ROUTES.PROFILE)
    } finally {
      setLoadingData(false)
    }
  }

  const validateForm = () => {
    const newErrors = {}
    if (form.newPassword) {
      if (form.newPassword.length < 6) {
        newErrors.newPassword = 'Password must be at least 6 characters'
      }
      if (form.newPassword !== form.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match'
      }
      if (!form.currentPassword) {
        newErrors.currentPassword = 'Current password is required to change password'
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
        fullName: form.fullName,        
        gender: form.gender || null,
        address: form.address || null,
        city: form.city || null,
        state: form.state || null,
        mobileNumber: form.mobileNumber || null,
        dateOfBirth: form.dateOfBirth ? new Date(form.dateOfBirth) : null
      }

      if (form.newPassword && form.currentPassword) {
        updateData.currentPassword = form.currentPassword
        updateData.newPassword = form.newPassword
      }

      console.log('Sending update request:', updateData)
      const response = await profileService.update(updateData)
      console.log('Update response:', response)
      console.log('Update response data:', response.data)
      console.log('Update response data - FullName:', response.data?.fullName)
      console.log('Update response data - Gender:', response.data?.gender)
      console.log('Update response data - City:', response.data?.city)
      console.log('Update response data - State:', response.data?.state)

      if (avatar) {
        await profileService.uploadAvatar(avatar)
      }

      if (window.showToast) {
        window.showToast({
          severity: 'success',
          summary: 'Success',
          detail: 'Profile updated successfully',
          life: 3000
        })
      }
      navigate(ROUTES.PROFILE)
    } catch (error) {
      console.error('Update profile error:', error)
      console.error('Error response:', error.response)
      const errorMessage = error.response?.data?.message || error.response?.data?.error || error.message || 'Failed to update profile'
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
    const { name, value } = e.target
    setForm(prev => ({
      ...prev,
      [name]: value
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

  const handleAvatarChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        if (window.showToast) {
          window.showToast({
            severity: 'error',
            summary: 'Error',
            detail: 'File size must be less than 5MB',
            life: 4000
          })
        }
        return
      }
      setAvatar(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setAvatarPreview(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const getAvatarUrl = () => {
    if (avatarPreview) {
      return avatarPreview
    }
    if (profile?.avatarUrl) {
      if (profile.avatarUrl.startsWith('http')) {
        return profile.avatarUrl
      }
      return `${API_BASE_URL.replace('/api', '')}${profile.avatarUrl}`
    }
    return 'https://ui-avatars.com/api/?name=' + encodeURIComponent(profile?.fullName || profile?.username || 'User') + '&background=random'
  }

  if (loadingData) {
    return (
      <div className="update-profile-page">
        <div className="container my-5">
          <div className="text-center">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="update-profile-page">
      <div className="container my-5">
        <div className="row justify-content-center">
          <div className="col-lg-8">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h1 className="display-6 fw-bold">
                <i className="bi bi-pencil-square me-2"></i>
                Update Profile
              </h1>
              <button
                className="btn btn-outline-secondary"
                onClick={() => navigate(ROUTES.PROFILE)}
              >
                <i className="bi bi-arrow-left me-2"></i>
                Back to Profile
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
                  <div className="text-center mb-4">
                    <div className="avatar-upload-container">
                      <img
                        src={getAvatarUrl()}
                        alt="Avatar"
                        className="avatar-preview"
                      />
                      <label htmlFor="avatar-upload" className="avatar-upload-label">
                        <i className="bi bi-camera"></i>
                        Change Avatar
                      </label>
                      <input
                        type="file"
                        id="avatar-upload"
                        accept="image/*"
                        onChange={handleAvatarChange}
                        className="d-none"
                      />
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
                      placeholder="Enter your full name"
                    />
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
                      readOnly
                      disabled
                      placeholder="Email"
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
                      placeholder="Enter your address"
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
                        placeholder="Enter your mobile number"
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
                  <h5 className="mb-3">Change Password (Optional)</h5>

                  <div className="mb-3">
                    <label htmlFor="currentPassword" className="form-label">
                      Current Password
                    </label>
                    <input
                      type="password"
                      className={`form-control ${errors.currentPassword ? 'is-invalid' : ''}`}
                      id="currentPassword"
                      name="currentPassword"
                      value={form.currentPassword}
                      onChange={handleChange}
                      placeholder="Enter current password"
                    />
                    {errors.currentPassword && (
                      <div className="invalid-feedback">{errors.currentPassword}</div>
                    )}
                  </div>

                  <div className="mb-3">
                    <label htmlFor="newPassword" className="form-label">
                      New Password
                    </label>
                    <input
                      type="password"
                      className={`form-control ${errors.newPassword ? 'is-invalid' : ''}`}
                      id="newPassword"
                      name="newPassword"
                      value={form.newPassword}
                      onChange={handleChange}
                      placeholder="Enter new password"
                    />
                    {errors.newPassword && (
                      <div className="invalid-feedback">{errors.newPassword}</div>
                    )}
                  </div>

                  <div className="mb-4">
                    <label htmlFor="confirmPassword" className="form-label">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      className={`form-control ${errors.confirmPassword ? 'is-invalid' : ''}`}
                      id="confirmPassword"
                      name="confirmPassword"
                      value={form.confirmPassword}
                      onChange={handleChange}
                      placeholder="Confirm new password"
                    />
                    {errors.confirmPassword && (
                      <div className="invalid-feedback">{errors.confirmPassword}</div>
                    )}
                  </div>

                  <div className="d-grid gap-2 d-md-flex justify-content-md-end">
                    <button
                      type="button"
                      className="btn btn-outline-secondary"
                      onClick={() => navigate(ROUTES.PROFILE)}
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
                          Updating...
                        </>
                      ) : (
                        <>
                          <i className="bi bi-check-lg me-2"></i>
                          Update Profile
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

export default UpdateProfile

