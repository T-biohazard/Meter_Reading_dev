import { useMemo } from 'react';
import FastApiService from '../../services/fastApi/FastApiService';
import { useAuth } from '../../app/AuthContext';

export function useFastApi() {
  const { token } = useAuth();

  const api = useMemo(() => {
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

        // Customer Mapping
        listCustomerMappings: () => Promise.resolve([]),
        getCustomerMapping: () => Promise.resolve(null),
        createCustomerMapping: () => Promise.resolve(null),
        updateCustomerMapping: () => Promise.resolve(null),
        deleteCustomerMapping: () => Promise.resolve(null),

        // Formula Billing
        listFormulaBillings: () => Promise.resolve([]),
        getFormulaBilling: () => Promise.resolve(null),
        createFormulaBilling: () => Promise.resolve(null),
        updateFormulaBilling: () => Promise.resolve(null),
        deleteFormulaBilling: () => Promise.resolve(null),

        // Meter Readings
        listMeterReadings1: () => Promise.resolve([]),
        listMeterReadings2: () => Promise.resolve([]),
        listCombinedReadingsByMeter: () => Promise.resolve([]),
        listCombinedReadingsRecent: () => Promise.resolve([]),

        // Meter Readings Topic 1 Logs
        listMeterReadingTopic1Logs: () => Promise.resolve([]),
        createMeterReadingTopic1Logs: () => Promise.resolve(null),

        // Meter Readings Topic 2 Logs
        listMeterReadingTopic2Logs: () => Promise.resolve([]),
        createMeterReadingTopic2Logs: () => Promise.resolve(null),

        // Combined Meter Readings Logs
        listCombinedLogsByMeter: () => Promise.resolve([]),
        listCombinedLogsRecent: () => Promise.resolve([]),
      };
    }

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

      // Customer Mapping
      listCustomerMappings: (skip, limit) => FastApiService.listCustomerMappings(skip, limit, token),
      getCustomerMapping: (mappingId) => FastApiService.getCustomerMapping(mappingId, token),
      createCustomerMapping: (payload) => FastApiService.createCustomerMapping(payload, token),
      updateCustomerMapping: (mappingId, payload) => FastApiService.updateCustomerMapping(mappingId, payload, token),
      deleteCustomerMapping: (mappingId) => FastApiService.deleteCustomerMapping(mappingId, token),

      // Formula Billing
      listFormulaBillings: (skip, limit) => FastApiService.listFormulaBillings(skip, limit, token),
      getFormulaBilling: (fbId) => FastApiService.getFormulaBilling(fbId, token),
      createFormulaBilling: (payload) => FastApiService.createFormulaBilling(payload, token),
      updateFormulaBilling: (fbId, payload) => FastApiService.updateFormulaBilling(fbId, payload, token),
      deleteFormulaBilling: (fbId) => FastApiService.deleteFormulaBilling(fbId, token),

      // Meter Readings
      listMeterReadings1: (skip, limit) => FastApiService.listMeterReadings1(skip, limit, token),
      listMeterReadings2: (skip, limit) => FastApiService.listMeterReadings2(skip, limit, token),
      listCombinedReadingsByMeter: (meter_id, limit) => FastApiService.listCombinedReadingsByMeter(meter_id, limit, token),
      listCombinedReadingsRecent: (limit) => FastApiService.listCombinedReadingsRecent(limit, token),
      
      // Meter Readings Topic 1 Logs
      listMeterReadingTopic1Logs: (skip, limit, startTime, endTime, meterId) => FastApiService.listMeterReadingTopic1Logs(skip, limit, startTime, endTime, meterId, token),
      createMeterReadingTopic1Logs: (payload) => FastApiService.createMeterReadingTopic1Logs(payload, token),

      // Meter Readings Topic 2 Logs
      listMeterReadingTopic2Logs: (skip, limit, startTime, endTime, meterId) => FastApiService.listMeterReadingTopic2Logs(skip, limit, startTime, endTime, meterId, token),
      createMeterReadingTopic2Logs: (payload) => FastApiService.createMeterReadingTopic2Logs(payload, token),

      // Combined Meter Readings Logs
      listCombinedLogsByMeter: (meter_id, limit, startDate, endDate) => FastApiService.listCombinedLogsByMeter(meter_id, limit, startDate, endDate, token),
      listCombinedLogsRecent: (limit, startDate, endDate) => FastApiService.listCombinedLogsRecent(limit, startDate, endDate, token),
    };
  }, [token]);

  return api;
}