// // import { useState, useMemo } from "react";
// // import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
// // import { Formik, Form, Field } from "formik";
// // import * as Yup from "yup";
// // import { MailPlus, RefreshCw, Send, Trash2 } from "lucide-react";

// // import { useAuth } from "../app/AuthContext";
// // import { usePermissions } from "../hooks/usePermissions";
// // import authService from "../services/authService";
// // import InputField from "../components/fields/InputField";
// // import Button from "../components/ui/Button";

// // /** Small helper to show/hide bits by permission */
// // function RoleGate({ perm, children, fallback = null }) {
// //   const { hasPermission } = usePermissions();
// //   return hasPermission(perm) ? children : fallback;
// // }

// // export default function Invitations() {
// //   const qc = useQueryClient();
// //   const { token } = useAuth();
// //   const { hasPermission } = usePermissions();

// //   const [open, setOpen] = useState(false);

// //   // --- API wrappers ---
// //   const api = {
// //     list: () => authService.apiRequest("/invitations", { method: "GET" }, token),
// //     roles: () => authService.getRoles(token),
// //     create: (payload) =>
// //       authService.apiRequest(
// //         "/invitations",
// //         { method: "POST", body: JSON.stringify(payload) },
// //         token
// //       ),
// //     resend: (id) =>
// //       authService.apiRequest(`/invitations/${id}/resend`, { method: "POST" }, token),
// //     remove: (id) =>
// //       authService.apiRequest(`/invitations/${id}`, { method: "DELETE" }, token),
// //   };

// //   // --- Enable flags so queries never fire while unauthenticated or disallowed ---
// //   const invitationsEnabled = Boolean(token) && hasPermission("invitations.index");
// //   const rolesEnabled = Boolean(token) && hasPermission("invitations.store");

// //   // --- Queries ---
// //   const {
// //     data: invitesResp,
// //     isLoading: invitesLoading,
// //     isError: invitesError,
// //     error: invitesErrObj,
// //   } = useQuery({
// //     queryKey: ["invitations"],
// //     queryFn: api.list,
// //     enabled: invitationsEnabled,
// //   });

// //   const {
// //     data: rolesData = [],
// //     isLoading: rolesLoading,
// //   } = useQuery({
// //     queryKey: ["roles"],
// //     queryFn: api.roles,
// //     enabled: rolesEnabled,
// //     select: (r) => r ?? [], // be extra safe
// //   });

// //   const invitations = invitesResp?.invitations ?? [];

// //   const roleOptions = useMemo(
// //     () => (rolesData || []).map((r) => ({ value: r.id, label: r.name })),
// //     [rolesData]
// //   );

// //   // --- Mutations ---
// //   const createMut = useMutation({
// //     mutationFn: api.create,
// //     onSuccess: () => {
// //       qc.invalidateQueries({ queryKey: ["invitations"] });
// //       setOpen(false);
// //     },
// //   });

// //   const resendMut = useMutation({
// //     mutationFn: api.resend,
// //     onSuccess: () => qc.invalidateQueries({ queryKey: ["invitations"] }),
// //   });

// //   const deleteMut = useMutation({
// //     mutationFn: api.remove,
// //     onSuccess: () => qc.invalidateQueries({ queryKey: ["invitations"] }),
// //   });

// //   // --- Form schema ---
// //   const CreateSchema = Yup.object({
// //     inviteEmail: Yup.string().email("Invalid email").required("Email is required"),
// //     role_id: Yup.string().required("Role is required"),
// //   });

// //   return (
// //     <div className="container mx-auto p-4">
// //       {/* Header */}
// //       <div className="flex items-center justify-between mb-6">
// //         <h1 className="text-3xl font-bold">Invitations</h1>
// //         <div className="flex gap-2">
// //           <Button
// //             intent="ghost"
// //             leftIcon={RefreshCw}
// //             onClick={() => qc.invalidateQueries({ queryKey: ["invitations"] })}
// //           >
// //             Refresh
// //           </Button>

