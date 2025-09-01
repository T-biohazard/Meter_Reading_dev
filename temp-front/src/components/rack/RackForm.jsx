import React from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import Button from '../ui/Button';
import { useFastApi } from '../../hooks/fastapihooks/fastapihooks';
import { Plus, X } from 'lucide-react';

const RackForm = ({ initialValues, isEditMode, onSubmit, onCancel, showToast }) => {
  const api = useFastApi();

  // Define validation schema based on API requirements
  const validationSchema = Yup.object().shape({
    datacenter_id: Yup.number()
      .integer('Datacenter ID must be an integer')
      .required('Datacenter ID is required'),
    rack_name: Yup.string()
      .required('Rack name is required'),
    status: Yup.string()
      .oneOf(['active', 'inactive', 'maintenance'], 'Invalid status') // Assuming these are valid statuses
      .required('Status is required'),
  });

  const handleSubmit = async (values, actions) => {
    try {
      // The API has different payloads for create and update.
      // For create, it needs datacenter_id, rack_name, and status.
      // For update, it only needs rack_name and status.
      let payload = {
        rack_name: values.rack_name,
        status: values.status,
      };

      // Add datacenter_id only in create mode
      if (!isEditMode) {
        payload = { ...payload, datacenter_id: values.datacenter_id };
      }

      await onSubmit(payload, actions);
    } catch (error) {
      showToast(error.message || 'An error occurred during save.', 'error');
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">{isEditMode ? 'Edit Rack' : 'Add Rack'}</h1>
      <Formik
        initialValues={initialValues || { datacenter_id: '', rack_name: '', status: 'active' }}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
        // Enable re-initialization to handle initialValues changes for edit mode
        enableReinitialize={true}
      >
        {({ isSubmitting }) => (
          <Form className="space-y-4">
            {!isEditMode && (
              <div>
                <label htmlFor="datacenter_id" className="block text-sm font-medium text-gray-700">Datacenter ID</label>
                <Field name="datacenter_id" type="number" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
                <ErrorMessage name="datacenter_id" component="div" className="text-red-500 text-sm" />
              </div>
            )}
            
            <div>
              <label htmlFor="rack_name" className="block text-sm font-medium text-gray-700">Rack Name</label>
              <Field name="rack_name" type="text" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
              <ErrorMessage name="rack_name" component="div" className="text-red-500 text-sm" />
            </div>

            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700">Status</label>
              <Field as="select" name="status" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm">
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="maintenance">Maintenance</option>
              </Field>
              <ErrorMessage name="status" component="div" className="text-red-500 text-sm" />
            </div>

            <div className="flex gap-4">
              <Button type="submit" intent="primary" disabled={isSubmitting} leftIcon={isEditMode ? null : Plus}>
                {isEditMode ? 'Save Changes' : 'Add Rack'}
              </Button>
              <Button type="button" intent="ghost" onClick={onCancel} leftIcon={X}>
                Cancel
              </Button>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default RackForm;