import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { authService } from '../common/services'
import { ROUTES } from '../common/constants'
import './Login.css'

const ForgotPassword = () => {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})
  const [success, setSuccess] = useState(false)

  const validateForm = () => {
    const newErrors = {}
    
    if (!email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Invalid email format'
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
    setSuccess(false)
    
    try {
      await authService.forgotPassword(email)
      setSuccess(true)
      
      if (window.showToast) {
        window.showToast({
          severity: 'success',
          summary: 'Success',
          detail: 'If the email exists, a password reset link has been sent.',
          life: 5000
        })
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to send reset email. Please try again.'
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

  return (
    <div className="login-page d-flex align-items-center justify-content-center min-vh-100">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-6 col-lg-5">
            <div className="card shadow-lg border-0">
              <div className="card-body p-5">
                <div className="text-center mb-4">
                  <div className="mb-3">
                    <span style={{ fontSize: '3rem' }}>🔒</span>
                  </div>
                  <h2 className="login-card-title mb-2">Forgot Password</h2>
                  <p className="text-muted">Enter your email to reset password</p>
                </div>
                
                {success ? (
                  <div className="alert alert-success" role="alert">
                    <p className="mb-0">If the email exists, a password reset link has been sent to your email.</p>
                    <p className="mb-0 mt-2">Please check your inbox and follow the instructions.</p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit}>
                    {errors.general && (
                      <div className="alert alert-danger" role="alert">
                        {errors.general}
                      </div>
                    )}

                    <div className="mb-3">
                      <label htmlFor="email" className="form-label">
                        Email
                      </label>
                      <input
                        type="email"
                        className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter your email"
                        autoComplete="email"
                      />
                      {errors.email && (
                        <div className="invalid-feedback">{errors.email}</div>
                      )}
                    </div>

                    <button 
                      type="submit" 
                      className="btn btn-primary w-100 mb-3"
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                          Sending...
                        </>
                      ) : (
                        'Send Reset Link'
                      )}
                    </button>
                  </form>
                )}

                <div className="text-center">
                  <a 
                    href="#" 
                    onClick={(e) => { e.preventDefault(); navigate(ROUTES.LOGIN) }} 
                    className="text-decoration-none"
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

export default ForgotPassword
