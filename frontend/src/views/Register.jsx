import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import PasswordInput from '../components/PasswordInput'
import { authService } from '../common/services'
import { ROUTES } from '../common/constants'
import './Login.css'

const Register = () => {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
    fullName: ''
  })
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})

  const validateForm = () => {
    const newErrors = {}
    
    if (!form.username.trim()) {
      newErrors.username = 'Username is required'
    }
    
    if (!form.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(form.email)) {
      newErrors.email = 'Email is invalid'
    }
    
    if (!form.password) {
      newErrors.password = 'Password is required'
    } else if (form.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters'
    }
    
    if (!form.fullName.trim()) {
      newErrors.fullName = 'Full name is required'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleRegister = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }
    
    setLoading(true)
    setErrors({})
    
    try {
      const result = await authService.register(
        form.username,
        form.email,
        form.password,
        form.fullName
      )
      
      if (window.showToast) {
        if (result?.emailSent) {
          window.showToast({
            severity: 'success',
            summary: 'Registration Successful',
            detail: 'Verification email has been sent. Please check your inbox to activate your account.',
            life: 5000
          })
        } else {
          window.showToast({
            severity: 'success',
            summary: 'Registration Successful',
            detail: 'Account created but verification email could not be sent. Please contact support.',
            life: 5000
          })
        }
      }
      
      navigate(ROUTES.LOGIN)
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Registration failed. Please try again.'
      setErrors({ general: errorMessage })
      
      if (window.showToast) {
        window.showToast({
          severity: 'error',
          summary: 'Registration Failed',
          detail: errorMessage,
          life: 5000
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
            <div className="card auth-card">
              <div className="auth-body">
                <h2 className="auth-title">Create Account</h2>
                <p className="auth-subtitle">Join our jewelry community</p>
                
                <form onSubmit={handleRegister}>
                  {errors.general && (
                    <div className="alert alert-danger" role="alert">
                      {errors.general}
                    </div>
                  )}

                  <div className="mb-3">
                    <label htmlFor="username" className="auth-label">
                      Username
                    </label>
                    <input
                      type="text"
                      className={`form-control auth-input ${errors.username ? 'is-invalid' : ''}`}
                      id="username"
                      value={form.username}
                      onChange={(e) => setForm({ ...form, username: e.target.value })}
                      placeholder="Enter your username"
                      autoComplete="username"
                    />
                    {errors.username && (
                      <div className="invalid-feedback">{errors.username}</div>
                    )}
                  </div>

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
                    />
                    {errors.email && (
                      <div className="invalid-feedback">{errors.email}</div>
                    )}
                  </div>

                  <div className="mb-3">
                    <label htmlFor="fullName" className="auth-label">
                      Full Name
                    </label>
                    <input
                      type="text"
                      className={`form-control auth-input ${errors.fullName ? 'is-invalid' : ''}`}
                      id="fullName"
                      value={form.fullName}
                      onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                      placeholder="Enter your full name"
                      autoComplete="name"
                    />
                    {errors.fullName && (
                      <div className="invalid-feedback">{errors.fullName}</div>
                    )}
                  </div>

                  <PasswordInput 
                    id="password"
                    value={form.password}
                    onChange={(value) => setForm({ ...form, password: value })}
                    label="Password"
                    placeholder="Enter password"
                    error={errors.password}
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
                        Loading...
                      </>
                    ) : (
                      'Sign Up'
                    )}
                  </button>

                  <div className="auth-footer">
                    <span>Already have an account? </span>
                    <a
                      href="#"
                      onClick={(e) => { e.preventDefault(); navigate(ROUTES.LOGIN) }}
                      className="auth-link"
                    >
                      Sign in
                    </a>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Register
