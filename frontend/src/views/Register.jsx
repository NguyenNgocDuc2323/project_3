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
            detail: 'Confirmation email has been sent to your email! Please check your inbox.',
            life: 5000
          })
        } else {
          window.showToast({
            severity: 'success',
            summary: 'Registration Successful',
            detail: 'Registration successful! However, confirmation email could not be sent. Please login.',
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
                    <span style={{ fontSize: '3rem' }}>📖</span>
                  </div>
                  <h2 className="login-card-title mb-2">Create Account</h2>
                  <p className="text-muted">Sign up to get started</p>
                </div>
                
                <form onSubmit={handleRegister}>
                  {errors.general && (
                    <div className="alert alert-danger" role="alert">
                      {errors.general}
                    </div>
                  )}

                  <div className="mb-3">
                    <label htmlFor="username" className="form-label">
                      Username
                    </label>
                    <input
                      type="text"
                      className={`form-control ${errors.username ? 'is-invalid' : ''}`}
                      id="username"
                      value={form.username}
                      onChange={(e) => setForm({ ...form, username: e.target.value })}
                      placeholder="Enter username"
                      autoComplete="username"
                    />
                    {errors.username && (
                      <div className="invalid-feedback">{errors.username}</div>
                    )}
                  </div>

                  <div className="mb-3">
                    <label htmlFor="email" className="form-label">
                      Email
                    </label>
                    <input
                      type="email"
                      className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                      id="email"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      placeholder="Enter email"
                      autoComplete="email"
                    />
                    {errors.email && (
                      <div className="invalid-feedback">{errors.email}</div>
                    )}
                  </div>

                  <div className="mb-3">
                    <label htmlFor="fullName" className="form-label">
                      Full Name
                    </label>
                    <input
                      type="text"
                      className={`form-control ${errors.fullName ? 'is-invalid' : ''}`}
                      id="fullName"
                      value={form.fullName}
                      onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                      placeholder="Enter full name"
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
                    className="btn btn-primary w-100 mb-3"
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

                  <div className="text-center">
                    <hr className="my-4" />
                    <p className="mb-0">
                      Already have an account?{' '}
                      <a 
                        href="#" 
                        onClick={(e) => { e.preventDefault(); navigate(ROUTES.LOGIN) }} 
                        className="text-decoration-none fw-bold"
                      >
                        Sign in
                      </a>
                    </p>
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
