import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import PasswordInput from '../components/PasswordInput'
import RadioCheckbox from '../components/RadioCheckbox'
import { authService } from '../common/services'
import { ROUTES } from '../common/constants'
import { isAdmin, storageUtils } from '../common/utils'
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

  useEffect(() => {
    const rememberedEmail = storageUtils.get('rememberedEmail')
    if (rememberedEmail) {
      setForm(prev => ({
        ...prev,
        email: rememberedEmail,
        remember_me: true
      }))
    }
  }, [])

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
      const response = await authService.login(form.email, form.password, form.remember_me)
      
      if (form.remember_me) {
        storageUtils.set('rememberedEmail', form.email)
      } else {
        storageUtils.remove('rememberedEmail')
      }
      
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
            <div className="card auth-card">
              <div className="auth-body">
                <h2 className="auth-title">Login</h2>
                <p className="auth-subtitle">Sign in to continue</p>
                
                <form onSubmit={handleLogin}>
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
                    placeholder="Enter your password"
                    error={errors.password}
                    autoComplete="current-password"
                  />

                  <div className="auth-actions">
                    <RadioCheckbox 
                      value={form.remember_me}
                      onChange={(checked) => setForm({ ...form, remember_me: checked })}
                      inputId="remember"
                      label="Remember me"
                    />
                    <a href="#" onClick={(e) => { e.preventDefault(); navigate('/forgot-password') }} className="auth-link">
                      Forgot password?
                    </a>
                  </div>

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
                      'Sign In'
                    )}
                  </button>

                  <div className="auth-divider">or</div>
                  <button
                    type="button"
                    className="btn auth-secondary"
                    onClick={() => navigate(ROUTES.REGISTER)}
                  >
                    Create Account
                  </button>
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
