import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useRoles } from '../../hooks/useRoles';
import { usePageElements } from '../../hooks/usePageElements';
import { useSaveAllChanges } from '../../hooks/useSaveAllChanges';
import PermissionsTableSkeleton from '../ui/PermissionsTableSkeleton';
import { formatPermissionName } from '../../utils/formatPermissionName';
import { ChevronDown, ChevronRight, X } from 'lucide-react';

const buildMenuTreeFromElements = (rows = []) => {
  const root = [];
  const menus = new Map();
  const submenus = new Map();

  const ensureMenu = (menuLabel, menuIcon) => {
    const key = menuLabel;
    if (!menus.has(key)) {
      const node = { label: menuLabel, key, icon: menuIcon || null, children: [], type: 'menu' };
      menus.set(key, node);
      root.push(node);
    }
    return menus.get(key);
  };

  const ensureSubmenu = (menuLabel, menuIcon, subLabel, subIcon) => {
    const parent = ensureMenu(menuLabel, menuIcon);
    const key = `${menuLabel}::${subLabel}`;
    if (!submenus.has(key)) {
      const node = { label: subLabel, key, icon: subIcon || null, children: [], type: 'submenu' };
      submenus.set(key, node);
      parent.children.push(node);
    }
    return submenus.get(key);
  };

  const pushLeaf = (targetChildren, pageElement) => {
    targetChildren.push({ ...pageElement, type: 'page' });
  };

  rows.forEach((r) => {
    if (Number(r?.status) === 0) return;

    const menuLabel = r.menu_name || null;
    const subLabel = r.sub_menu_name || null;

    if (!menuLabel && !subLabel) {
      pushLeaf(root, r);
      return;
    }
    if (menuLabel && !subLabel) {
      const menuNode = ensureMenu(menuLabel, r.menu_icon);
      pushLeaf(menuNode.children, r);
      return;
    }
    const subNode = ensureSubmenu(menuLabel, r.menu_icon, subLabel, r.sub_menu_icon);
    pushLeaf(subNode.children, r);
  });

  return root;
};

const getPagesInBranch = (node) => {
  let pages = [];
  if (node.type === 'page') {
    return [node.id];
  }
  if (node.children) {
    node.children.forEach(child => {
      pages = pages.concat(getPagesInBranch(child));
    });
  }
  return pages;
};

// Helper function to find parent menus for a given page ID
const findParentMenus = (tree, pageId) => {
    const parents = [];
    const traverse = (nodes, currentPath = []) => {
        nodes.forEach(node => {
            const newPath = [...currentPath, node];
            if (node.type === 'page' && node.id === pageId) {
                newPath.forEach(parent => {
                    if (parent.type === 'menu' || parent.type === 'submenu') {
                        parents.push(parent);
                    }
                });
            } else if (node.children) {
                traverse(node.children, newPath);
            }
        });
    };
    traverse(tree);
    return parents;
};

