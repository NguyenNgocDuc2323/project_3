<template>
  <div class="admin-users-list">
    <div class="page-header">
      <div>
        <h1>Manage Users</h1>
        <p>View and manage user accounts</p>
      </div>
    </div>

    <Card class="users-card">
      <template #content>
        <div v-if="loading" class="loading-state">
          <p>Loading users...</p>
        </div>
        <DataTable 
          v-else
          :value="users" 
          :paginator="true" 
          :rows="10"
          :rowsPerPageOptions="[10, 20, 50]"
          :globalFilterFields="['username', 'email', 'fullName']"
          :globalFilter="globalFilter"
          stripedRows
        >
          <template #header>
            <div class="table-header">
              <span class="table-title">Users ({{ users.length }})</span>
              <span class="p-input-icon-left">
                <i class="pi pi-search" />
                <InputText v-model="globalFilter" placeholder="Search..." />
              </span>
            </div>
          </template>
          
          <Column field="id" header="ID" :sortable="true" style="width: 80px" />
          <Column field="username" header="Username" :sortable="true" />
          <Column field="email" header="Email" :sortable="true" />
          <Column field="fullName" header="Full Name" :sortable="true" />
          <Column field="role" header="Role" :sortable="true" style="width: 100px">
            <template #body="slotProps">
              <Tag 
                :value="slotProps.data.role === 1 ? 'Admin' : 'User'" 
                :severity="slotProps.data.role === 1 ? 'danger' : 'info'" 
              />
            </template>
          </Column>
          <Column field="isActive" header="Status" :sortable="true" style="width: 100px">
            <template #body="slotProps">
              <Tag 
                :value="slotProps.data.isActive ? 'Active' : 'Inactive'" 
                :severity="slotProps.data.isActive ? 'success' : 'secondary'" 
              />
            </template>
          </Column>
          <Column field="createdAt" header="Created" :sortable="true" style="width: 150px">
            <template #body="slotProps">
              {{ formatDate(slotProps.data.createdAt) }}
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
                :disabled="slotProps.data.role === 1"
              />
            </template>
          </Column>
        </DataTable>
      </template>
    </Card>

    <DeleteDialog 
      :visible="showDeleteDialog"
      :user="selectedUser"
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
import { adminUserService } from '@/api/admin/userService'
import { useToast } from 'primevue/usetoast'
import DeleteDialog from './DeleteDialog.vue'

const router = useRouter()
const toast = useToast()

const users = ref([])
const loading = ref(true)
const showDeleteDialog = ref(false)
const selectedUser = ref(null)
const globalFilter = ref('')

onMounted(() => {
  loadData()
})

const loadData = async () => {
  loading.value = true
  try {
    users.value = await adminUserService.getAll()
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to load users.',
      life: 4000
    })
  } finally {
    loading.value = false
  }
}

const formatDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US')
}

const navigateToEdit = (id) => {
  router.push(`/admin/users/edit/${id}`)
}

const confirmDelete = (user) => {
  selectedUser.value = user
  showDeleteDialog.value = true
}

const handleDelete = async () => {
  if (!selectedUser.value) return

  try {
    await adminUserService.delete(selectedUser.value.id)
    toast.add({
      severity: 'success',
      summary: 'Success',
      detail: 'User deleted successfully',
      life: 3000
    })
    showDeleteDialog.value = false
    loadData()
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to delete user.',
      life: 4000
    })
  }
}
</script>

<style scoped>
.admin-users-list {
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
  min-height: calc(100vh - 200px);
}

.page-header {
  margin-bottom: 2rem;
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

.users-card {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
}

:deep(.users-card .p-card-body) {
  padding: 0;
}

:deep(.users-card .p-card-content) {
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
  .admin-users-list {
    padding: 1rem;
  }
  
  .table-header {
    flex-direction: column;
    align-items: stretch;
  }
}
</style>

