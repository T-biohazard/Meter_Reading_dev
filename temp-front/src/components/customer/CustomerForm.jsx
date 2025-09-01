import React, { useState, useEffect } from "react";
import Button from '../ui/Button';
import { useFormik, FormikProvider } from "formik";
import { customerSchema } from '../../validations/customerValidation';
import InputField from "../fields/InputField";
import SelectField from "../fields/SelectField";

const defaultFormValues = {
  customer: "",
  formula_billing_id: "",
  threshold: "",
  grace_value: "",
  status: "",
};

export default function CustomerForm({ initialValues, isEditMode, onSubmit, onCancel }) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const formik = useFormik({
    initialValues: defaultFormValues,
    validationSchema: customerSchema(isEditMode),
    onSubmit: async (values) => {
      setIsSubmitting(true);
      try {
        // Filter out any empty values if in edit mode to avoid sending optional fields with no data
        const payload = isEditMode
          ? Object.fromEntries(Object.entries(values).filter(([_, v]) => v !== "" && v !== null))
          : values;

        await onSubmit(payload, {
          resetForm: () => formik.resetForm({ values: defaultFormValues }),
        });
      } catch (error) {
        // Handle API submission errors if needed
      } finally {
        setIsSubmitting(false);
      }
    },
  });

  useEffect(() => {
    if (isEditMode && initialValues) {
      formik.setValues({
        customer: initialValues.customer || "",
        formula_billing_id: initialValues.formula_billing_id || "",
        threshold: initialValues.threshold || "",
        grace_value: initialValues.grace_value || "",
        status: initialValues.status || "",
      });
    }
  }, [isEditMode, initialValues, formik.setValues]);

  const billingFormulaOptions = [
    { label: "Formula A", value: 101 },
    { label: "Formula B", value: 102 },
    { label: "Formula C", value: 103 },
  ];

  const statusOptions = [
    { label: "Active", value: "active" },
    { label: "Inactive", value: "inactive" },
  ];

  return (
    <div className='p-t4'>
      <h1 className='text-2xl font-bold mt-2'>
        {isEditMode ? "Edit Customer" : "Add Customer"}
      </h1>
      <p className="opacity-70 mb-16">View and Manage the list of Customers.</p>
      <FormikProvider value={formik}>
        <form className='grid grid-cols-1 md:grid-cols-2 gap-4' onSubmit={formik.handleSubmit}>
          <InputField
            name="customer"
            type="text"
            label="Customer Name"
          />
          <SelectField
            name="formula_billing_id"
            label="Billing Formula"
            options={billingFormulaOptions}
          />
          <InputField
            name="threshold"
            type="number"
            step="0.01"
            label="Threshold"
          />
          <InputField
            name="grace_value"
            type="number"
            step="0.01"
            label="Grace Value"
          />
          <SelectField
            name="status"
            label="Status"
            options={statusOptions}
          />
          <div className='flex w-full justify-end mt-4 space-x-2 col-span-full'>
            <Button intent="cancel" type='button' onClick={onCancel} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button
              intent="submit"
              type='submit'
              loading={isSubmitting}
              loadingText='Saving...'
              disabled={isSubmitting || !formik.isValid}
            >
              Save
            </Button>
          </div>
        </form>
      </FormikProvider>
    </div>
  );
}