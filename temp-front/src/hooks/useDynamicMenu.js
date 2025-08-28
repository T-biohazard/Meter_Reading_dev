// src/hooks/useDynamicMenu.js
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import authService from "../services/authService";
import { useAuth } from "../app/AuthContext";
import { usePermissions } from "../hooks/usePermissions";

const MENU_CACHE_KEY = "menu-page-elements:v2"; // bump cache key since schema changed

const alpha = (a, b) => String(a.label).localeCompare(String(b.label));

function buildMenuTreeFromElements(rows = []) {
  const root = [];
  const menus = new Map();       // menu_name -> node
  const submenus = new Map();    // menu_name::sub_menu_name -> node
  const seen = new Set();        // dedupe leaves by label|path

  const ensureMenu = (menuLabel, menuIcon) => {
    if (!menus.has(menuLabel)) {
      const node = { label: menuLabel, icon: menuIcon || null, children: [] };
      menus.set(menuLabel, node);
      root.push(node);
    } else if (menuIcon && !menus.get(menuLabel).icon) {
      // fill icon if it arrives from a later row
      menus.get(menuLabel).icon = menuIcon;
    }
    return menus.get(menuLabel);
  };

  const ensureSubmenu = (menuLabel, menuIcon, subLabel, subIcon) => {
    const parent = ensureMenu(menuLabel, menuIcon);
    const key = `${menuLabel}::${subLabel}`;
    if (!submenus.has(key)) {
      const node = { label: subLabel, icon: subIcon || null, children: [] };
      submenus.set(key, node);
      parent.children.push(node);
    } else if (subIcon && !submenus.get(key).icon) {
      submenus.get(key).icon = subIcon;
    }
    return submenus.get(key);
  };

  const pushLeaf = (targetChildren, label, path, icon) => {
    const sig = `${label}|${path}`;
    if (seen.has(sig)) return;
    seen.add(sig);
    targetChildren.push({ label, path, icon: icon || null });
  };

  rows.forEach((r) => {
    // filter inactive (status === 0)
    if (Number(r?.status) === 0) return;

    const pageLabel = r.page_name || "Untitled";
    const path = r.path || "#";
    const menuLabel = r.menu_name || null;
    const subLabel = r.sub_menu_name || null;

    const menuIcon = r.menu_icon || null;
    const subIcon = r.sub_menu_icon || null;
    const pageIcon = r.page_icon || null;

    if (!menuLabel && !subLabel) {
      // top-level page
      pushLeaf(root, pageLabel, path, pageIcon);
      return;
    }
    if (menuLabel && !subLabel) {
      const menuNode = ensureMenu(menuLabel, menuIcon);
      pushLeaf(menuNode.children, pageLabel, path, pageIcon);
      return;
    }
    // menu + submenu
    const subNode = ensureSubmenu(menuLabel, menuIcon, subLabel, subIcon);
    pushLeaf(subNode.children, pageLabel, path, pageIcon);
  });

  // sort
  root.sort(alpha);
  root.forEach((n) => {
    if (Array.isArray(n.children)) {
      n.children.sort(alpha);
      n.children.forEach((c) => {
        if (Array.isArray(c.children)) c.children.sort(alpha);
      });
    }
  });

  return root;
}

export function useDynamicMenu() {
  const { token } = useAuth();
  const { hasPermission } = usePermissions();

  const cachedRows = useMemo(() => {
    try {
      const raw = localStorage.getItem(MENU_CACHE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }, []);

  const { data, isLoading, isError, error, isFetching } = useQuery({
    queryKey: ["menu-page-elements"],
    queryFn: () => authService.listMenuPageElements(token),
    enabled: !!token && hasPermission("menu-page-elements.index"),
    initialData: cachedRows ?? undefined,
    keepPreviousData: true,
    staleTime: 0,
    onSuccess: (rows) => {
      try {
        localStorage.setItem(MENU_CACHE_KEY, JSON.stringify(rows ?? []));
      } catch {}
    },
  });

  const rows = Array.isArray(data) ? data : [];
  const tree = useMemo(() => buildMenuTreeFromElements(rows), [rows]);

  return { tree, isLoading, isFetching, isError, error };
}