// //           <RoleGate perm="invitations.store">
// //             <Button intent="primary" leftIcon={MailPlus} onClick={() => setOpen(true)}>
// //               New invite
// //             </Button>
// //           </RoleGate>
// //         </div>
// //       </div>

// //       {/* List card */}
// //       <div className="card bg-base-100 shadow-xl">
// //         <div className="card-body">
// //           {!hasPermission("invitations.index") ? (
// //             <div className="alert">
// //               <span>You don’t have permission to view invitations.</span>
// //             </div>
// //           ) : invitesLoading ? (
// //             <div className="animate-pulse h-24">Loading…</div>
// //           ) : invitesError ? (
// //             <div className="alert alert-error">
// //               <span>{invitesErrObj?.message || "Failed to load invitations."}</span>
// //             </div>
// //           ) : invitations.length === 0 ? (
// //             <div className="opacity-60">No invitations yet.</div>
// //           ) : (
// //             <div className="overflow-x-auto">
// //               <table className="table">
// //                 <thead>
// //                   <tr>
// //                     <th>Email</th>
// //                     <th>Role</th>
// //                     <th>Status</th>
// //                     <th>Sent</th>
// //                     <th className="w-40 text-right">Actions</th>
// //                   </tr>
// //                 </thead>
// //                 <tbody>
// //                   {invitations.map((inv) => (
// //                     <tr key={inv.id}>
// //                       <td>{inv.email}</td>
// //                       <td>
// //                         <span className="badge badge-outline">{inv.role?.name ?? "-"}</span>
// //                       </td>
// //                       <td>{inv.status ?? "pending"}</td>
// //                       <td>{inv.created_at ? new Date(inv.created_at).toLocaleString() : "-"}</td>
// //                       <td>
// //                         <div className="flex justify-end gap-2">
// //                           <RoleGate perm="invitations.resend">
// //                             <Button
// //                               size="xs"
// //                               variant="outline"
// //                               leftIcon={Send}
// //                               onClick={() => resendMut.mutate(inv.id)}
// //                               loading={
// //                                 resendMut.isPending && resendMut.variables === inv.id
// //                               }
// //                             >
// //                               Resend
// //                             </Button>
// //                           </RoleGate>
// //                           <RoleGate perm="invitations.destroy">
// //                             <Button
// //                               size="xs"
// //                               intent="danger"
// //                               leftIcon={Trash2}
// //                               onClick={() => deleteMut.mutate(inv.id)}
// //                               loading={
// //                                 deleteMut.isPending && deleteMut.variables === inv.id
// //                               }
// //                             >
// //                               Revoke
// //                             </Button>
// //                           </RoleGate>
// //                         </div>
// //                       </td>
// //                     </tr>
// //                   ))}
// //                 </tbody>
// //               </table>
// //             </div>
// //           )}
// //         </div>
// //       </div>

// //       {/* Create modal (Formik-wrapped so InputField works) */}
// //       {open && (
// //         <dialog open className="modal">
// //           <div className="modal-box">
// //             <h3 className="font-bold text-lg mb-4">Invite a user</h3>

// //             <Formik
// //               initialValues={{ inviteEmail: "", role_id: "" }}
// //               validationSchema={CreateSchema}
// //               onSubmit={(values) => createMut.mutate(values)}
// //             >
// //               {({ isValid, isSubmitting }) => (
// //                 <Form>
// //                   <div className="space-y-4">
// //                     <InputField
// //                       name="inviteEmail"
// //                       type="email"
// //                       label="Email"
// //                       labelBgClass="bg-base-100"
// //                       required
// //                     />

// //                     <label className="form-control w-full">
// //                       <div className="label">
// //                         <span className="label-text">Role</span>
// //                       </div>
// //                       <Field as="select" name="role_id" className="select select-bordered">
// //                         <option value="" disabled>
// //                           {rolesLoading ? "Loading roles…" : "Select role…"}
// //                         </option>
// //                         {roleOptions.map((o) => (
// //                           <option key={o.value} value={o.value}>
// //                             {o.label}
// //                           </option>
// //                         ))}
// //                       </Field>
// //                     </label>
// //                   </div>

