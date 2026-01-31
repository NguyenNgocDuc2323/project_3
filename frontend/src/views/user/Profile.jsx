import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { profileService } from '../../common/services'
import { ROUTES } from '../../common/constants'
import { API_BASE_URL } from '../../common/constants'
import { isAuthenticated } from '../../common/utils'
import './Profile.css'

const Profile = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadProfile()
  }, [location.key]) // Reload when location changes (e.g., navigating back from UpdateProfile)

  const loadProfile = async () => {
    try {
      setLoading(true)
      
      // Check authentication first
      if (!isAuthenticated()) {
        navigate(ROUTES.LOGIN)
        return
      }

      const response = await profileService.get()
      console.log('Profile loaded:', response.data)
      setProfile(response.data)
    } catch (error) {
      console.error('Error loading profile:', error)
      
      // If 401 Unauthorized, redirect to login
      if (error.response?.status === 401) {
        if (window.showToast) {
          window.showToast({
            severity: 'error',
            summary: 'Unauthorized',
            detail: 'Please login to view your profile',
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
    } finally {
      setLoading(false)
    }
  }

  const getAvatarUrl = () => {
    if (profile?.avatarUrl) {
      if (profile.avatarUrl.startsWith('http')) {
        return profile.avatarUrl
      }
      // Backend stores avatar URL as /uploads/avatars/filename.jpg
      // Static files are served from wwwroot, so URL should be http://localhost:5000/uploads/avatars/filename.jpg
      const avatarPath = profile.avatarUrl.startsWith('/') ? profile.avatarUrl : `/${profile.avatarUrl}`
      return `http://localhost:5000${avatarPath}`
    }
    return 'https://ui-avatars.com/api/?name=' + encodeURIComponent(profile?.fullName || profile?.username || 'User') + '&background=random'
  }

  if (loading) {
    return (
      <div className="profile-page">
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

  if (!profile) {
    return (
      <div className="profile-page">
        <div className="container my-5">
          <div className="alert alert-warning">Profile not found</div>
        </div>
      </div>
    )
  }

  return (
    <div className="profile-page">
      <div className="container my-5">
        <div className="row justify-content-center">
          <div className="col-lg-8">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h1 className="display-6 fw-bold">
                <i className="bi bi-person-circle me-2"></i>
                My Profile
              </h1>
              <button
                className="btn btn-primary"
                onClick={() => navigate(ROUTES.PROFILE_EDIT)}
              >
                <i className="bi bi-pencil me-2"></i>
                Edit Profile
              </button>
            </div>

            <div className="card shadow-sm">
              <div className="card-body p-4">
                <div className="row">
                  <div className="col-md-4 text-center mb-4 mb-md-0">
                    <div className="profile-avatar-container">
                      <img
                        src={getAvatarUrl()}
                        alt="Avatar"
                        className="profile-avatar"
                        onError={(e) => {
                          // Fallback to placeholder if image fails to load
                          e.target.src = 'https://ui-avatars.com/api/?name=' + encodeURIComponent(profile?.fullName || profile?.username || 'User') + '&background=random'
                        }}
                      />
                    </div>
                    <h4 className="mt-3 mb-0">{profile.fullName || profile.username}</h4>
                    <p className="text-muted">{profile.email}</p>
                    {profile.role === 1 && (
                      <span className="badge bg-danger">Admin</span>
                    )}
                  </div>
                  <div className="col-md-8">
                    <div className="profile-info">
                      <div className="info-item mb-3">
                        <label className="text-muted small">Username</label>
                        <div className="fw-bold">{profile.username}</div>
                      </div>
                      <div className="info-item mb-3">
                        <label className="text-muted small">Email</label>
                        <div className="fw-bold">{profile.email}</div>
                      </div>
                      {profile.fullName && (
                        <div className="info-item mb-3">
                          <label className="text-muted small">Full Name</label>
                          <div className="fw-bold">{profile.fullName}</div>
                        </div>
                      )}
                      <div className="info-item mb-3">
                        <label className="text-muted small">Gender</label>
                        <div className="fw-bold">{profile.gender || 'Chưa cập nhật'}</div>
                      </div>
                      <div className="info-item mb-3">
                        <label className="text-muted small">Address</label>
                        <div className="fw-bold">{profile.address || 'Chưa cập nhật'}</div>
                      </div>
                      <div className="info-item mb-3">
                        <label className="text-muted small">City</label>
                        <div className="fw-bold">{profile.city || 'Chưa cập nhật'}</div>
                      </div>
                      <div className="info-item mb-3">
                        <label className="text-muted small">State</label>
                        <div className="fw-bold">{profile.state || 'Chưa cập nhật'}</div>
                      </div>
                      <div className="info-item mb-3">
                        <label className="text-muted small">Mobile Number</label>
                        <div className="fw-bold">{profile.mobileNumber || 'Chưa cập nhật'}</div>
                      </div>
                      <div className="info-item mb-3">
                        <label className="text-muted small">Date of Birth</label>
                        <div className="fw-bold">
                          {profile.dateOfBirth 
                            ? new Date(profile.dateOfBirth).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              })
                            : 'Chưa cập nhật'}
                        </div>
                      </div>
                      <div className="info-item mb-3">
                        <label className="text-muted small">Member Since</label>
                        <div className="fw-bold">
                          {new Date(profile.createdAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </div>
                      </div>
                      {profile.updatedAt && (
                        <div className="info-item">
                          <label className="text-muted small">Last Updated</label>
                          <div className="fw-bold">
                            {new Date(profile.updatedAt).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </div>
                        </div>
                      )}
                    </div>
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

export default Profile

