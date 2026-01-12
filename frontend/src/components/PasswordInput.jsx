import React, { useState } from 'react'
import './PasswordInput.css'

const PasswordInput = ({
  value,
  onChange,
  id = 'password',
  label = 'Password',
  placeholder = 'Enter password',
  error = '',
  required = false,
  autoComplete = 'current-password'
}) => {
  const [showPassword, setShowPassword] = useState(false)

  return (
    <div className="mb-3 password-input">
      <label htmlFor={id} className="form-label">
        {label} {required && <span className="text-danger">*</span>}
      </label>
      <div className="input-group">
        <input
          type={showPassword ? 'text' : 'password'}
          className={`form-control ${error ? 'is-invalid' : ''}`}
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          autoComplete={autoComplete}
        />
        <button
          className="btn btn-outline-secondary"
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          aria-label="Toggle password visibility"
        >
          {showPassword ? (
            <i className="bi bi-eye-slash"></i>
          ) : (
            <i className="bi bi-eye"></i>
          )}
        </button>
      </div>
      {error && <div className="invalid-feedback">{error}</div>}
    </div>
  )
}

export default PasswordInput
