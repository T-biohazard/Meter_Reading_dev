// src/components/roles/RoleFormModal.jsx
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Formik, Form, Field } from "formik";
import * as Yup from "yup";
import { useApi } from "../../hooks/useApi";
import Button from "../../components/ui/Button";

// Corrected Yup validation schema
const RoleSchema = Yup.object().shape({
  name: Yup.string()
    .min(2, "Role name is too short!")
    .required("Role name is required"),
  permissions: Yup.array().of(
    Yup.object().shape({
      name: Yup.string().required(),
      id: Yup.number().required(),
      guard_name: Yup.string(),
    })
  ),
});

function RoleFormModal({ isOpen, onClose, role, permissions, addToast }) {
  const isEditing = !!role;
  const api = useApi();
  const queryClient = useQueryClient();

  // Mutation for creating/updating a role
  const saveMutation = useMutation({
    mutationFn: (values) => {
      // The API expects an array of permission names, not full permission objects.
      const permissionNames = values.permissions.map(p => p.name);
      const payload = { ...values, permissions: permissionNames };
      
      return isEditing 
        ? api.updateRole(role.id, payload) 
        : api.createRole(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      onClose();
      const message = isEditing ? "Role updated successfully." : "Role created successfully.";
      addToast(message, "success");
    },
    onError: (error) => {
      console.error("Failed to save role:", error);
      addToast(`Failed to save role: ${error.message}`, "error");
    },
  });

  const initialValues = {
    name: isEditing ? role.name : "",
    permissions: isEditing ? role.permissions : [],
  };

  if (!isOpen) return null;

  return (
    <dialog className="modal modal-open">
      <div className="modal-box">
        <h3 className="font-bold text-lg mb-4">
          {isEditing ? `Edit Role: ${role.name}` : "Create New Role"}
        </h3>
        <Formik
          initialValues={initialValues}
          validationSchema={RoleSchema}
          onSubmit={(values) => saveMutation.mutate(values)}
        >
          {({ errors, touched, values, setFieldValue }) => (
            <Form className="space-y-4">
              <label className="form-control w-full">
                <div className="label">
                  <span className="label-text">Role Name</span>
                </div>
                <Field
                  name="name"
                  type="text"
                  placeholder="e.g., Editor"
                  className="input input-bordered w-full"
                />
                {errors.name && touched.name && (
                  <div className="label text-error">{errors.name}</div>
                )}
              </label>

              <div className="form-control">
                <div className="label">
                  <span className="label-text">Permissions</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {permissions.map((permission) => (
                    <div key={permission.id} className="form-control">
                      <label className="label cursor-pointer">
                        <span className="label-text">{permission.name}</span>
                        <input
                          type="checkbox"
                          className="checkbox"
                          checked={values.permissions.some(p => p.id === permission.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setFieldValue(
                                "permissions",
                                [...values.permissions, permission]
                              );
                            } else {
                              setFieldValue(
                                "permissions",
                                values.permissions.filter(p => p.id !== permission.id)
                              );
                            }
                          }}
                        />
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="modal-action">
                <Button variant="ghost" onClick={onClose} disabled={saveMutation.isPending}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  intent="save"
                  loading={saveMutation.isPending}
                  loadingText="Saving..."
                >
                  Save
                </Button>
              </div>
            </Form>
          )}
        </Formik>
      </div>
      <form method="dialog" className="modal-backdrop" onClick={onClose}>
        <button type="button">close</button>
      </form>
    </dialog>
  );
}

export default RoleFormModal;