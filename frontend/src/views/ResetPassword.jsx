import React, { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import PasswordInput from '../components/PasswordInput'
import { authService } from '../common/services'
import { ROUTES } from '../common/constants'
import './Login.css'

const ResetPassword = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [form, setForm] = useState({
    email: '',
    token: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    const token = searchParams.get('token')
    const email = searchParams.get('email')
    
    if (token && email) {
      setForm(prev => ({
        ...prev,
        token: decodeURIComponent(token),
        email: decodeURIComponent(email)
      }))
    }
  }, [searchParams])

  const validateForm = () => {
    const newErrors = {}
    
    if (!form.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = 'Invalid email format'
    }
    
    if (!form.newPassword) {
      newErrors.newPassword = 'Password is required'
    } else if (form.newPassword.length < 6) {
      newErrors.newPassword = 'Password must be at least 6 characters'
    }
    
    if (!form.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password'
    } else if (form.newPassword !== form.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match'
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
      await authService.resetPassword(form.email, form.token, form.newPassword)
      setSuccess(true)
      
      if (window.showToast) {
        window.showToast({
          severity: 'success',
          summary: 'Success',
          detail: 'Password has been reset successfully.',
          life: 3000
        })
      }
      
      setTimeout(() => {
        navigate(ROUTES.LOGIN)
      }, 2000)
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to reset password. Please try again.'
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

  if (!form.token || !form.email) {
    return (
      <div className="login-page d-flex align-items-center justify-content-center min-vh-100">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-md-6 col-lg-5">
              <div className="card auth-card">
                <div className="auth-body">
                  <div className="alert alert-danger" role="alert">
                    Invalid reset link. Please request a new password reset.
                  </div>
                  <div className="auth-footer">
                    <a
                      href="#"
                      onClick={(e) => { e.preventDefault(); navigate('/forgot-password') }}
                      className="auth-link"
                    >
                      Request New Reset Link
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="login-page d-flex align-items-center justify-content-center min-vh-100">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-6 col-lg-5">
            <div className="card auth-card">
              <div className="auth-body">
                <h2 className="auth-title">Reset Password</h2>
                <p className="auth-subtitle">Enter your new password</p>
                
                {success ? (
                  <div className="alert alert-success" role="alert">
                    <p className="mb-0">Password has been reset successfully!</p>
                    <p className="mb-0 mt-2">Redirecting to login...</p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit}>
                    {errors.general && (
                      <div className="alert alert-danger" role="alert">
                        {errors.general}
                      </div>
                    )}

                    <div className="mb-3">
                      <label htmlFor="email" className="auth-label">
                        Email
                      </label>
                      <input
                        type="email"
                        className={`form-control auth-input ${errors.email ? 'is-invalid' : ''}`}
                        id="email"
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        placeholder="Enter your email"
                        autoComplete="email"
                        disabled
                      />
                      {errors.email && (
                        <div className="invalid-feedback">{errors.email}</div>
                      )}
                    </div>

                    <PasswordInput 
                      id="newPassword"
                      value={form.newPassword}
                      onChange={(value) => setForm({ ...form, newPassword: value })}
                      label="New Password"
                      placeholder="Enter new password"
                      error={errors.newPassword}
                      autoComplete="new-password"
                    />

                    <PasswordInput 
                      id="confirmPassword"
                      value={form.confirmPassword}
                      onChange={(value) => setForm({ ...form, confirmPassword: value })}
                      label="Confirm Password"
                      placeholder="Confirm new password"
                      error={errors.confirmPassword}
                      autoComplete="new-password"
                    />

                    <button 
                      type="submit" 
                      className="btn auth-primary"
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                          Resetting...
                        </>
                      ) : (
                        'Reset Password'
                      )}
                    </button>
                  </form>
                )}

                <div className="auth-footer">
                  <a
                    href="#"
                    onClick={(e) => { e.preventDefault(); navigate(ROUTES.LOGIN) }}
                    className="auth-link"
                  >
                    Back to Login
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ResetPassword
