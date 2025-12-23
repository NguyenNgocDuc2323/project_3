<template>
  <div class="admin-categories-list">
    <div class="page-header">
      <div>
        <h1>Manage Categories</h1>
        <p>View and manage story categories</p>
      </div>
      <Button 
        label="Add Category" 
        icon="pi pi-plus"
        @click="navigateToCreate"
        class="add-btn"
      />
    </div>

    <Card class="categories-card">
      <template #content>
        <div v-if="loading" class="loading-state">
          <p>Loading categories...</p>
        </div>
        <DataTable 
          v-else
          :value="categories" 
          :paginator="true" 
          :rows="10"
          stripedRows
        >
          <template #header>
            <div class="table-header">
              <span class="table-title">Categories ({{ categories.length }})</span>
            </div>
          </template>
          
          <Column field="id" header="ID" :sortable="true" style="width: 80px" />
          <Column field="name" header="Name" :sortable="true" />
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
      :category="selectedCategory"
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
import Tooltip from 'primevue/tooltip'
import { categoryService } from '@/api/categoryService'
import { useToast } from 'primevue/usetoast'
import DeleteDialog from './DeleteDialog.vue'

const router = useRouter()
const toast = useToast()

const categories = ref([])
const loading = ref(true)
const showDeleteDialog = ref(false)
const selectedCategory = ref(null)

onMounted(() => {
  loadData()
})

const loadData = async () => {
  loading.value = true
  try {
    categories.value = await categoryService.getAll()
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to load categories.',
      life: 4000
    })
  } finally {
    loading.value = false
  }
}

const navigateToCreate = () => {
  router.push('/admin/categories/create')
}

const navigateToEdit = (id) => {
  router.push(`/admin/categories/edit/${id}`)
}

const confirmDelete = (category) => {
  selectedCategory.value = category
  showDeleteDialog.value = true
}

const handleDelete = async () => {
  if (!selectedCategory.value) return

  try {
    await categoryService.delete(selectedCategory.value.id)
    toast.add({
      severity: 'success',
      summary: 'Success',
      detail: 'Category deleted successfully',
      life: 3000
    })
    showDeleteDialog.value = false
    loadData()
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to delete category.',
      life: 4000
    })
  }
}
</script>

<style scoped>
.admin-categories-list {
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

.categories-card {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
}

:deep(.categories-card .p-card-body) {
  padding: 0;
}

:deep(.categories-card .p-card-content) {
  padding: 1.5rem;
}

.loading-state {
  padding: 2rem;
  text-align: center;
  color: #666;
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
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
  .admin-categories-list {
    padding: 1rem;
  }
}
</style>

