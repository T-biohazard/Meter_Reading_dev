import React, { useState, useEffect } from "react";
import Button from '../ui/Button';
import { useFormik, FormikProvider } from "formik";
import { meterDetailsSchema } from '../../validations/meterDetailsValidation';
import InputField from "../fields/InputField";
import SelectField from "../fields/SelectField";
import { ArrowLeft } from 'lucide-react';

const defaultFormValues = {
  meter_serial: "",
  meter_name: "",
  type: "",
  phase: "",
  datacenter_name: "",
  installed_point: "",
  power_source: "",
  phase_source: "",
  customer: "",
  billing_formula: "",
  threshold: "",
  grace_value: "",
  rack: "",
  status: "active",
};

export default function MeterDetailsForm({ initialValues, isEditMode, onSubmit, onCancel }) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const formik = useFormik({
    initialValues: defaultFormValues,
    validationSchema: meterDetailsSchema(isEditMode),
    onSubmit: async (values) => {
      setIsSubmitting(true);
      try {
        console.log("Submitting form with values:", values);
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        await onSubmit(values, {
          resetForm: () => formik.resetForm({ values: defaultFormValues }),
        });
      } catch (error) {
        console.error("Form submission failed:", error);
      } finally {
        setIsSubmitting(false);
      }
    },
  });

  useEffect(() => {
    if (isEditMode && initialValues) {
      formik.setValues(initialValues);
    }
  }, [isEditMode, initialValues, formik.setValues]);

  // Mock data for SelectField options
  const typeOptions = [{ label: "Primary", value: "primary" }, { label: "Secondary", value: "secondary" }];
  const statusOptions = [{ label: "Active", value: "active" }, { label: "Inactive", value: "inactive" }];
  const customerOptions = [{ label: "Customer A", value: "customer-a" }, { label: "Customer B", value: "customer-b" }];
  const billingFormulaOptions = [{ label: "Formula 1", value: "formula-1" }, { label: "Formula 2", value: "formula-2" }];

  return (
    <div className='p-t4'>
      <div className="flex items-center space-x-2">
        <Button variant="icon" type="button" onClick={onCancel} className="p-1 -ml-2 mt-1 text-gray-500 hover:text-gray-700">
          <ArrowLeft size={24} />
        </Button>
        <h1 className='text-2xl font-bold mt-2'>
          {isEditMode ? "Edit Meter Details" : "Add Meter Details"}
        </h1>
      </div>
      <p className="opacity-70 mb-16">View and Manage the list of Meter Details.</p>
      <FormikProvider value={formik}>
        <form className='grid grid-cols-1 md:grid-cols-2 gap-4' onSubmit={formik.handleSubmit}>
          <InputField name="meter_serial" type="text" label="Meter Serial" />
          <InputField name="meter_name" type="text" label="Meter Name" />
          <SelectField name="type" label="Type" options={typeOptions} />
          <InputField name="phase" type="text" label="Phase" />
          <InputField name="datacenter_name" type="text" label="Datacenter Name" />
          <InputField name="installed_point" type="text" label="Installed Point" />
          <InputField name="power_source" type="text" label="Power Source" />
          <InputField name="phase_source" type="text" label="Phase Source" />
          <SelectField name="customer" label="Customer" options={customerOptions} searchable />
          <SelectField name="billing_formula" label="Billing Formula" options={billingFormulaOptions} searchable />
          <InputField name="threshold" type="number" step="0.01" label="Threshold" />
          <InputField name="grace_value" type="number" step="0.01" label="Grace Value" />
          <InputField name="rack" type="text" label="Rack" />
          <SelectField name="status" label="Status" options={statusOptions} searchable />
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