<template>
  <div class="layout">
    <AppHeader />

    <main class="main">
      <div class="container">
        <router-view />
      </div>
    </main>

    <AppFooter />
  </div>
</template>

<script setup>
import AppHeader from '@/components/layout/AppHeader.vue'
import AppFooter from '@/components/layout/AppFooter.vue'
</script>

<style scoped>
.layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.main {
  flex: 1;
  padding: 2rem 0;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1.5rem;
}

@media (max-width: 720px) {
  .main {
    padding: 1.25rem 0;
  }
  .container {
    padding: 0 1rem;
  }
}
</style>


