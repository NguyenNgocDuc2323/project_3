import { createRouter, createWebHistory } from 'vue-router'
import About from '../views/About.vue'
import Login from '../views/Login.vue'
import Register from '../views/Register.vue'
import Dashboard from '../views/user/Dashboard.vue'
import AdminDashboard from '../views/admin/Dashboard.vue'
import StoriesList from '../views/admin/stories/List.vue'
import StoriesCreate from '../views/admin/stories/Create.vue'
import StoriesEdit from '../views/admin/stories/Edit.vue'
import UsersList from '../views/admin/users/List.vue'
import UsersEdit from '../views/admin/users/Edit.vue'
import CategoriesList from '../views/admin/categories/List.vue'
import CategoriesCreate from '../views/admin/categories/Create.vue'
import CategoriesEdit from '../views/admin/categories/Edit.vue'
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
    path: '/admin/stories/list',
    name: 'StoriesList',
    component: StoriesList,
    meta: { layout: 'default', requiresAuth: true, requiresAdmin: true }
  },
  {
    path: '/admin/stories/create',
    name: 'StoriesCreate',
    component: StoriesCreate,
    meta: { layout: 'default', requiresAuth: true, requiresAdmin: true }
  },
  {
    path: '/admin/stories/edit/:id',
    name: 'StoriesEdit',
    component: StoriesEdit,
    meta: { layout: 'default', requiresAuth: true, requiresAdmin: true }
  },
  {
    path: '/admin/users/list',
    name: 'UsersList',
    component: UsersList,
    meta: { layout: 'default', requiresAuth: true, requiresAdmin: true }
  },
  {
    path: '/admin/users/edit/:id',
    name: 'UsersEdit',
    component: UsersEdit,
    meta: { layout: 'default', requiresAuth: true, requiresAdmin: true }
  },
  {
    path: '/admin/categories/list',
    name: 'CategoriesList',
    component: CategoriesList,
    meta: { layout: 'default', requiresAuth: true, requiresAdmin: true }
  },
  {
    path: '/admin/categories/create',
    name: 'CategoriesCreate',
    component: CategoriesCreate,
    meta: { layout: 'default', requiresAuth: true, requiresAdmin: true }
  },
  {
    path: '/admin/categories/edit/:id',
    name: 'CategoriesEdit',
    component: CategoriesEdit,
    meta: { layout: 'default', requiresAuth: true, requiresAdmin: true }
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

