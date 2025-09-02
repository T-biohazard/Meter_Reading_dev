import * as Yup from 'yup';

export const datacenterSchema = (isEditMode) => {
  return Yup.object().shape({
    datacenter_name: Yup.string()
      .required("Datacenter Name is required")
      .trim()
      .max(100, "Datacenter Name cannot exceed 100 characters"),
    status: Yup.string()
      .oneOf(["active", "inactive"], "Invalid status")
      .nullable(),
  });
};