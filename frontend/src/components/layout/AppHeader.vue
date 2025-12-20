<template>
  <header class="header" :class="{ 'scrolled': isScrolled }">
    <div class="header-background"></div>
    <div class="header-gradient"></div>
    <div class="container">
      <router-link to="/dashboard" class="brand">
        <div class="brandMark">
          <span class="book-icon">📖</span>
          <div class="brand-glow"></div>
        </div>
        <span class="brandText">
          <span class="brand-text-main">Đọc Chuyện</span>
          <span class="brand-text-sub">Kho truyện hay</span>
        </span>
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
          <i :class="item.icon" class="nav-icon"></i>
          <span>{{ item.label }}</span>
        </router-link>
        <router-link
          v-if="isAuthenticated"
          to="/dashboard"
          class="navLink"
        >
          <i class="pi pi-th-large nav-icon"></i>
          <span>Dashboard</span>
        </router-link>
        <Button 
          v-if="!isAuthenticated"
          label="Đăng nhập" 
          severity="secondary"
          outlined
          @click="$router.push('/login')"
          class="loginBtn"
        >
          <template #icon>
            <i class="pi pi-sign-in"></i>
          </template>
        </Button>
        <Button 
          v-else
          label="Đăng xuất" 
          severity="secondary"
          outlined
          @click="handleLogout"
          class="loginBtn"
        >
          <template #icon>
            <i class="pi pi-sign-out"></i>
          </template>
        </Button>
      </nav>
    </div>
  </header>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import Button from 'primevue/button'

const router = useRouter()
const isAuthenticated = ref(false)
const isScrolled = ref(false)

const navItems = [
  { to: '/dashboard', label: 'Trang chủ', icon: 'pi pi-home' },
  { to: '/about', label: 'Giới thiệu', icon: 'pi pi-info-circle' }
]

const checkAuth = () => {
  const token = localStorage.getItem('accessToken')
  isAuthenticated.value = !!token
}

const handleLogout = () => {
  localStorage.removeItem('accessToken')
  localStorage.removeItem('refreshToken')
  localStorage.removeItem('user')
  isAuthenticated.value = false
  router.push('/dashboard')
}

const handleScroll = () => {
  isScrolled.value = window.scrollY > 20
}

onMounted(() => {
  checkAuth()
  window.addEventListener('storage', checkAuth)
  window.addEventListener('scroll', handleScroll)
  handleScroll()
})

onUnmounted(() => {
  window.removeEventListener('storage', checkAuth)
  window.removeEventListener('scroll', handleScroll)
})

// Check auth when route changes
router.afterEach(() => {
  checkAuth()
})
</script>

<style scoped>
.header {
  position: sticky;
  top: 0;
  z-index: 1000;
  color: #F4E4BC;
  border-bottom: 2px solid rgba(139, 111, 71, 0.3);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
  background: linear-gradient(135deg, rgba(92, 64, 51, 0.95) 0%, rgba(139, 111, 71, 0.95) 100%);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
}

.header.scrolled {
  box-shadow: 0 8px 32px rgba(92, 64, 51, 0.4);
  border-bottom-color: rgba(139, 111, 71, 0.5);
  background: linear-gradient(135deg, rgba(92, 64, 51, 0.98) 0%, rgba(139, 111, 71, 0.98) 100%);
}

.header-background {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: 
    radial-gradient(circle at 20% 50%, rgba(212, 165, 116, 0.15) 0%, transparent 50%),
    radial-gradient(circle at 80% 80%, rgba(139, 111, 71, 0.15) 0%, transparent 50%);
  pointer-events: none;
  animation: backgroundShift 8s ease-in-out infinite;
}

.header-gradient {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg, 
    transparent 0%, 
    rgba(244, 228, 188, 0.5) 25%, 
    rgba(244, 228, 188, 0.8) 50%, 
    rgba(244, 228, 188, 0.5) 75%, 
    transparent 100%);
  animation: shimmer 3s ease-in-out infinite;
}

@keyframes backgroundShift {
  0%, 100% {
    transform: translateX(0) translateY(0);
  }
  50% {
    transform: translateX(-5px) translateY(-5px);
  }
}

@keyframes shimmer {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(100%);
  }
}

.container {
  max-width: 1600px;
  margin: 0 auto;
  padding: 1.25rem 2rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 2rem;
  position: relative;
  z-index: 1;
}

@media (max-width: 768px) {
  .container {
    padding: 1rem 1.5rem;
  }
}

.brand {
  display: inline-flex;
  align-items: center;
  gap: 1rem;
  text-decoration: none;
  color: inherit;
  font-weight: 800;
  letter-spacing: 0.3px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  padding: 0.5rem;
  border-radius: 12px;
}

