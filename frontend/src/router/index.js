import { createRouter, createWebHistory } from 'vue-router'
import About from '../views/About.vue'
import Login from '../views/Login.vue'
import Register from '../views/Register.vue'
import Dashboard from '../views/user/Dashboard.vue'
import AddStory from '../views/AddStory.vue'
import AdminDashboard from '../views/admin/Dashboard.vue'
import { cookieUtils } from '@/utils/cookie'

const routes = [
  {
    path: '/',
    redirect: '/dashboard'
  },
  {
    path: '/about',
    name: 'About',
    component: About,
    meta: { layout: 'default' }
  },
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: { layout: 'blank' }
  },
  {
    path: '/register',
    name: 'Register',
    component: Register,
    meta: { layout: 'blank' }
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: Dashboard,
    meta: { layout: 'default', requiresAuth: true }
  },
  {
    path: '/admin',
    name: 'AdminDashboard',
    component: AdminDashboard,
    meta: { layout: 'default', requiresAuth: true, requiresAdmin: true }
  },
  {
    path: '/stories/add',
    name: 'AddStory',
    component: AddStory,
    meta: { layout: 'default', requiresAuth: true }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  const token = cookieUtils.get('accessToken')
  const userStr = localStorage.getItem('user')
  const user = userStr ? JSON.parse(userStr) : null
  
  if (to.meta.requiresAuth && !token) {
    next('/login')
    return
  }

  if (to.meta.requiresAdmin) {
    if (!token || !user || (user.role !== 1 && user.role !== '1')) {
      next('/dashboard')
      return
    }
  }

  next()
})

export default router

