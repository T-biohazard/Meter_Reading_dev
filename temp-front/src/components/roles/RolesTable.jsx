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
    <div className="overflow-x-auto rounded-lg border border-gray-200">
      <table className="table table-auto w-full">
        <thead>
          <tr className="bg-gray-100 text-gray-600 uppercase text-sm leading-normal">
            <th className="py-3 px-4 text-left w-1/2">Role Name</th>
            <th className="py-3 px-4 text-left w-40">Status</th>
            {canPerformActions && <th className="py-3 px-4 text-right w-32">Actions</th>}
          </tr>
        </thead>

        <tbody className="text-gray-600 text-sm font-light">
          {roles.map((role) => {
            const isActive = normalizeActive(role);
            return (
              <tr key={role.id} className="border-b border-gray-200 hover:bg-gray-50 align-middle">
                <td className="py-3 px-4">
                  <div className="font-semibold">{role.name}</div>
                </td>

                {/* Status pill */}
                <td className="py-3 px-4">
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
                  <td className="py-3 px-4 text-right">
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
