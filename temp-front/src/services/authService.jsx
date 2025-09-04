// src/services/authService.jsx

/**
 * @fileoverview Auth service: handles API communication with the Laravel backend.
 * Also includes CRUD helpers for Menu Page Elements (phase 8).
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

async function handleApiResponse(response) {
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message = data?.message || `Request failed with status ${response.status}`;
    throw new Error(message);
  }
  return data;
}

async function apiRequest(path, options = {}, token = null) {
  const headers = {
    Accept: "application/json",
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });

  return handleApiResponse(response);
}

const authService = {
  // ===== Auth =====
  login: async (name, password) => {
    const data = await apiRequest("/login", {
      method: "POST",
      body: JSON.stringify({ name, password }),
    });
    return { user: data.user, token: data.token };
  },

  logout: async (token) => {
    await apiRequest("/logout", { method: "POST" }, token);
    return true;
  },

  register: async (payload) => {
    const data = await apiRequest("/register", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    return { user: data.user, token: data.token };
  },

  // ===== Roles & Permissions =====
  getPageElements: async (token) => {
    const data = await apiRequest("/page-elements", { method: "GET" }, token);
    return data.page_elements || [];
  },
  
  getRoles: async (token) => {
    const data = await apiRequest("/roles", { method: "GET" }, token);
    return data.roles || [];
  },

  getPermissions: async (token) => {
    const data = await apiRequest("/permissions", { method: "GET" }, token);
    return data.permissions || [];
  },

  syncPermissions: async (token) => {
    return apiRequest("/AddRouteToPermission", { method: "POST" }, token);
  },

  createRole: async (payload, token) => {
    return apiRequest("/roles", {
      method: "POST",
      body: JSON.stringify(payload),
    }, token);
  },

  updateRole: async (id, payload, token) => {
    return apiRequest(`/roles/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    }, token);
  },

  deleteRole: async (id, token) => {
    return apiRequest(`/roles/${id}`, { method: "DELETE" }, token);
  },

  // ===== Menu Page Elements (Phase 8) =====
  // GET /menu-page-elements
  listMenuPageElements: async (token) => {
  const data = await apiRequest("/page-elements-menu", { method: "GET" }, token);
  return Array.isArray(data) ? data : data.page_elements || [];
},

  // POST /menu-page-elements
  createMenuPageElement: async (payload, token) => {
    return apiRequest("/page-elements", {
      method: "POST",
      body: JSON.stringify(payload),
    }, token);
  },

  // GET /menu-page-elements/{id}
  getMenuPageElement: async (id, token) => {
    return apiRequest(`/page-elements/${id}`, { method: "GET" }, token);
  },

  // PUT /menu-page-elements/{id}
  updateMenuPageElement: async (id, payload, token) => {
    return apiRequest(`/page-elements/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    }, token);
  },

  // DELETE /menu-page-elements/{id}
  deleteMenuPageElement: async (id, token) => {
    return apiRequest(`/page-elements/${id}`, { method: "DELETE" }, token);
  },
  
  // ===== Page Roles Pivot Table =====
  // PUT /page-elements/{id}/roles
  updatePageRoles: async (pageId, roleIds, token) => {
    return apiRequest(`/page-elements/${pageId}/roles`, {
      method: "PUT",
      body: JSON.stringify({ role_ids: roleIds }),
    }, token);
  },

  // expose low-level helper if you need it elsewhere
  apiRequest,
};

export default authService;