// //                   <div className="modal-action">
// //                     <button
// //                       type="button"
// //                       className="btn btn-ghost"
// //                       onClick={() => setOpen(false)}
// //                     >
// //                       Cancel
// //                     </button>
// //                     <Button
// //                       intent="primary"
// //                       type="submit"
// //                       loading={createMut.isPending || isSubmitting}
// //                       disabled={!isValid}
// //                     >
// //                       Send invite
// //                     </Button>
// //                   </div>
// //                 </Form>
// //               )}
// //             </Formik>
// //           </div>

// //           {/* If you do NOT want a dim overlay, REMOVE this block entirely */}
// //           <form method="dialog" className="modal-backdrop">
// //             <button onClick={() => setOpen(false)}>close</button>
// //           </form>
// //         </dialog>
// //       )}
// //     </div>
// //   );
// // }



// import { useMemo, useState } from "react";
// import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
// import { Formik, Form } from "formik";
// import * as Yup from "yup";
// import { Plus, RefreshCw, Pencil, Trash2 } from "lucide-react";

// import { useAuth } from "../app/AuthContext";
// import { usePermissions } from "../hooks/usePermissions";
// import authService from "../services/authService";
// import InputField from "../components/fields/InputField";
// import Button from "../components/ui/Button";

// /** Permission gate */
// function RoleGate({ perm, children, fallback = null }) {
//   const { hasPermission } = usePermissions();
//   return hasPermission(perm) ? children : fallback;
// }

// export default function Products() {
//   const qc = useQueryClient();
//   const { token } = useAuth();
//   const { hasPermission } = usePermissions();

//   const [modalOpen, setModalOpen] = useState(false);
//   const [editing, setEditing] = useState(null); // product being edited or null

//   // --- enable flags so queries never fire if disallowed/unauthenticated
//   const canView = Boolean(token) && hasPermission("view products");
//   const canManage = Boolean(token) && hasPermission("manage products");

//   // --- queries
//   const {
//     data: products = [],
//     isLoading,
//     isError,
//     error,
//   } = useQuery({
//     queryKey: ["products"],
//     queryFn: () => authService.getProducts(token),
//     enabled: canView,
//   });

//   // --- mutations
//   const createMut = useMutation({
//     mutationFn: (payload) => authService.createProduct(payload, token),
//     onSuccess: () => {
//       qc.invalidateQueries({ queryKey: ["products"] });
//       setModalOpen(false);
//     },
//   });

//   const updateMut = useMutation({
//     mutationFn: ({ id, payload }) => authService.updateProduct(id, payload, token),
//     onSuccess: () => {
//       qc.invalidateQueries({ queryKey: ["products"] });
//       setModalOpen(false);
//       setEditing(null);
//     },
//   });

//   const deleteMut = useMutation({
//     mutationFn: (id) => authService.deleteProduct(id, token),
//     onSuccess: () => qc.invalidateQueries({ queryKey: ["products"] }),
//   });

//   const openCreate = () => {
//     setEditing(null);
//     setModalOpen(true);
//   };

//   const openEdit = (p) => {
//     setEditing(p);
//     setModalOpen(true);
//   };

//   const ProductSchema = Yup.object({
//     name: Yup.string().required("Name is required"),
//     description: Yup.string().max(1000, "Too long"),
//     price: Yup.number().typeError("Must be a number").min(0, "Must be ≥ 0").required("Price is required"),
//   });

