import React, { useEffect, useState } from "react";
import { useFormik, FormikProvider } from "formik";
import * as Yup from "yup";
import { useNavigate } from "react-router-dom";
import { User, Mail, Lock, Phone } from "lucide-react";

import InputField from "../components/fields/InputField";
import Button from "../components/ui/Button";
import authService from "../services/authService";
import { useAuth } from "../app/AuthContext";

// Helper: generate lowercase username from first+last name
const generateUsername = (first, last) => {
  if (!first && !last) return "";
  let name = `${first}${last}`.toLowerCase().replace(/\s+/g, ""); // remove spaces
  name = name.replace(/[^a-z0-9_]/g, ""); // keep only alphanumeric + underscores
  return name;
};

const schema = Yup.object({
  first_name: Yup.string().min(1).max(50).required("First name is required."),
  last_name: Yup.string().min(1).max(50).required("Last name is required."),
  username: Yup.string()
    .min(1)
    .max(50)
    .matches(/^[a-z0-9_]+$/, "Username can only contain lowercase letters, numbers, or underscores")
    .required("Username is required."),
  email: Yup.string().email().required("Email is required."),
  mobile: Yup.string().matches(/^[0-9]{8,15}$/).required("Mobile number is required."),
  password: Yup.string()
    .min(8)
    .matches(/[A-Z]/, "Add a capital letter.")
    .matches(/[0-9]/, "Add a number.")
    .required("Password is required."),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("password")], "Passwords must match.")
    .required("Confirm your password."),
  terms: Yup.boolean().oneOf([true], "Please accept the terms."),
  role_id: Yup.number().required("Select a role"),
  team_id: Yup.number().required("Select a team"),
  dept_id: Yup.number().nullable(),
});

export default function Registration() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [apiError, setApiError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [roles, setRoles] = useState([]);

  // Dummy teams and departments with integer IDs
  const teams = [
    { id: 1, name: "Engineering" },
    { id: 2, name: "Sales" },
  ];
  const departments = [
    { id: 1, name: "Backend" },
    { id: 2, name: "Frontend" },
  ];

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const data = await authService.getRoles();
        setRoles(data);
      } catch (err) {
        console.error("Failed to fetch roles:", err);
      }
    };
    fetchRoles();
  }, []);

  const formik = useFormik({
    initialValues: {
      first_name: "",
      last_name: "",
      username: "",
      email: "",
      mobile: "",
      password: "",
      confirmPassword: "",
      terms: true,
      role_id: roles[0]?.id || 1,
      team_id: teams[0]?.id || 1,
      dept_id: departments[0]?.id || null,
    },
    validationSchema: schema,
    enableReinitialize: true,
    validateOnMount: true,
    onSubmit: async (values) => {
      setIsSubmitting(true);
      setApiError("");

      try {
        const username = values.username || generateUsername(values.first_name, values.last_name);

        const { user, token } = await authService.register({
          name: username,
          first_name: values.first_name,
          last_name: values.last_name,
          email: values.email,
          mobile: values.mobile,
          password: values.password,
          primary_role_id: values.role_id,
          team_id: values.team_id,
          dept_id: values.dept_id ? Number(values.dept_id) : null, // ensures int or null
        });

        login(user, token);
        navigate("/dashboard", { replace: true });
      } catch (err) {
        setApiError(err?.message || "Registration failed");
      } finally {
        setIsSubmitting(false);
      }
    },
  });

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 dark:bg-gray-900 p-4">
      <FormikProvider value={formik}>
        <form onSubmit={formik.handleSubmit} className="card-body bg-white shadow-xl rounded-2xl w-full max-w-md" noValidate>
          <h1 className="text-3xl font-bold text-center mb-6">Create account</h1>

          <InputField name="first_name" label="First Name" leftIcon={User} required disabled={isSubmitting} />
          <InputField name="last_name" label="Last Name" leftIcon={User} required disabled={isSubmitting} />
          <InputField name="username" label="Username" leftIcon={User} required disabled={isSubmitting} />
          <InputField name="email" type="email" label="Email" leftIcon={Mail} required disabled={isSubmitting} />
          <InputField name="mobile" type="tel" label="Mobile" leftIcon={Phone} required disabled={isSubmitting} />
          <InputField name="password" type="password" label="Password" leftIcon={Lock} showPasswordToggle required disabled={isSubmitting} />
          <InputField name="confirmPassword" type="password" label="Confirm Password" leftIcon={Lock} showPasswordToggle required disabled={isSubmitting} />

          {/* Role dropdown */}
          <div className="form-control mb-2">
            <label className="label">Role</label>
            <select
              name="role_id"
              value={formik.values.role_id}
              onChange={formik.handleChange}
              disabled={isSubmitting || roles.length === 0}
              className="select select-bordered w-full"
            >
              {roles.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
            </select>
          </div>

          {/* Team dropdown */}
          <div className="form-control mb-2">
            <label className="label">Team</label>
            <select name="team_id" value={formik.values.team_id} onChange={formik.handleChange} className="select select-bordered w-full">
              {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          </div>

          {/* Dept dropdown */}
          <div className="form-control mb-2">
            <label className="label">Department</label>
            <select name="dept_id" value={formik.values.dept_id || ""} onChange={formik.handleChange} className="select select-bordered w-full">
              <option value="">None</option>
              {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
          </div>

          <label className="label cursor-pointer justify-start gap-3">
            <input type="checkbox" name="terms" checked={formik.values.terms} onChange={formik.handleChange} className="checkbox checkbox-sm" disabled={isSubmitting} />
            <span className="label-text">I agree to the Terms & Privacy.</span>
          </label>

          {apiError && <p className="text-error text-center">{apiError}</p>}

          <div className="mt-4">
            <Button intent="submit" type="submit" block loading={isSubmitting} disabled={!formik.isValid || isSubmitting}>
              Create account
            </Button>
          </div>
        </form>
      </FormikProvider>
    </div>
  );
}
