import React, { useState, useEffect } from "react";
import Button from '../ui/Button';
import { useFormik, FormikProvider } from "formik";
import { meterSchema } from '../../validations/meterValidation';
import InputField from "../fields/InputField";
import SelectField from "../fields/SelectField";
import { ArrowLeft } from 'lucide-react';
import { useFastApi } from '../../hooks/fastapihooks/fastapihooks';

const defaultFormValues = {
  datacenter_id: null,
  rack_id: null,
  customer: [],
  serial: "",
  name: "",
  primary_secondary: null,
  phase: "",
  installed_point: "",
  power_source: "",
  phase_source: "",
  status: "",
};

export default function MeterForm({ initialValues, isEditMode, onSubmit, onCancel }) {
  const api = useFastApi();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [datacenterOptions, setDatacenterOptions] = useState([]);
  const [rackOptions, setRackOptions] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [datacenters, racks] = await Promise.all([
          api.listDatacenters(),
          api.listRacks()
        ]);
        setDatacenterOptions(datacenters.map(dc => ({ label: dc.datacenter_name, value: dc.id })));
        setRackOptions(racks.map(r => ({ label: r.rack_name, value: r.id })));
      } catch (err) {
        console.error("Failed to fetch related data:", err);
      }
    };
    fetchData();
  }, [api]);

  const formik = useFormik({
    initialValues: defaultFormValues,
    validationSchema: meterSchema,
    onSubmit: async (values) => {
      setIsSubmitting(true);
      try {
        await onSubmit(values, {
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
        datacenter_id: initialValues.datacenter_id || null,
        rack_id: initialValues.rack_id || null,
        customer: initialValues.customer || [],
        serial: initialValues.serial || "",
        name: initialValues.name || "",
        primary_secondary: initialValues.primary_secondary || null,
        phase: initialValues.phase || "",
        installed_point: initialValues.installed_point || "",
        power_source: initialValues.power_source || "",
        phase_source: initialValues.phase_source || "",
        status: initialValues.status || "active",
      });
    }
  }, [isEditMode, initialValues, formik.setValues]);

  const statusOptions = [
    { label: "Active", value: "active" },
    { label: "Inactive", value: "inactive" },
  ];
  
  const primarySecondaryOptions = [
    { label: "Primary (1)", value: 1 },
    { label: "Secondary (2)", value: 2 },
  ];

  const customerOptions = [
    { label: "Customer A", value: "customer_a" },
    { label: "Customer B", value: "customer_b" },
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
          {isEditMode ? "Edit Meter" : "Add Meter"}
        </h1>
      </div>
      <p className="opacity-70 mb-16">View and Manage the list of Meters.</p>
      <FormikProvider value={formik}>
        <form className='grid grid-cols-1 md:grid-cols-2 gap-4' onSubmit={formik.handleSubmit}>
          <SelectField
            name="datacenter_id"
            label="Datacenter"
            options={datacenterOptions}
            searchable
            disabled={datacenterOptions.length === 0}
          />
          <SelectField
            name="rack_id"
            label="Rack"
            options={rackOptions}
            searchable
            disabled={rackOptions.length === 0}
          />
          
          <SelectField
            name="customer"
            label="Customer"
            options={customerOptions}
            searchable
            multiple // Add this prop
            disabled={customerOptions.length === 0}
            />
          
          <InputField
            name="serial"
            type="text"
            label="Serial Number"
          />
          <InputField
            name="name"
            type="text"
            label="Meter Name"
          />
          <SelectField
            name="primary_secondary"
            label="Primary / Secondary"
            options={primarySecondaryOptions}
          />
          <InputField
            name="phase"
            type="number"
            label="Phase (1 or 3)"
          />
          <InputField
            name="installed_point"
            type="text"
            label="Installed Point"
          />
          <InputField
            name="power_source"
            type="text"
            label="Power Source"
          />
          <InputField
            name="phase_source"
            type="text"
            label="Phase Source"
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