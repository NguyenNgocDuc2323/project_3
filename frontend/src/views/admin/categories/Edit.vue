<template>
  <div class="admin-categories-edit">
    <div class="page-header">
      <div>
        <h1>Edit Category</h1>
        <p>Update category information</p>
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
          <p>Loading category...</p>
        </div>
        <form v-else @submit.prevent="handleSubmit" class="category-form">
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
            <div class="form-group full-width">
              <label for="name" class="form-label">
                <i class="pi pi-tag" />
                Category Name <span class="required">*</span>
              </label>
              <InputText 
                id="name" 
                v-model="form.name" 
                placeholder="Enter category name"
                class="form-input"
                :class="{ 'p-invalid': errors.name }"
              />
              <small v-if="errors.name" class="p-error">{{ errors.name }}</small>
            </div>
          </div>

          <div class="form-row">
            <div class="form-group full-width">
              <label for="description" class="form-label">
                <i class="pi pi-align-left" />
                Description
              </label>
              <Textarea 
                id="description" 
                v-model="form.description" 
                placeholder="Enter category description (optional)"
                :rows="3"
                class="form-input"
                :class="{ 'p-invalid': errors.description }"
              />
              <small v-if="errors.description" class="p-error">{{ errors.description }}</small>
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
              label="Update Category" 
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
import Textarea from 'primevue/textarea'
import Message from 'primevue/message'
import Divider from 'primevue/divider'
import { categoryService } from '@/api/categoryService'
import { useToast } from 'primevue/usetoast'

const router = useRouter()
const route = useRoute()
const toast = useToast()

const loading = ref(false)
const successMessage = ref('')

const form = ref({
  name: '',
  description: ''
})

const errors = ref({
  general: '',
  name: '',
  description: ''
})

onMounted(async () => {
  await loadCategory()
})

const loadCategory = async () => {
  loading.value = true
  try {
    const categoryId = parseInt(route.params.id)
    const category = await categoryService.getById(categoryId)
    
    form.value = {
      name: category.name || '',
      description: category.description || ''
    }
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to load category.',
      life: 4000
    })
    router.push('/admin/categories/list')
  } finally {
    loading.value = false
  }
}

const validateForm = () => {
  errors.value = { general: '', name: '', description: '' }

  if (!form.value.name || form.value.name.trim() === '') {
    errors.value.name = 'Category name is required'
    return false
  }

  return true
}

const handleSubmit = async () => {
  if (!validateForm()) {
    return
  }

  loading.value = true

  try {
    const categoryId = parseInt(route.params.id)
    await categoryService.update(categoryId, {
      name: form.value.name.trim(),
      description: form.value.description?.trim() || ''
    })
    
    successMessage.value = 'Category updated successfully!'
    
    setTimeout(() => {
      router.push('/admin/categories/list')
    }, 1500)
  } catch (err) {
    errors.value.general = err.response?.data?.message || 'An error occurred. Please try again.'
  } finally {
    loading.value = false
  }
}

const handleCancel = () => {
  router.push('/admin/categories/list')
}

const navigateToList = () => {
  router.push('/admin/categories/list')
}
</script>

<style scoped>
.admin-categories-edit {
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

.category-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;
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

.required {
  color: #dc3545;
}

.form-input {
  width: 100%;
}

.error-message,
.success-message {
  margin-bottom: 1rem;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 1rem;
}

@media (max-width: 768px) {
  .admin-categories-edit {
    padding: 1rem;
  }

  :deep(.form-card .p-card-content) {
    padding: 1.5rem;
  }
}
</style>

