/**
 * @fileoverview FastApiService: handles API communication with the FastAPI backend.
 */

const API_BASE_URL = "http://localhost:8001";

/**
 * Handles API response, parses JSON, throws error for non-OK statuses.
 */
async function handleApiResponse(response) {
  // If the response is a 404 for a meter readings endpoint, return an empty array instead of throwing an error.
  if (response.status === 404 && response.url.includes('meter_readings_combined') || response.url.includes('meter_readings_combined_logs')) {
    return []; 
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const message = data?.detail?.map(d => `${d.loc.join(" -> ")}: ${d.msg}`).join("\n") || data?.message || `Request failed with status ${response.status}`;
    throw new Error(message);
  }

  return data;
}

/**
 * General-purpose API request helper.
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
  // ===== Customers =====
  listCustomers: (skip = 0, limit = 100, token = null) =>
    apiRequest(`/customers/?skip=${skip}&limit=${limit}`, { method: "GET" }, token),
  getCustomer: (customerId, token = null) =>
    apiRequest(`/customers/${customerId}`, { method: "GET" }, token),
  createCustomer: (payload, token = null) =>
    apiRequest("/customers/", { method: "POST", body: JSON.stringify(payload) }, token),
  updateCustomer: (customerId, payload, token = null) =>
    apiRequest(`/customers/${customerId}`, { method: "PUT", body: JSON.stringify(payload) }, token),
  deleteCustomer: (customerId, token = null) =>
    apiRequest(`/customers/${customerId}`, { method: "DELETE" }, token),

  // ===== Meters =====
  listMeters: (skip = 0, limit = 100, token = null) =>
    apiRequest(`/meters/?skip=${skip}&limit=${limit}`, { method: "GET" }, token),
  getMeter: (meterId, token = null) =>
    apiRequest(`/meters/${meterId}`, { method: "GET" }, token),
  createMeter: (payload, token = null) =>
    apiRequest("/meters/", { method: "POST", body: JSON.stringify(payload) }, token),
  updateMeter: (meterId, payload, token = null) =>
    apiRequest(`/meters/${meterId}`, { method: "PUT", body: JSON.stringify(payload) }, token),
  deleteMeter: (meterId, token = null) =>
    apiRequest(`/meters/${meterId}`, { method: "DELETE" }, token),

  // ===== Datacenters =====
  listDatacenters: (skip = 0, limit = 100, token = null) =>
    apiRequest(`/datacenters/?skip=${skip}&limit=${limit}`, { method: "GET" }, token),
  getDatacenter: (datacenterId, token = null) =>
    apiRequest(`/datacenters/${datacenterId}`, { method: "GET" }, token),
  createDatacenter: (payload, token = null) =>
    apiRequest("/datacenters/", { method: "POST", body: JSON.stringify(payload) }, token),
  updateDatacenter: (datacenterId, payload, token = null) =>
    apiRequest(`/datacenters/${datacenterId}`, { method: "PUT", body: JSON.stringify(payload) }, token),
  deleteDatacenter: (datacenterId, token = null) =>
    apiRequest(`/datacenters/${datacenterId}`, { method: "DELETE" }, token),

  // ===== Racks =====
  listRacks: (skip = 0, limit = 10, token = null) =>
    apiRequest(`/racks/?skip=${skip}&limit=${limit}`, { method: "GET" }, token),
  getRack: (rackId, token = null) =>
    apiRequest(`/racks/${rackId}`, { method: "GET" }, token),
  createRack: (payload, token = null) =>
    apiRequest("/racks/", { method: "POST", body: JSON.stringify(payload) }, token),
  updateRack: (rackId, payload, token = null) =>
    apiRequest(`/racks/${rackId}`, { method: "PUT", body: JSON.stringify(payload) }, token),
  deleteRack: (rackId, token = null) =>
    apiRequest(`/racks/${rackId}`, { method: "DELETE" }, token),

  // ===== Customer Mapping =====
  listCustomerMappings: (skip = 0, limit = 100, token = null) =>
    apiRequest(`/customer-mapping/?skip=${skip}&limit=${limit}`, { method: "GET" }, token),
  getCustomerMapping: (mappingId, token = null) =>
    apiRequest(`/customer-mapping/${mappingId}`, { method: "GET" }, token),
  createCustomerMapping: (payload, token = null) =>
    apiRequest("/customer-mapping/", { method: "POST", body: JSON.stringify(payload) }, token),
  updateCustomerMapping: (mappingId, payload, token = null) =>
    apiRequest(`/customer-mapping/${mappingId}`, { method: "PUT", body: JSON.stringify(payload) }, token),
  deleteCustomerMapping: (mappingId, token = null) =>
    apiRequest(`/customer-mapping/${mappingId}`, { method: "DELETE" }, token),

  // ===== Formula Billing =====
  listFormulaBillings: (skip = 0, limit = 100, token = null) =>
    apiRequest(`/formula-billing/?skip=${skip}&limit=${limit}`, { method: "GET" }, token),
  getFormulaBilling: (fbId, token = null) =>
    apiRequest(`/formula-billing/${fbId}`, { method: "GET" }, token),
  createFormulaBilling: (payload, token = null) =>
    apiRequest("/formula-billing/", { method: "POST", body: JSON.stringify(payload) }, token),
  updateFormulaBilling: (fbId, payload, token = null) =>
    apiRequest(`/formula-billing/${fbId}`, { method: "PUT", body: JSON.stringify(payload) }, token),
  deleteFormulaBilling: (fbId, token = null) =>
    apiRequest(`/formula-billing/${fbId}`, { method: "DELETE" }, token),

  // ===== Meter Readings 1 & 2 =====
  listMeterReadings1: (skip = 0, limit = 10, token = null) =>
    apiRequest(`/meter_readings_1/?skip=${skip}&limit=${limit}`, { method: "GET" }, token),
  listMeterReadings2: (skip = 0, limit = 10, token = null) =>
    apiRequest(`/meter_readings_2/?skip=${skip}&limit=${limit}`, { method: "GET" }, token),

  // ===== Combined Meter Readings =====
  listCombinedReadingsByMeter: (meter_id, limit = 10, token = null) =>
    apiRequest(`/meter_readings_combined/${meter_id}?limit=${limit}`, { method: "GET" }, token),
  listCombinedReadingsRecent: (limit = 10, token = null) =>
    apiRequest(`/meter_readings_combined/?limit=${limit}`, { method: "GET" }, token),

  // ===== Meter Readings Topic 1 Logs =====
  listMeterReadingTopic1Logs: (skip = 0, limit = 100, startTime = null, endTime = null, meterId = null, token = null) => {
    let path = `/meter_readings_topic1_logs/?skip=${skip}&limit=${limit}`;
    if (startTime) path += `&start_time=${startTime.toISOString()}`;
    if (endTime) path += `&end_time=${endTime.toISOString()}`;
    if (meterId) path += `&meter_id=${meterId}`;
    return apiRequest(path, { method: "GET" }, token);
  },
  createMeterReadingTopic1Logs: (payload, token = null) =>
    apiRequest("/meter_readings_topic1_logs/", { method: "POST", body: JSON.stringify(payload) }, token),
  
  // ===== Meter Readings Topic 2 Logs =====
  listMeterReadingTopic2Logs: (skip = 0, limit = 100, startTime = null, endTime = null, meterId = null, token = null) => {
    let path = `/meter_readings_topic2_logs/?skip=${skip}&limit=${limit}`;
    if (startTime) path += `&start_time=${startTime.toISOString()}`;
    if (endTime) path += `&end_time=${endTime.toISOString()}`;
    if (meterId) path += `&meter_id=${meterId}`;
    return apiRequest(path, { method: "GET" }, token);
  },
  createMeterReadingTopic2Logs: (payload, token = null) =>
    apiRequest("/meter_readings_topic2_logs/", { method: "POST", body: JSON.stringify(payload) }, token),

  // ===== Combined Meter Readings Logs =====
  listCombinedLogsByMeter: (meter_id, limit = 10, token = null) =>
    apiRequest(`/meter_readings_combined_logs/${meter_id}?limit=${limit}`, { method: "GET" }, token),
  listCombinedLogsRecent: (limit = 10, token = null) =>
    apiRequest(`/meter_readings_combined_logs/?limit=${limit}`, { method: "GET" }, token),
};

export default FastApiService;