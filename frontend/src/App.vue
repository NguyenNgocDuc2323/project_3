<template>
  <component :is="layoutComponent" />
  <Toast />
</template>

<script setup>
import { computed, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import Toast from 'primevue/toast'
import ToastService from 'primevue/toastservice'
import DefaultLayout from '@/layouts/DefaultLayout.vue'
import BlankLayout from '@/layouts/BlankLayout.vue'
import { useTokenRefresh } from '@/composables/useTokenRefresh'
import { cookieUtils } from '@/utils/cookie'

const route = useRoute()
const { startAutoRefresh, stopAutoRefresh } = useTokenRefresh()

const layoutComponent = computed(() => {
  const layout = route.meta?.layout ?? 'default'
  return layout === 'blank' ? BlankLayout : DefaultLayout
})

onMounted(() => {
  const refreshToken = cookieUtils.get('refreshToken')
  if (refreshToken) {
    startAutoRefresh()
  }
})

onUnmounted(() => {
  stopAutoRefresh()
})
</script>

