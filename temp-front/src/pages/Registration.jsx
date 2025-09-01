// import React, { useEffect, useState } from "react";
// import { useFormik, FormikProvider } from "formik";
// import * as Yup from "yup";
// import { useNavigate } from "react-router-dom";
// import { User, Mail, Lock, Phone } from "lucide-react";

// import InputField from "../components/fields/InputField";
// import Button from "../components/ui/Button";
// import authService from "../services/authService";
// import { useAuth } from "../app/AuthContext";

// // Helper: generate lowercase username from first+last name
// const generateUsername = (first, last) => {
//   if (!first && !last) return "";
//   let name = `${first}${last}`.toLowerCase().replace(/\s+/g, ""); // remove spaces
//   name = name.replace(/[^a-z0-9_]/g, ""); // keep only alphanumeric + underscores
//   return name;
// };

// const schema = Yup.object({
//   first_name: Yup.string().min(1).max(50).required("First name is required."),
//   last_name: Yup.string().min(1).max(50).required("Last name is required."),
//   username: Yup.string()
//     .min(1)
//     .max(50)
//     .matches(/^[a-z0-9_]+$/, "Username can only contain lowercase letters, numbers, or underscores")
//     .required("Username is required."),
//   email: Yup.string().email().required("Email is required."),
//   mobile: Yup.string().matches(/^[0-9]{8,15}$/).required("Mobile number is required."),
//   password: Yup.string()
//     .min(8)
//     .matches(/[A-Z]/, "Add a capital letter.")
//     .matches(/[0-9]/, "Add a number.")
//     .required("Password is required."),
//   confirmPassword: Yup.string()
//     .oneOf([Yup.ref("password")], "Passwords must match.")
//     .required("Confirm your password."),
//   terms: Yup.boolean().oneOf([true], "Please accept the terms."),
//   role_id: Yup.number().required("Select a role"),
//   team_id: Yup.number().required("Select a team"),
//   dept_id: Yup.number().nullable(),
// });

// export default function Registration() {
//   const navigate = useNavigate();
//   const { login } = useAuth();
//   const [apiError, setApiError] = useState("");
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [roles, setRoles] = useState([]);

//   // Dummy teams and departments with integer IDs
//   const teams = [
//     { id: 1, name: "Engineering" },
//     { id: 2, name: "Sales" },
//   ];
//   const departments = [
//     { id: 1, name: "Backend" },
//     { id: 2, name: "Frontend" },
//   ];

//   useEffect(() => {
//     const fetchRoles = async () => {
//       try {
//         const data = await authService.getRoles();
//         setRoles(data);
//       } catch (err) {
//         console.error("Failed to fetch roles:", err);
//       }
//     };
//     fetchRoles();
//   }, []);

//   const formik = useFormik({
//     initialValues: {
//       first_name: "",
//       last_name: "",
//       username: "",
//       email: "",
//       mobile: "",
//       password: "",
//       confirmPassword: "",
//       terms: true,
//       role_id: roles[0]?.id || 1,
//       team_id: teams[0]?.id || 1,
//       dept_id: departments[0]?.id || null,
//     },
//     validationSchema: schema,
//     enableReinitialize: true,
//     validateOnMount: true,
//     onSubmit: async (values) => {
//       setIsSubmitting(true);
//       setApiError("");

//       try {
//         const username = values.username || generateUsername(values.first_name, values.last_name);

//         const { user, token } = await authService.register({
//           name: username,
//           first_name: values.first_name,
//           last_name: values.last_name,
//           email: values.email,
//           mobile: values.mobile,
//           password: values.password,
//           primary_role_id: values.role_id,
//           team_id: values.team_id,
//           dept_id: values.dept_id ? Number(values.dept_id) : null, // ensures int or null
//         });

//         login(user, token);
//         navigate("/dashboard", { replace: true });
//       } catch (err) {
//         setApiError(err?.message || "Registration failed");
//       } finally {
//         setIsSubmitting(false);
//       }
//     },
//   });

//   return (
//     <div className="min-h-screen dark:bg-gray-900">
//       <FormikProvider value={formik}>
//         {/* Wide, centered container that uses more of the page */}
//         <div className="container mx-auto px-4 md:px-10 py-10">
//           <form
//             onSubmit={formik.handleSubmit}
//             className="w-full max-w-6xl mx-auto"
//             noValidate
//           >
//             <h1 className="text-3xl font-bold mb-10">Create account</h1>

//             {/* 2-column grid on md+, full-width on small screens */}
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//               {/* Row 1: First name | Last name */}
//               <div>
//                 <InputField
//                   name="first_name"
//                   label="First Name"
//                   leftIcon={User}
//                   required
//                   disabled={isSubmitting}
//                 />
//               </div>
//               <div>
//                 <InputField
//                   name="last_name"
//                   label="Last Name"
//                   leftIcon={User}
//                   required
//                   disabled={isSubmitting}
//                 />
//               </div>

