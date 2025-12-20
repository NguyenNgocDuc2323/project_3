<template>
  <div class="register-page">
    <div class="register-wrapper">
      <Card class="register-card">
        <template #content>
          <div class="card-header">
            <div class="header-icon">📖</div>
            <h2 class="card-title">Tạo tài khoản mới</h2>
            <p class="card-subtitle">Đăng ký để bắt đầu hành trình của bạn</p>
          </div>
          
          <form @submit.prevent="handleRegister" class="register-form">
            <Message 
              v-if="errors.general" 
              severity="error" 
              :closable="false"
              class="error-message"
            >
              {{ errors.general }}
            </Message>
            
            <div class="form-group">
              <label for="username" class="form-label">
                <i class="pi pi-user" />
                Tên đăng nhập <span class="required">*</span>
              </label>
              <InputText 
                id="username" 
                v-model="form.username" 
                placeholder="Nhập tên đăng nhập"
                class="form-input"
                :class="{ 'p-invalid': errors.username }"
                autocomplete="username"
              />
              <small v-if="errors.username" class="p-error">{{ errors.username }}</small>
            </div>

            <div class="form-group">
              <label for="email" class="form-label">
                <i class="pi pi-envelope" />
                Email <span class="required">*</span>
              </label>
              <InputText 
                id="email" 
                v-model="form.email" 
                type="email"
                placeholder="Nhập email"
                class="form-input"
                :class="{ 'p-invalid': errors.email }"
                autocomplete="email"
              />
              <small v-if="errors.email" class="p-error">{{ errors.email }}</small>
            </div>

            <div class="form-group">
              <label for="fullName" class="form-label">
                <i class="pi pi-id-card" />
                Họ và tên
              </label>
              <InputText 
                id="fullName" 
                v-model="form.fullName" 
                placeholder="Nhập họ và tên (tùy chọn)"
                class="form-input"
              />
            </div>

            <PasswordInput 
              id="password"
              v-model="form.password"
              label="Mật khẩu"
              placeholder="Nhập mật khẩu"
              :error="errors.password"
              :required="true"
              :feedback="true"
              autocomplete="new-password"
            />

            <Button 
              type="submit" 
              label="Đăng ký" 
              icon="pi pi-user-plus"
              class="submit-button"
              :loading="loading"
              :disabled="loading"
            />

            <Divider>
              <span class="divider-text">hoặc</span>
            </Divider>

            <div class="login-link">
              <span>Đã có tài khoản?</span>
              <a href="#" @click.prevent="$router.push('/login')" class="link"> Đăng nhập ngay</a>
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
import Card from 'primevue/card'
import InputText from 'primevue/inputtext'
import Button from 'primevue/button'
import Divider from 'primevue/divider'
import Message from 'primevue/message'
import PasswordInput from '@/components/PasswordInput.vue'
import { authService } from '@/api/authService'

const router = useRouter()

const form = ref({
  username: '',
  email: '',
  fullName: '',
  password: ''
})

const loading = ref(false)
const errors = ref({})

const validateForm = () => {
  errors.value = {}
  
  if (!form.value.username.trim()) {
    errors.value.username = 'Vui lòng nhập tên đăng nhập'
  } else if (form.value.username.length < 3) {
    errors.value.username = 'Tên đăng nhập phải có ít nhất 3 ký tự'
  }
  
  if (!form.value.email.trim()) {
    errors.value.email = 'Vui lòng nhập email'
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.value.email)) {
    errors.value.email = 'Email không hợp lệ'
  }
  
  if (!form.value.password) {
    errors.value.password = 'Vui lòng nhập mật khẩu'
  } else if (form.value.password.length < 6) {
    errors.value.password = 'Mật khẩu phải có ít nhất 6 ký tự'
  }
  
  return Object.keys(errors.value).length === 0
}

const handleRegister = async () => {
  if (!validateForm()) {
    return
  }
  
  loading.value = true
  errors.value = {}
  
  try {
    const response = await authService.register(
      form.value.username,
      form.value.email,
      form.value.password,
      form.value.fullName
    )
    
    localStorage.setItem('accessToken', response.accessToken)
    localStorage.setItem('refreshToken', response.refreshToken)
    localStorage.setItem('user', JSON.stringify(response.user))
    
    router.push('/dashboard')
  } catch (err) {
    errors.value.general = err.response?.data?.message || 'Đăng ký thất bại. Vui lòng thử lại.'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.register-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem 1rem;
  background: linear-gradient(135deg, #F4E4BC 0%, #E8D5B7 100%);
  box-sizing: border-box;
  overflow-x: hidden;
}

.register-wrapper {
  width: 100%;
  max-width: 500px;
  box-sizing: border-box;
}

.register-card {
  border-radius: 20px;
  box-shadow: 0 12px 40px rgba(92, 64, 51, 0.2);
  border: 1px solid rgba(139, 111, 71, 0.2);
  overflow: hidden;
  width: 100%;
  box-sizing: border-box;
}

:deep(.register-card .p-card-body) {
  padding: 0;
}

:deep(.register-card .p-card-content) {
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

.register-form {
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

.required {
  color: #e24c4c;
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

.login-link {
  text-align: center;
  font-size: 0.9rem;
  color: #5C4033;
}

.login-link .link {
  color: #8B6F47;
  text-decoration: none;
  font-weight: 600;
  margin-left: 0.25rem;
  cursor: pointer;
  transition: color 0.2s ease;
}

.login-link .link:hover {
  color: #5C4033;
  text-decoration: underline;
}

.error-message {
  margin-bottom: 0.5rem;
}

:deep(.p-message-error) {
  background: #fee;
  border-color: #e24c4c;
  color: #e24c4c;
  border-radius: 10px;
}

.p-error {
  color: #e24c4c;
  font-size: 0.85rem;
  margin-top: 0.25rem;
}

@media (max-width: 640px) {
  .register-page {
    padding: 1.5rem 1rem;
  }

  :deep(.register-card .p-card-content) {
    padding: 2rem 1.5rem;
  }

  .card-title {
    font-size: 1.5rem;
  }

  .header-icon {
    font-size: 3rem;
  }
}
</style>
