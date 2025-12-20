<template>
  <div class="admin-dashboard">
    <div class="dashboard-header">
      <h1>Story Management</h1>
      <p>Manage all stories in the system</p>
    </div>

    <Card class="dashboard-card">
      <template #content>
        <div v-if="loading" class="loading-state">
          <p>Loading stories...</p>
        </div>
        <DataTable 
          v-else
          :value="allStories" 
          :paginator="true" 
          :rows="10"
          :rowsPerPageOptions="[10, 20, 50]"
          paginatorTemplate="RowsPerPageDropdown FirstPageLink PrevPageLink CurrentPageReport NextPageLink LastPageLink"
          currentPageReportTemplate="{first} to {last} of {totalRecords}"
          responsiveLayout="scroll"
          :globalFilterFields="['title', 'author', 'category']"
          stripedRows
          :globalFilter="globalFilter"
        >
          <template #header>
            <div class="table-header">
              <span class="table-title">Stories ({{ allStories.length }})</span>
              <span class="p-input-icon-left">
                <i class="pi pi-search" />
                <InputText v-model="globalFilter" placeholder="Search..." />
              </span>
            </div>
          </template>
          
          <Column field="id" header="ID" :sortable="true" style="width: 80px" />
          <Column field="title" header="Title" :sortable="true" />
          <Column field="author" header="Author" :sortable="true" />
          <Column field="category" header="Category" :sortable="true" />
          <Column field="views" header="Views" :sortable="true" style="width: 100px" />
          <Column field="likes" header="Likes" :sortable="true" style="width: 100px" />
          <Column field="isFeatured" header="Featured" :sortable="true" style="width: 100px">
            <template #body="slotProps">
              <Tag v-if="slotProps.data.isFeatured" value="Yes" severity="success" />
              <Tag v-else value="No" severity="secondary" />
            </template>
          </Column>
          <Column header="Actions" style="width: 200px">
            <template #body="slotProps">
              <Button 
                icon="pi pi-pencil" 
                class="p-button-rounded p-button-text p-button-plain"
                @click="editStory(slotProps.data)"
                v-tooltip.top="'Edit'"
              />
              <Button 
                icon="pi pi-trash" 
                class="p-button-rounded p-button-text p-button-danger"
                @click="confirmDelete(slotProps.data)"
                v-tooltip.top="'Delete'"
              />
            </template>
          </Column>
        </DataTable>
      </template>
    </Card>

    <Dialog 
      :visible="showDeleteDialog"
      @update:visible="showDeleteDialog = $event"
      modal 
      header="Confirm Delete"
      :style="{ width: '450px' }"
    >
      <div class="delete-confirm">
        <p>Are you sure you want to delete <strong>{{ selectedStory?.title }}</strong>?</p>
        <p class="warning-text">This action cannot be undone.</p>
      </div>
      <template #footer>
        <Button label="Cancel" icon="pi pi-times" @click="showDeleteDialog = false" severity="secondary" outlined />
        <Button label="Delete" icon="pi pi-check" @click="deleteStory" severity="danger" />
      </template>
    </Dialog>

    <Dialog 
      :visible="showEditDialog"
      @update:visible="showEditDialog = $event"
      modal 
      header="Edit Story"
      :style="{ width: '600px' }"
    >
      <div class="edit-form" v-if="selectedStory">
        <div class="form-group">
          <label>Title</label>
          <InputText v-model="editForm.title" />
        </div>
        <div class="form-group">
          <label>Author</label>
          <InputText v-model="editForm.author" />
        </div>
        <div class="form-group">
          <label>Description</label>
          <Textarea v-model="editForm.description" rows="4" />
        </div>
        <div class="form-group">
          <label>Image URL</label>
          <InputText v-model="editForm.imageUrl" />
        </div>
        <div class="form-group">
          <label>Category</label>
          <InputText v-model="editForm.category" />
        </div>
        <div class="form-group">
          <Checkbox v-model="editForm.isFeatured" inputId="featured" :binary="true" />
          <label for="featured" class="checkbox-label">Featured</label>
        </div>
      </div>
      <template #footer>
        <Button label="Cancel" icon="pi pi-times" @click="showEditDialog = false" severity="secondary" outlined />
        <Button label="Save" icon="pi pi-check" @click="saveStory" />
      </template>
    </Dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import Card from 'primevue/card'
