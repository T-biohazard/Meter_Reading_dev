import * as Yup from 'yup';

export const usageSummarySchema = Yup.object().shape({
  customer: Yup.string().required("Customer name is required"),
  total_racks: Yup.number().required("Total Racks is required").typeError("Total Racks must be a number"),
  threshold_kw: Yup.number().required("Threshold is required").typeError("Threshold must be a number"),
  total_consumption_kw: Yup.number().required("Total Consumption is required").typeError("Total Consumption must be a number"),
  extra_consumption_kw: Yup.number().required("Extra Consumption is required").typeError("Extra Consumption must be a number"),
});