<template>
  <div class="admin-stories-list">
    <div class="page-header">
      <div>
        <h1>Manage Stories</h1>
        <p>View, edit, and delete stories</p>
      </div>
      <Button 
        label="Add New Story" 
        icon="pi pi-plus"
        @click="navigateToAdd"
        class="add-btn"
      />
    </div>

    <Card class="stories-card">
      <template #content>
        <DataTable 
          :value="stories" 
          :paginator="true" 
          :rows="10"
          :rowsPerPageOptions="[10, 20, 50]"
          :globalFilterFields="['title', 'author', 'category']"
          :globalFilter="globalFilter"
          stripedRows
        >
          <template #header>
            <div class="table-header">
              <span class="table-title">Stories ({{ stories.length }})</span>
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
          <Column header="Actions" style="width: 150px">
            <template #body="slotProps">
              <Button 
                icon="pi pi-pencil" 
                class="p-button-rounded p-button-text"
                @click="navigateToEdit(slotProps.data.id)"
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

    <DeleteDialog 
      :visible="showDeleteDialog"
      :story="selectedStory"
      @update:visible="showDeleteDialog = $event"
      @confirm="handleDelete"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import Card from 'primevue/card'
import Button from 'primevue/button'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import InputText from 'primevue/inputtext'
import Tag from 'primevue/tag'
import Tooltip from 'primevue/tooltip'
import { adminStoryService } from '@/api/admin/storyService'
import { useToast } from 'primevue/usetoast'
import DeleteDialog from './DeleteDialog.vue'

const router = useRouter()
const toast = useToast()

const stories = ref([])
const loading = ref(true)
const showDeleteDialog = ref(false)
const selectedStory = ref(null)
const globalFilter = ref('')

onMounted(() => {
  loadData()
})

const loadData = async () => {
  loading.value = true
  try {
    stories.value = await adminStoryService.getAll()
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to load stories.',
      life: 4000
    })
  } finally {
    loading.value = false
  }
}

const navigateToAdd = () => {
  router.push('/admin/stories/create')
}

const navigateToEdit = (id) => {
  router.push(`/admin/stories/edit/${id}`)
}

const confirmDelete = (story) => {
  selectedStory.value = story
  showDeleteDialog.value = true
}

const handleDelete = async () => {
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
      detail: 'Failed to delete story.',
      life: 4000
    })
  }
}
</script>

<style scoped>
.admin-stories-list {
  padding: 2rem;
  max-width: 1400px;
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

.add-btn {
  height: 2.5rem;
}

.stories-card {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
}

:deep(.stories-card .p-card-body) {
  padding: 0;
}

:deep(.stories-card .p-card-content) {
  padding: 1.5rem;
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
  .admin-stories-list {
    padding: 1rem;
  }
  
  .table-header {
    flex-direction: column;
    align-items: stretch;
  }
}
</style>

