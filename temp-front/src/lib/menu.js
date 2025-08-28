
// src/lib/menu.js
import { LayoutDashboard, FolderKanban, Settings2 } from "lucide-react";

export const menuTree = [
  {
    label: "Workspace",
    Icon: LayoutDashboard,
    children: [
      {
        label: "Overview",
        children: [
          { label: "Home", path: "/" },
          { label: "Dashboard", path: "/people/roles" },
          { label: "Activity Feed", path: "/settings/admin/permissions" },
        ],
      },
      {
        label: "People",
        children: [
          { label: "Users", path: "/users" },
          { label: "Roles", path: "/roles" },
          // { label: "Invitations", path: "/settings/admin/permissions" },
          {label: "Invitations", path: "/invitations" }
        ],
      },
    ],
  },
  {
    label: "Projects",
    Icon: FolderKanban,
    children: [
      {
        label: "Alpha",
        children: [
          { label: "Backlog", path: "/projects/alpha/backlog" },
          { label: "Boards", path: "/projects/alpha/boards" },
          { label: "Reports", path: "/projects/alpha/reports" },
        ],
      },
      {
        label: "Beta",
        children: [
          { label: "Backlog", path: "/projects/beta/backlog" },
          { label: "Boards", path: "/projects/beta/boards" },
          { label: "Releases", path: "/projects/beta/releases" },
        ],
      },
    ],
  },
  {
    label: "Settings",
    Icon: Settings2,
    children: [
      {
        label: "Account",
        children: [
          { label: "Profile", path: "/settings/profile" },
          { label: "Security", path: "/settings/security" },
          { label: "Billing", path: "/settings/billing" },
        ],
      },
      {
        label: "Admin",
        children: [
          { label: "Users", path: "/settings/admin/users" },
          { label: "Permissions", path: "/settings/admin/permissions" },
          { label: "Audit Log", path: "/settings/admin/audit-log" },
        ],
      },
    ],
  },
];
