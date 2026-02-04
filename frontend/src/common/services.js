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

export const analyticsService = {
  getRevenue(period = "month") {
    return apiClient.get("/admin/analytics/revenue", { params: { period } });
  },
};

export const bannerService = {
  getAll(activeOnly = true) {
    return apiClient.get("/banners", { params: { activeOnly } });
  },
  getById(id) {
    return apiClient.get(`/banners/${id}`);
  },
  create(data) {
    return apiClient.post("/banners", data);
  },
  update(id, data) {
    return apiClient.put(`/banners/${id}`, data);
  },
  delete(id) {
    return apiClient.delete(`/banners/${id}`);
  },
};

export const chatService = {
  sendMessage(message) {
    return apiClient.post("/chat", { message });
  },
};

export const profileService = {
  get() {
    return apiClient.get("/profile");
  },
  update(data) {
    return apiClient.put("/profile", data);
  },
  uploadAvatar(file) {
    const formData = new FormData();
    formData.append("file", file);
    return apiClient.post("/profile/avatar", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },
  changePassword(oldPassword, newPassword) {
    return apiClient.post("/profile/change-password", { oldPassword, newPassword });
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
  clear() {
    return apiClient.delete("/cart/clear");
  },
};

export const orderService = {
  create(data) {
    return apiClient.post("/orders", data);
  },
  getAll() {
    return apiClient.get("/orders");
  },
  getById(id) {
    return apiClient.get(`/orders/${id}`);
  },
};

export const addressService = {
  getAll() {
    return apiClient.get("/addresses");
  },
  getById(id) {
    return apiClient.get(`/addresses/${id}`);
  },
  create(data) {
    return apiClient.post("/addresses", data);
  },
  update(id, data) {
    return apiClient.put(`/addresses/${id}`, data);
  },
  delete(id) {
    return apiClient.delete(`/addresses/${id}`);
  },
  setDefault(id) {
    return apiClient.patch(`/addresses/${id}/set-default`);
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

export const submitContact = async (contactData) => {
  try {
    const response = await apiClient.post("/contact/submit", contactData);
    return response.data;
  } catch (error) {
    throw error;
  }
};
