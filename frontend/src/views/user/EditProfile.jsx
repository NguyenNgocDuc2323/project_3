import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { profileService } from '../../common/services'
import { getCurrentUser, storageUtils } from '../../common/utils'
import { ROUTES } from '../../common/constants'
import './Profile.css'
import './EditProfile.css'

const EditProfile = () => {
  const navigate = useNavigate()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [changingPassword, setChangingPassword] = useState(false)
  const [provinces, setProvinces] = useState([])
  const [wards, setWards] = useState([])
  const [filteredWards, setFilteredWards] = useState([])
  const [selectedProvinceId, setSelectedProvinceId] = useState('')
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    gender: '',
    address: '',
    city: '',
    state: '',
    mobileNumber: '',
    dateOfBirth: ''
  })
  const [passwordData, setPasswordData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [errors, setErrors] = useState({})
  const [passwordErrors, setPasswordErrors] = useState({})
  const [preview, setPreview] = useState(null)

  useEffect(() => {
    loadProfile()
    loadProvincesAndWards()
  }, [])

  useEffect(() => {
    if (selectedProvinceId && wards.length > 0) {
      const filtered = wards.filter(ward => ward.province_id === selectedProvinceId)
      setFilteredWards(filtered)
      // Reset ward selection when province changes
      if (formData.state && !filtered.find(w => w.name === formData.state)) {
        setFormData(prev => ({ ...prev, state: '' }))
      }
    } else {
      setFilteredWards([])
    }
  }, [selectedProvinceId, wards])

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

  const loadProfile = async () => {
    try {
      setLoading(true)
      const response = await profileService.get()
      const profileData = response.data
      setProfile(profileData)
      setFormData({
        fullName: profileData.fullName || '',
        email: profileData.email || '',
        gender: profileData.gender || '',
        address: profileData.address || '',
        city: profileData.city || '',
        state: profileData.state || '',
        mobileNumber: profileData.mobileNumber || '',
        dateOfBirth: profileData.dateOfBirth ? profileData.dateOfBirth.split('T')[0] : ''
      })
      
      // Set selected province if city matches a province name (after provinces are loaded)
      if (profileData.city && provinces.length > 0) {
        const matchedProvince = provinces.find(p => p.name === profileData.city)
        if (matchedProvince) {
          setSelectedProvinceId(matchedProvince.id)
        }
      }
      
      if (profileData.avatarUrl) {
        let avatarUrl = profileData.avatarUrl
        if (!avatarUrl.startsWith('http')) {
          // Backend stores avatar URL as /uploads/avatars/filename.jpg
          // Static files are served from wwwroot, so URL should be http://localhost:5000/uploads/avatars/filename.jpg
          const avatarPath = avatarUrl.startsWith('/') ? avatarUrl : `/${avatarUrl}`
          avatarUrl = `http://localhost:5000${avatarPath}`
        }
        setPreview(avatarUrl)
      }
    } catch (error) {
      console.error('Error loading profile:', error)
      if (window.showToast) {
        window.showToast({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load profile',
          life: 4000
        })
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // Set selected province when provinces are loaded and profile has city
    if (provinces.length > 0 && profile?.city) {
      const matchedProvince = provinces.find(p => p.name === profile.city)
      if (matchedProvince && !selectedProvinceId) {
        setSelectedProvinceId(matchedProvince.id)
      }
    }
  }, [provinces, profile?.city])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const handleProvinceChange = (e) => {
    const provinceId = e.target.value
    setSelectedProvinceId(provinceId)
    const selectedProvince = provinces.find(p => p.id === provinceId)
    setFormData(prev => ({
      ...prev,
      city: selectedProvince ? selectedProvince.name : '',
      state: '' // Reset ward when province changes
    }))
  }

  const handleWardChange = (e) => {
    const wardName = e.target.value
    setFormData(prev => ({
      ...prev,
      state: wardName
    }))
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

  const validateForm = () => {
    const newErrors = {}
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const validatePasswordForm = () => {
    const newErrors = {}
    
    if (!passwordData.oldPassword || !passwordData.oldPassword.trim()) {
      newErrors.oldPassword = 'Old password is required'
    }

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

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    try {
      setSaving(true)
      // Prepare data for API - convert empty strings to null for optional fields
      const updateData = {
        fullName: formData.fullName || null,
        gender: formData.gender || null,
        address: formData.address || null,
        city: formData.city || null,
        state: formData.state || null,
        mobileNumber: formData.mobileNumber || null,
        dateOfBirth: formData.dateOfBirth ? new Date(formData.dateOfBirth).toISOString() : null
      }
      const response = await profileService.update(updateData)
      setProfile(response.data)
      
      // Update formData with response to sync date format
      setFormData(prev => ({
        ...prev,
        dateOfBirth: response.data.dateOfBirth ? response.data.dateOfBirth.split('T')[0] : ''
      }))
      
      // Update user in storage
      const currentUser = getCurrentUser()
      if (currentUser) {
        const updatedUser = {
          ...currentUser,
          fullName: response.data.fullName,
          avatarUrl: response.data.avatarUrl,
          gender: response.data.gender,
          address: response.data.address,
          city: response.data.city,
          state: response.data.state,
          mobileNumber: response.data.mobileNumber,
          dateOfBirth: response.data.dateOfBirth
        }
        storageUtils.set('user', updatedUser)
      }

      if (window.showToast) {
        window.showToast({
          severity: 'success',
          summary: 'Success',
          detail: 'Profile updated successfully',
          life: 3000
        })
      }
      
      // Navigate back to profile page
      navigate(ROUTES.PROFILE)
    } catch (error) {
      console.error('Error updating profile:', error)
      const errorMessage = error.response?.data?.message || 'Failed to update profile'
      if (window.showToast) {
        window.showToast({
          severity: 'error',
          summary: 'Error',
          detail: errorMessage,
          life: 4000
        })
      }
    } finally {
      setSaving(false)
    }
  }

  const handlePasswordSubmit = async (e) => {
    e.preventDefault()
    
    if (!validatePasswordForm()) {
      return
    }

    try {
      setChangingPassword(true)
      await profileService.changePassword(passwordData.oldPassword, passwordData.newPassword)
      
      // Reset password form
      setPasswordData({
        oldPassword: '',
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

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (!file) return

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      if (window.showToast) {
        window.showToast({
          severity: 'error',
          summary: 'Error',
          detail: 'Invalid file type. Please select an image file (jpg, png, gif, webp)',
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
          detail: 'File size exceeds 5MB limit',
          life: 4000
        })
      }
      return
    }

    // Create preview
    const reader = new FileReader()
    reader.onloadend = () => {
      setPreview(reader.result)
    }
    reader.readAsDataURL(file)

    // Upload file
    handleAvatarUpload(file)
  }

  const handleAvatarUpload = async (file) => {
    try {
      setUploading(true)
      const response = await profileService.uploadAvatar(file)
      setProfile(response.data)
      
      // Update user in storage
      const currentUser = getCurrentUser()
      if (currentUser) {
        const updatedUser = {
          ...currentUser,
          avatarUrl: response.data.avatarUrl
        }
        storageUtils.set('user', updatedUser)
      }

      if (window.showToast) {
        window.showToast({
          severity: 'success',
          summary: 'Success',
          detail: 'Avatar uploaded successfully',
          life: 3000
        })
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
      if (profile?.avatarUrl) {
        let avatarUrl = profile.avatarUrl
        if (!avatarUrl.startsWith('http')) {
          // Backend stores avatar URL as /uploads/avatars/filename.jpg
          // Static files are served from wwwroot, so URL should be http://localhost:5000/uploads/avatars/filename.jpg
          const avatarPath = avatarUrl.startsWith('/') ? avatarUrl : `/${avatarUrl}`
          avatarUrl = `http://localhost:5000${avatarPath}`
        }
        setPreview(avatarUrl)
      } else {
        setPreview(null)
      }
    } finally {
      setUploading(false)
    }
  }

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
    <div className="profile-page">
      <div className="container my-5">
        <div className="row justify-content-center">
          <div className="col-lg-8">
            <div className="card shadow-sm">
              <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center">
                <h2 className="card-title mb-0">
                  <i className="bi bi-pencil-square me-2"></i>
                  Edit Profile
                </h2>
                <button
                  className="btn btn-light btn-sm"
                  onClick={() => navigate(ROUTES.PROFILE)}
                >
                  <i className="bi bi-arrow-left me-2"></i>
                  Quay lại
                </button>
              </div>
              <div className="card-body p-4">
                {/* Avatar Section */}
                <div className="text-center mb-4">
                  <div className="avatar-upload-wrapper">
                    <div className="avatar-preview">
                      {preview ? (
                        <img src={preview} alt="Avatar" className="avatar-image" />
                      ) : (
                        <div className="avatar-placeholder">
                          <i className="bi bi-person-circle"></i>
                        </div>
                      )}
                      {uploading && (
                        <div className="avatar-overlay">
                          <div className="spinner-border spinner-border-sm text-white" role="status">
                            <span className="visually-hidden">Uploading...</span>
                          </div>
                        </div>
                      )}
                    </div>
                    <label htmlFor="avatar-upload" className="btn btn-outline-primary mt-3">
                      <i className="bi bi-camera me-2"></i>
                      {uploading ? 'Uploading...' : 'Change Avatar'}
                    </label>
                    <input
                      type="file"
                      id="avatar-upload"
                      accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                      onChange={handleFileChange}
                      disabled={uploading}
                      style={{ display: 'none' }}
                    />
                  </div>
                </div>

                {/* Profile Form */}
                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label htmlFor="username" className="form-label">
                      <i className="bi bi-person me-2"></i>Username
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="username"
                      value={profile?.username || ''}
                      disabled
                    />
                    <small className="form-text text-muted">Username cannot be changed</small>
                  </div>

                  <div className="mb-3">
                    <label htmlFor="email" className="form-label">
                      <i className="bi bi-envelope me-2"></i>Email
                    </label>
                    <input
                      type="email"
                      className="form-control"
                      id="email"
                      name="email"
                      value={formData.email}
                      disabled
                    />
                    <small className="form-text text-muted">Email cannot be changed</small>
                  </div>

                  <div className="mb-3">
                    <label htmlFor="fullName" className="form-label">
                      <i className="bi bi-card-text me-2"></i>Full Name
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="fullName"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      placeholder="Enter your full name"
                    />
                  </div>

                  <div className="mb-3">
                    <label htmlFor="gender" className="form-label">
                      <i className="bi bi-gender-ambiguous me-2"></i>Gender
                    </label>
                    <select
                      className="form-control"
                      id="gender"
                      name="gender"
                      value={formData.gender}
                      onChange={handleInputChange}
                    >
                      <option value="">Select Gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div className="mb-3">
                    <label htmlFor="dateOfBirth" className="form-label">
                      <i className="bi bi-calendar-event me-2"></i>Date of Birth
                    </label>
                    <input
                      type="date"
                      className="form-control"
                      id="dateOfBirth"
                      name="dateOfBirth"
                      value={formData.dateOfBirth}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div className="mb-3">
                    <label htmlFor="mobileNumber" className="form-label">
                      <i className="bi bi-telephone me-2"></i>Mobile Number
                    </label>
                    <input
                      type="tel"
                      className="form-control"
                      id="mobileNumber"
                      name="mobileNumber"
                      value={formData.mobileNumber}
                      onChange={handleInputChange}
                      placeholder="Enter your mobile number"
                    />
                  </div>

                  <div className="mb-3">
                    <label htmlFor="address" className="form-label">
                      <i className="bi bi-geo-alt me-2"></i>Address
                    </label>
                    <textarea
                      className="form-control"
                      id="address"
                      name="address"
                      rows="3"
                      value={formData.address}
                      onChange={handleInputChange}
                      placeholder="Enter your address"
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
                        value={formData.state}
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

                  <div className="d-flex gap-2 mt-4">
                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={saving}
                    >
                      {saving ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                          Saving...
                        </>
                      ) : (
                        <>
                          <i className="bi bi-save me-2"></i>
                          Lưu thay đổi
                        </>
                      )}
                    </button>
                    <button
                      type="button"
                      className="btn btn-outline-secondary"
                      onClick={() => navigate(ROUTES.PROFILE)}
                      disabled={saving}
                    >
                      <i className="bi bi-x-circle me-2"></i>
                      Hủy
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
                        <label htmlFor="oldPassword" className="form-label">
                          <i className="bi bi-lock me-2"></i>Old Password <span className="text-danger">*</span>
                        </label>
                        <input
                          type="password"
                          className={`form-control ${passwordErrors.oldPassword ? 'is-invalid' : ''}`}
                          id="oldPassword"
                          name="oldPassword"
                          value={passwordData.oldPassword}
                          onChange={handlePasswordChange}
                          required
                        />
                        {passwordErrors.oldPassword && (
                          <div className="invalid-feedback">{passwordErrors.oldPassword}</div>
                        )}
                      </div>

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

export default EditProfile
