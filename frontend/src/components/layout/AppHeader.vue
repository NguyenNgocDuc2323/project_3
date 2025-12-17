<template>
  <header class="header">
    <div class="container">
      <router-link to="/" class="brand">
        <span class="brandMark">◆</span>
        <span class="brandText">My Project</span>
      </router-link>

      <nav class="nav">
        <router-link
          v-for="item in navItems"
          :key="item.to"
          :to="item.to"
          class="navLink"
          active-class="isActive"
          exact-active-class="isActive"
        >
          {{ item.label }}
        </router-link>
      </nav>
    </div>
  </header>
</template>

<script setup>
const navItems = [
  { to: '/', label: 'Home' },
  { to: '/about', label: 'About' }
]
</script>

<style scoped>
.header {
  position: sticky;
  top: 0;
  z-index: 20;
  background: #2c3e50;
  color: #fff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 1rem 1.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.brand {
  display: inline-flex;
  align-items: center;
  gap: 0.6rem;
  text-decoration: none;
  color: inherit;
  font-weight: 800;
  letter-spacing: 0.2px;
}

.brandMark {
  display: inline-flex;
  width: 28px;
  height: 28px;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  background: rgba(66, 185, 131, 0.18);
  color: #42b983;
}

.brandText {
  font-size: 1.05rem;
}

.nav {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.navLink {
  padding: 0.45rem 0.75rem;
  border-radius: 8px;
  text-decoration: none;
  color: rgba(255, 255, 255, 0.92);
  transition: background 160ms ease, opacity 160ms ease;
  font-weight: 600;
}

.navLink:hover {
  background: rgba(255, 255, 255, 0.08);
}

.isActive {
  background: rgba(66, 185, 131, 0.22);
  color: #fff;
}

@media (max-width: 520px) {
  .container {
    padding: 0.9rem 1rem;
  }

  .brandText {
    display: none;
  }
}
</style>


