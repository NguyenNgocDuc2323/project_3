<template>
  <div class="add-story-page">
    <div class="page-container">
      <div class="page-header">
        <h1 class="page-title">
          <i class="pi pi-plus-circle" />
          Thêm truyện mới
        </h1>
        <p class="page-subtitle">Chia sẻ câu chuyện của bạn với cộng đồng</p>
      </div>

      <Card class="form-card">
        <template #content>
          <form @submit.prevent="handleSubmit" class="story-form">
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
                  Tiêu đề truyện <span class="required">*</span>
                </label>
                <InputText 
                  id="title" 
                  v-model="form.title" 
                  placeholder="Nhập tiêu đề truyện"
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
                  Tác giả
                </label>
                <InputText 
                  id="author" 
                  v-model="form.author" 
                  placeholder="Tên tác giả"
                  class="form-input"
                  :class="{ 'p-invalid': errors.author }"
                />
                <small v-if="errors.author" class="p-error">{{ errors.author }}</small>
              </div>

              <div class="form-group">
                <label for="category" class="form-label">
                  <i class="pi pi-tags" />
                  Thể loại
                </label>
                <Select 
                  id="category"
                  v-model="form.category" 
                  :options="categories"
                  placeholder="Chọn thể loại"
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
                  URL hình ảnh <span class="required">*</span>
                </label>
                <InputText 
                  id="imageUrl" 
                  v-model="form.imageUrl" 
                  placeholder="https://example.com/image.jpg"
                  class="form-input"
                  :class="{ 'p-invalid': errors.imageUrl }"
                />
                <small v-if="errors.imageUrl" class="p-error">{{ errors.imageUrl }}</small>
                <small class="form-hint">Nhập URL hình ảnh từ internet (ví dụ: Unsplash, Imgur...)</small>
              </div>
            </div>

            <div class="form-row" v-if="form.imageUrl && isValidUrl(form.imageUrl)">
              <div class="form-group full-width">
                <label class="form-label">Xem trước hình ảnh</label>
                <div class="image-preview">
                  <img :src="form.imageUrl" alt="Preview" @error="imageError = true" />
                  <div v-if="imageError" class="image-error">
                    <i class="pi pi-exclamation-triangle" />
                    <p>Không thể tải hình ảnh</p>
                  </div>
                </div>
              </div>
            </div>

            <div class="form-row">
              <div class="form-group full-width">
                <label for="description" class="form-label">
                  <i class="pi pi-align-left" />
                  Mô tả
                </label>
                <Textarea 
                  id="description" 
                  v-model="form.description" 
                  placeholder="Mô tả ngắn gọn về câu chuyện..."
                  :rows="5"
                  class="form-input"
                  :class="{ 'p-invalid': errors.description }"
                />
                <small v-if="errors.description" class="p-error">{{ errors.description }}</small>
                <small class="form-hint">{{ form.description?.length || 0 }}/1000 ký tự</small>
              </div>
            </div>

            <div class="form-row">
              <div class="form-group full-width">
                <div class="checkbox-group">
                  <RadioCheckbox 
                    v-model="form.isFeatured" 
                    inputId="featured"
                    label="Đánh dấu là truyện nổi bật"
                    icon="pi pi-star"
                    binary
                  />
                </div>
              </div>
            </div>

            <Divider />

            <div class="form-actions">
              <Button 
                type="button"
                label="Hủy" 
                icon="pi pi-times"
                severity="secondary"
                outlined
                @click="handleCancel"
                class="action-btn"
              />
              <Button 
                type="submit" 
                label="Thêm truyện" 
                icon="pi pi-check"
                :loading="loading"
                :disabled="loading"
                class="action-btn primary"
              />
            </div>
          </form>
        </template>
      </Card>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import Card from 'primevue/card'
import InputText from 'primevue/inputtext'
import Textarea from 'primevue/textarea'
import Select from 'primevue/select'
import Button from 'primevue/button'
import Message from 'primevue/message'
import Divider from 'primevue/divider'
import RadioCheckbox from '@/components/RadioCheckbox.vue'
import apiClient from '@/api/axios'

const router = useRouter()

const form = ref({
  title: '',
  author: '',
  category: null,
  imageUrl: '',
  description: '',
  isFeatured: false
})

const loading = ref(false)
const errors = ref({})
const successMessage = ref('')
const imageError = ref(false)