const TreeRow = ({ 
  node, 
  localPages, 
  localPermissions, 
  selectedRole, 
  handlePageAccessChange, 
  handlePermissionChange, 
  expandedPages, 
  toggleRow, 
  expandedMenus, 
  toggleMenu,
  handleMenuAccessChange,
  menuCheckedState,
  isPending,
  isFetching,
  depth = 0 
}) => {
  const isMenuExpanded = expandedMenus.has(node.key);

  if (node.type === 'menu' || node.type === 'submenu') {
    const isChecked = menuCheckedState.get(node.key);
    const isIndeterminate = isChecked === null;

    return (
      <React.Fragment>
        <tr key={node.key}>
          <td colSpan="3" className={`py-3 px-4 font-bold text-gray-800 bg-gray-50 border-b border-gray-200 ${depth > 0 ? 'pl-8' : ''}`}>
            <div className="flex items-center">
              <button
                onClick={() => toggleMenu(node.key)}
                className="flex items-center w-full text-left"
              >
                <span className="mr-2">
                  {isMenuExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                </span>
                {node.label}
              </button>
              <input
                type="checkbox"
                className="checkbox checkbox-primary ml-auto"
                checked={isChecked || false}
                onChange={() => handleMenuAccessChange(node)}
                ref={el => {
                  if (el) el.indeterminate = isIndeterminate;
                }}
                disabled={!selectedRole || isPending || isFetching}
              />
            </div>
          </td>
        </tr>
        {isMenuExpanded && node.children.map((childNode) => (
          <TreeRow
            key={`${childNode.id || childNode.label}-${childNode.path}`}
            node={childNode}
            localPages={localPages}
            localPermissions={localPermissions}
            selectedRole={selectedRole}
            handlePageAccessChange={handlePageAccessChange}
            handlePermissionChange={handlePermissionChange}
            expandedPages={expandedPages}
            toggleRow={toggleRow}
            expandedMenus={expandedMenus}
            toggleMenu={toggleMenu}
            handleMenuAccessChange={handleMenuAccessChange}
            menuCheckedState={menuCheckedState}
            isPending={isPending}
            isFetching={isFetching}
            depth={depth + 1}
          />
        ))}
      </React.Fragment>
    );
  }

  return (
    <React.Fragment>
      <tr className="border-b border-gray-200 hover:bg-gray-50" key={`${node.id || node.label}-${node.path}`}>
        <td className={`py-3 px-4 font-semibold text-gray-800 ${depth > 0 ? 'pl-12' : ''}`}>
          <div className="flex items-center">
            {node.permissions && node.permissions.length > 0 && (
              <button 
                onClick={() => toggleRow(node.id)} 
                className="mr-2"
                aria-label="Expand/Collapse permissions"
              >
                {expandedPages.has(node.id) ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
              </button>
            )}
            {node.page_name}
          </div>
        </td>
        <td className="py-3 px-4">
          <input
            type="checkbox"
            className="checkbox checkbox-primary"
            checked={localPages.has(node.id)}
            onChange={() => handlePageAccessChange(node.id)}
            disabled={!selectedRole || isPending || isFetching}
          />
        </td>
        <td className="py-3 px-4">
          {node.permissions && node.permissions.map(permission => (
            <span
              key={permission.id}
              className={`badge badge-sm mr-1 ${localPermissions.has(permission.id) ? 'badge-primary' : 'badge-ghost'}`}
            >
              {formatPermissionName(permission.name)}
            </span>
          ))}
        </td>
      </tr>
      {expandedPages.has(node.id) && node.permissions.length > 0 && (
        <tr className="bg-gray-50 border-b border-gray-200">
          <td colSpan="3" className="py-4 px-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {node.permissions.map(permission => (
                <div key={permission.id} className="form-control">
                  <label className="label cursor-pointer justify-start">
                    <input
                      type="checkbox"
                      className="checkbox checkbox-primary mr-2"
                      checked={localPermissions.has(permission.id)}
                      onChange={() => handlePermissionChange(permission.id)}
                      disabled={!selectedRole || isPending || isFetching}
                    />
                    <span className="label-text text-gray-700">
                      {formatPermissionName(permission.name)}
                    </span>
                  </label>
                </div>
              ))}
            </div>
          </td>
        </tr>
      )}
    </React.Fragment>
  );
};

