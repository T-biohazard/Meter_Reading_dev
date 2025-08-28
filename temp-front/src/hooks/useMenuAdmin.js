// src/hooks/useMenuAdmin.js
import { useQueryClient } from "@tanstack/react-query";

const MENU_CACHE_KEY = "menu-page-elements:v1";

/**
 * Tiny admin helper for the dynamic menu.
 * - refreshMenu(): re-fetches from the server (updates Sidebar)
 * - clearMenuCache(): wipes localStorage copy
 * - publishNow(): clears cache + re-fetches immediately
 */
export function useMenuAdmin() {
  const qc = useQueryClient();

  const refreshMenu = () => {
    qc.invalidateQueries({ queryKey: ["menu-page-elements"] });
  };

  const clearMenuCache = () => {
    try {
      localStorage.removeItem(MENU_CACHE_KEY);
    } catch {}
  };

  const publishNow = () => {
    clearMenuCache();
    refreshMenu();
  };

  return { refreshMenu, clearMenuCache, publishNow };
}
