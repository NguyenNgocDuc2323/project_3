import React from 'react'
import './RadioCheckbox.css'

const RadioCheckbox = ({
  value,
  onChange,
  inputId,
  label = '',
  icon = '',
  disabled = false,
  customClass = ''
}) => {
  return (
    <div className={`form-check ${customClass}`}>
      <input
        className="form-check-input"
        type="checkbox"
        id={inputId}
        checked={value}
        onChange={(e) => onChange(e.target.checked)}
        disabled={disabled}
      />
      {label && (
        <label className="form-check-label" htmlFor={inputId}>
          {icon && <i className={icon}></i>}
          {label}
        </label>
      )}
    </div>
  )
}

export default RadioCheckbox
