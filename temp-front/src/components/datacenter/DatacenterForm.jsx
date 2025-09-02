import React, { useState, useEffect } from "react";
import Button from '../ui/Button';
import { useFormik, FormikProvider } from "formik";
import { datacenterSchema } from '../../validations/datacenterValidation';
import InputField from "../fields/InputField";
import SelectField from "../fields/SelectField";
import { ArrowLeft } from 'lucide-react';

const defaultFormValues = {
  datacenter_name: "",
  status: "", // Default status for new records
};

export default function DatacenterForm({ initialValues, isEditMode, onSubmit, onCancel }) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const formik = useFormik({
    initialValues: defaultFormValues,
    validationSchema: datacenterSchema(isEditMode),
    onSubmit: async (values) => {
      setIsSubmitting(true);
      try {
        const payload = Object.fromEntries(
          Object.entries(values).filter(([_, v]) => v !== null && v !== "" && v !== undefined)
        );
        await onSubmit(payload, {
          resetForm: () => formik.resetForm({ values: defaultFormValues }),
        });
      } catch (error) {
      } finally {
        setIsSubmitting(false);
      }
    },
  });

  useEffect(() => {
    if (isEditMode && initialValues) {
      formik.setValues({
        datacenter_name: initialValues.datacenter_name || "",
        status: initialValues.status || "active",
      });
    }
  }, [isEditMode, initialValues, formik.setValues]);

  const statusOptions = [
    { label: "Active", value: "active" },
    { label: "Inactive", value: "inactive" },
  ];

  return (
    <div className='p-t4'>
      <div className="flex items-center space-x-2">
        <Button
          variant="icon"
          type="button"
          onClick={onCancel}
          className="p-1 -ml-2 mt-1 text-gray-500 hover:text-gray-700"
        >
          <ArrowLeft size={24} />
        </Button>
        <h1 className='text-2xl font-bold mt-2'>
          {isEditMode ? "Edit Datacenter" : "Add Datacenter"}
        </h1>
      </div>
      <p className="opacity-70 mb-16">View and Manage the list of Datacenters.</p>
      <FormikProvider value={formik}>
        <form className='grid grid-cols-1 md:grid-cols-2 gap-4' onSubmit={formik.handleSubmit}>
          <InputField
            name="datacenter_name"
            type="text"
            label="Datacenter Name"
          />
          <SelectField
            name="status"
            label="Status"
            options={statusOptions}
            searchable
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