import Button from 'primevue/button'
import Dialog from 'primevue/dialog'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import InputText from 'primevue/inputtext'
import Textarea from 'primevue/textarea'
import Checkbox from 'primevue/checkbox'
import Tag from 'primevue/tag'
import Tooltip from 'primevue/tooltip'
import { adminStoryService } from '@/api/admin/storyService'
import { useToast } from 'primevue/usetoast'

const router = useRouter()
const toast = useToast()

const loading = ref(true)
const allStories = ref([])
const showDeleteDialog = ref(false)
const showEditDialog = ref(false)
const selectedStory = ref(null)
const globalFilter = ref('')

const editForm = ref({
  title: '',
  author: '',
  description: '',
  imageUrl: '',
  category: '',
  isFeatured: false
})

onMounted(() => {
  loadData()
})

const loadData = async () => {
  loading.value = true
  try {
    const allStoriesData = await adminStoryService.getAll()
    allStories.value = allStoriesData
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to load stories. Please try again.',
      life: 4000
    })
  } finally {
    loading.value = false
  }
}

const confirmDelete = (story) => {
  selectedStory.value = story
  showDeleteDialog.value = true
}

const deleteStory = async () => {
  if (!selectedStory.value) return

  try {
    await adminStoryService.delete(selectedStory.value.id)
    toast.add({
      severity: 'success',
      summary: 'Success',
      detail: 'Story deleted successfully',
      life: 3000
    })
    showDeleteDialog.value = false
    loadData()
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to delete story. Please try again.',
      life: 4000
    })
  }
}

const editStory = (story) => {
  selectedStory.value = story
  editForm.value = {
    title: story.title,
    author: story.author || '',
    description: story.description || '',
    imageUrl: story.imageUrl,
    category: story.category || '',
    isFeatured: story.isFeatured || false
  }
  showEditDialog.value = true
}

const saveStory = async () => {
  if (!selectedStory.value) return

  try {
    await adminStoryService.update(selectedStory.value.id, {
      ...selectedStory.value,
      ...editForm.value
    })
    toast.add({
      severity: 'success',
      summary: 'Success',
      detail: 'Story updated successfully',
      life: 3000
    })
    showEditDialog.value = false
    loadData()
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to update story. Please try again.',
      life: 4000
    })
  }
}
</script>

<style scoped>
.admin-dashboard {
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
  min-height: 100vh;
}

.dashboard-header {
  margin-bottom: 2rem;
}

.dashboard-header h1 {
  font-size: 2rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: #333;
}

.dashboard-header p {
  color: #666;
  font-size: 1rem;
}

.dashboard-card {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.table-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: #333;
}

.loading-state {
  padding: 2rem;
  text-align: center;
  color: #666;
}

.delete-confirm {
  padding: 1rem 0;
}

.warning-text {
  color: #dc3545;
  font-size: 0.9rem;
  margin-top: 0.5rem;
}

.edit-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  font-weight: 600;
  color: #333;
}

.checkbox-label {
  margin-left: 0.5rem;
  font-weight: 500;
  color: #333;
}

:deep(.p-datatable) {
  font-size: 0.9rem;
}

:deep(.p-datatable .p-datatable-thead > tr > th) {
  background: #f8f9fa;
  font-weight: 600;
  color: #495057;
  border-bottom: 2px solid #dee2e6;
}

:deep(.p-datatable .p-datatable-tbody > tr:hover) {
  background: #f8f9fa;
}

@media (max-width: 768px) {
  .admin-dashboard {
    padding: 1rem;
  }
  
  .table-header {
    flex-direction: column;
    align-items: stretch;
  }
  
  .table-header .p-input-icon-left {
    width: 100%;
  }
}
</style>
