import { createRouter, createWebHistory } from 'vue-router'
import About from '../views/About.vue'
import Login from '../views/Login.vue'
import Register from '../views/Register.vue'
import Dashboard from '../views/Dashboard.vue'
import AddStory from '../views/AddStory.vue'

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

export default router