const categories = [
  { label: 'Phiêu lưu', value: 'Phiêu lưu' },
  { label: 'Huyền bí', value: 'Huyền bí' },
  { label: 'Drama', value: 'Drama' },
  { label: 'Lãng mạn', value: 'Lãng mạn' },
  { label: 'Fantasy', value: 'Fantasy' },
  { label: 'Đời sống', value: 'Đời sống' },
  { label: 'Lịch sử', value: 'Lịch sử' },
  { label: 'Khoa học viễn tưởng', value: 'Khoa học viễn tưởng' }
]

const isValidUrl = (url) => {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

watch(() => form.value.imageUrl, () => {
  imageError.value = false
})

const validateForm = () => {
  errors.value = {}
  
  if (!form.value.title?.trim()) {
    errors.value.title = 'Vui lòng nhập tiêu đề truyện'
  } else if (form.value.title.length > 200) {
    errors.value.title = 'Tiêu đề không được vượt quá 200 ký tự'
  }
  
  if (form.value.author && form.value.author.length > 100) {
    errors.value.author = 'Tên tác giả không được vượt quá 100 ký tự'
  }
  
  if (!form.value.imageUrl?.trim()) {
    errors.value.imageUrl = 'Vui lòng nhập URL hình ảnh'
  } else if (!isValidUrl(form.value.imageUrl)) {
    errors.value.imageUrl = 'URL không hợp lệ'
  }
  
  if (form.value.description && form.value.description.length > 1000) {
    errors.value.description = 'Mô tả không được vượt quá 1000 ký tự'
  }
  
  return Object.keys(errors.value).length === 0
}

const handleSubmit = async () => {
  if (!validateForm()) {
    return
  }
  
  loading.value = true
  errors.value = {}
  successMessage.value = ''
  
  try {
    const response = await apiClient.post('/story', {
      title: form.value.title.trim(),
      author: form.value.author?.trim() || '',
      category: form.value.category || null,
      imageUrl: form.value.imageUrl.trim(),
      description: form.value.description?.trim() || null,
      isFeatured: form.value.isFeatured
    })
    
    successMessage.value = 'Thêm truyện thành công!'
    
    setTimeout(() => {
      router.push('/dashboard')
    }, 1500)
  } catch (err) {
    errors.value.general = err.response?.data?.message || 'Có lỗi xảy ra. Vui lòng thử lại.'
  } finally {
    loading.value = false
  }
}

const handleCancel = () => {
  router.push('/dashboard')
}
</script>

<style scoped>
.add-story-page {
  min-height: calc(100vh - 200px);
  padding: 2rem 1rem;
  background: linear-gradient(to bottom, #F9F7F4 0%, #F4E4BC 50%, #E8D5B7 100%);
}

.page-container {
  max-width: 900px;
  margin: 0 auto;
  width: 100%;
  box-sizing: border-box;
}

.page-header {
  text-align: center;
  margin-bottom: 2rem;
}

.page-title {
  font-size: 2.75rem;
  font-weight: 800;
  background: linear-gradient(135deg, #5C4033 0%, #8B6F47 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  text-shadow: 0 2px 4px rgba(92, 64, 51, 0.1);
}

.page-title i {
  font-size: 2.75rem;
  background: linear-gradient(135deg, #8B6F47 0%, #D4A574 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  filter: drop-shadow(0 2px 4px rgba(139, 111, 71, 0.2));
}

.page-subtitle {
  font-size: 1.2rem;
  color: #8B6F47;
  margin: 0;
  font-weight: 500;
  letter-spacing: 0.3px;
}

.form-card {
  border-radius: 24px;
  box-shadow: 0 12px 40px rgba(92, 64, 51, 0.2);
  border: 2px solid rgba(139, 111, 71, 0.15);
  overflow: hidden;
  background: white;
  backdrop-filter: blur(10px);
}

:deep(.form-card .p-card-body) {
  padding: 0;
}

:deep(.form-card .p-card-content) {
  padding: 3rem;
  background: white;
}

@media (max-width: 768px) {
  :deep(.form-card .p-card-content) {
    padding: 2rem;
  }
}

.story-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  width: 100%;
  box-sizing: border-box;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
  width: 100%;
  box-sizing: border-box;
}

.form-row .full-width {
  grid-column: 1 / -1;
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
  font-size: 0.95rem;
  margin-bottom: 0.25rem;
}

.form-label i {
  color: #8B6F47;
  font-size: 1rem;
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
  border-radius: 14px;
  border: 2px solid rgba(139, 111, 71, 0.25);
  font-size: 1rem;
  padding: 0.875rem 1.25rem;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-sizing: border-box;
  background: #F9F7F4;
}

:deep(.form-input:focus) {
  border-color: #8B6F47;
  box-shadow: 0 0 0 4px rgba(139, 111, 71, 0.15), 0 4px 12px rgba(139, 111, 71, 0.1);
  outline: none;
  background: white;
  transform: translateY(-1px);
}

:deep(.form-input.p-invalid) {
  border-color: #e24c4c;
}

:deep(.p-textarea) {
  width: 100% !important;
  max-width: 100% !important;
  resize: vertical;
  min-height: 120px;
}

.form-hint {
  font-size: 0.85rem;
  color: #8B6F47;
  margin-top: 0.25rem;
}

.image-preview {
  width: 100%;
  max-width: 100%;
  border-radius: 16px;
  overflow: hidden;
  border: 3px solid rgba(139, 111, 71, 0.2);
  background: linear-gradient(135deg, #F9F7F4 0%, #F4E4BC 100%);
  position: relative;
  aspect-ratio: 16/9;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 16px rgba(92, 64, 51, 0.1);
  transition: all 0.3s ease;
}

.image-preview:hover {
  border-color: #8B6F47;
  box-shadow: 0 8px 24px rgba(92, 64, 51, 0.2);
}

.image-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.image-error {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #8B6F47;
  background: rgba(244, 228, 188, 0.8);
}

.image-error i {
  font-size: 2rem;
  margin-bottom: 0.5rem;
}

.image-error p {
  margin: 0;
  font-size: 0.9rem;
}

.checkbox-group {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1.25rem;
  background: linear-gradient(135deg, #F9F7F4 0%, #F4E4BC 100%);
  border-radius: 14px;
  border: 2px solid rgba(139, 111, 71, 0.15);
  transition: all 0.3s ease;
}

.checkbox-group:hover {
  border-color: #8B6F47;
  box-shadow: 0 4px 12px rgba(139, 111, 71, 0.1);
}


:deep(.p-divider) {
  margin: 1rem 0;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  padding-top: 1rem;
  flex-wrap: wrap;
}

.action-btn {
  min-width: 160px;
  height: 3.5rem;
  font-size: 1.05rem;
  font-weight: 700;
  border-radius: 14px;
  letter-spacing: 0.3px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.action-btn.primary {
  background: linear-gradient(135deg, #8B6F47 0%, #5C4033 100%);
  border: none;
  color: #F4E4BC;
  box-shadow: 0 4px 16px rgba(92, 64, 51, 0.3);
}

:deep(.action-btn.primary:hover:not(:disabled)) {
  background: linear-gradient(135deg, #5C4033 0%, #8B6F47 100%);
  transform: translateY(-3px);
  box-shadow: 0 8px 24px rgba(92, 64, 51, 0.4);
}

:deep(.action-btn.primary:active:not(:disabled)) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(92, 64, 51, 0.3);
}

:deep(.action-btn.p-button-outlined) {
  border: 2px solid #8B6F47;
  color: #8B6F47;
  background: transparent;
  box-shadow: 0 2px 8px rgba(139, 111, 71, 0.15);
}

:deep(.action-btn.p-button-outlined:hover) {
  background: rgba(139, 111, 71, 0.1);
  border-color: #5C4033;
  color: #5C4033;
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(139, 111, 71, 0.25);
}

.error-message,
.success-message {
  margin-bottom: 0.5rem;
}

:deep(.p-message-error) {
  background: #fee;
  border-color: #e24c4c;
  color: #e24c4c;
  border-radius: 12px;
}

:deep(.p-message-success) {
  background: #efe;
  border-color: #42b983;
  color: #42b983;
  border-radius: 12px;
}

.p-error {
  color: #e24c4c;
  font-size: 0.85rem;
  margin-top: 0.25rem;
}

@media (max-width: 768px) {
  .add-story-page {
    padding: 1.5rem 1rem;
  }

  .page-title {
    font-size: 2rem;
  }

  .page-title i {
    font-size: 2rem;
  }

  :deep(.form-card .p-card-content) {
    padding: 1.5rem;
  }

  .form-row {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .form-actions {
    flex-direction: column;
  }

  .action-btn {
    width: 100%;
  }
}

@media (max-width: 480px) {
  .page-title {
    font-size: 1.75rem;
  }

  :deep(.form-card .p-card-content) {
    padding: 1.25rem;
  }

  .story-form {
    gap: 1.25rem;
  }
}
</style>



