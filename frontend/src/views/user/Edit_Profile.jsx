import React, { useState, useEffect } from 'react'
import { Container, Row, Col, Card, Form, Button, Alert, Spinner } from 'react-bootstrap'
import { useNavigate } from 'react-router-dom'
import { profileService } from '../../common/services'
import { showToast } from '../../common/utils'
import { ROUTES } from '../../common/constants'
import provincesData from '../../data/provinces.json'
import wardsData from '../../data/wards.json'
import './Profile.css'

const EditProfile = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [provinces, setProvinces] = useState([])
  const [wards, setWards] = useState([])
  const [selectedProvinceId, setSelectedProvinceId] = useState('')
  const [profile, setProfile] = useState({
    username: '',
    email: '',
    fullName: '',
    address: '',
    city: '',
    state: '',
    mobileNumber: '',
    dateOfBirth: '',
    avatarUrl: ''
  })
  const [errors, setErrors] = useState({})

  useEffect(() => {
    // Load provinces data and sort by name
    const sortedProvinces = [...provincesData].sort((a, b) => a.name.localeCompare(b.name, 'vi'))
    setProvinces(sortedProvinces)
    loadProfile()
  }, [])

  // Filter wards when province changes
  useEffect(() => {
    if (selectedProvinceId) {
      const filteredWards = wardsData
        .filter(ward => ward.province_id === selectedProvinceId)
        .sort((a, b) => a.name.localeCompare(b.name, 'vi'))
      setWards(filteredWards)
    } else {
      setWards([])
    }
  }, [selectedProvinceId])

  const loadProfile = async () => {
    try {
      setLoading(true)
      const response = await profileService.getProfile()
      const data = response.data
      
      // Tìm province_id từ state name nếu có
      let provinceId = ''
      if (data.state) {
        const province = provincesData.find(p => p.name === data.state)
        if (province) {
          provinceId = province.id
        }
      }

      setProfile({
        username: data.username || '',
        email: data.email || '',
        fullName: data.fullName || '',
        address: data.address || '',
        city: data.city || '',
        state: data.state || '',
        mobileNumber: data.mobileNumber || '',
        dateOfBirth: data.dateOfBirth ? data.dateOfBirth.split('T')[0] : '',
        avatarUrl: data.avatarUrl || ''
      })

      // Set selected province để load wards
      if (provinceId) {
        setSelectedProvinceId(provinceId)
      }
    } catch (error) {
      console.error('Error loading profile:', error)
      showToast('Không thể tải thông tin profile', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setProfile(prev => ({
      ...prev,
      [name]: value
    }))
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null
      }))
    }
  }

  const handleProvinceChange = (e) => {
    const provinceId = e.target.value
    const selectedProvince = provincesData.find(p => p.id === provinceId)
    
    setSelectedProvinceId(provinceId)
    
    // Update state field with province name
    setProfile(prev => ({
      ...prev,
      state: selectedProvince ? selectedProvince.name : '',
      city: '' // Reset city when province changes
    }))
  }

  const handleWardChange = (e) => {
    const wardName = e.target.value
    setProfile(prev => ({
      ...prev,
      city: wardName
    }))
  }

  const validate = () => {
    const newErrors = {}
    
    if (profile.mobileNumber && !/^[0-9]{10,15}$/.test(profile.mobileNumber)) {
      newErrors.mobileNumber = 'Số điện thoại không hợp lệ'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validate()) {
      return
    }

    try {
      setSaving(true)
      const updateData = {
        fullName: profile.fullName || null,
        address: profile.address || null,
        city: profile.city || null,
        state: profile.state || null,
        mobileNumber: profile.mobileNumber || null,
        dateOfBirth: profile.dateOfBirth || null
      }

      const response = await profileService.updateProfile(updateData)
      showToast('Cập nhật profile thành công!', 'success')
      
      // Update profile with response
      if (response.data) {
        setProfile(prev => ({
          ...prev,
          ...response.data,
          dateOfBirth: response.data.dateOfBirth ? response.data.dateOfBirth.split('T')[0] : ''
        }))
      }
      
      // Redirect to profile view page after successful update
      setTimeout(() => {
        navigate(ROUTES.PROFILE)
      }, 1000)
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
      
      if (response.data?.avatarUrl) {
        setProfile(prev => ({
          ...prev,
          avatarUrl: response.data.avatarUrl
        }))
        showToast('Upload avatar thành công!', 'success')
      }
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
      // For relative paths, always prepend API base URL to get absolute URL
      // This ensures the request goes directly to backend, not through Vite proxy
      const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:5000'
      // Ensure the path starts with /
      const avatarPath = profile.avatarUrl.startsWith('/') ? profile.avatarUrl : `/${profile.avatarUrl}`
      return `${apiBase}${avatarPath}`
    }
    return 'https://ui-avatars.com/api/?name=' + encodeURIComponent(profile.fullName || profile.username) + '&background=random'
  }

  if (loading) {
    return (
      <Container className="py-5">
        <div className="text-center">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Đang tải...</span>
          </Spinner>
        </div>
      </Container>
    )
  }

  return (
    <Container className="py-5">
      <Row>
        <Col md={8} className="mx-auto">
          <Card className="shadow-sm">
            <Card.Header className="bg-primary text-white d-flex justify-content-between align-items-center">
              <h3 className="mb-0">
                <i className="bi bi-pencil-square me-2"></i>
                Chỉnh sửa thông tin cá nhân
              </h3>
            </Card.Header>
            <Card.Body className="p-4">
              {/* Avatar Section */}
              <div className="text-center mb-4">
                <div className="avatar-container position-relative d-inline-block">
                  <img
                    src={getAvatarUrl()}
                    alt="Avatar"
                    className="avatar-image rounded-circle border border-3 border-primary"
                  />
                  <label className="avatar-upload-btn position-absolute bottom-0 end-0">
                    <i className="bi bi-camera-fill"></i>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarChange}
                      style={{ display: 'none' }}
                      disabled={uploading}
                    />
                  </label>
                  {uploading && (
                    <div className="position-absolute top-50 start-50 translate-middle">
                      <Spinner animation="border" size="sm" variant="primary" />
                    </div>
                  )}
                </div>
                <p className="text-muted mt-2 mb-0">Nhấn vào biểu tượng camera để đổi avatar</p>
              </div>

              <Form onSubmit={handleSubmit}>
                <Row>
                  <Col md={6} className="mb-3">
                    <Form.Group>
                      <Form.Label>Tên đăng nhập</Form.Label>
                      <Form.Control
                        type="text"
                        value={profile.username}
                        disabled
                        className="bg-light"
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6} className="mb-3">
                    <Form.Group>
                      <Form.Label>Email</Form.Label>
                      <Form.Control
                        type="email"
                        value={profile.email}
                        disabled
                        className="bg-light"
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Row>
                  <Col md={6} className="mb-3">
                    <Form.Group>
                      <Form.Label>Họ và tên</Form.Label>
                      <Form.Control
                        type="text"
                        name="fullName"
                        value={profile.fullName}
                        onChange={handleChange}
                        placeholder="Nhập họ và tên"
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6} className="mb-3">
                    <Form.Group>
                      <Form.Label>Số điện thoại</Form.Label>
                      <Form.Control
                        type="tel"
                        name="mobileNumber"
                        value={profile.mobileNumber}
                        onChange={handleChange}
                        placeholder="Nhập số điện thoại"
                        isInvalid={!!errors.mobileNumber}
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.mobileNumber}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                </Row>

                <Row>
                  <Col className="mb-3">
                    <Form.Group>
                      <Form.Label>Địa chỉ</Form.Label>
                      <Form.Control
                        type="text"
                        name="address"
                        value={profile.address}
                        onChange={handleChange}
                        placeholder="Nhập địa chỉ"
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Row>
                  <Col md={6} className="mb-3">
                    <Form.Group>
                      <Form.Label>Tỉnh/Thành phố <span className="text-danger">*</span></Form.Label>
                      <Form.Select
                        name="state"
                        value={selectedProvinceId}
                        onChange={handleProvinceChange}
                        required
                      >
                        <option value="">-- Chọn Tỉnh/Thành phố --</option>
                        {provinces.map((province) => (
                          <option key={province.id} value={province.id}>
                            {province.name}
                          </option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col md={6} className="mb-3">
                    <Form.Group>
                      <Form.Label>Phường/Xã</Form.Label>
                      <Form.Select
                        name="city"
                        value={profile.city}
                        onChange={handleWardChange}
                        disabled={!selectedProvinceId}
                      >
                        <option value="">-- Chọn Phường/Xã --</option>
                        {wards.map((ward) => (
                          <option key={ward.id} value={ward.name}>
                            {ward.name}
                          </option>
                        ))}
                      </Form.Select>
                      {!selectedProvinceId && (
                        <Form.Text className="text-muted">
                          Vui lòng chọn Tỉnh/Thành phố trước
                        </Form.Text>
                      )}
                    </Form.Group>
                  </Col>
                </Row>

                <Row>
                  <Col md={6} className="mb-3">
                    <Form.Group>
                      <Form.Label>Ngày sinh</Form.Label>
                      <Form.Control
                        type="date"
                        name="dateOfBirth"
                        value={profile.dateOfBirth}
                        onChange={handleChange}
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <div className="d-flex gap-2 mt-4">
                  <Button
                    variant="outline-secondary"
                    size="lg"
                    onClick={() => navigate(ROUTES.PROFILE)}
                    disabled={saving}
                    className="flex-fill"
                  >
                    <i className="bi bi-x-circle me-2"></i>
                    Quay lại
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    disabled={saving}
                    className="flex-fill"
                  >
                    {saving ? (
                      <>
                        <Spinner animation="border" size="sm" className="me-2" />
                        Đang lưu...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-save me-2"></i>
                        Lưu thay đổi
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

export default EditProfile

