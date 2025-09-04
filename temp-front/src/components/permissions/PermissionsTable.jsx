import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useRoles } from '../../hooks/useRoles';
import { usePageElements } from '../../hooks/usePageElements';
import { useSaveAllChanges } from '../../hooks/useSaveAllChanges';
import PermissionsTableSkeleton from '../ui/PermissionsTableSkeleton';
import { formatPermissionName } from '../../utils/formatPermissionName';
import { ChevronDown, ChevronRight, X, Pencil } from 'lucide-react';
// import InputField from "./fields/InputField"; // ← use your shared InputField

/* ----------------------- helpers: tree build ----------------------- */
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
  if (node.type === 'page') return [node.id];
  if (node.children) node.children.forEach(child => { pages = pages.concat(getPagesInBranch(child)); });
  return pages;
};

/* ----------------------- helpers: badges ----------------------- */
const permissionBadgeClass = (name, active) => {
  const n = (name || '').toLowerCase();
  let color = 'badge-primary';
  if (n.includes('create') || n.includes('add') || n.includes('new')) color = 'badge-success';
  else if (n.includes('export') || n.includes('download')) color = 'badge-secondary';
  else if (n.includes('update') || n.includes('edit') || n.includes('sync')) color = 'badge-warning';
  else if (n.includes('delete') || n.includes('remove')) color = 'badge-error';
  else if (n.includes('view') || n.includes('read') || n.includes('list')) color = 'badge-primary';
  return `badge badge-sm ${active ? color : 'badge-ghost'}`;
};

/* (kept if you need it elsewhere) */
const findParentMenus = (tree, pageId) => {
  const parents = [];
  const traverse = (nodes, currentPath = []) => {
    nodes.forEach(node => {
      const newPath = [...currentPath, node];
      if (node.type === 'page' && node.id === pageId) {
        newPath.forEach(parent => {
          if (parent.type === 'menu' || parent.type === 'submenu') parents.push(parent);
        });
      } else if (node.children) {
        traverse(node.children, newPath);
      }
    });
  };
  traverse(tree);
  return parents;
};

/* ----------------------- reusable table shell + stats ----------------------- */
const Chip = ({ label, value }) => (
  <span className="inline-flex items-center gap-1 rounded-full border border-gray-200 bg-gray-50 px-2.5 py-1 text-xs text-gray-700">
    <span className="opacity-80">{label}:</span>
    <b className="font-medium">{value}</b>
  </span>
);

const TableShell = ({ columns = [], stats, children }) => (
  <div className="rounded-lg border border-gray-200 bg-white">
    {stats ? (
      <div className="flex flex-wrap items-center gap-2 p-3">
        <Chip label="Rows" value={stats.rows} />
        <Chip label="Visible" value={stats.visible} />
        <Chip label="Cols" value={stats.cols} />
        <Chip label="Menus" value={stats.menus} />
        <Chip label="Submenus" value={stats.submenus} />
        <Chip label="Pages" value={stats.pages} />
        <Chip label="Perms" value={stats.permissions} />
      </div>
    ) : null}

    <div className="overflow-x-auto">
      <table className="table table-auto w-full">
        <thead>
          <tr className="bg-gray-100 text-gray-700 uppercase text-sm leading-normal">
            {columns.map((c, i) => (
              <th key={i} className={`py-3 px-4 text-left ${c.className || ''}`}>{c.label}</th>
            ))}
          </tr>
        </thead>
        {children}
      </table>
    </div>
  </div>
);

const countTreeStats = (nodes = []) => {
  let menus = 0, submenus = 0, pages = 0, permissions = 0;
  const walk = (arr) => {
    arr.forEach((n) => {
      if (n.type === 'menu') menus += 1;
      else if (n.type === 'submenu') submenus += 1;
      else if (n.type === 'page') {
        pages += 1;
        permissions += (n.permissions?.length || 0);
      }
      if (n.children?.length) walk(n.children);
    });
  };
  walk(nodes);
  return { menus, submenus, pages, permissions, rows: menus + submenus + pages };
};

