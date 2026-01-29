import React, { useState, useEffect } from 'react'
import { Container, Row, Col, Card, Button, Spinner, Badge } from 'react-bootstrap'
import { useNavigate } from 'react-router-dom'
import { profileService } from '../../common/services'
import { showToast } from '../../common/utils'
import { ROUTES } from '../../common/constants'
import './Profile.css'

const Profile = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
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

  useEffect(() => {
    loadProfile()
  }, [])

  const loadProfile = async () => {
    try {
      setLoading(true)
      const response = await profileService.getProfile()
      const data = response.data
      
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
    } catch (error) {
      console.error('Error loading profile:', error)
      showToast('Không thể tải thông tin profile', 'error')
    } finally {
      setLoading(false)
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

  const formatDate = (dateString) => {
    if (!dateString) return 'Chưa cập nhật'
    const date = new Date(dateString)
    return date.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
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
                <i className="bi bi-person-circle me-2"></i>
                Thông tin cá nhân
              </h3>
            </Card.Header>
            <Card.Body className="p-4">
              {/* Avatar Section */}
              <div className="text-center mb-4">
                <img
                  src={getAvatarUrl()}
                  alt="Avatar"
                  className="avatar-image rounded-circle border border-3 border-primary"
                  style={{ width: '150px', height: '150px', objectFit: 'cover' }}
                  onError={(e) => {
                    // Fallback to default avatar if image fails to load
                    e.target.src = 'https://ui-avatars.com/api/?name=' + encodeURIComponent(profile.fullName || profile.username) + '&background=random'
                  }}
                />
                <h4 className="mt-3 mb-1">{profile.fullName || profile.username}</h4>
                <p className="text-muted mb-0">{profile.email}</p>
              </div>

              <hr />

              {/* Profile Information */}
              <Row className="mb-3">
                <Col md={4}>
                  <strong>
                    <i className="bi bi-person me-2 text-primary"></i>
                    Tên đăng nhập:
                  </strong>
                </Col>
                <Col md={8}>
                  <span>{profile.username || 'Chưa cập nhật'}</span>
                </Col>
              </Row>

              <Row className="mb-3">
                <Col md={4}>
                  <strong>
                    <i className="bi bi-envelope me-2 text-primary"></i>
                    Email:
                  </strong>
                </Col>
                <Col md={8}>
                  <span>{profile.email || 'Chưa cập nhật'}</span>
                </Col>
              </Row>

              <Row className="mb-3">
                <Col md={4}>
                  <strong>
                    <i className="bi bi-person-badge me-2 text-primary"></i>
                    Họ và tên:
                  </strong>
                </Col>
                <Col md={8}>
                  <span>{profile.fullName || 'Chưa cập nhật'}</span>
                </Col>
              </Row>

              <Row className="mb-3">
                <Col md={4}>
                  <strong>
                    <i className="bi bi-telephone me-2 text-primary"></i>
                    Số điện thoại:
                  </strong>
                </Col>
                <Col md={8}>
                  <span>{profile.mobileNumber || 'Chưa cập nhật'}</span>
                </Col>
              </Row>

              <Row className="mb-3">
                <Col md={4}>
                  <strong>
                    <i className="bi bi-geo-alt me-2 text-primary"></i>
                    Địa chỉ:
                  </strong>
                </Col>
                <Col md={8}>
                  <span>{profile.address || 'Chưa cập nhật'}</span>
                </Col>
              </Row>

              <Row className="mb-3">
                <Col md={4}>
                  <strong>
                    <i className="bi bi-building me-2 text-primary"></i>
                    Phường/Xã:
                  </strong>
                </Col>
                <Col md={8}>
                  <span>{profile.city || 'Chưa cập nhật'}</span>
                </Col>
              </Row>

              <Row className="mb-3">
                <Col md={4}>
                  <strong>
                    <i className="bi bi-geo me-2 text-primary"></i>
                    Tỉnh/Thành phố:
                  </strong>
                </Col>
                <Col md={8}>
                  <span>{profile.state || 'Chưa cập nhật'}</span>
                </Col>
              </Row>

              <Row className="mb-3">
                <Col md={4}>
                  <strong>
                    <i className="bi bi-calendar-event me-2 text-primary"></i>
                    Ngày sinh:
                  </strong>
                </Col>
                <Col md={8}>
                  <span>{formatDate(profile.dateOfBirth)}</span>
                </Col>
              </Row>

              <div className="mt-4 text-center">
                <Button
                  variant="primary"
                  size="lg"
                  onClick={() => navigate(ROUTES.PROFILE_EDIT)}
                >
                  <i className="bi bi-pencil-square me-2"></i>
                  Cập nhật thông tin
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  )
}

export default Profile
