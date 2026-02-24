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
    EDIT_PROFILE: '/profile/edit',
    ADDRESSES: '/profile/addresses',
    USER_ORDERS_LIST: '/orders',
    USER_ORDERS_DETAIL: '/orders',
    CART: '/cart',
    CHECKOUT: '/checkout',
    CHECKOUT_THANK_YOU: '/checkout/thank-you',
    ABOUT: '/about',
  DIAMOND_INFO: '/diamond-info',
  ADMIN: '/admin',
  ADMIN_USERS_LIST: '/admin/users/list',
  ADMIN_USERS_CREATE: '/admin/users/create',
  ADMIN_USERS_EDIT: '/admin/users/edit',
  ADMIN_CATEGORIES_LIST: '/admin/categories/list',
  ADMIN_CATEGORIES_CREATE: '/admin/categories/create',
  ADMIN_CATEGORIES_EDIT: '/admin/categories/edit',
  ADMIN_PRODUCTS_LIST: '/admin/products/list',
  ADMIN_PRODUCTS_CREATE: '/admin/products/create',
  ADMIN_PRODUCTS_EDIT: '/admin/products/edit',
  ADMIN_BANNERS_LIST: '/admin/banners/list',
  ADMIN_BANNERS_CREATE: '/admin/banners/create',
  ADMIN_BANNERS_EDIT: '/admin/banners/edit',
  ADMIN_ORDERS_LIST: '/admin/orders/list',
  ADMIN_ORDERS_DETAIL: '/admin/orders/detail',
  ADMIN_REPORTS_DASHBOARD: '/admin/reports',
  ADMIN_REPORTS_PRODUCTS: '/admin/reports/products',
  ADMIN_REPORTS_USERS: '/admin/reports/users',
  ADMIN_REPORTS_INVOICES: '/admin/reports/invoices'
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

