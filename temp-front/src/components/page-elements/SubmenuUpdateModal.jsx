// src/components/page-elements/SubmenuUpdateModal.jsx

import React, { useMemo } from "react";
import { FormikProvider, useFormik, Form } from "formik";
import * as Yup from "yup";
import Button from "../ui/Button";
import InputField from "../fields/InputField";
import SelectField from "../fields/SelectField";

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
  new_sub_menu_name: Yup.string().required("Submenu name is required."),
  menu_name: Yup.string().required("Parent menu is required."),
});

export default function SubmenuUpdateModal({ onClose, submenuData, allMenus, onSubmit }) {
  
  const menuOptions = useMemo(() => 
    allMenus?.map(m => ({ label: m.name, value: m.name })) || [], 
    [allMenus]
  );

  const formik = useFormik({
    initialValues: {
      new_sub_menu_name: submenuData?.label || '',
      menu_name: submenuData?.parentMenuName || '',
    },
    validationSchema: Schema,
    onSubmit: async (values, { setSubmitting }) => {
      const payload = { 
        new_sub_menu_name: values.new_sub_menu_name, 
        menu_name: values.menu_name 
      };
      
      const id = submenuData.children?.[0]?.id || null;
      if (id) {
        await onSubmit(payload, id);
      } else {
        console.error("No page element found for this submenu to perform update.");
      }
      setSubmitting(false);
    },
    enableReinitialize: true,
  });

  return (
    <Modal title="Edit Sub-menu Name" onClose={onClose}>
      <p className="mb-6"></p>
      <FormikProvider value={formik}>
        <Form onSubmit={formik.handleSubmit}>
          <SelectField
              name="menu_name"
              label="Parent Menu"
              options={menuOptions}
              searchable={true}
          />
          <InputField
            name="new_sub_menu_name"
            label="Sub-menu Name"
            placeholder="e.g. User Management"
          />
          
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