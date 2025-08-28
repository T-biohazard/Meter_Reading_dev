// // // // src/components//roles/RolesTable.jsx
// // // import { usePermissions } from "../../hooks/usePermissions";
// // // import Button from "../../components/ui/Button";
// // // import { Pencil, Trash } from "lucide-react";

// // // function RolesTable({ roles, onEdit, onDelete }) {
// // //   const { hasPermission } = usePermissions();

// // //   if (!roles || roles.length === 0) {
// // //     return (
// // //       <div className="text-center p-8 text-neutral-content">
// // //         <p>No roles found. Create a new one to get started.</p>
// // //       </div>
// // //     );
// // //   }

// // //   // Check if the user has permission to either update or destroy roles
// // //   const canPerformActions = hasPermission("roles.update") || hasPermission("roles.destroy");

// // //   return (
// // //     <div className="overflow-x-auto">
// // //       <table className="table table-zebra w-full">
// // //         {/* head */}
// // //         <thead>
// // //           <tr>
// // //             <th>Role Name</th>
// // //             <th>Permissions</th>
// // //             {canPerformActions && (
// // //               <th className="text-right">Actions</th>
// // //             )}
// // //           </tr>
// // //         </thead>
// // //         <tbody>
// // //           {roles.map((role) => (
// // //             <tr key={role.id}>
// // //               <td>
// // //                 <div className="font-bold">{role.name}</div>
// // //               </td>
// // //               <td>
// // //                 <div className="flex flex-wrap gap-2">
// // //                   {role.permissions.map((permission) => (
// // //                     <div
// // //                       key={permission.id}
// // //                       className="badge badge-outline badge-primary badge-sm"
// // //                     >
// // //                       {permission.name}
// // //                     </div>
// // //                   ))}
// // //                 </div>
// // //               </td>
// // //               {canPerformActions && (
// // //                 <td className="text-right">
// // //                   <div className="join">
// // //                     {hasPermission("roles.update") && (
// // //                       <Button
// // //                         variant="ghost"
// // //                         size="sm"
// // //                         iconOnly
// // //                         aria-label={`Edit ${role.name}`}
// // //                         leftIcon={Pencil}
// // //                         onClick={() => onEdit(role)}
// // //                         joined
// // //                       />
// // //                     )}
// // //                     {hasPermission("roles.destroy") && (
// // //                       <Button
// // //                         variant="ghost"
// // //                         size="sm"
// // //                         intent="delete"
// // //                         iconOnly
// // //                         aria-label={`Delete ${role.name}`}
// // //                         leftIcon={Trash}
// // //                         onClick={() => onDelete(role)}
// // //                         disabled={role.name === "admin"}
// // //                         joined
// // //                       />
// // //                     )}
// // //                   </div>
// // //                 </td>
// // //               )}
// // //             </tr>
// // //           ))}
// // //         </tbody>
// // //       </table>
// // //     </div>
// // //   );
// // // }

// // // export default RolesTable;



// // // tahsin
// // // src/components/roles/RolesTable.jsx
// // import { usePermissions } from "../../hooks/usePermissions";
// // import Button from "../../components/ui/Button";
// // import { Pencil, Trash, CheckCircle2, XCircle } from "lucide-react";

// // /** Robustly read "active" from various backend shapes without changing behavior */
// // function normalizeActive(role) {
// //   const raw =
// //     role?.active ??
// //     role?.is_active ??
// //     role?.status ??
// //     role?.enabled ??
// //     role?.isEnabled ??
// //     null;

// //   if (typeof raw === "boolean") return raw;
// //   if (typeof raw === "number") return raw === 1 || raw > 0;
// //   if (typeof raw === "string") {
// //     const s = raw.trim().toLowerCase();
// //     return ["1", "true", "yes", "active", "enabled"].includes(s);
// //   }
// //   // default to false until backend provides a field
// //   return false;
// // }

// // function RolesTable({ roles, onEdit, onDelete }) {
// //   const { hasPermission } = usePermissions();

// //   if (!roles || roles.length === 0) {
// //     return (
// //       <div className="text-center p-10">
// //         <div className="inline-flex items-center justify-center rounded-xl bg-base-200 px-4 py-3">
// //           <span className="opacity-80">No roles found. Create a new one to get started.</span>
// //         </div>
// //       </div>
// //     );
// //   }

// //   const canPerformActions = hasPermission("roles.update") || hasPermission("roles.destroy");

// //   return (
// //     <div className="overflow-x-auto">
// //       <table className="table w-full">
// //         <thead>
// //           <tr>
// //             <th className="w-48">Role Name</th>
// //             <th className="w-40">Status</th>
// //             {canPerformActions && <th className="text-right w-32">Actions</th>}
// //           </tr>
// //         </thead>

