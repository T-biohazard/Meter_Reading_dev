import * as Yup from 'yup';

export const meterSchema = Yup.object().shape({
  datacenter_id: Yup.number()
    .required("Datacenter ID is required")
    .typeError("Datacenter ID must be a number")
    .integer("Datacenter ID must be an integer"),
  rack_id: Yup.number()
    .required("Rack ID is required")
    .typeError("Rack ID must be a number")
    .integer("Rack ID must be an integer"),
  serial: Yup.string()
    .required("Serial number is required")
    .trim()
    .max(50, "Serial number cannot exceed 50 characters"),
  name: Yup.string()
    .required("Name is required")
    .trim()
    .max(100, "Name cannot exceed 100 characters"),
  primary_secondary: Yup.number()
    .required("Primary/Secondary is required")
    .oneOf([1, 2], "Primary/Secondary must be 1 or 2"),
  phase: Yup.string().nullable().trim().max(50, "Phase cannot exceed 50 characters"),
  installed_point: Yup.string().nullable().trim().max(100, "Installed point cannot exceed 100 characters"),
  power_source: Yup.string().nullable().trim().max(100, "Power source cannot exceed 100 characters"),
  phase_source: Yup.string().nullable().trim().max(100, "Phase source cannot exceed 100 characters"),
  status: Yup.string()
    .oneOf(["active", "inactive"], "Invalid status")
    .required("Status is required"),
});