<template>
  <div class="admin-users-edit">
    <div class="page-header">
      <div>
        <h1>Edit User</h1>
        <p>Update user information</p>
      </div>
      <Button 
        label="Back to List" 
        icon="pi pi-arrow-left"
        @click="navigateToList"
        severity="secondary"
        outlined
      />
    </div>

    <Card class="form-card">
      <template #content>
        <div v-if="loading" class="loading-state">
          <p>Loading user...</p>
        </div>
        <form v-else @submit.prevent="handleSubmit" class="user-form">
          <Message 
            v-if="errors.general" 
            severity="error" 
            :closable="true"
            @close="errors.general = ''"
            class="error-message"
          >
            {{ errors.general }}
          </Message>

          <Message 
            v-if="successMessage" 
            severity="success" 
            :closable="true"
            @close="successMessage = ''"
            class="success-message"
          >
            {{ successMessage }}
          </Message>

          <div class="form-row">
            <div class="form-group">
              <label for="username" class="form-label">
                <i class="pi pi-user" />
                Username
              </label>
              <InputText 
                id="username" 
                v-model="form.username" 
                disabled
                class="form-input"
              />
              <small class="form-hint">Username cannot be changed</small>
            </div>

            <div class="form-group">
              <label for="email" class="form-label">
                <i class="pi pi-envelope" />
                Email
              </label>
              <InputText 
                id="email" 
                v-model="form.email" 
                disabled
                class="form-input"
              />
              <small class="form-hint">Email cannot be changed</small>
            </div>
          </div>

          <div class="form-row">
            <div class="form-group full-width">
              <label for="fullName" class="form-label">
                <i class="pi pi-id-card" />
                Full Name
              </label>
              <InputText 
                id="fullName" 
                v-model="form.fullName" 
                placeholder="Enter full name"
                class="form-input"
                :class="{ 'p-invalid': errors.fullName }"
              />
              <small v-if="errors.fullName" class="p-error">{{ errors.fullName }}</small>
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="role" class="form-label">
                <i class="pi pi-shield" />
                Role
              </label>
              <InputText 
                id="role" 
                :value="form.role === 1 ? 'Admin' : 'User'"
                disabled
                class="form-input"
              />
              <small class="form-hint">Role cannot be changed</small>
            </div>

            <div class="form-group">
              <label class="form-label">
                <i class="pi pi-check-circle" />
                Status
              </label>
              <div class="checkbox-group">
                <Checkbox 
                  v-model="form.isActive" 
                  inputId="isActive"
                  :binary="true"
                />
                <label for="isActive" class="checkbox-label">
                  Active
                </label>
              </div>
            </div>
          </div>

          <Divider />

          <div class="form-actions">
            <Button 
              type="button"
              label="Cancel" 
              icon="pi pi-times"
              severity="secondary"
              outlined
              @click="handleCancel"
              :disabled="loading"
            />
            <Button 
              type="submit"
              label="Update User" 
              icon="pi pi-check"
              :loading="loading"
              :disabled="loading"
            />
          </div>
        </form>
      </template>
    </Card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import Card from 'primevue/card'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import Checkbox from 'primevue/checkbox'
import Message from 'primevue/message'
import Divider from 'primevue/divider'
import { adminUserService } from '@/api/admin/userService'
import { useToast } from 'primevue/usetoast'

const router = useRouter()
const route = useRoute()
const toast = useToast()

const loading = ref(false)
const successMessage = ref('')

const form = ref({
  username: '',
  email: '',
  fullName: '',
  role: 2,
  isActive: true
})

const errors = ref({
  general: '',
  fullName: ''
})

onMounted(async () => {
  await loadUser()
})

const loadUser = async () => {
  loading.value = true
  try {
    const userId = parseInt(route.params.id)
    const user = await adminUserService.getById(userId)
    
    form.value = {
      username: user.username || '',
      email: user.email || '',
      fullName: user.fullName || '',
      role: user.role || 2,
      isActive: user.isActive !== undefined ? user.isActive : true
    }
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to load user.',
      life: 4000
    })
    router.push('/admin/users/list')
  } finally {
    loading.value = false
  }
}

const handleSubmit = async () => {
  loading.value = true
  errors.value = { general: '', fullName: '' }

  try {
    const userId = parseInt(route.params.id)
    await adminUserService.update(userId, {
      fullName: form.value.fullName,
      isActive: form.value.isActive
    })
    
    successMessage.value = 'User updated successfully!'
    
    setTimeout(() => {
      router.push('/admin/users/list')
    }, 1500)
  } catch (err) {
    errors.value.general = err.response?.data?.message || 'An error occurred. Please try again.'
  } finally {
    loading.value = false
  }
}

const handleCancel = () => {
  router.push('/admin/users/list')
}

const navigateToList = () => {
  router.push('/admin/users/list')
}
</script>

<style scoped>
.admin-users-edit {
  padding: 2rem;
  max-width: 1000px;
  margin: 0 auto;
  min-height: calc(100vh - 200px);
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.page-header h1 {
  font-size: 2rem;
  font-weight: 600;
  color: #333;
  margin-bottom: 0.5rem;
}

.page-header p {
  color: #666;
  font-size: 1rem;
  margin: 0;
}

.form-card {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
}

:deep(.form-card .p-card-body) {
  padding: 0;
}

:deep(.form-card .p-card-content) {
  padding: 2rem;
}

.loading-state {
  padding: 3rem;
  text-align: center;
  color: #666;
}

.user-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
}

.form-row .form-group.full-width {
  grid-column: 1 / -1;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-label {
  font-weight: 600;
  color: #333;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.form-input {
  width: 100%;
}

.form-hint {
  color: #666;
  font-size: 0.85rem;
}

.error-message,
.success-message {
  margin-bottom: 1rem;
}

.checkbox-group {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding-top: 0.5rem;
}

.checkbox-label {
  font-weight: 500;
  color: #333;
  cursor: pointer;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 1rem;
}

@media (max-width: 768px) {
  .admin-users-edit {
    padding: 1rem;
  }

  .form-row {
    grid-template-columns: 1fr;
  }

  :deep(.form-card .p-card-content) {
    padding: 1.5rem;
  }
}
</style>

