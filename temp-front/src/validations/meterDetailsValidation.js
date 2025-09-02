import * as Yup from 'yup';

export const meterDetailsSchema = (isEditMode) => {
  return Yup.object().shape({
    meter_serial: Yup.string().required("Meter Serial is required"),
    meter_name: Yup.string().required("Meter Name is required"),
    type: Yup.string().required("Type is required"),
    phase: Yup.string().required("Phase is required"),
    datacenter_name: Yup.string().required("Datacenter Name is required"),
    installed_point: Yup.string().required("Installed Point is required"),
    power_source: Yup.string().required("Power Source is required"),
    phase_source: Yup.string().required("Phase Source is required"),
    customer: Yup.string().required("Customer is required"),
    billing_formula: Yup.string().required("Billing Formula is required"),
    threshold: Yup.number().required("Threshold is required").typeError("Threshold must be a number"),
    grace_value: Yup.number().required("Grace Value is required").typeError("Grace Value must be a number"),
    rack: Yup.string().required("Rack is required"),
    status: Yup.string().oneOf(['active', 'inactive']).required("Status is required"),
  });
};