// //         <tbody className="[&>tr:hover]:bg-base-200/40">
// //           {roles.map((role) => {
// //             const isActive = normalizeActive(role);
// //             return (
// //               <tr key={role.id} className="align-middle">
// //                 <td>
// //                   <div className="font-semibold">{role.name}</div>
// //                 </td>

// //                 {/* Status pill */}
// //                 <td>
// //                   <span
// //                     className={[
// //                       "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs",
// //                       "border",
// //                       isActive
// //                         ? "bg-success/10 border-success/30 text-success"
// //                         : "bg-base-200 border-base-300 text-base-content/70",
// //                     ].join(" ")}
// //                     title={`Raw status: ${String(
// //                       role?.active ?? role?.is_active ?? role?.status ?? role?.enabled ?? "n/a"
// //                     )}`}
// //                   >
// //                     {isActive ? (
// //                       <CheckCircle2 className="w-3.5 h-3.5" />
// //                     ) : (
// //                       <XCircle className="w-3.5 h-3.5" />
// //                     )}
// //                     {isActive ? "Active" : "Inactive"}
// //                   </span>
// //                 </td>

// //                 {/* Actions */}
// //                 {canPerformActions && (
// //                   <td className="text-right">
// //                     <div className="join">
// //                       {hasPermission("roles.update") && (
// //                         <Button
// //                           variant="ghost"
// //                           size="sm"
// //                           iconOnly
// //                           aria-label={`Edit ${role.name}`}
// //                           leftIcon={Pencil}
// //                           onClick={() => onEdit(role)}
// //                           joined
// //                         />
// //                       )}
// //                       {hasPermission("roles.destroy") && (
// //                         <Button
// //                           variant="ghost"
// //                           size="sm"
// //                           intent="delete"
// //                           iconOnly
// //                           aria-label={`Delete ${role.name}`}
// //                           leftIcon={Trash}
// //                           onClick={() => onDelete(role)}
// //                           disabled={role.name === "admin"}
// //                           joined
// //                         />
// //                       )}
// //                     </div>
// //                   </td>
// //                 )}
// //               </tr>
// //             );
// //           })}
// //         </tbody>
// //       </table>
// //     </div>
// //   );
// // }

// // export default RolesTable;


// // tahsin
// // src/components/roles/RolesTable.jsx
// import { usePermissions } from "../../hooks/usePermissions";
// import Button from "../../components/ui/Button";
// import { Pencil, Trash, CheckCircle2, XCircle } from "lucide-react";

// /** Robustly read "active" from various backend shapes without changing behavior */
// function normalizeActive(role) {
//   const raw =
//     role?.active ??
//     role?.is_active ??
//     role?.status ??
//     role?.enabled ??
//     role?.isEnabled ??
//     null;

//   if (typeof raw === "boolean") return raw;
//   if (typeof raw === "number") return raw === 1 || raw > 0;
//   if (typeof raw === "string") {
//     const s = raw.trim().toLowerCase();
//     return ["1", "true", "yes", "active", "enabled"].includes(s);
//   }
//   // default to false until backend provides a field
//   return false;
// }

// function RolesTable({ roles, onEdit, onDelete }) {
//   const { hasPermission } = usePermissions();

//   if (!roles || roles.length === 0) {
//     return (
//       <div className="text-center p-10">
//         <div className="inline-flex items-center justify-center rounded-xl bg-base-200 px-4 py-3">
//           <span className="opacity-80">No roles found. Create a new one to get started.</span>
//         </div>
//       </div>
//     );
//   }

//   const canPerformActions = hasPermission("roles.update") || hasPermission("roles.destroy");

//   return (
//     <div className="overflow-x-auto">
//       <table className="table table-zebra w-full">
//         <thead>
//           <tr className="bg-base-200/80 border-b border-base-300">
//             <th className="w-48 text-xs uppercase tracking-wide">Role Name</th>
//             <th className="w-40 text-xs uppercase tracking-wide">Status</th>
//             {canPerformActions && (
//               <th className="text-right w-32 text-xs uppercase tracking-wide">Actions</th>
//             )}
//           </tr>
//         </thead>

//         <tbody>
//           {roles.map((role) => {
//             const isActive = normalizeActive(role);
//             return (
//               <tr
//                 key={role.id}
//                 className="align-middle border-b border-base-300 first:border-t hover:bg-base-300/50 transition-colors"
//               >
//                 <td>
//                   <div className="font-semibold">{role.name}</div>
//                 </td>

//                 {/* Status pill */}
//                 <td>
//                   <span
//                     className={[
//                       "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs",
//                       "border",
//                       isActive
//                         ? "bg-success/10 border-success/30 text-success"
//                         : "bg-base-200 border-base-300 text-base-content/70",
//                     ].join(" ")}
//                     title={`Raw status: ${String(
//                       role?.active ?? role?.is_active ?? role?.status ?? role?.enabled ?? "n/a"
//                     )}`}
//                   >
//                     {isActive ? (
//                       <CheckCircle2 className="w-3.5 h-3.5" />
//                     ) : (
//                       <XCircle className="w-3.5 h-3.5" />
//                     )}
//                     {isActive ? "Active" : "Inactive"}
//                   </span>
//                 </td>

