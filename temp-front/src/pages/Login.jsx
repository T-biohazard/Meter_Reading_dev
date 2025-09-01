
import React, { useState } from "react";
import { useFormik, FormikProvider } from "formik";
import * as Yup from "yup";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../app/AuthContext";
import authService from "../services/authService";
import InputField from "../components/fields/InputField";
import { User, Lock } from "lucide-react";

const usernameSuggestions = ["admin", "demo", "tahsin", "john_doe"];

const sanitizeUsername = (input) =>
  input.toLowerCase().replace(/\s+/g, "").replace(/[^a-z0-9_]/g, "");

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [apiError, setApiError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const formik = useFormik({
    initialValues: { name: "", password: "" },
    validationSchema: Yup.object({
      name: Yup.string()
        .required("Username is required.")
        .matches(/^[a-z0-9_]+$/, "Only lowercase letters, numbers, and underscores allowed."),
      password: Yup.string().required("Password is required."),
    }),
    validateOnMount: true,
    onSubmit: async (values) => {
      setIsSubmitting(true);
      setApiError("");
      try {
        if (!navigator.onLine) {
          setApiError("No internet connection.");
          return;
        }
        const sanitizedName = sanitizeUsername(values.name);
        const data = await authService.login(sanitizedName, values.password);
        login(data.user, data.token);
        navigate("/dashboard", { replace: true });
      } catch (error) {
        setApiError(error.message || "Login failed");
      } finally {
        setIsSubmitting(false);
      }
    },
  });

  return (
    <div className="flex flex-col items-center justify-center mt-32  gap-4 w-full">
      <FormikProvider value={formik}>
        <form
          onSubmit={formik.handleSubmit}
          className="px-8 py-14 bg-white shadow-xl rounded-2xl w-full max-w-md"
          noValidate
        >
        
          <h2 className="text-3xl font-bold text-center mb-6">Login</h2>

          {/* Username with icon in the floating label */}
          <InputField
            name="name"
            type="text"
            label={
              <>
                <User className="inline-block h-3.5 w-3.5 -mt-0.5 mr-1 opacity-70" />
                Username
              </>
            }
            labelBgClass="bg-white"
            autoComplete="username"
            required
            dropdown
            options={usernameSuggestions}
            minChars={1}
            disabled={isSubmitting}
          />

          {/* Password with icon in the floating label */}
          <InputField
            name="password"
            type="password"
            label={
              <>
                <Lock className="inline-block h-3.5 w-3.5 -mt-0.5 mr-1 opacity-70" />
                Password
              </>
            }
            labelBgClass="bg-white"
            autoComplete="current-password"
            showPasswordToggle
            required
            disabled={isSubmitting}
          />

          {apiError && <p className="text-error text-center mb-4">{apiError}</p>}

          <div className="form-control">
            <button
              type="submit"
              className="btn btn-primary w-full rounded-lg shadow-lg"
              disabled={isSubmitting || !formik.isValid}
            >
              {isSubmitting ? <span className="loading loading-spinner" /> : "Log In"}
            </button>
          </div>
        </form>
      </FormikProvider>
    </div>
  );
};

export default Login;