.brand:hover {
  transform: translateY(-2px);
}

.brand:hover .brandMark {
  transform: rotate(5deg) scale(1.1);
  box-shadow: 0 4px 16px rgba(244, 228, 188, 0.4);
}

.brandMark {
  display: inline-flex;
  width: 50px;
  height: 50px;
  align-items: center;
  justify-content: center;
  border-radius: 14px;
  background: linear-gradient(135deg, rgba(244, 228, 188, 0.25) 0%, rgba(244, 228, 188, 0.15) 100%);
  font-size: 1.5rem;
  position: relative;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: 2px solid rgba(244, 228, 188, 0.3);
  overflow: hidden;
}

.book-icon {
  position: relative;
  z-index: 2;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
  animation: bookFloat 3s ease-in-out infinite;
}

@keyframes bookFloat {
  0%, 100% {
    transform: translateY(0) rotate(0deg);
  }
  50% {
    transform: translateY(-3px) rotate(2deg);
  }
}

.brand-glow {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 100%;
  height: 100%;
  background: radial-gradient(circle, rgba(244, 228, 188, 0.3) 0%, transparent 70%);
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 0.5;
    transform: translate(-50%, -50%) scale(1);
  }
  50% {
    opacity: 0.8;
    transform: translate(-50%, -50%) scale(1.1);
  }
}

.brandText {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
}

.brand-text-main {
  font-size: 1.4rem;
  color: #F4E4BC;
  font-weight: 800;
  line-height: 1.2;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  background: linear-gradient(135deg, #F4E4BC 0%, #E8D5B7 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.brand-text-sub {
  font-size: 0.75rem;
  color: rgba(244, 228, 188, 0.7);
  font-weight: 500;
  letter-spacing: 0.5px;
  text-transform: uppercase;
}

@media (max-width: 768px) {
  .brandText {
    display: none;
  }
  
  .brandMark {
    width: 40px;
    height: 40px;
    font-size: 1.3rem;
  }
}

.nav {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.navLink {
  padding: 0.65rem 1.25rem;
  border-radius: 12px;
  text-decoration: none;
  color: rgba(244, 228, 188, 0.9);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  font-weight: 600;
  font-size: 0.95rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  position: relative;
  overflow: hidden;
}

.navLink::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(244, 228, 188, 0.1), transparent);
  transition: left 0.5s ease;
}

.navLink:hover::before {
  left: 100%;
}

.navLink:hover {
  background: rgba(244, 228, 188, 0.15);
  color: #F4E4BC;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(244, 228, 188, 0.2);
}

.navLink.isActive {
  background: linear-gradient(135deg, rgba(244, 228, 188, 0.25) 0%, rgba(244, 228, 188, 0.15) 100%);
  color: #F4E4BC;
  box-shadow: 0 2px 8px rgba(244, 228, 188, 0.3);
  border: 1px solid rgba(244, 228, 188, 0.3);
}

.nav-icon {
  font-size: 1rem;
  transition: transform 0.3s ease;
}

.navLink:hover .nav-icon {
  transform: scale(1.2);
}

@media (max-width: 640px) {
  .navLink span {
    display: none;
  }
  
  .navLink {
    padding: 0.65rem;
    min-width: 40px;
    justify-content: center;
  }
}

.loginBtn {
  margin-left: 0.75rem;
  position: relative;
  overflow: hidden;
}

:deep(.p-button-outlined.p-button-secondary) {
  color: #F4E4BC;
  border-color: #F4E4BC;
  border-width: 2px;
  font-weight: 600;
  padding: 0.65rem 1.5rem;
  border-radius: 12px;
  background: rgba(244, 228, 188, 0.05);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

:deep(.p-button-outlined.p-button-secondary::before) {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  border-radius: 50%;
  background: rgba(244, 228, 188, 0.2);
  transform: translate(-50%, -50%);
  transition: width 0.6s ease, height 0.6s ease;
}

:deep(.p-button-outlined.p-button-secondary:hover::before) {
  width: 300px;
  height: 300px;
}

:deep(.p-button-outlined.p-button-secondary:hover) {
  background: rgba(244, 228, 188, 0.15);
  border-color: #F4E4BC;
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(244, 228, 188, 0.3);
  color: #F4E4BC;
}

:deep(.p-button-outlined.p-button-secondary:active) {
  transform: translateY(0);
}

@media (max-width: 640px) {
  .container {
    padding: 1rem 1.25rem;
  }

  .loginBtn {
    padding: 0.5rem !important;
    min-width: auto;
  }

  :deep(.p-button-label) {
    display: none;
  }
}
</style>


