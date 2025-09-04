// src/components/page-elements/PageUpdateModal.jsx

import React, { useState, useMemo, useEffect } from "react";
import { FormikProvider, useFormik, Form } from "formik";
import * as Yup from "yup";
import Button from "../ui/Button";
import InputField from "../fields/InputField";
import SelectField from "../fields/SelectField";
import { Link as LinkIcon, Lock } from "lucide-react";

// Modal Wrapper - replace with your actual modal component
function Modal({ children, title, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-base-100 rounded-xl shadow-xl w-full max-w-2xl p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold">{title}</h3>
          <button className="btn btn-ghost btn-sm" onClick={onClose}>✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}

// IconInput helper from your original file
function IconInput({ name, label, value, placeholder = "fa-solid fa-house", formik }) {
    // ... (Your existing IconInput component code here)
    // I will not rewrite it to save space. Just copy and paste it from your original file.
    // Make sure to include the helper functions and state management needed.
    // ...
}

// Validation Schema for the update form
const Schema = Yup.object({
  page_name: Yup.string().required("Page name is required."),
  path: Yup.string()
    .matches(/^\/[a-zA-Z0-9\-/_]*$/, "Path must start with / and use letters, numbers, -, _, and / only.")
    .required("Path is required."),
  menu_name: Yup.string().nullable(),
  sub_menu_name: Yup.string().nullable(),
});

export default function PageUpdateModal({ onClose, pageData, allMenus, submenusByMenu, onSubmit }) {
    
    // Reuse the helper functions from the PageElementForm
    const buildMenuOptions = (menus) => (menus?.map(m => ({ label: m.name, value: m.name })) || []);
    const buildSubOptions = (menuName, submenus) => {
        const m = submenus?.get(menuName);
        return m ? [...m.keys()].map(s => ({ label: s, value: s })) : [];
    };

    const formik = useFormik({
        initialValues: {
            page_name: pageData.page_name || '',
            path: pageData.path || '',
            menu_name: pageData.menu_name || '',
            menu_icon: pageData.menu_icon || '',
            sub_menu_name: pageData.sub_menu_name || '',
            sub_menu_icon: pageData.sub_menu_icon || '',
            page_icon: pageData.page_icon || '',
        },
        validationSchema: Schema,
        onSubmit: async (values, { setSubmitting }) => {
            const payload = {
                page_name: values.page_name,
                path: values.path,
                menu_name: values.menu_name || null,
                menu_icon: values.menu_icon || null,
                sub_menu_name: values.sub_menu_name || null,
                sub_menu_icon: values.sub_menu_icon || null,
                page_icon: values.page_icon || null,
            };
            await onSubmit(payload, pageData.id);
            setSubmitting(false);
        },
        enableReinitialize: true,
    });

    const menuOptions = useMemo(() => buildMenuOptions(allMenus), [allMenus]);
    const subOptions = useMemo(() => buildSubOptions(formik.values.menu_name, submenusByMenu), [formik.values.menu_name, submenusByMenu]);
    
    // Auto-update icons logic (from original form)
    useEffect(() => {
      const found = allMenus?.find((m) => m.name === formik.values.menu_name);
      if (found?.icon) {
        formik.setFieldValue("menu_icon", found.icon);
      } else if (!formik.values.menu_icon) {
        formik.setFieldValue("menu_icon", "");
      }
    }, [formik.values.menu_name, allMenus]);

    useEffect(() => {
      const icon = submenusByMenu?.get(formik.values.menu_name)?.get(formik.values.sub_menu_name);
      if (icon) {
        formik.setFieldValue("sub_menu_icon", icon);
      } else if (!formik.values.sub_menu_icon) {
        formik.setFieldValue("sub_menu_icon", "");
      }
    }, [formik.values.menu_name, formik.values.sub_menu_name, submenusByMenu]);

    return (
        <Modal title="Edit Page" onClose={onClose}>
            <FormikProvider value={formik}>
                <Form onSubmit={formik.handleSubmit}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        
                        {/* Menu & Submenu Dropdowns */}
                        <div className="md:col-span-full mt-4">
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <SelectField
                                    name="menu_name"
                                    label="Menu"
                                    options={menuOptions}
                                    searchable={true}
                                />
                                <SelectField
                                    name="sub_menu_name"
                                    label="Submenu (optional)"
                                    options={subOptions}
                                    searchable={true}
                                    disabled={!formik.values.menu_name}
                                />
                            </div>
                        </div>
                        
                        {/* Page Fields */}
                        <div className="md:col-span-full">
                            
                            <InputField name="page_name" label="Page Name" />
                            <InputField name="path" label="Path" />
                            <IconInput name="page_icon" label="Page Icon (optional)" formik={formik} />
                        </div>
                        
                    </div>
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