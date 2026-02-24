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
          </div>
        </Card>
      </Container>
    </div>
  )
}

export default Profile