//               {/* Row 2: Username (full width) */}
//               <div className="md:col-span-2">
//                 <InputField
//                   name="username"
//                   label="Username"
//                   leftIcon={User}
//                   required
//                   disabled={isSubmitting}
//                 />
//               </div>

//               {/* Row 3: Email | Mobile */}
//               <div>
//                 <InputField
//                   name="email"
//                   type="email"
//                   label="Email"
//                   leftIcon={Mail}
//                   required
//                   disabled={isSubmitting}
//                 />
//               </div>
//               <div>
//                 <InputField
//                   name="mobile"
//                   type="tel"
//                   label="Mobile"
//                   leftIcon={Phone}
//                   required
//                   disabled={isSubmitting}
//                 />
//               </div>

//               {/* Row 4: Password | Confirm Password */}
//               <div>
//                 <InputField
//                   name="password"
//                   type="password"
//                   label="Password"
//                   leftIcon={Lock}
//                   showPasswordToggle
//                   required
//                   disabled={isSubmitting}
//                 />
//               </div>
//               <div>
//                 <InputField
//                   name="confirmPassword"
//                   type="password"
//                   label="Confirm Password"
//                   leftIcon={Lock}
//                   showPasswordToggle
//                   required
//                   disabled={isSubmitting}
//                 />
//               </div>

//               {apiError && (
//                 <p className="text-error text-center md:col-span-2">{apiError}</p>
//               )}

//               <div className="md:col-span-2">
//                 <Button
//                   intent="submit"
//                   type="submit"
//                   block
//                   loading={isSubmitting}
//                   disabled={!formik.isValid || isSubmitting}
//                 >
//                   Create account
//                 </Button>
//               </div>
//             </div>
//           </form>
//         </div>
//       </FormikProvider>
//     </div>
//   );
// }




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
  let name = `${first}${last}`.toLowerCase().replace(/\s+/g, "");
  name = name.replace(/[^a-z0-9_]/g, "");
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
          dept_id: values.dept_id ? Number(values.dept_id) : null,
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
    <div className="min-h-screen dark:bg-gray-900">
      <FormikProvider value={formik}>
        {/* Left-anchored page container (matches sample: generous L/R padding, vertical rhythm) */}
        <div className="px-4 md:px-8 lg:px-10 py-8">
          <form
            onSubmit={formik.handleSubmit}
            className="w-full max-w-none mr-auto" // left aligned like the sample
            noValidate
          >
            {/* Page header (title + subtitle) */}
            <header className="mb-6">
              <h1 className="text-2xl font-bold">Create account</h1>
              <p className="opacity-70">Create a system user.</p>
            </header>
            <hr className="border-base-300/70 mb-6" />

            {/* Single section block (bordered like the sample's sections) */}
            <section className=" p-5">
              {/* 2-column layout on md+, align items from the top like the sample */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
                {/* Row 1: First name | Last name */}
                <div>
                  <InputField
                    name="first_name"
                    label="First Name"
                    leftIcon={User}
                    required
                    disabled={isSubmitting}
                  />
                </div>
                <div>
                  <InputField
                    name="last_name"
                    label="Last Name"
                    leftIcon={User}
                    required
                    disabled={isSubmitting}
                  />
                </div>

                {/* Row 2: Username (full width) */}
                <div className="md:col-span-2">
                  <InputField
                    name="username"
                    label="Username"
                    leftIcon={User}
                    required
                    disabled={isSubmitting}
                  />
                </div>

                {/* Row 3: Email | Mobile */}
                <div>
                  <InputField
                    name="email"
                    type="email"
                    label="Email"
                    leftIcon={Mail}
                    required
                    disabled={isSubmitting}
                  />
                </div>
                <div>
                  <InputField
                    name="mobile"
                    type="tel"
                    label="Mobile"
                    leftIcon={Phone}
                    required
                    disabled={isSubmitting}
                  />
                </div>

                {/* Row 4: Password | Confirm Password */}
                <div>
                  <InputField
                    name="password"
                    type="password"
                    label="Password"
                    leftIcon={Lock}
                    showPasswordToggle
                    required
                    disabled={isSubmitting}
                  />
                </div>
                <div>
                  <InputField
                    name="confirmPassword"
                    type="password"
                    label="Confirm Password"
                    leftIcon={Lock}
                    showPasswordToggle
                    required
                    disabled={isSubmitting}
                  />
                </div>

                {apiError && (
                  <p className="text-error md:col-span-2">{apiError}</p>
                )}

                {/* Action row: left aligned (no block/full-width) */}
                <div className="md:col-span-2 pt-2 justify-self-end">
                  <Button
                    intent="submit"
                    type="submit"
                    loading={isSubmitting}
                    disabled={!formik.isValid || isSubmitting}
                  >
                    Create account
                  </Button>
                </div>
              </div>
            </section>
          </form>
        </div>
      </FormikProvider>
    </div>
  );
}
