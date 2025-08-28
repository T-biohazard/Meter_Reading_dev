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
// --- Menu Page Elements (Phase 8) ---
const menu = {
  getAll: async (token) => {
    // GET /menu-page-elements  -> returns an array
    return apiRequest("/menu-page-elements", { method: "GET" }, token);
  },
  getOne: async (id, token) => {
    return apiRequest(`/menu-page-elements/${id}`, { method: "GET" }, token);
  },
  create: async (payload, token) => {
    return apiRequest("/menu-page-elements", {
      method: "POST",
      body: JSON.stringify(payload),
    }, token);
  },
  update: async (id, payload, token) => {
    return apiRequest(`/menu-page-elements/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    }, token);
  },
  remove: async (id, token) => {
    return apiRequest(`/menu-page-elements/${id}`, { method: "DELETE" }, token);
  },
};

const authService = {
  // ...your existing exports
  menu, // <- export the menu namespace
};

export default authService;
