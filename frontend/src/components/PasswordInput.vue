<template>
  <div class="form-group">
    <label :for="id" class="form-label">
      <i class="pi pi-lock" />
      {{ label }} <span v-if="required" class="required">*</span>
    </label>
    <Password 
      :id="id" 
      :modelValue="modelValue"
      @update:modelValue="$emit('update:modelValue', $event)"
      :placeholder="placeholder"
      class="password-input"
      :class="{ 'p-invalid': error }"
      :feedback="feedback"
      toggleMask
      :autocomplete="autocomplete"
    />
    <small v-if="error" class="p-error">{{ error }}</small>
  </div>
</template>

<script setup>
import Password from 'primevue/password'

defineProps({
  modelValue: {
    type: String,
    default: ''
  },
  id: {
    type: String,
    default: 'password'
  },
  label: {
    type: String,
    default: 'Mật khẩu'
  },
  placeholder: {
    type: String,
    default: 'Nhập mật khẩu'
  },
  error: {
    type: String,
    default: ''
  },
  required: {
    type: Boolean,
    default: false
  },
  feedback: {
    type: Boolean,
    default: false
  },
  autocomplete: {
    type: String,
    default: 'current-password'
  }
})

defineEmits(['update:modelValue'])
</script>

<style scoped>
.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  width: 100%;
  box-sizing: border-box;
}

.form-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 600;
  color: #5C4033;
  font-size: 0.9rem;
}

.form-label i {
  color: #8B6F47;
  font-size: 0.9rem;
}

.required {
  color: #e24c4c;
}

.p-error {
  color: #e24c4c;
  font-size: 0.85rem;
  margin-top: 0.25rem;
}

/* Password Input Styling */
:deep(.password-input) {
  width: 100% !important;
  max-width: 100% !important;
  display: flex;
  flex-direction: column;
}

/* Override any form-input styles that might be applied */
:deep(.password-input.p-inputwrapper) {
  width: 100% !important;
  max-width: 100% !important;
  border: none !important;
  padding: 0 !important;
  background: transparent !important;
}


:deep(.password-input .p-password-input-wrapper) {
  width: 100% !important;
  max-width: 100% !important;
  position: relative !important;
  display: flex !important;
  align-items: center !important;
}

:deep(.password-input .p-inputtext) {
  width: 100% !important;
  max-width: 100% !important;
  box-sizing: border-box !important;
  border-radius: 10px !important;
  border: 2px solid rgba(139, 111, 71, 0.25) !important;
  font-size: 1rem !important;
  padding: 0.75rem 1rem !important;
  padding-right: 3rem !important;
  transition: all 0.3s ease !important;
  background: #fff !important;
}

:deep(.password-input .p-inputtext:focus) {
  border-color: #8B6F47 !important;
  box-shadow: 0 0 0 0.2rem rgba(139, 111, 71, 0.2) !important;
  outline: none !important;
}

:deep(.password-input .p-inputtext.p-invalid) {
  border-color: #e24c4c !important;
}

/* Toggle icon styling - Đảm bảo cả 2 icon (ẩn/hiện) có cùng màu và size chính xác */
:deep(.password-input .p-password-input-icon),
:deep(.password-input .p-password-toggle-icon),
:deep(.password-input .p-password-toggle-mask-icon),
:deep(.password-input .p-password-mask-icon),
:deep(.password-input .p-input-icon),
:deep(.password-input .p-input-icon-right) {
  position: absolute !important;
  right: 0.75rem !important;
  top: 70% !important;
  transform: translateY(-60%) !important;
  cursor: pointer !important;
  color: rgba(139, 111, 71, 0.7) !important;
  z-index: 10 !important;
  transition: color 0.2s ease !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  pointer-events: auto !important;
  width: 1.5rem !important;
  height: 1.5rem !important;
  min-width: 1.5rem !important;
  min-height: 1.5rem !important;
  max-width: 1.5rem !important;
  max-height: 1.5rem !important;
  box-sizing: border-box !important;
  flex-shrink: 0 !important;
}

:deep(.password-input .p-password-input-icon:hover),
:deep(.password-input .p-password-toggle-icon:hover),
:deep(.password-input .p-password-toggle-mask-icon:hover),
:deep(.password-input .p-password-mask-icon:hover),
:deep(.password-input .p-input-icon:hover),
:deep(.password-input .p-input-icon-right:hover) {
  color: #8B6F47 !important;
}

:deep(.password-input .p-input-icon-right .p-icon),
:deep(.password-input .p-password-input-icon .p-icon),
:deep(.password-input .p-password-toggle-mask-icon .p-icon),
:deep(.password-input .p-password-mask-icon.p-icon) {
  width: 1.2rem !important;
  height: 1.2rem !important;
  color: inherit !important;
}

