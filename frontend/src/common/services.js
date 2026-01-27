import apiClient from "./api";
import { cookieUtils, storageUtils } from "./utils";
import { TOKEN_EXPIRATION } from "./constants";

export const authService = {
  async login(email, password, rememberMe = false) {
    const response = await apiClient.post("/auth/login", {
      email,
      password,
      rememberMe,
    });

    const accessToken = response.data?.accessToken || response.data?.AccessToken;
    const user = response.data?.user || response.data?.User;

    if (accessToken) {
      const tokenExpirationMinutes = rememberMe 
        ? TOKEN_EXPIRATION.ACCESS_TOKEN_MINUTES * 2 
        : TOKEN_EXPIRATION.ACCESS_TOKEN_MINUTES;
      cookieUtils.set("accessToken", accessToken, tokenExpirationMinutes);
    } else {
      cookieUtils.remove("accessToken");
    }

    if (user) {
      storageUtils.set("user", user);
    }

    return response.data;
  },

  async register(username, email, password, fullName) {
    const response = await apiClient.post("/auth/register", {
      username,
      email,
      password,
      fullName,
    });
    return response.data;
  },

  async refreshToken() {
    const response = await apiClient.post("/auth/refresh", {});

    const newAccessToken = response.data?.accessToken || response.data?.AccessToken;
    const user = response.data?.user || response.data?.User;

    if (newAccessToken) {
      cookieUtils.set("accessToken", newAccessToken, TOKEN_EXPIRATION.ACCESS_TOKEN_MINUTES);
    } else {
      cookieUtils.remove("accessToken");
    }

    if (user) {
      storageUtils.set("user", user);
    }

    return response.data;
  },

  logout() {
    cookieUtils.remove("accessToken");
    storageUtils.remove("user");
  },

  async forgotPassword(email) {
    const response = await apiClient.post("/auth/forgot-password", {
      email,
    });
    return response.data;
  },

  async resetPassword(email, token, newPassword) {
    const response = await apiClient.post("/auth/reset-password", {
      email,
      token,
      newPassword,
    });
    return response.data;
  },
};

export const storyService = {
  getAll(featured = null) {
    const params = featured !== null ? { featured } : {};
    return apiClient.get("/stories", { params });
  },

  getById(id) {
    return apiClient.get(`/stories/${id}`);
  },

  getPopular(limit = 5) {
    return apiClient.get("/stories/popular", { params: { limit } });
  },

  getStats() {
    return apiClient.get("/stories/stats");
  },

  create(data) {
    return apiClient.post("/stories", data);
  },

  update(id, data) {
    return apiClient.put(`/stories/${id}`, data);
  },

  delete(id) {
    return apiClient.delete(`/stories/${id}`);
  },
};

export const userService = {
  getAll() {
    return apiClient.get("/admin/users");
  },

  getById(id) {
    return apiClient.get(`/admin/users/${id}`);
  },

  update(id, data) {
    return apiClient.put(`/admin/users/${id}`, data);
  },

  delete(id) {
    return apiClient.delete(`/admin/users/${id}`);
  },
};

export const categoryService = {
  getAll() {
    return apiClient.get("/categories");
  },
  getTree() {
    return apiClient.get("/categories/tree");
  },

  create(data) {
    return apiClient.post("/categories", data);
  },

  update(id, data) {
    return apiClient.put(`/categories/${id}`, data);
  },

  delete(id) {
    return apiClient.delete(`/categories/${id}`);
  },
};

export const productService = {
  getAll(featured = null, categoryId = null) {
    const params = {};
    if (featured !== null) params.featured = featured;
    if (categoryId !== null) params.categoryId = categoryId;
    return apiClient.get("/products", { params });
  },

  getById(id) {
    return apiClient.get(`/products/${id}`);
  },

  getPopular(limit = 5) {
    return apiClient.get("/products/popular", { params: { limit } });
  },

  create(data) {
    return apiClient.post("/products", data);
  },

  update(id, data) {
    return apiClient.put(`/products/${id}`, data);
  },

  delete(id) {
    return apiClient.delete(`/products/${id}`);
  },
};

export const chatService = {
  sendMessage(message) {
    return apiClient.post("/chat", { message });
  },
};

export const cartService = {
  getAll() {
    return apiClient.get("/cart");
  },
  getCount() {
    return apiClient.get("/cart/count");
  },
  contains(productId) {
    return apiClient.get(`/cart/contains/${productId}`);
  },
  add(productId, quantity = 1) {
    return apiClient.post("/cart/add", { productId, quantity });
  },
  update(productId, quantity) {
    return apiClient.put(`/cart/${productId}`, { quantity });
  },
  remove(productId) {
    return apiClient.delete(`/cart/${productId}`);
  },
};

export const favoriteService = {
  getAll() {
    return apiClient.get("/favorites");
  },
  contains(productId) {
    return apiClient.get(`/favorites/contains/${productId}`);
  },
  getCount(productId) {
    return apiClient.get(`/favorites/count/${productId}`);
  },
  add(productId) {
    return apiClient.post("/favorites", { productId });
  },
  remove(productId) {
    return apiClient.delete(`/favorites/${productId}`);
  },
};
