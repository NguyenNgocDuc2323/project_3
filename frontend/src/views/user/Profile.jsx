import React, { useState, useEffect } from 'react'
import { Container, Card, Form, Button, Row, Col, Alert, Spinner } from 'react-bootstrap'
import { profileService } from '../../common/services'
import './Profile.css'

const Profile = () => {
  const showToast = (message, severity = 'info') => {
    if (window.showToast) {
      window.showToast({
        severity,
        summary: severity === 'success' ? 'Thành công' : severity === 'error' ? 'Lỗi' : 'Thông báo',
        detail: message
      })
    }
  }
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [profile, setProfile] = useState({
    id: null,
    username: '',
    email: '',
    fullName: '',
    avatarUrl: null,
    gender: null,
    address: null,
    phone: null,
    dateOfBirth: null,
    createdAt: null,
    updatedAt: null
  })
  const [formData, setFormData] = useState({
    fullName: '',
    gender: '',
    address: '',
    phone: '',
    dateOfBirth: ''
  })
  const [errors, setErrors] = useState({})

  useEffect(() => {
    loadProfile()
  }, [])

  const loadProfile = async () => {
    try {
      setLoading(true)
      const response = await profileService.get()
      const data = response.data
      setProfile(data)
      
      // Format date for input field (YYYY-MM-DD)
      const formatDateForInput = (dateString) => {
        if (!dateString) return ''
        const date = new Date(dateString)
        if (isNaN(date.getTime())) return ''
        return date.toISOString().split('T')[0]
      }
      
      setFormData({
        fullName: data.fullName || '',
        gender: data.gender || '',
        address: data.address || '',
        phone: data.phone || '',
        dateOfBirth: formatDateForInput(data.dateOfBirth)
      })
    } catch (error) {
      console.error('Error loading profile:', error)
      showToast(error.response?.data?.message || 'Không thể tải thông tin profile', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null
      }))
    }
  }

  const validateForm = () => {
    const newErrors = {}
    
    if (formData.fullName && formData.fullName.length > 100) {
      newErrors.fullName = 'Họ tên không được vượt quá 100 ký tự'
    }

    if (formData.gender && formData.gender.length > 20) {
      newErrors.gender = 'Giới tính không được vượt quá 20 ký tự'
    }

    if (formData.address && formData.address.length > 500) {
      newErrors.address = 'Địa chỉ không được vượt quá 500 ký tự'
    }

    if (formData.phone && formData.phone.length > 20) {
      newErrors.phone = 'Số điện thoại không được vượt quá 20 ký tự'
    }

    if (formData.dateOfBirth) {
      const dateOfBirth = new Date(formData.dateOfBirth)
      if (dateOfBirth > new Date()) {
        newErrors.dateOfBirth = 'Ngày sinh không thể là ngày trong tương lai'
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

    try {
      setSaving(true)
      
      // Prepare data for API (convert empty strings to null, format date)
      const updateData = {
        fullName: formData.fullName || null,
        gender: formData.gender || null,
        address: formData.address || null,
        phone: formData.phone || null,
        dateOfBirth: formData.dateOfBirth ? new Date(formData.dateOfBirth).toISOString() : null
      }
      
      const response = await profileService.update(updateData)
      const updatedProfile = response.data
      setProfile(updatedProfile)
      
      // Update formData with formatted date
      const formatDateForInput = (dateString) => {
        if (!dateString) return ''
        const date = new Date(dateString)
        if (isNaN(date.getTime())) return ''
        return date.toISOString().split('T')[0]
      }
      
      setFormData({
        fullName: updatedProfile.fullName || '',
        gender: updatedProfile.gender || '',
        address: updatedProfile.address || '',
        phone: updatedProfile.phone || '',
        dateOfBirth: formatDateForInput(updatedProfile.dateOfBirth)
      })
      
      showToast('Cập nhật profile thành công!', 'success')
    } catch (error) {
      console.error('Error updating profile:', error)
      showToast(error.response?.data?.message || 'Có lỗi xảy ra khi cập nhật profile', 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      showToast('Chỉ chấp nhận file ảnh (jpg, png, gif, webp)', 'error')
      return
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      showToast('Kích thước file không được vượt quá 5MB', 'error')
      return
    }

    try {
      setUploading(true)
      const response = await profileService.uploadAvatar(file)
      const updatedProfile = response.data
      setProfile(updatedProfile)
      showToast('Upload avatar thành công!', 'success')
    } catch (error) {
      console.error('Error uploading avatar:', error)
      showToast(error.response?.data?.message || 'Có lỗi xảy ra khi upload avatar', 'error')
    } finally {
      setUploading(false)
      // Reset file input
      e.target.value = ''
    }
  }

  const getAvatarUrl = () => {
    if (profile.avatarUrl) {
      // If it's already a full URL (http/https), use it directly
      if (profile.avatarUrl.startsWith('http://') || profile.avatarUrl.startsWith('https://')) {
        return profile.avatarUrl
      }
      // For relative paths, prepend API base URL
      const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:5000'
      const avatarPath = profile.avatarUrl.startsWith('/') ? profile.avatarUrl : `/${profile.avatarUrl}`
      return `${apiBase}${avatarPath}`
    }
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.fullName || profile.username || 'User')}&background=random`
  }

  if (loading) {
    return (
      <Container className="py-5">
        <div className="text-center">
          <Spinner animation="border" variant="primary" />
          <p className="mt-3 text-muted">Đang tải thông tin...</p>
        </div>
      </Container>
    )
  }

  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col md={8} lg={6}>
          <Card className="shadow-sm">
            <Card.Header className="bg-primary text-white">
              <h4 className="mb-0">
                <i className="bi bi-person-circle me-2"></i>
                Thông tin Profile
              </h4>
            </Card.Header>
            <Card.Body className="p-4">
              {/* Avatar Section */}
              <div className="text-center mb-4">
                <div className="profile-avatar-wrapper mb-3">
                  <img
                    src={getAvatarUrl()}
                    alt="Avatar"
                    className="profile-avatar"
                  />
                  {uploading && (
                    <div className="avatar-overlay">
                      <Spinner animation="border" variant="light" size="sm" />
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
                  <label htmlFor="avatar-input">
                    <Button
                      variant="outline-primary"
                      size="sm"
                      as="span"
                      disabled={uploading}
                    >
                      <i className="bi bi-camera me-2"></i>
                      {uploading ? 'Đang upload...' : 'Thay đổi avatar'}
                    </Button>
                  </label>
                </div>
                <p className="text-muted small mt-2 mb-0">
                  Chấp nhận: JPG, PNG, GIF, WEBP (tối đa 5MB)
                </p>
              </div>

              <hr />

              {/* Profile Form */}
              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label>
                    <i className="bi bi-person me-2"></i>
                    Username
                  </Form.Label>
                  <Form.Control
                    type="text"
                    value={profile.username}
                    disabled
                    className="bg-light"
                  />
                  <Form.Text className="text-muted">
                    Username không thể thay đổi
                  </Form.Text>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>
                    <i className="bi bi-envelope me-2"></i>
                    Email
                  </Form.Label>
                  <Form.Control
                    type="email"
                    value={profile.email}
                    disabled
                    className="bg-light"
                  />
                  <Form.Text className="text-muted">
                    Email không thể thay đổi
                  </Form.Text>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>
                    <i className="bi bi-card-text me-2"></i>
                    Họ và tên
                  </Form.Label>
                  <Form.Control
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    isInvalid={!!errors.fullName}
                    placeholder="Nhập họ và tên"
                    maxLength={100}
                  />
                  {errors.fullName && (
                    <Form.Control.Feedback type="invalid">
                      {errors.fullName}
                    </Form.Control.Feedback>
                  )}
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>
                    <i className="bi bi-gender-ambiguous me-2"></i>
                    Giới tính
                  </Form.Label>
                  <Form.Select
                    name="gender"
                    value={formData.gender}
                    onChange={handleInputChange}
                    isInvalid={!!errors.gender}
                  >
                    <option value="">Chọn giới tính</option>
                    <option value="Nam">Nam</option>
                    <option value="Nữ">Nữ</option>
                    <option value="Khác">Khác</option>
                  </Form.Select>
                  {errors.gender && (
                    <Form.Control.Feedback type="invalid">
                      {errors.gender}
                    </Form.Control.Feedback>
                  )}
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>
                    <i className="bi bi-calendar-event me-2"></i>
                    Ngày sinh
                  </Form.Label>
                  <Form.Control
                    type="date"
                    name="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={handleInputChange}
                    isInvalid={!!errors.dateOfBirth}
                  />
                  {errors.dateOfBirth && (
                    <Form.Control.Feedback type="invalid">
                      {errors.dateOfBirth}
                    </Form.Control.Feedback>
                  )}
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>
                    <i className="bi bi-telephone me-2"></i>
                    Số điện thoại
                  </Form.Label>
                  <Form.Control
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    isInvalid={!!errors.phone}
                    placeholder="Nhập số điện thoại"
                    maxLength={20}
                  />
                  {errors.phone && (
                    <Form.Control.Feedback type="invalid">
                      {errors.phone}
                    </Form.Control.Feedback>
                  )}
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>
                    <i className="bi bi-geo-alt me-2"></i>
                    Địa chỉ
                  </Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    isInvalid={!!errors.address}
                    placeholder="Nhập địa chỉ"
                    maxLength={500}
                  />
                  {errors.address && (
                    <Form.Control.Feedback type="invalid">
                      {errors.address}
                    </Form.Control.Feedback>
                  )}
                </Form.Group>

                {profile.createdAt && (
                  <div className="mb-3">
                    <small className="text-muted">
                      <i className="bi bi-calendar me-1"></i>
                      Tham gia: {new Date(profile.createdAt).toLocaleDateString('vi-VN')}
                    </small>
                  </div>
                )}

                <div className="d-grid gap-2">
                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    disabled={saving}
                  >
                    {saving ? (
                      <>
                        <Spinner
                          animation="border"
                          size="sm"
                          className="me-2"
                        />
                        Đang lưu...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-check-circle me-2"></i>
                        Cập nhật Profile
                      </>
                    )}
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  )
}

export default Profile