//                 {/* Actions */}
//                 {canPerformActions && (
//                   <td className="text-right">
//                     <div className="join">
//                       {hasPermission("roles.update") && (
//                         <Button
//                           variant="ghost"
//                           size="sm"
//                           iconOnly
//                           aria-label={`Edit ${role.name}`}
//                           leftIcon={Pencil}
//                           onClick={() => onEdit(role)}
//                           joined
//                         />
//                       )}
//                       {hasPermission("roles.destroy") && (
//                         <Button
//                           variant="ghost"
//                           size="sm"
//                           intent="delete"
//                           iconOnly
//                           aria-label={`Delete ${role.name}`}
//                           leftIcon={Trash}
//                           onClick={() => onDelete(role)}
//                           disabled={role.name === "admin"}
//                           joined
//                         />
//                       )}
//                     </div>
//                   </td>
//                 )}
//               </tr>
//             );
//           })}
//         </tbody>
//       </table>
//     </div>
//   );
// }

// export default RolesTable;


// tahsin
// src/components/roles/RolesTable.jsx
import { usePermissions } from "../../hooks/usePermissions";
import Button from "../../components/ui/Button";
import { Pencil, Trash, CheckCircle2, XCircle } from "lucide-react";

/** Robustly read "active" from various backend shapes without changing behavior */
function normalizeActive(role) {
  const raw =
    role?.active ??
    role?.is_active ??
    role?.status ??
    role?.enabled ??
    role?.isEnabled ??
    null;

  if (typeof raw === "boolean") return raw;
  if (typeof raw === "number") return raw === 1 || raw > 0;
  if (typeof raw === "string") {
    const s = raw.trim().toLowerCase();
    return ["1", "true", "yes", "active", "enabled"].includes(s);
  }
  // default to false until backend provides a field
  return false;
}

function RolesTable({ roles, onEdit, onDelete }) {
  const { hasPermission } = usePermissions();

  if (!roles || roles.length === 0) {
    return (
      <div className="text-center p-10">
        <div className="inline-flex items-center justify-center rounded-xl bg-base-200 px-4 py-3">
          <span className="opacity-80">No roles found. Create a new one to get started.</span>
        </div>
      </div>
    );
  }

  const canPerformActions = hasPermission("roles.update") || hasPermission("roles.destroy");

  return (
    <div className="overflow-x-auto">
      {/* True table grid borders + soft row hover */}
      <style>{`
        .table-grid { border-collapse: collapse; }
        .table-grid th, .table-grid td {
          border: 1px solid var(--fallback-b3, oklch(var(--b3)));
        }
        .row-hover { transition: background-color .15s ease; }
        .row-hover:hover { background-color: color-mix(in oklab, var(--fallback-b2, oklch(var(--b2))) 92%, black 0%); }
      `}</style>

      <table className="table table-grid w-full">
        <thead>
          <tr className="bg-base-200/70">
            <th className="w-48">Role Name</th>
            <th className="w-40">Status</th>
            {canPerformActions && <th className="text-right w-32">Actions</th>}
          </tr>
        </thead>

        <tbody>
          {roles.map((role) => {
            const isActive = normalizeActive(role);
            return (
              <tr key={role.id} className="row-hover align-middle">
                <td>
                  <div className="font-semibold">{role.name}</div>
                </td>

                {/* Status pill */}
                <td>
                  <span
                    className={[
                      "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs border",
                      isActive
                        ? "bg-success/10 border-success/30 text-success"
                        : "bg-base-200 border-base-300 text-base-content/70",
                    ].join(" ")}
                    title={`Raw status: ${String(
                      role?.active ?? role?.is_active ?? role?.status ?? role?.enabled ?? "n/a"
                    )}`}
                  >
                    {isActive ? (
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    ) : (
                      <XCircle className="w-3.5 h-3.5" />
                    )}
                    {isActive ? "Active" : "Inactive"}
                  </span>
                </td>

                {/* Actions */}
                {canPerformActions && (
                  <td className="text-right">
                    <div className="join">
                      {hasPermission("roles.update") && (
                        <Button
                          variant="ghost"
                          size="sm"
                          iconOnly
                          aria-label={`Edit ${role.name}`}
                          leftIcon={Pencil}
                          onClick={() => onEdit(role)}
                          joined
                        />
                      )}
                      {hasPermission("roles.destroy") && (
                        <Button
                          variant="ghost"
                          size="sm"
                          intent="delete"
                          iconOnly
                          aria-label={`Delete ${role.name}`}
                          leftIcon={Trash}
                          onClick={() => onDelete(role)}
                          disabled={role.name === "admin"}
                          joined
                        />
                      )}
                    </div>
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default RolesTable;
