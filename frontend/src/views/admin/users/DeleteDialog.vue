<template>
  <Dialog 
    :visible="visible"
    @update:visible="$emit('update:visible', $event)"
    modal 
    header="Confirm Delete"
    :style="{ width: '450px' }"
  >
    <div class="delete-confirm">
      <p>Are you sure you want to delete user <strong>{{ user?.username }}</strong>?</p>
      <p class="warning-text">This action cannot be undone.</p>
    </div>
    <template #footer>
      <Button 
        label="Cancel" 
        icon="pi pi-times" 
        @click="$emit('update:visible', false)" 
        severity="secondary" 
        outlined 
      />
      <Button 
        label="Delete" 
        icon="pi pi-check" 
        @click="$emit('confirm')" 
        severity="danger" 
      />
    </template>
  </Dialog>
</template>

<script setup>
import Dialog from 'primevue/dialog'
import Button from 'primevue/button'

defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  user: {
    type: Object,
    default: null
  }
})

defineEmits(['update:visible', 'confirm'])
</script>

<style scoped>
.delete-confirm {
  padding: 1rem 0;
}

.warning-text {
  color: #dc3545;
  font-size: 0.9rem;
  margin-top: 0.5rem;
}
</style>

