<template>
  <div class="layout">
    <AppHeader />
    <HeroBanner />

    <main class="main">
      <router-view />
    </main>

    <AppFooter />
  </div>
</template>

<script setup>
import AppHeader from '@/components/layout/AppHeader.vue'
import AppFooter from '@/components/layout/AppFooter.vue'
import HeroBanner from '@/components/layout/HeroBanner.vue'
</script>

<style scoped>
.layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.main {
  flex: 1;
}
</style>


