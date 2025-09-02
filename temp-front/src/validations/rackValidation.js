import * as Yup from 'yup';

export const rackSchema = (isEditMode) => {
  const schema = Yup.object().shape({
    rack_name: Yup.string()
      .required("Rack Name is required")
      .trim()
      .max(100, "Rack Name cannot exceed 100 characters"),
    status: Yup.string()
      .oneOf(["active", "inactive"], "Invalid status")
      .required("Status is required"),
    datacenter_id: Yup.number()
      .nullable()
      .typeError("Datacenter ID must be a number")
      .integer("Datacenter ID must be an integer"),
  });

  // Conditionally apply 'required' for datacenter_id only when adding a new rack
  if (!isEditMode) {
    return schema.shape({
      datacenter_id: Yup.number()
        .required("Datacenter ID is required")
        .typeError("Datacenter ID must be a number")
        .integer("Datacenter ID must be an integer"),
    });
  }

  return schema;
};