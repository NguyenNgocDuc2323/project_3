import React, { useState, useEffect } from 'react'
import { Container, Card, Button, Row, Col, Spinner } from 'react-bootstrap'
import { useNavigate } from 'react-router-dom'
import { profileService } from '../../common/services'
import { ROUTES } from '../../common/constants'
import './Profile.css'

const Profile = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState({
    id: null,
    username: '',
    email: '',
    fullName: null,
    avatarUrl: null,
    gender: null,
    address: null,
    phone: null,
    dateOfBirth: null,
    createdAt: null,
    updatedAt: null
  })

  useEffect(() => {
    loadProfile()
  }, [])

  const loadProfile = async () => {
    try {
      setLoading(true)
      const response = await profileService.get()
      const data = response.data
      setProfile(data)
    } catch (error) {
      console.error('Error loading profile:', error)
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
      // For relative paths, prepend API base URL
      const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:5000'
      const avatarPath = profile.avatarUrl.startsWith('/') ? profile.avatarUrl : `/${profile.avatarUrl}`
      return `${apiBase}${avatarPath}`
    }
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.fullName || profile.username || 'User')}&background=random`
  }

  const formatDate = (dateString) => {
    if (!dateString) return null
    const date = new Date(dateString)
    if (isNaN(date.getTime())) return null
    return date.toLocaleDateString('vi-VN')
  }

  const displayValue = (value) => {
    return value || 'Chưa cập nhật'
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
                </div>
              </div>

              <hr />

              {/* Profile Information */}
              <div className="profile-info">
                <Row className="mb-3">
                  <Col sm={4} className="text-muted">
                    <i className="bi bi-person me-2"></i>
                    Username:
                  </Col>
                  <Col sm={8}>
                    <strong>{profile.username}</strong>
                  </Col>
                </Row>

                <Row className="mb-3">
                  <Col sm={4} className="text-muted">
                    <i className="bi bi-envelope me-2"></i>
                    Email:
                  </Col>
                  <Col sm={8}>
                    <strong>{profile.email}</strong>
                  </Col>
                </Row>

                <Row className="mb-3">
                  <Col sm={4} className="text-muted">
                    <i className="bi bi-card-text me-2"></i>
                    Họ và tên:
                  </Col>
                  <Col sm={8}>
                    <strong>{displayValue(profile.fullName)}</strong>
                  </Col>
                </Row>

                <Row className="mb-3">
                  <Col sm={4} className="text-muted">
                    <i className="bi bi-gender-ambiguous me-2"></i>
                    Giới tính:
                  </Col>
                  <Col sm={8}>
                    <strong>{displayValue(profile.gender)}</strong>
                  </Col>
                </Row>

                <Row className="mb-3">
                  <Col sm={4} className="text-muted">
                    <i className="bi bi-calendar-event me-2"></i>
                    Ngày sinh:
                  </Col>
                  <Col sm={8}>
                    <strong>{displayValue(formatDate(profile.dateOfBirth))}</strong>
                  </Col>
                </Row>

                <Row className="mb-3">
                  <Col sm={4} className="text-muted">
                    <i className="bi bi-telephone me-2"></i>
                    Số điện thoại:
                  </Col>
                  <Col sm={8}>
                    <strong>{displayValue(profile.phone)}</strong>
                  </Col>
                </Row>

                <Row className="mb-3">
                  <Col sm={4} className="text-muted">
                    <i className="bi bi-geo-alt me-2"></i>
                    Địa chỉ:
                  </Col>
                  <Col sm={8}>
                    <strong>{displayValue(profile.address)}</strong>
                  </Col>
                </Row>

                {profile.createdAt && (
                  <Row className="mb-3">
                    <Col sm={4} className="text-muted">
                      <i className="bi bi-calendar me-2"></i>
                      Tham gia:
                    </Col>
                    <Col sm={8}>
                      <strong>{formatDate(profile.createdAt)}</strong>
                    </Col>
                  </Row>
                )}
              </div>

              <hr />

              <div className="d-grid gap-2">
                <Button
                  variant="primary"
                  size="lg"
                  onClick={() => navigate(ROUTES.EDIT_PROFILE)}
                >
                  <i className="bi bi-pencil-square me-2"></i>
                  Cập nhật Profile
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
