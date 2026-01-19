import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import PasswordInput from '../components/PasswordInput'
import RadioCheckbox from '../components/RadioCheckbox'
import { authService } from '../common/services'
import { ROUTES } from '../common/constants'
import { isAdmin } from '../common/utils'
import './Login.css'

const Login = () => {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    email: '',
    password: '',
    remember_me: false
  })
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})

  const validateForm = () => {
    const newErrors = {}
    
    if (!form.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = 'Invalid email format'
    }
    
    if (!form.password) {
      newErrors.password = 'Password is required'
    } else if (form.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleLogin = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }
    
    setLoading(true)
    setErrors({})
    
    try {
      const response = await authService.login(form.email, form.password)
      
      if (window.showToast) {
        window.showToast({
          severity: 'success',
          summary: 'Success',
          detail: `Welcome back, ${response.user?.fullName || response.user?.username || 'User'}!`,
          life: 3000
        })
      }
      
      // Redirect admin đến /admin, user thường đến /dashboard
      if (isAdmin()) {
        navigate(ROUTES.ADMIN)
      } else {
        navigate(ROUTES.DASHBOARD)
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Login failed. Please try again.'
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
                  <h2 className="login-card-title mb-2">Welcome Back</h2>
                  <p className="text-muted">Sign in to continue</p>
                </div>
                
                <form onSubmit={handleLogin}>
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
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      placeholder="Enter email"
                      autoComplete="email"
                    />
                    {errors.email && (
                      <div className="invalid-feedback">{errors.email}</div>
                    )}
                  </div>

                  <PasswordInput 
                    id="password"
                    value={form.password}
                    onChange={(value) => setForm({ ...form, password: value })}
                    label="Password"
                    placeholder="Enter password"
                    error={errors.password}
                    autoComplete="current-password"
                  />

                  <div className="d-flex justify-content-between align-items-center mb-4">
                    <RadioCheckbox 
                      value={form.remember_me}
                      onChange={(checked) => setForm({ ...form, remember_me: checked })}
                      inputId="remember"
                      label="Remember me"
                    />
                    <a href="#" onClick={(e) => { e.preventDefault(); navigate('/forgot-password') }} className="text-decoration-none">
                      Forgot password?
                    </a>
                  </div>

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
                      'Sign In'
                    )}
                  </button>

                  <div className="text-center">
                    <hr className="my-4" />
                    <p className="mb-0">
                      Don't have an account?{' '}
                      <a 
                        href="#" 
                        onClick={(e) => { e.preventDefault(); navigate(ROUTES.REGISTER) }} 
                        className="text-decoration-none fw-bold"
                      >
                        Sign up
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

export default Login
