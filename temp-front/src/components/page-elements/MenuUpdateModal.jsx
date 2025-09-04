// src/components/page-elements/MenuUpdateModal.jsx

import React from "react";
import { FormikProvider, useFormik, Form } from "formik";
import * as Yup from "yup";
import Button from "../ui/Button";
import InputField from "../fields/InputField";

// Modal Wrapper - replace with your actual modal component
function Modal({ children, title, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-base-100 rounded-xl shadow-xl w-full max-w-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold">{title}</h3>
          <button className="btn btn-ghost btn-sm" onClick={onClose}>✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}

const Schema = Yup.object({
  new_menu_name: Yup.string().required("Menu name is required."),
});

// Helper function to find the first page element ID in the tree
const findFirstPageElementId = (node) => {
    // If the node itself is a page, return its ID
    if (node.type === 'page' && node.id) {
        return node.id;
    }
    // If the node has children, recursively search them
    if (node.children && node.children.length > 0) {
        for (const child of node.children) {
            const id = findFirstPageElementId(child);
            if (id) {
                return id;
            }
        }
    }
    return null; // Return null if no ID is found
};

export default function MenuUpdateModal({ onClose, menuData, onSubmit }) {
  const formik = useFormik({
    initialValues: {
      new_menu_name: menuData.label || '',
    },
    validationSchema: Schema,
    onSubmit: async (values, { setSubmitting }) => {
      const payload = { new_menu_name: values.new_menu_name };

      // Use the new helper function to find a valid ID
      const id = findFirstPageElementId(menuData);

      if (id) {
          await onSubmit(payload, id);
      } else {
          console.error("No page element found for this menu to perform update.");
      }
      setSubmitting(false);
    },
    enableReinitialize: true,
  });

  return (
    <Modal title="Edit Menu Name" onClose={onClose}>
      <p className="mb-6"></p>
      <FormikProvider value={formik}>
        <Form onSubmit={formik.handleSubmit}>
          <InputField
            name="new_menu_name"
            label="Menu Name"
            placeholder="e.g. My Dashboard"
          />
          <p className="mt-6"></p>
          <div className='flex w-full justify-end mt-4 space-x-2'>
            <Button intent="cancel" type='button' onClick={onClose} disabled={formik.isSubmitting}>Cancel</Button>
            <Button
              intent="submit"
              type='submit'
              loading={formik.isSubmitting}
              loadingText='Updating...'
              disabled={formik.isSubmitting || !formik.isValid}
            >
              Update
            </Button>
          </div>
        </Form>
      </FormikProvider>
    </Modal>
  );
}