import * as yup from "yup";

export const customerSchema = (isEditMode) => {
  const baseSchema = yup.object().shape({
    customer: yup
      .string()
      .max(255, "Customer name is too long."),
    formula_billing_id: yup
      .number()
      .integer("Must be an integer.")
      .positive("Must be a positive number.")
      .typeError("Billing Formula must be a number."),
    threshold: yup
      .number()
      .min(0, "Threshold cannot be negative.")
      .typeError("Threshold must be a number."),
    grace_value: yup
      .number()
      .min(0, "Grace value cannot be negative.")
      .typeError("Grace value must be a number."),
    status: yup
      .string()
      .oneOf(["active", "inactive"], "Status must be either 'active' or 'inactive'."),
  });

  // If in add mode (not edit), make certain fields required.
  if (!isEditMode) {
    return baseSchema.shape({
      customer: yup.string().required("Customer name is required."),
      formula_billing_id: yup.number().required("Formula billing ID is required."),
      threshold: yup.number().required("Threshold is required."),
      grace_value: yup.number().required("Grace value is required."),
      status: yup.string().required("Status is required."),
    });
  }

  // In edit mode, all fields are optional.
  return baseSchema.optional();
};