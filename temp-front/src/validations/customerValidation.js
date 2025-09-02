// src/validations/customerValidation.js
import * as Yup from 'yup';

export const customerSchema = (isEditMode) =>
  Yup.object({
    customer: Yup.string().required('Customer Name is required'),
    formula_billing_id: Yup.number().nullable().optional(), // Correctly handles null values
    threshold: Yup.number().nullable().optional(),
    grace_value: Yup.number().nullable().optional(),
    status: Yup.string().required('Status is required'),
  });