const countVisibleRows = (nodes = [], expandedMenus = new Set()) => {
  let count = 0;
  const walk = (arr) => {
    arr.forEach((n) => {
      if (n.type === 'menu' || n.type === 'submenu') {
        count += 1;
        if (expandedMenus.has(n.key) && n.children?.length) walk(n.children);
      } else if (n.type === 'page') {
        count += 1;
      }
    });
  };
  walk(nodes);
  return count;
};

/* ----------------------- row ----------------------- */
const TreeRow = ({
  node,
  localPages,
  localPermissions,
  selectedRole,
  handlePageAccessChange,
  handlePermissionChange,
  expandedPages,              // kept for compatibility
  toggleRow,                  // kept for compatibility
  expandedMenus,
  toggleMenu,
  handleMenuAccessChange,
  menuCheckedState,
  isPending,
  isFetching,
  depth = 0,
  openPermissionModal
}) => {
  const isMenuExpanded = expandedMenus.has(node.key);
  const depthDash = depth > 0 ? '— '.repeat(Math.min(depth, 3)) : '';

  if (node.type === 'menu' || node.type === 'submenu') {
    const isChecked = menuCheckedState.get(node.key);
    const isIndeterminate = isChecked === null;

    return (
      <>
        <tr key={node.key} className="border-b border-gray-200">
          <td className="py-3 px-4">
            <input
              type="checkbox"
              className="checkbox checkbox-success"
              checked={!!isChecked}
              onChange={() => handleMenuAccessChange(node)}
              ref={el => { if (el) el.indeterminate = isIndeterminate; }}
              disabled={!selectedRole || isPending || isFetching}
            />
          </td>

          <td className={`py-3 px-4 font-medium text-gray-800 ${depth > 0 ? 'pl-8' : ''}`}>
            <span>{depthDash}{node.label}</span>
          </td>

          <td className="py-3 px-4 text-gray-400">—</td>

          <td className="py-3 px-4">
            <button
              onClick={() => toggleMenu(node.key)}
              className="btn btn-ghost btn-sm"
              aria-label={isMenuExpanded ? 'Collapse' : 'Expand'}
              title={isMenuExpanded ? 'Collapse' : 'Expand'}
            >
              {isMenuExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            </button>
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
            openPermissionModal={openPermissionModal}
          />
        ))}
      </>
    );
  }

  return (
    <>
      <tr className="border-b border-gray-200 hover:bg-gray-50" key={`${node.id || node.label}-${node.path}`}>
        <td className="py-3 px-4">
          <input
            type="checkbox"
            className="checkbox checkbox-success"
            checked={localPages.has(node.id)}
            onChange={() => handlePageAccessChange(node.id)}
            disabled={!selectedRole || isPending || isFetching}
          />
        </td>

        <td className={`py-3 px-4 font-medium text-gray-800 ${depth > 0 ? 'pl-12' : ''}`}>
          <span>{depthDash}{node.page_name}</span>
        </td>

        <td className="py-3 px-4">
          {node.permissions && node.permissions.map(permission => {
            const active = localPermissions.has(permission.id);
            return (
              <span
                key={permission.id}
                className={`${permissionBadgeClass(permission.name, active)} mr-2`}
                title={formatPermissionName(permission.name)}
              >
                {formatPermissionName(permission.name)}
              </span>
            );
          })}
          {!node.permissions?.length && <span className="text-gray-400">—</span>}
        </td>

        <td className="py-3 px-4">
          {node.permissions && node.permissions.length > 0 ? (
            <button
              onClick={() => openPermissionModal(node)}
              className="btn btn-ghost btn-sm"
              disabled={!selectedRole || isPending || isFetching}
              aria-label="Edit permissions"
              title="Edit"
            >
              <Pencil size={16} />
            </button>
          ) : (
            <span className="text-xs text-gray-400">—</span>
          )}
        </td>
      </tr>
    </>
  );
};