const PermissionsTable = () => {
  const rolesQuery = useRoles();
  const pageElementsQuery = usePageElements();
  const saveChangesMutation = useSaveAllChanges();

  const [selectedRole, setSelectedRole] = useState(null);
  const [localPermissions, setLocalPermissions] = useState(new Set());
  const [localPages, setLocalPages] = useState(new Set());
  const [expandedPages, setExpandedPages] = useState(new Set());
  const [expandedMenus, setExpandedMenus] = useState(new Set());
  const [menuCheckedState, setMenuCheckedState] = useState(new Map());
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const searchRef = useRef(null);

  const isLoading = rolesQuery.isLoading || pageElementsQuery.isLoading;
  const isFetching = pageElementsQuery.isFetching;
  const isPending = saveChangesMutation.isPending;
  const isError = rolesQuery.isError || pageElementsQuery.isError;
  const roles = rolesQuery.data;
  const pageElements = pageElementsQuery.data;

  const menuTree = useMemo(() => buildMenuTreeFromElements(pageElements), [pageElements]);

  useEffect(() => {
    if (selectedRole && pageElements) {
      const pagesForRole = pageElements.filter(page =>
        page.roles.some(r => r.id === selectedRole.id)
      );
      
      const permissionsForRole = pageElements.flatMap(page =>
        page.permissions?.filter(p =>
          p.roles.some(r => r.id === selectedRole.id)
        ) ?? []
      );

      const initialPermissions = new Set(permissionsForRole.map(p => p.id));
      setLocalPermissions(initialPermissions);

      const initialPages = new Set(pagesForRole.map(p => p.id));
      setLocalPages(initialPages);

      setSearchTerm(selectedRole.name);
    }
  }, [selectedRole, pageElements]);

  const updateMenuStates = (updatedPages) => {
    const newMenuState = new Map();
    const checkMenuState = (nodes) => {
      nodes.forEach(node => {
        if (node.type === 'menu' || node.type === 'submenu') {
          const allPages = getPagesInBranch(node);
          if (allPages.length === 0) {
              newMenuState.set(node.key, false);
          } else {
              const selectedPages = allPages.filter(pageId => updatedPages.has(pageId));
              if (selectedPages.length === 0) {
                newMenuState.set(node.key, false);
              } else if (selectedPages.length === allPages.length) {
                newMenuState.set(node.key, true);
              } else {
                newMenuState.set(node.key, null);
              }
          }
          checkMenuState(node.children);
        }
      });
    };
    checkMenuState(menuTree);
    setMenuCheckedState(newMenuState);
  };

  useEffect(() => {
      if (menuTree.length > 0) {
          updateMenuStates(localPages);
      }
  }, [localPages, menuTree]);

  useEffect(() => {
    if (roles && pageElements) {
      const storedRoleId = localStorage.getItem('selectedRoleId');
      if (storedRoleId) {
        const completeRole = pageElements.flatMap(page => page.roles).find(role => role.id === storedRoleId);
        if (completeRole) {
          setSelectedRole(completeRole);
        }
      }
    }
  }, [roles, pageElements]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleRoleSelect = (role) => {
    setSelectedRole(role);
    setSearchTerm(role.name);
    setIsSearchOpen(false);
    localStorage.setItem('selectedRoleId', role.id);
  };

  const handleClearSelection = () => {
    setSelectedRole(null);
    setSearchTerm('');
    setLocalPermissions(new Set());
    setLocalPages(new Set());
    localStorage.removeItem('selectedRoleId');
  };

  const handlePermissionChange = (permissionId) => {
    setLocalPermissions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(permissionId)) {
        newSet.delete(permissionId);
      } else {
        newSet.add(permissionId);
      }
      return newSet;
    });
  };

  const handlePageAccessChange = (pageId) => {
    setLocalPages(prev => {
      const newSet = new Set(prev);
      if (newSet.has(pageId)) {
        newSet.delete(pageId);
      } else {
        newSet.add(pageId);
      }
      return newSet;
    });
  };

  const handleMenuAccessChange = (menuNode) => {
    const allPagesInMenu = getPagesInBranch(menuNode);
    const isChecked = menuCheckedState.get(menuNode.key);

    setLocalPages(prev => {
      const newSet = new Set(prev);
      if (isChecked) {
        allPagesInMenu.forEach(pageId => newSet.delete(pageId));
      } else {
        allPagesInMenu.forEach(pageId => newSet.add(pageId));
      }
      return newSet;
    });
  };

  const toggleRow = (pageId) => {
    setExpandedPages(prev => {
      const newSet = new Set(prev);
      if (newSet.has(pageId)) {
        newSet.delete(pageId);
      } else {
        newSet.add(pageId);
      }
      return newSet;
    });
  };

  const toggleMenu = (menuKey) => {
    setExpandedMenus(prev => {
      const newSet = new Set(prev);
      if (newSet.has(menuKey)) {
        newSet.delete(menuKey);
      } else {
        newSet.add(menuKey);
      }
      return newSet;
    });
  };

  const handleSave = () => {
    if (!selectedRole || !pageElements) return;

    const allPermissions = pageElements.flatMap(page => page.permissions || []);
    const selectedPermissionNames = allPermissions.filter(p => localPermissions.has(p.id)).map(p => p.name);

    saveChangesMutation.mutate({
      roleId: selectedRole.id,
      roleName: selectedRole.name,
      permissions: selectedPermissionNames,
      pageElements: pageElements,
      localPages: localPages,
    });
  };

  const filteredRoles = roles
    ? roles.filter(role => role.name.toLowerCase().includes(searchTerm.toLowerCase()))
    : [];

  if (isLoading || isFetching || isPending) {
    return <PermissionsTableSkeleton />;
  }

  if (isError) {
    return (
      <div className="p-8 bg-red-100 border border-red-400 text-red-700 rounded-xl">
        <p className="font-bold">Error loading data</p>
        <p>{rolesQuery.error?.message || pageElementsQuery.error?.message}</p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 bg-white rounded-xl shadow-lg w-full">
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <h1 className="text-2xl font-semibold text-gray-800">Permissions by Role</h1>
        <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto relative" ref={searchRef}>
          <div className="relative w-full md:w-64">
            <input
              type="text"
              placeholder="Search or select a role..."
              className="input input-bordered w-full"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setIsSearchOpen(true);
              }}
              onFocus={() => setIsSearchOpen(true)}
            />
            {selectedRole && (
                <button
                    onClick={handleClearSelection}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                    aria-label="Clear selection"
                >
                    <X size={16} />
                </button>
            )}
            {isSearchOpen && (
              <ul className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                {filteredRoles.length > 0 ? (
                  filteredRoles.map(role => (
                    <li key={role.id}>
                      <button
                        onClick={() => handleRoleSelect(role)}
                        className="w-full text-left px-4 py-2 hover:bg-gray-100"
                      >
                        {role.name}
                      </button>
                    </li>
                  ))
                ) : (
                  <li className="px-4 py-2 text-gray-500">No roles found.</li>
                )}
              </ul>
            )}
          </div>
          <button
            onClick={handleSave}
            disabled={!selectedRole || isPending || isFetching}
            className={`
              btn btn-primary
              ${isPending || isFetching ? 'loading' : ''}
              ${!selectedRole ? 'btn-disabled' : ''}
            `}
          >
            {isPending || isFetching ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>

      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className="table table-auto w-full">
          <thead>
            <tr className="bg-gray-100 text-gray-600 uppercase text-sm leading-normal">
              <th className="py-3 px-4 text-left w-1/2">Page</th>
              <th className="py-3 px-4 text-left">Access</th>
              <th className="py-3 px-4 text-left w-1/2">Permissions</th>
            </tr>
          </thead>
          <tbody className="text-gray-600 text-sm font-light">
            {menuTree.map(node => (
              <TreeRow
                key={node.key || node.id}
                node={node}
                localPages={localPages}
                localPermissions={localPermissions}
                selectedRole={selectedRole}
                handlePageAccessChange={handlePageAccessChange}
                handlePermissionChange={handlePermissionChange}
                expandedPages={expandedPages}
                toggleRow={toggleRow}
                expandedMenus={expandedMenus}
                toggleMenu={toggleMenu}
                handleMenuAccessChange={handleMenuAccessChange}
                menuCheckedState={menuCheckedState}
                isPending={isPending}
                isFetching={isFetching}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PermissionsTable;