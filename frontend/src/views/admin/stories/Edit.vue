<template>
  <div class="admin-stories-edit">
    <div class="page-header">
      <div>
        <h1>Edit Story</h1>
        <p>Update story information</p>
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
          <p>Loading story...</p>
        </div>
        <form v-else @submit.prevent="handleSubmit" class="story-form">
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
              <label for="title" class="form-label">
                <i class="pi pi-book" />
                Story Title <span class="required">*</span>
              </label>
              <InputText 
                id="title" 
                v-model="form.title" 
                placeholder="Enter story title"
                class="form-input"
                :class="{ 'p-invalid': errors.title }"
              />
              <small v-if="errors.title" class="p-error">{{ errors.title }}</small>
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="author" class="form-label">
                <i class="pi pi-user" />
                Author
              </label>
              <InputText 
                id="author" 
                v-model="form.author" 
                placeholder="Author name"
                class="form-input"
                :class="{ 'p-invalid': errors.author }"
              />
              <small v-if="errors.author" class="p-error">{{ errors.author }}</small>
            </div>

            <div class="form-group">
              <label for="category" class="form-label">
                <i class="pi pi-tags" />
                Category
              </label>
              <InputText 
                id="category"
                v-model="form.category" 
                placeholder="Enter category"
                class="form-input"
                :class="{ 'p-invalid': errors.category }"
              />
              <small v-if="errors.category" class="p-error">{{ errors.category }}</small>
            </div>
          </div>

          <div class="form-row">
            <div class="form-group full-width">
              <label for="imageUrl" class="form-label">
                <i class="pi pi-image" />
                Image URL <span class="required">*</span>
              </label>
              <InputText 
                id="imageUrl" 
                v-model="form.imageUrl" 
                placeholder="https://example.com/image.jpg"
                class="form-input"
                :class="{ 'p-invalid': errors.imageUrl }"
              />
              <small v-if="errors.imageUrl" class="p-error">{{ errors.imageUrl }}</small>
            </div>
          </div>

          <div class="form-row" v-if="form.imageUrl && isValidUrl(form.imageUrl)">
            <div class="form-group full-width">
              <label class="form-label">Image Preview</label>
              <div class="image-preview">
                <img :src="form.imageUrl" alt="Preview" @error="imageError = true" />
                <div v-if="imageError" class="image-error">
                  <i class="pi pi-exclamation-triangle" />
                  <p>Failed to load image</p>
                </div>
              </div>
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
                placeholder="Brief description of the story..."
                :rows="5"
                class="form-input"
                :class="{ 'p-invalid': errors.description }"
              />
              <small v-if="errors.description" class="p-error">{{ errors.description }}</small>
            </div>
          </div>

          <div class="form-row">
            <div class="form-group full-width">
              <div class="checkbox-group">
                <Checkbox 
                  v-model="form.isFeatured" 
                  inputId="featured"
                  :binary="true"
                />
                <label for="featured" class="checkbox-label">
                  <i class="pi pi-star" />
                  Mark as featured story
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
              label="Update Story" 
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
import Checkbox from 'primevue/checkbox'
import Message from 'primevue/message'
import Divider from 'primevue/divider'
import { adminStoryService } from '@/api/admin/storyService'
import { useToast } from 'primevue/usetoast'

const router = useRouter()
const route = useRoute()
const toast = useToast()

const loading = ref(false)
const successMessage = ref('')
const imageError = ref(false)

const form = ref({
  title: '',
  author: '',
  description: '',
  imageUrl: '',
  category: '',
  isFeatured: false
})

const errors = ref({
  general: '',
  title: '',
  author: '',
  description: '',
  imageUrl: '',
  category: ''
})

onMounted(async () => {
  await loadStory()
})

const loadStory = async () => {
  loading.value = true
  try {
    const storyId = parseInt(route.params.id)
    const story = await adminStoryService.getById(storyId)
    
    form.value = {
      title: story.title || '',
      author: story.author || '',
      description: story.description || '',
      imageUrl: story.imageUrl || '',
      category: story.category || '',
      isFeatured: story.isFeatured || false
    }
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to load story.',
      life: 4000
    })
    router.push('/admin/stories/list')
  } finally {
    loading.value = false
  }
}

const isValidUrl = (string) => {
  try {
    new URL(string)
    return true
  } catch (_) {
    return false
  }
}

const validateForm = () => {
  errors.value = {
    general: '',
    title: '',
    author: '',
    description: '',
    imageUrl: '',
    category: ''
  }

  if (!form.value.title || form.value.title.trim() === '') {
    errors.value.title = 'Title is required'
    return false
  }

  if (!form.value.imageUrl || form.value.imageUrl.trim() === '') {
    errors.value.imageUrl = 'Image URL is required'
    return false
  }

  if (form.value.imageUrl && !isValidUrl(form.value.imageUrl)) {
    errors.value.imageUrl = 'Please enter a valid URL'
    return false
  }

  return true
}

const handleSubmit = async () => {
  if (!validateForm()) {
    return
  }

  loading.value = true
  imageError.value = false

  try {
    const storyId = parseInt(route.params.id)
    await adminStoryService.update(storyId, {
      ...form.value
    })
    
    successMessage.value = 'Story updated successfully!'
    
    setTimeout(() => {
      router.push('/admin/stories/list')
    }, 1500)
  } catch (err) {
    errors.value.general = err.response?.data?.message || 'An error occurred. Please try again.'
  } finally {
    loading.value = false
  }
}

const handleCancel = () => {
  router.push('/admin/stories/list')
}

const navigateToList = () => {
  router.push('/admin/stories/list')
}
</script>

<style scoped>
.admin-stories-edit {
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

.story-form {
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

.image-preview {
  width: 100%;
  max-width: 400px;
  height: 300px;
  border: 2px dashed #ddd;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  background: #f9f9f9;
}

.image-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.image-error {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  color: #dc3545;
}

.checkbox-group {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
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
  .admin-stories-edit {
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

