// src/hooks/fastapihooks/fastapihooks.js
import { useMemo } from 'react';
import FastApiService from '../../services/fastApi/FastApiService';
import { useAuth } from '../../app/AuthContext';

/**
 * A custom hook to expose a memoized API client for the FastAPI backend.
 * This hook provides a consistent and reusable way to interact with all
 * the backend's endpoints without needing to import the service directly.
 *
 * It uses `useMemo` to ensure the API object is not recreated on every render,
 * improving performance in React components. It also handles authentication by
 * checking for a user token.
 *
 * @returns {object} An object containing all API functions.
 */
export function useFastApi() {
  const { token } = useAuth();

  const api = useMemo(() => {
    // If there is no token, return a set of no-op functions.
    // This prevents API calls from being attempted when the user is logged out.
    if (!token) {
      return {
        // Customers
        listCustomers: () => Promise.resolve([]),
        getCustomer: () => Promise.resolve(null),
        createCustomer: () => Promise.resolve(null),
        updateCustomer: () => Promise.resolve(null),
        deleteCustomer: () => Promise.resolve(null),

        // Meters
        listMeters: () => Promise.resolve([]),
        getMeter: () => Promise.resolve(null),
        createMeter: () => Promise.resolve(null),
        updateMeter: () => Promise.resolve(null),
        deleteMeter: () => Promise.resolve(null),

        // Datacenters
        listDatacenters: () => Promise.resolve([]),
        getDatacenter: () => Promise.resolve(null),
        createDatacenter: () => Promise.resolve(null),
        updateDatacenter: () => Promise.resolve(null),
        deleteDatacenter: () => Promise.resolve(null),

        // Racks
        listRacks: () => Promise.resolve([]),
        getRack: () => Promise.resolve(null),
        createRack: () => Promise.resolve(null),
        updateRack: () => Promise.resolve(null),
        deleteRack: () => Promise.resolve(null),

        // Customer Mappings
        listCustomerMappings: () => Promise.resolve([]),
        getCustomerMapping: () => Promise.resolve(null),
        createCustomerMapping: () => Promise.resolve(null),
        updateCustomerMapping: () => Promise.resolve(null),
        deleteCustomerMapping: () => Promise.resolve(null),

        // Formula Billings
        listFormulaBillings: () => Promise.resolve([]),
        getFormulaBilling: () => Promise.resolve(null),
        createFormulaBilling: () => Promise.resolve(null),
        updateFormulaBilling: () => Promise.resolve(null),
        deleteFormulaBilling: () => Promise.resolve(null),

        // Meter Readings (NEW)
        listMeterReadings: () => Promise.resolve([]),
        createMeterReading: () => Promise.resolve(null),
      };
    }

    // If there is a token, return the actual API functions.
    return {
      // Customers
      listCustomers: (skip, limit) => FastApiService.listCustomers(skip, limit, token),
      getCustomer: (customerId) => FastApiService.getCustomer(customerId, token),
      createCustomer: (payload) => FastApiService.createCustomer(payload, token),
      updateCustomer: (customerId, payload) => FastApiService.updateCustomer(customerId, payload, token),
      deleteCustomer: (customerId) => FastApiService.deleteCustomer(customerId, token),

      // Meters
      listMeters: (skip, limit) => FastApiService.listMeters(skip, limit, token),
      getMeter: (meterId) => FastApiService.getMeter(meterId, token),
      createMeter: (payload) => FastApiService.createMeter(payload, token),
      updateMeter: (meterId, payload) => FastApiService.updateMeter(meterId, payload, token),
      deleteMeter: (meterId) => FastApiService.deleteMeter(meterId, token),

      // Datacenters
      listDatacenters: (skip, limit) => FastApiService.listDatacenters(skip, limit, token),
      getDatacenter: (datacenterId) => FastApiService.getDatacenter(datacenterId, token),
      createDatacenter: (payload) => FastApiService.createDatacenter(payload, token),
      updateDatacenter: (datacenterId, payload) => FastApiService.updateDatacenter(datacenterId, payload, token),
      deleteDatacenter: (datacenterId) => FastApiService.deleteDatacenter(datacenterId, token),

      // Racks
      listRacks: (skip, limit) => FastApiService.listRacks(skip, limit, token),
      getRack: (rackId) => FastApiService.getRack(rackId, token),
      createRack: (payload) => FastApiService.createRack(payload, token),
      updateRack: (rackId, payload) => FastApiService.updateRack(rackId, payload, token),
      deleteRack: (rackId) => FastApiService.deleteRack(rackId, token),

      // Customer Mappings
      listCustomerMappings: (skip, limit) => FastApiService.listCustomerMappings(skip, limit, token),
      getCustomerMapping: (mappingId) => FastApiService.getCustomerMapping(mappingId, token),
      createCustomerMapping: (payload) => FastApiService.createCustomerMapping(payload, token),
      updateCustomerMapping: (mappingId, payload) => FastApiService.updateCustomerMapping(mappingId, payload, token),
      deleteCustomerMapping: (mappingId) => FastApiService.deleteCustomerMapping(mappingId, token),

      // Formula Billings
      listFormulaBillings: (skip, limit) => FastApiService.listFormulaBillings(skip, limit, token),
      getFormulaBilling: (fbId) => FastApiService.getFormulaBilling(fbId, token),
      createFormulaBilling: (payload) => FastApiService.createFormulaBilling(payload, token),
      updateFormulaBilling: (fbId, payload) => FastApiService.updateFormulaBilling(fbId, payload, token),
      deleteFormulaBilling: (fbId) => FastApiService.deleteFormulaBilling(fbId, token),
      
      // Meter Readings (NEW)
      listMeterReadings: (skip, limit) => FastApiService.listMeterReadings(skip, limit, token),
      // createMeterReading: (payload) => FastApiService.createMeterReading(payload, token),
    };
  }, [token]);

  return api;
}