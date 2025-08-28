import { useAuth } from "../app/AuthContext";
import authService from "../services/authService";
import { useMemo } from 'react';

export function useApi() {
  const { token } = useAuth();
  
  const api = useMemo(() => ({
    getRoles: () => authService.getRoles(token),
    getPermissions: () => authService.getPermissions(token),
    getPageElements: () => authService.getPageElements(token),
    createRole: (payload) => authService.createRole(payload, token),
    updateRole: (id, payload) => authService.updateRole(id, payload, token),
    deleteRole: (id) => authService.deleteRole(id, token),
    syncPermissions: () => authService.syncPermissions(token),
    
    // New functions for Menu Page Elements
    getMenuPageElements: () => authService.getMenuPageElements(token),
    createMenuPageElement: (payload) => authService.createMenuPageElement(payload, token),
    updateMenuPageElement: (id, payload) => authService.updateMenuPageElement(id, payload, token),
    deleteMenuPageElement: (id) => authService.deleteMenuPageElement(id, token),
    
    // New functions for Page Roles Pivot Table
    updatePageRoles: (pageId, roleIds) => authService.updatePageRoles(pageId, roleIds, token),
    
  }), [token]);

  return api;
}