export const API_BASE_URL = import.meta.env.VITE_API_URL 
  ? `${import.meta.env.VITE_API_URL}/api` 
  : 'http://localhost:5000/api'

export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password',
  DASHBOARD: '/dashboard',
  SHOP: '/shop',
  PRODUCT_DETAIL: '/products/:id',
  PROFILE: '/profile',
  PROFILE_EDIT: '/profile/edit',
  CART: '/cart',
  CHECKOUT: '/checkout',
  THANK_YOU: '/thank-you',
  ABOUT: '/about',
  ADMIN: '/admin',
  ADMIN_STORIES_LIST: '/admin/stories/list',
  ADMIN_STORIES_CREATE: '/admin/stories/create',
  ADMIN_STORIES_EDIT: '/admin/stories/edit',
  ADMIN_USERS_LIST: '/admin/users/list',
  ADMIN_USERS_CREATE: '/admin/users/create',
  ADMIN_USERS_EDIT: '/admin/users/edit',
  ADMIN_CATEGORIES_LIST: '/admin/categories/list',
  ADMIN_CATEGORIES_CREATE: '/admin/categories/create',
  ADMIN_CATEGORIES_EDIT: '/admin/categories/edit'
}

export const STORAGE_KEYS = {
  USER: 'user',
  ACCESS_TOKEN: 'token',
  REFRESH_TOKEN: 'refreshToken'
}

export const TOKEN_EXPIRATION = {
  ACCESS_TOKEN_MINUTES: 1,
  REFRESH_TOKEN_DAYS: 30
}