/* SVG icon inside toggle - Đảm bảo cả 2 SVG icon có cùng màu và size chính xác */
:deep(.password-input .p-password-toggle-mask-icon svg),
:deep(.password-input .p-password-mask-icon svg) {
  width: 1.2rem !important;
  height: 1.2rem !important;
  min-width: 1.2rem !important;
  min-height: 1.2rem !important;
  max-width: 1.2rem !important;
  max-height: 1.2rem !important;
  display: block !important;
  fill: rgba(139, 111, 71, 0.7) !important;
  stroke: rgba(139, 111, 71, 0.7) !important;
  color: rgba(139, 111, 71, 0.7) !important;
  transition: fill 0.2s ease, stroke 0.2s ease, color 0.2s ease !important;
  margin: 0 auto !important;
  box-sizing: border-box !important;
  flex-shrink: 0 !important;
}

/* Đảm bảo tất cả path, circle, rect bên trong SVG có cùng màu (màu nhạt) */
:deep(.password-input .p-password-toggle-mask-icon svg path),
:deep(.password-input .p-password-toggle-mask-icon svg circle),
:deep(.password-input .p-password-toggle-mask-icon svg rect),
:deep(.password-input .p-password-mask-icon svg path),
:deep(.password-input .p-password-mask-icon svg circle),
:deep(.password-input .p-password-mask-icon svg rect) {
  fill: rgba(139, 111, 71, 0.7) !important;
  stroke: rgba(139, 111, 71, 0.7) !important;
  color: rgba(139, 111, 71, 0.7) !important;
}

:deep(.password-input .p-password-toggle-mask-icon:hover svg),
:deep(.password-input .p-password-mask-icon:hover svg) {
  fill: #8B6F47 !important;
  stroke: #8B6F47 !important;
  color: #8B6F47 !important;
}

:deep(.password-input .p-password-toggle-mask-icon:hover svg path),
:deep(.password-input .p-password-toggle-mask-icon:hover svg circle),
:deep(.password-input .p-password-toggle-mask-icon:hover svg rect),
:deep(.password-input .p-password-mask-icon:hover svg path),
:deep(.password-input .p-password-mask-icon:hover svg circle),
:deep(.password-input .p-password-mask-icon:hover svg rect) {
  fill: #8B6F47 !important;
  stroke: #8B6F47 !important;
  color: #8B6F47 !important;
}

/* Đảm bảo cả 2 icon container (ẩn/hiện) có cùng màu và size chính xác */
:deep(.password-input .p-password-toggle-mask-icon),
:deep(.password-input .p-password-mask-icon) {
  line-height: 1 !important;
  vertical-align: middle !important;
  width: 1.5rem !important;
  height: 1.5rem !important;
  min-width: 1.5rem !important;
  min-height: 1.5rem !important;
  max-width: 1.5rem !important;
  max-height: 1.5rem !important;
  color: rgba(139, 111, 71, 0.7) !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  box-sizing: border-box !important;
}

/* Force màu cho cả 2 icon container (màu nhạt) */
:deep(.password-input .p-password-toggle-mask-icon *),
:deep(.password-input .p-password-mask-icon *) {
  color: rgba(139, 111, 71, 0.7) !important;
  fill: rgba(139, 111, 71, 0.7) !important;
  stroke: rgba(139, 111, 71, 0.7) !important;
}

:deep(.password-input .p-password-toggle-mask-icon:hover),
:deep(.password-input .p-password-mask-icon:hover) {
  color: #8B6F47 !important;
}

:deep(.password-input .p-password-toggle-mask-icon:hover *),
:deep(.password-input .p-password-mask-icon:hover *) {
  color: #8B6F47 !important;
  fill: #8B6F47 !important;
  stroke: #8B6F47 !important;
}

/* Password Strength Panel */
:deep(.password-input .p-password-panel) {
  margin-top: 0.5rem;
  padding: 0.75rem;
  background: #fff;
  border: 1px solid rgba(139, 111, 71, 0.2);
  border-radius: 10px;
  box-shadow: 0 4px 12px rgba(92, 64, 51, 0.1);
}

:deep(.password-input .p-password-meter) {
  height: 0.5rem;
  background: rgba(139, 111, 71, 0.1);
  border-radius: 5px;
  margin-bottom: 0.5rem;
}

:deep(.password-input .p-password-strength-label) {
  font-size: 0.85rem;
  color: #8B6F47;
  margin-top: 0.5rem;
}
</style>
