export const cookieUtils = {
  set(name, value, minutes = 1) {
    if (!value) {
      return;
    }

    const expires = new Date();
    expires.setTime(expires.getTime() + minutes * 60 * 1000);

    const isSecure = window.location.protocol === "https:";
    const secureFlag = isSecure ? "; Secure" : "";
    const sameSite = "SameSite=Lax";

    const cookieString = `${name}=${encodeURIComponent(value)}; expires=${expires.toUTCString()}; path=/; ${sameSite}${secureFlag}`;

    document.cookie = cookieString;
  },

  get(name) {
    const nameEQ = name + "=";
    const cookies = document.cookie.split(";");

    for (let i = 0; i < cookies.length; i++) {
      let cookie = cookies[i];
      while (cookie.charAt(0) === " ") {
        cookie = cookie.substring(1, cookie.length);
      }
      if (cookie.indexOf(nameEQ) === 0) {
        const value = decodeURIComponent(cookie.substring(nameEQ.length, cookie.length));
        return value;
      }
    }
    return null;
  },

  remove(name) {
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/`;
  },
};

export const storageUtils = {
  set(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  },

  get(key) {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  },

  remove(key) {
    localStorage.removeItem(key);
  },
};

export const isAuthenticated = () => {
  return cookieUtils.get("accessToken") !== null;
};

export const isAdmin = () => {
  const user = storageUtils.get("user");
  return user && (user.role === 1 || user.role === "1");
};

export const getCurrentUser = () => {
  return storageUtils.get("user");
};

export const logout = () => {
  cookieUtils.remove("accessToken");
  storageUtils.remove("user");
};
