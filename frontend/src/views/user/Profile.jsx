import React, { useState, useEffect } from 'react'
import { Container, Card, Button, Row, Col, Spinner, Modal, Form } from 'react-bootstrap'
import { useNavigate } from 'react-router-dom'
import { profileService } from '../../common/services'
import { ROUTES } from '../../common/constants'
import { logout } from '../../common/utils'
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
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deletePassword, setDeletePassword] = useState('')
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState('')

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
      if (profile.avatarUrl.startsWith('http://') || profile.avatarUrl.startsWith('https://')) {
        return profile.avatarUrl
      }
      const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:5000'
      const avatarPath = profile.avatarUrl.startsWith('/') ? profile.avatarUrl : `/${profile.avatarUrl}`
      return `${apiBase}${avatarPath}`
    }
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.fullName || profile.username || 'User')}&background=111&color=fff&size=128`
  }

  const formatDate = (dateString) => {
    if (!dateString) return null
    const date = new Date(dateString)
    if (isNaN(date.getTime())) return null
    return date.toLocaleDateString('en-US')
  }

  const formatGender = (value) => {
    if (!value) return null
    const normalized = String(value).toLowerCase()
    if (normalized === 'nam' || normalized === 'male') return 'Male'
    if (normalized === 'nữ' || normalized === 'nu' || normalized === 'female') return 'Female'
    if (normalized === 'khac' || normalized === 'other') return 'Other'
    return value
  }

  const displayValue = (value) => {
    return value || 'Not provided'
  }

  const handleDeleteAccount = async () => {
    if (!deletePassword.trim()) {
      setDeleteError('Please enter your password.')
      return
    }
    setDeleting(true)
    setDeleteError('')
    try {
      await profileService.deleteAccount(deletePassword)
      setShowDeleteModal(false)
      setDeletePassword('')
      if (window.showToast) {
        window.showToast({ severity: 'success', summary: 'Account deleted', detail: 'Your account has been deleted.', life: 3000 })
      }
      logout()
      navigate(ROUTES.LOGIN, { replace: true })
    } catch (err) {
      const msg = err?.response?.data?.message || 'Could not delete account. Check your password.'
      setDeleteError(msg)
      if (window.showToast) {
        window.showToast({ severity: 'error', summary: 'Error', detail: msg, life: 4000 })
      }
    } finally {
      setDeleting(false)
    }
  }

  const closeDeleteModal = () => {
    setShowDeleteModal(false)
    setDeletePassword('')
    setDeleteError('')
  }

  if (loading) {
    return (
      <Container className="py-5">
        <div className="text-center py-5">
          <Spinner animation="border" variant="dark" />
          <p className="mt-3 text-muted">Loading profile...</p>
        </div>
      </Container>
    )
  }

  return (
    <div className="profile-page">
      <Container className="profile-container">
        <Card className="profile-card">
          <div className="profile-header-accent"></div>
          
          <div className="profile-avatar-section">
            <div className="profile-avatar-wrapper">
              <img
                src={getAvatarUrl()}
                alt="Avatar"
                className="profile-avatar"
              />
            </div>
            <h1 className="profile-name">{profile.fullName || profile.username}</h1>
            <p className="profile-username">@{profile.username}</p>
          </div>

          <div className="profile-content">
            <div className="info-grid">
              <div className="info-item">
                <span className="info-label"><i className="bi bi-envelope"></i> Email</span>
                <span className="info-value">{profile.email}</span>
              </div>
              
              <div className="info-item">
                <span className="info-label"><i className="bi bi-gender-ambiguous"></i> Gender</span>
                <span className="info-value">{displayValue(formatGender(profile.gender))}</span>
              </div>

              <div className="info-item">
                <span className="info-label"><i className="bi bi-calendar-event"></i> Date of Birth</span>
                <span className="info-value">{displayValue(formatDate(profile.dateOfBirth))}</span>
              </div>

              <div className="info-item">
                <span className="info-label"><i className="bi bi-telephone"></i> Phone</span>
                <span className="info-value">{displayValue(profile.phone)}</span>
              </div>

              <div className="info-item">
                <span className="info-label"><i className="bi bi-geo-alt"></i> Address</span>
                <span className="info-value">{displayValue(profile.address)}</span>
              </div>

              <div className="info-item">
                <span className="info-label"><i className="bi bi-calendar-check"></i> Member Since</span>
                <span className="info-value">{formatDate(profile.createdAt)}</span>
              </div>
            </div>

            <div className="profile-actions d-flex gap-3">
              <Button
                className="btn-edit-profile"
                onClick={() => navigate(ROUTES.EDIT_PROFILE)}
              >
                Edit Profile
              </Button>
              <Button
                variant="outline-dark"
                className="btn-address"
                onClick={() => navigate(ROUTES.ADDRESSES)}
              >
                Address
              </Button>
            </div>

            <hr className="my-4" />
            <div className="profile-danger-zone">
              <h6 className="text-danger mb-2"><i className="bi bi-exclamation-triangle me-1"></i> Danger zone</h6>
              <p className="text-muted small mb-2">Deleting your account will permanently remove your data. This action cannot be undone.</p>
              <Button variant="outline-danger" size="sm" onClick={() => setShowDeleteModal(true)}>
                <i className="bi bi-trash me-1"></i> Delete account
              </Button>
            </div>
          </div>
        </Card>
      </Container>

      <Modal show={showDeleteModal} onHide={closeDeleteModal} centered>
        <Modal.Header closeButton>
          <Modal.Title className="text-danger">Delete account</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p className="text-muted small">To delete your account, please enter your password to confirm.</p>
          <Form.Group className="mb-2">
            <Form.Label>Password</Form.Label>
            <Form.Control
              type="password"
              value={deletePassword}
              onChange={(e) => setDeletePassword(e.target.value)}
              placeholder="Enter password"
              isInvalid={!!deleteError}
            />
            {deleteError && <Form.Control.Feedback type="invalid">{deleteError}</Form.Control.Feedback>}
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={closeDeleteModal} disabled={deleting}>Cancel</Button>
          <Button variant="danger" onClick={handleDeleteAccount} disabled={deleting}>
            {deleting ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                Deleting...
              </>
            ) : (
              'Delete account'
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  )
}

export default Profile
