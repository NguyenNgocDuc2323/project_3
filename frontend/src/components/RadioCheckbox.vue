<template>
  <div class="custom-checkbox-wrapper">
    <Checkbox 
      :modelValue="modelValue"
      @update:modelValue="$emit('update:modelValue', $event)"
      :inputId="inputId"
      :binary="binary"
      :disabled="disabled"
      :class="customClass"
    />
    <label 
      v-if="label" 
      :for="inputId" 
      class="checkbox-label"
    >
      <i v-if="icon" :class="icon" />
      {{ label }}
    </label>
  </div>
</template>

<script setup>
import Checkbox from 'primevue/checkbox'

defineProps({
  modelValue: {
    type: [Boolean, Array],
    default: false
  },
  inputId: {
    type: String,
    required: true
  },
  label: {
    type: String,
    default: ''
  },
  icon: {
    type: String,
    default: ''
  },
  binary: {
    type: Boolean,
    default: false
  },
  disabled: {
    type: Boolean,
    default: false
  },
  customClass: {
    type: String,
    default: ''
  }
})

defineEmits(['update:modelValue'])
</script>

<style scoped>
.custom-checkbox-wrapper {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.checkbox-label {
  font-size: 0.95rem;
  color: #5C4033;
  cursor: pointer;
  user-select: none;
  display: flex;
  align-items: center;
  gap: 0.4rem;
}

.checkbox-label i {
  color: #8B6F47;
  font-size: 0.9rem;
}
</style>

