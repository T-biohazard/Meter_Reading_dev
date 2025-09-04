// src/services/fastApi/FastApiService.js
/**
 * @fileoverview FastApiService: a dedicated service for handling API communication
 * with the FastAPI backend.
 */

const API_BASE_URL = "http://localhost:8001";

/**
 * Handles the API response, parsing JSON and throwing an error for non-OK statuses.
 * @param {Response} response The fetch API response object.
 * @returns {Promise<any>} The parsed JSON data.
 */
async function handleApiResponse(response) {
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message = data?.detail?.map(d => `${d.loc.join(" -> ")}: ${d.msg}`).join("\n") || data?.message || `Request failed with status ${response.status}`;
    throw new Error(message);
  }
  return data;
}

/**
 * A general-purpose helper for making API requests.
 * @param {string} path The API endpoint path.
 * @param {RequestInit} options The fetch options object.
 * @param {string | null} token An optional JWT token for authorization.
 * @returns {Promise<any>} The parsed API response.
 */
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

const FastApiService = {
  // ===== Customers Endpoints =====
  listCustomers: async (skip = 0, limit = 100, token = null) => apiRequest(`/customers/?skip=${skip}&limit=${limit}`, { method: "GET" }, token),
  getCustomer: async (customerId, token = null) => apiRequest(`/customers/${customerId}`, { method: "GET" }, token),
  createCustomer: async (payload, token = null) => apiRequest("/customers/", { method: "POST", body: JSON.stringify(payload) }, token),
  updateCustomer: async (customerId, payload, token = null) => apiRequest(`/customers/${customerId}`, { method: "PUT", body: JSON.stringify(payload) }, token),
  deleteCustomer: async (customerId, token = null) => apiRequest(`/customers/${customerId}`, { method: "DELETE" }, token),

  // ===== Meters Endpoints =====
  listMeters: async (skip = 0, limit = 100, token = null) => apiRequest(`/meters/?skip=${skip}&limit=${limit}`, { method: "GET" }, token),
  getMeter: async (meterId, token = null) => apiRequest(`/meters/${meterId}`, { method: "GET" }, token),
  createMeter: async (payload, token = null) => apiRequest("/meters/", { method: "POST", body: JSON.stringify(payload) }, token),
  updateMeter: async (meterId, payload, token = null) => apiRequest(`/meters/${meterId}`, { method: "PUT", body: JSON.stringify(payload) }, token),
  deleteMeter: async (meterId, token = null) => apiRequest(`/meters/${meterId}`, { method: "DELETE" }, token),

  // ===== Datacenters Endpoints =====
  listDatacenters: async (skip = 0, limit = 100, token = null) => apiRequest(`/datacenters/?skip=${skip}&limit=${limit}`, { method: "GET" }, token),
  getDatacenter: async (datacenterId, token = null) => apiRequest(`/datacenters/${datacenterId}`, { method: "GET" }, token),
  createDatacenter: async (payload, token = null) => apiRequest("/datacenters/", { method: "POST", body: JSON.stringify(payload) }, token),
  updateDatacenter: async (datacenterId, payload, token = null) => apiRequest(`/datacenters/${datacenterId}`, { method: "PUT", body: JSON.stringify(payload) }, token),
  deleteDatacenter: async (datacenterId, token = null) => apiRequest(`/datacenters/${datacenterId}`, { method: "DELETE" }, token),

  // ===== Racks Endpoints =====
  listRacks: async (skip = 0, limit = 10, token = null) => apiRequest(`/racks/?skip=${skip}&limit=${limit}`, { method: "GET" }, token),
  getRack: async (rackId, token = null) => apiRequest(`/racks/${rackId}`, { method: "GET" }, token),
  createRack: async (payload, token = null) => apiRequest("/racks/", { method: "POST", body: JSON.stringify(payload) }, token),
  updateRack: async (rackId, payload, token = null) => apiRequest(`/racks/${rackId}`, { method: "PUT", body: JSON.stringify(payload) }, token),
  deleteRack: async (rackId, token = null) => apiRequest(`/racks/${rackId}`, { method: "DELETE" }, token),

  // ===== Customer Mapping Endpoints =====
  listCustomerMappings: async (skip = 0, limit = 100, token = null) => apiRequest(`/customer-mapping/?skip=${skip}&limit=${limit}`, { method: "GET" }, token),
  getCustomerMapping: async (mappingId, token = null) => apiRequest(`/customer-mapping/${mappingId}`, { method: "GET" }, token),
  createCustomerMapping: async (payload, token = null) => apiRequest("/customer-mapping/", { method: "POST", body: JSON.stringify(payload) }, token),
  updateCustomerMapping: async (mappingId, payload, token = null) => apiRequest(`/customer-mapping/${mappingId}`, { method: "PUT", body: JSON.stringify(payload) }, token),
  deleteCustomerMapping: async (mappingId, token = null) => apiRequest(`/customer-mapping/${mappingId}`, { method: "DELETE" }, token),

  // ===== Formula Billing Endpoints =====
  listFormulaBillings: async (skip = 0, limit = 100, token = null) => apiRequest(`/formula-billing/?skip=${skip}&limit=${limit}`, { method: "GET" }, token),
  getFormulaBilling: async (fbId, token = null) => apiRequest(`/formula-billing/${fbId}`, { method: "GET" }, token),
  createFormulaBilling: async (payload, token = null) => apiRequest("/formula-billing/", { method: "POST", body: JSON.stringify(payload) }, token),
  updateFormulaBilling: async (fbId, payload, token = null) => apiRequest(`/formula-billing/${fbId}`, { method: "PUT", body: JSON.stringify(payload) }, token),
  deleteFormulaBilling: async (fbId, token = null) => apiRequest(`/formula-billing/${fbId}`, { method: "DELETE" }, token),

  // ===== Meter Readings Endpoints (NEW) =====
  listMeterReadings: async (skip = 0, limit = 10, token = null) => apiRequest(`/meter_readings_1/?skip=${skip}&limit=${limit}`, { method: "GET" }, token),
  // createMeterReading: async (payload, token = null) => apiRequest("/meter_readings_1/", { method: "POST", body: JSON.stringify(payload) }, token),

};

export default FastApiService;