/* ----------------------- main ----------------------- */
const PermissionsTable = () => {
  const rolesQuery = useRoles();
  const pageElementsQuery = usePageElements();
  const saveChangesMutation = useSaveAllChanges();

  const [selectedRole, setSelectedRole] = useState(null);
  const [localPermissions, setLocalPermissions] = useState(new Set());
  const [localPages, setLocalPages] = useState(new Set());
  const [expandedPages, setExpandedPages] = useState(new Set());   // kept for compatibility
  const [expandedMenus, setExpandedMenus] = useState(new Set());
  const [menuCheckedState, setMenuCheckedState] = useState(new Map());
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [modalPage, setModalPage] = useState(null);                // modal target
  const searchRef = useRef(null);

  const isLoading = rolesQuery.isLoading || pageElementsQuery.isLoading;
  const isFetching = pageElementsQuery.isFetching;
  const isPending = saveChangesMutation.isPending;
  const isError = rolesQuery.isError || pageElementsQuery.isError;
  const roles = rolesQuery.data;
  const pageElements = pageElementsQuery.data;

  const menuTree = useMemo(() => buildMenuTreeFromElements(pageElements), [pageElements]);

  // hydrate sets when role selected
  useEffect(() => {
    if (selectedRole && pageElements) {
      const pagesForRole = pageElements.filter(page =>
        page.roles.some(r => r.id === selectedRole.id)
      );
      const permissionsForRole = pageElements.flatMap(page =>
        page.permissions?.filter(p => p.roles.some(r => r.id === selectedRole.id)) ?? []
      );
      setLocalPermissions(new Set(permissionsForRole.map(p => p.id)));
      setLocalPages(new Set(pagesForRole.map(p => p.id)));
      setSearchTerm(selectedRole.name);
    }
  }, [selectedRole, pageElements]);

  // tri-state compute
  const updateMenuStates = (updatedPages) => {
    const newMenuState = new Map();
    const checkMenuState = (nodes) => {
      nodes.forEach(node => {
        if (node.type === 'menu' || node.type === 'submenu') {
          const allPages = getPagesInBranch(node);
          if (allPages.length === 0) newMenuState.set(node.key, false);
          else {
            const selectedPages = allPages.filter(pageId => updatedPages.has(pageId));
            if (selectedPages.length === 0) newMenuState.set(node.key, false);
            else if (selectedPages.length === allPages.length) newMenuState.set(node.key, true);
            else newMenuState.set(node.key, null);
          }
          checkMenuState(node.children);
        }
      });
    };
    checkMenuState(menuTree);
    setMenuCheckedState(newMenuState);
  };

  useEffect(() => {
    if (menuTree.length > 0) updateMenuStates(localPages);
  }, [localPages, menuTree]);

  // restore last role
  useEffect(() => {
    if (roles && pageElements) {
      const storedRoleId = localStorage.getItem('selectedRoleId');
      if (storedRoleId) {
        const completeRole = pageElements.flatMap(page => page.roles).find(role => role.id === storedRoleId);
        if (completeRole) setSelectedRole(completeRole);
      }
    }
  }, [roles, pageElements]);

  // close search on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) setIsSearchOpen(false);
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
      const next = new Set(prev);
      if (next.has(permissionId)) next.delete(permissionId);
      else next.add(permissionId);
      return next;
    });
  };

  const handlePageAccessChange = (pageId) => {
    setLocalPages(prev => {
      const next = new Set(prev);
      if (next.has(pageId)) next.delete(pageId);
      else next.add(pageId);
      return next;
    });
  };

  const handleMenuAccessChange = (menuNode) => {
    const allPagesInMenu = getPagesInBranch(menuNode);
    const isChecked = menuCheckedState.get(menuNode.key);
    setLocalPages(prev => {
      const next = new Set(prev);
      if (isChecked) allPagesInMenu.forEach(pageId => next.delete(pageId));
      else allPagesInMenu.forEach(pageId => next.add(pageId));
      return next;
    });
  };

  const toggleRow = (pageId) => {
    setExpandedPages(prev => {
      const next = new Set(prev);
      if (next.has(pageId)) next.delete(pageId);
      else next.add(pageId);
      return next;
    });
  };

  const toggleMenu = (menuKey) => {
    setExpandedMenus(prev => {
      const next = new Set(prev);
      if (next.has(menuKey)) next.delete(menuKey);
      else next.add(menuKey);
      return next;
    });
  };

  const openPermissionModal = (pageNode) => setModalPage(pageNode);
  const closePermissionModal = () => setModalPage(null);

  const handleSave = () => {
    if (!selectedRole || !pageElements) return;
    const allPermissions = pageElements.flatMap(page => page.permissions || []);
    const selectedPermissionNames = allPermissions
      .filter(p => localPermissions.has(p.id))
      .map(p => p.name);
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

  /* -------- move this hook ABOVE any conditional returns -------- */
  const treeStats = useMemo(() => {
    const s = countTreeStats(menuTree);
    const visible = countVisibleRows(menuTree, expandedMenus);
    return { ...s, visible, cols: 4 };
  }, [menuTree, expandedMenus]);

  if (isLoading || isFetching || isPending) return <PermissionsTableSkeleton />;

  if (isError) {
    return (
      <div className="p-8 bg-red-100 border border-red-400 text-red-700 rounded-xl">
        <p className="font-bold">Error loading data</p>
        <p>{rolesQuery.error?.message || pageElementsQuery.error?.message}</p>
      </div>
    );
  }

  return (
    <div className=" w-full bg-white">
      {/* header actions */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <h1 className="text-2xl font-semibold text-gray-800">Permissions by Role</h1>
        <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto relative" ref={searchRef}>
          <div className="relative w-full md:w-64">
            <input
              type="text"
              placeholder="Search or select a role..."
              className="input input-bordered w-full"
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setIsSearchOpen(true); }}
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
            className={`btn btn-success ${(!selectedRole || isPending || isFetching) ? 'btn-disabled' : ''}`}
          >
            Save
          </button>
        </div>
      </div>

      {/* TABLE (wrapped in reusable shell w/ stats) */}
      <TableShell
        stats={treeStats}
        columns={[
          { label: 'Access' },
          { label: 'Page', className: 'w-1/2' },
          { label: 'Permissions', className: 'w-1/2' },
          { label: 'Edit' },
        ]}
      >
        <tbody className="text-gray-700 text-sm">
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
              openPermissionModal={openPermissionModal}
            />
          ))}
        </tbody>
      </TableShell>

      {/* MODAL: permission editor for a single page */}
      {modalPage && (
        <div className="modal modal-open">
          <div className="modal-box max-w-3xl">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="font-bold text-lg">{modalPage.page_name}</h3>
                <p className="text-sm text-gray-500">Toggle permissions for this page</p>
              </div>
              <button className="btn btn-ghost btn-sm" onClick={closePermissionModal} aria-label="Close">
                <X size={16} />
              </button>
            </div>

            {modalPage.permissions?.length ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {modalPage.permissions.map((permission) => (
                  <label key={permission.id} className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50">
                    <input
                      type="checkbox"
                      className="checkbox checkbox-success"
                      checked={localPermissions.has(permission.id)}
                      onChange={() => handlePermissionChange(permission.id)}
                      disabled={!selectedRole || isPending || isFetching}
                    />
                    <span className="text-sm">{formatPermissionName(permission.name)}</span>
                  </label>
                ))}
              </div>
            ) : (
              <div className="text-gray-500">No permissions defined for this page.</div>
            )}

            <div className="modal-action">
              <button className="btn" onClick={closePermissionModal}>Done</button>
            </div>
          </div>
          <div className="modal-backdrop" onClick={closePermissionModal} />
        </div>
      )}
    </div>
  );
};

export default PermissionsTable;
