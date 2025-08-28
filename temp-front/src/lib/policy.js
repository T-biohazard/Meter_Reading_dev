import { Roles } from "./roles";
import { Permissions } from "./roles";

const ROLE_PERMISSIONS = {
  [Roles.VIEWER]: [Permissions.ITEM_EXPORT],
  [Roles.EDITOR]: [Permissions.ITEM_CREATE, Permissions.ITEM_UPDATE, Permissions.ITEM_EXPORT],
  [Roles.ADMIN]: [
    Permissions.ITEM_CREATE,
    Permissions.ITEM_UPDATE,
    Permissions.ITEM_DELETE,
    Permissions.ITEM_EXPORT,
  ],
};

export function hasPermission(role, permission) {
  if (!permission) return true; // no permission needed
  const allowed = ROLE_PERMISSIONS[role] || [];
  return allowed.includes(permission);
}

export function filterAllowedActions(role, items = []) {
  return items
    .filter((it) => hasPermission(role, it.requires))
    .map((it) => ({ ...it, disabled: typeof it.disabledWhen === "function" ? it.disabledWhen() : false }));
}
