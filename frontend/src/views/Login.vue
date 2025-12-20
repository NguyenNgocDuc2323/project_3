<template>
  <div class="login-page">
    <div class="login-wrapper">
      <Card class="login-card">
        <template #content>
          <div class="card-header">
            <div class="header-icon">📖</div>
            <h2 class="card-title">Welcome Back</h2>
            <p class="card-subtitle">Sign in to continue</p>
          </div>
          
          <form @submit.prevent="handleLogin" class="login-form">
            <div class="form-group">
              <label for="username" class="form-label">
                <i class="pi pi-user" />
                Username
              </label>
              <InputText 
                id="username" 
                v-model="form.username" 
                placeholder="Enter username"
                class="form-input"
                :class="{ 'p-invalid': errors.username }"
                autocomplete="username"
              />
              <small v-if="errors.username" class="p-error">{{ errors.username }}</small>
            </div>

            <PasswordInput 
              id="password"
              v-model="form.password"
              label="Password"
              placeholder="Enter password"
              :error="errors.password"
              :feedback="false"
              autocomplete="current-password"
            />

            <div class="form-options">
              <RadioCheckbox 
                v-model="form.remember_me" 
                inputId="remember"
                label="Remember me"
                binary
              />
              <a href="#" @click.prevent class="forgot-password">Forgot password?</a>
            </div>

            <Button 
              type="submit" 
              label="Sign In" 
              icon="pi pi-sign-in"
              class="submit-button"
              :loading="loading"
              :disabled="loading"
            />

            <Divider>
              <span class="divider-text">or</span>
            </Divider>

            <div class="register-link">
              <span>Don't have an account?</span>
              <a href="#" @click.prevent="$router.push('/register')" class="link"> Sign up</a>
            </div>
          </form>
        </template>
      </Card>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from 'primevue/usetoast'
import Card from 'primevue/card'
import InputText from 'primevue/inputtext'
import Button from 'primevue/button'
import Divider from 'primevue/divider'
import PasswordInput from '@/components/PasswordInput.vue'
import RadioCheckbox from '@/components/RadioCheckbox.vue'
import { authService } from '@/api/authService'
import { useTokenRefresh } from '@/composables/useTokenRefresh'

const router = useRouter()
const toast = useToast()
const { startAutoRefresh } = useTokenRefresh()

const form = ref({
  username: '',
  password: '',
  remember_me: false
})

const loading = ref(false)
const errors = ref({})

const validateForm = () => {
  errors.value = {}
  
  if (!form.value.username.trim()) {
    errors.value.username = 'Username is required'
  }
  
  if (!form.value.password) {
    errors.value.password = 'Password is required'
  } else if (form.value.password.length < 6) {
    errors.value.password = 'Password must be at least 6 characters'
  }
  
  return Object.keys(errors.value).length === 0
}

const handleLogin = async () => {
  if (!validateForm()) {
    return
  }
  
  loading.value = true
  errors.value = {}
  
  try {
    const response = await authService.login(form.value.username, form.value.password)
    
    localStorage.setItem('user', JSON.stringify(response.user))
    
    startAutoRefresh()
    
    toast.add({
      severity: 'success',
      summary: 'Success',
      detail: `Welcome back, ${response.user.username}!`,
      life: 3000
    })
    
    router.push('/dashboard')
  } catch (err) {
    const errorMessage = err.response?.data?.message || 'Login failed. Please try again.'
    errors.value.general = errorMessage
    
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: errorMessage,
      life: 4000
    })
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem 1rem;
  background: linear-gradient(135deg, #F4E4BC 0%, #E8D5B7 100%);
  box-sizing: border-box;
  overflow-x: hidden;
}

.login-wrapper {
  width: 100%;
  max-width: 450px;
  box-sizing: border-box;
}

.login-card {
  border-radius: 20px;
  box-shadow: 0 12px 40px rgba(92, 64, 51, 0.2);
  border: 1px solid rgba(139, 111, 71, 0.2);
  overflow: hidden;
  width: 100%;
  box-sizing: border-box;
}

:deep(.login-card .p-card-body) {
  padding: 0;
}

:deep(.login-card .p-card-content) {
  padding: 2.5rem;
  box-sizing: border-box;
}

.card-header {
  text-align: center;
  margin-bottom: 2rem;
}

.header-icon {
  font-size: 3.5rem;
  margin-bottom: 1rem;
}

.card-title {
  font-size: 1.75rem;
  font-weight: 700;
  color: #5C4033;
  margin-bottom: 0.5rem;
}

.card-subtitle {
  font-size: 0.95rem;
  color: #8B6F47;
  margin: 0;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  width: 100%;
  box-sizing: border-box;
}

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

.form-input {
  width: 100%;
  box-sizing: border-box;
}

:deep(.form-input) {
  width: 100% !important;
  max-width: 100% !important;
  border-radius: 10px;
  border: 2px solid rgba(139, 111, 71, 0.25);
  font-size: 1rem;
  padding: 0.75rem 1rem;
  transition: all 0.3s ease;
  box-sizing: border-box;
}

:deep(.form-input:focus) {
  border-color: #8B6F47;
  box-shadow: 0 0 0 0.2rem rgba(139, 111, 71, 0.2);
  outline: none;
}

:deep(.form-input.p-invalid) {
  border-color: #e24c4c;
}

.form-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.75rem;
  width: 100%;
  box-sizing: border-box;
}


.forgot-password {
  font-size: 0.9rem;
  color: #8B6F47;
  text-decoration: none;
  font-weight: 500;
  transition: color 0.2s ease;
}

.forgot-password:hover {
  color: #5C4033;
  text-decoration: underline;
}

.submit-button {
  width: 100%;
  height: 3rem;
  font-size: 1.05rem;
  font-weight: 600;
  border-radius: 10px;
  margin-top: 0.5rem;
  box-sizing: border-box;
}

:deep(.submit-button) {
  background: linear-gradient(135deg, #8B6F47 0%, #5C4033 100%);
  border: none;
  color: #F4E4BC;
  width: 100% !important;
}

:deep(.submit-button:hover:not(:disabled)) {
  background: linear-gradient(135deg, #5C4033 0%, #8B6F47 100%);
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(92, 64, 51, 0.3);
}

:deep(.p-divider) {
  margin: 1.5rem 0;
}

.divider-text {
  color: #8B6F47;
  font-size: 0.85rem;
  padding: 0 1rem;
  background: white;
}

.register-link {
  text-align: center;
  font-size: 0.9rem;
  color: #5C4033;
}

.register-link .link {
  color: #8B6F47;
  text-decoration: none;
  font-weight: 600;
  margin-left: 0.25rem;
  cursor: pointer;
  transition: color 0.2s ease;
}

.register-link .link:hover {
  color: #5C4033;
  text-decoration: underline;
}

.p-error {
  color: #e24c4c;
  font-size: 0.85rem;
  margin-top: 0.25rem;
}

@media (max-width: 640px) {
  .login-page {
    padding: 1.5rem 1rem;
  }

  :deep(.login-card .p-card-content) {
    padding: 2rem 1.5rem;
  }

  .card-title {
    font-size: 1.5rem;
  }

  .header-icon {
    font-size: 3rem;
  }

  .form-options {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .forgot-password {
    align-self: flex-end;
  }
}
</style>
