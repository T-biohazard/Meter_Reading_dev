// src/components/forms/RackForm.jsx
import React, { useState, useEffect } from "react";
import Button from '../ui/Button';
import { useFormik, FormikProvider } from "formik";
import { rackSchema } from '../../validations/rackValidation';
import InputField from "../fields/InputField";
import SelectField from "../fields/SelectField";
import { ArrowLeft } from 'lucide-react';
import { useFastApi } from '../../hooks/fastapihooks/fastapihooks';

const defaultFormValues = {
  datacenter_id: null,
  rack_name: "",
  status: "",
};

export default function RackForm({ initialValues, isEditMode, onSubmit, onCancel }) {
  const api = useFastApi();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [datacenterOptions, setDatacenterOptions] = useState([]);

  useEffect(() => {
    const fetchDatacenters = async () => {
      try {
        const data = await api.listDatacenters();
        const options = data.map(dc => ({ label: dc.datacenter_name, value: dc.id }));
        setDatacenterOptions(options);
      } catch (err) {
        console.error("Failed to fetch datacenters:", err);
      }
    };
    fetchDatacenters();
  }, [api]);

  const formik = useFormik({
    initialValues: defaultFormValues,
    validationSchema: rackSchema(isEditMode),
    onSubmit: async (values) => {
      setIsSubmitting(true);
      try {
        const payload = Object.fromEntries(
          Object.entries(values).filter(([_, v]) => v !== null && v !== "")
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
    // This hook now depends on datacenterOptions, ensuring it only runs after data is fetched.
    if (isEditMode && initialValues && datacenterOptions.length > 0) {
      formik.setValues({
        datacenter_id: initialValues.datacenter_id || null,
        rack_name: initialValues.rack_name || "",
        status: initialValues.status || "",
      });
    }
  }, [isEditMode, initialValues, formik.setValues, datacenterOptions]); // Added datacenterOptions to dependencies

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
          {isEditMode ? "Edit Rack" : "Add Rack"}
        </h1>
      </div>
      <p className="opacity-70 mb-16">View and Manage the list of Racks.</p>
      <FormikProvider value={formik}>
        <form className='grid grid-cols-1 md:grid-cols-2 gap-4' onSubmit={formik.handleSubmit}>
          <SelectField
            name="datacenter_id"
            label="Datacenter"
            options={datacenterOptions}
            searchable
            disabled={datacenterOptions.length === 0 || isEditMode}
          />
          <InputField
            name="rack_name"
            type="text"
            label="Rack Name"
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