//   return (
//     <div className="container mx-auto p-4">
//       {/* header */}
//       <div className="flex items-center justify-between mb-6">
//         <h1 className="text-3xl font-bold">Products</h1>
//         <div className="flex gap-2">
//           <Button intent="ghost" leftIcon={RefreshCw} onClick={() => qc.invalidateQueries({ queryKey: ["products"] })}>
//             Refresh
//           </Button>
//           <RoleGate perm="manage products">
//             <Button intent="primary" leftIcon={Plus} onClick={openCreate}>
//               New product
//             </Button>
//           </RoleGate>
//         </div>
//       </div>

//       {/* table */}
//       <div className="card bg-base-100 shadow-xl">
//         <div className="card-body">
//           {!canView ? (
//             <div className="alert"><span>You don’t have permission to view products.</span></div>
//           ) : isLoading ? (
//             <div className="animate-pulse h-24">Loading…</div>
//           ) : isError ? (
//             <div className="alert alert-error"><span>{error?.message || "Failed to load products."}</span></div>
//           ) : products.length === 0 ? (
//             <div className="opacity-60">No products yet.</div>
//           ) : (
//             <div className="overflow-x-auto">
//               <table className="table">
//                 <thead>
//                   <tr>
//                     <th>Name</th>
//                     <th>Description</th>
//                     <th className="text-right">Price</th>
//                     {canManage && <th className="w-40 text-right">Actions</th>}
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {products.map((p) => (
//                     <tr key={p.id}>
//                       <td className="font-medium">{p.name}</td>
//                       <td className="max-w-[36ch] truncate">{p.description}</td>
//                       <td className="text-right">${Number(p.price).toFixed(2)}</td>
//                       {canManage && (
//                         <td>
//                           <div className="flex justify-end gap-2">
//                             <Button size="xs" variant="outline" leftIcon={Pencil} onClick={() => openEdit(p)}>
//                               Edit
//                             </Button>
//                             <Button
//                               size="xs"
//                               intent="danger"
//                               leftIcon={Trash2}
//                               onClick={() => deleteMut.mutate(p.id)}
//                               loading={deleteMut.isPending && deleteMut.variables === p.id}
//                             >
//                               Delete
//                             </Button>
//                           </div>
//                         </td>
//                       )}
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>
//           )}
//         </div>
//       </div>

//       {/* create/edit modal */}
//       {modalOpen && (
//         <dialog open className="modal">
//           <div className="modal-box">
//             <h3 className="font-bold text-lg mb-4">{editing ? "Edit product" : "Create product"}</h3>

//             <Formik
//               initialValues={{
//                 name: editing?.name ?? "",
//                 description: editing?.description ?? "",
//                 price: editing?.price ?? "",
//               }}
//               validationSchema={ProductSchema}
//               onSubmit={(values) =>
//                 editing
//                   ? updateMut.mutate({ id: editing.id, payload: values })
//                   : createMut.mutate(values)
//               }
//             >
//               {({ isValid, isSubmitting }) => (
//                 <Form>
//                   <div className="space-y-4">
//                     <InputField name="name" label="Name" labelBgClass="bg-base-100" required />
//                     <InputField name="description" label="Description" labelBgClass="bg-base-100" />
//                     <InputField name="price" type="number" step="0.01" label="Price" labelBgClass="bg-base-100" required />
//                   </div>

//                   <div className="modal-action">
//                     <button type="button" className="btn btn-ghost" onClick={() => { setModalOpen(false); setEditing(null); }}>
//                       Cancel
//                     </button>
//                     <Button
//                       intent="primary"
//                       type="submit"
//                       loading={createMut.isPending || updateMut.isPending || isSubmitting}
//                       disabled={!isValid}
//                     >
//                       {editing ? "Save changes" : "Create"}
//                     </Button>
//                   </div>
//                 </Form>
//               )}
//             </Formik>
//           </div>

//           {/* Remove this block if you don't want a dim overlay */}
//           <form method="dialog" className="modal-backdrop">
//             <button onClick={() => { setModalOpen(false); setEditing(null); }}>close</button>
//           </form>
//         </dialog>
//       )}
//     </div>
//   );
// }
