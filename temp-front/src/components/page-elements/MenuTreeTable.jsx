// src/components/page-elements/MenuTreeTable.jsx

import React, { useState, useMemo } from 'react';
import { usePageElements } from '../../hooks/usePageElements';
import Button from '../ui/Button';
import MenuTableSkeleton from '../ui/MenuTableSkeleton';
import { Plus, Pencil, Trash2, ChevronDown, ChevronRight } from 'lucide-react';

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
      // Add the parentMenuName to the submenu node
      const node = { 
        label: subLabel, 
        key, 
        icon: subIcon || null, 
        children: [], 
        type: 'submenu', 
        parentMenuName: menuLabel 
      };
      submenus.set(key, node);
      parent.children.push(node);
    }
    return submenus.get(key);
  };

  const pushLeaf = (targetChildren, pageElement) => {
    targetChildren.push({ ...pageElement, type: 'page' });
  };

  rows.forEach((r) => {
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

/* ----------------------- reusable table shell ----------------------- */
const TableShell = ({ columns = [], children }) => (
  <div className="rounded-lg border border-gray-200 bg-white">
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

/* ----------------------- row ----------------------- */
const TreeRow = ({ node, expandedMenus, toggleMenu, onEditPage, onEditMenu, onEditSubmenu, handleDelete, depth = 0 }) => {
  const isMenuExpanded = expandedMenus.has(node.key);
  const depthPadding = depth > 0 ? `${depth * 1.5}rem` : '1rem';
  const depthDash = depth > 0 ? '— '.repeat(Math.min(depth, 3)) : '';

  if (node.type === 'menu' || node.type === 'submenu') {
    return (
      <>
        <tr key={node.key} className="border-b border-gray-200 hover:bg-gray-50">
          <td className="py-3 px-4 font-medium text-gray-800" style={{ paddingLeft: depthPadding }}>
            <div className="flex items-center gap-2">
              <button
                onClick={() => toggleMenu(node.key)}
                className="btn btn-ghost btn-sm"
                aria-label={isMenuExpanded ? 'Collapse' : 'Expand'}
                title={isMenuExpanded ? 'Collapse' : 'Expand'}
              >
                {isMenuExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
              </button>
              <span>{depthDash}{node.label}</span>
            </div>
          </td>
          <td className="py-3 px-4 text-gray-500">—</td>
          <td className="py-3 px-4">
            <div className="flex items-center gap-2">
              {/* Conditional Edit Button for Menus/Submenus */}
              <Button 
                variant='icon' 
                size="sm" 
                onClick={() => node.type === 'menu' ? onEditMenu(node) : onEditSubmenu(node)} 
                title={`Edit ${node.type}`}
              >
                <Pencil className="h-4 w-4 text-gray-500" />
              </Button>
            </div>
          </td>
        </tr>

        {isMenuExpanded && node.children.map((childNode) => (
          <TreeRow
            key={childNode.id || childNode.key}
            node={childNode}
            expandedMenus={expandedMenus}
            toggleMenu={toggleMenu}
            onEditPage={onEditPage}
            onEditMenu={onEditMenu}
            onEditSubmenu={onEditSubmenu}
            handleDelete={handleDelete}
            depth={depth + 1}
          />
        ))}
      </>
    );
  }

  return (
    <tr className="border-b border-gray-200 hover:bg-gray-50" key={node.id}>
      <td className="py-3 px-4" style={{ paddingLeft: depthPadding }}>
        <span className="font-normal text-gray-800">{depthDash}{node.page_name}</span>
      </td>
      <td className="py-3 px-4 text-gray-600">{node.path}</td>
      <td className="py-3 px-4">
        <div className="flex items-center gap-2">
          {/* Edit Button for Pages */}
          <Button variant='icon' size="sm" onClick={() => onEditPage(node)} title="Edit Page">
            <Pencil className="h-4 w-4 text-gray-500" />
          </Button>
          <Button variant='icon' size="sm" onClick={() => handleDelete(node.id)} title="Delete Page">
            <Trash2 className="h-4 w-4 text-red-600" />
          </Button>
        </div>
      </td>
    </tr>
  );
};

/* ----------------------- main component ----------------------- */
const MenuTreeTable = ({ onAdd, onEditPage, onEditMenu, onEditSubmenu, onDelete }) => {
  const { data: pageElements, isLoading, isError, error, refetch } = usePageElements();
  const [expandedMenus, setExpandedMenus] = useState(new Set());
  
  const menuTree = useMemo(() => buildMenuTreeFromElements(pageElements), [pageElements]);

  const toggleMenu = (menuKey) => {
    setExpandedMenus(prev => {
      const next = new Set(prev);
      if (next.has(menuKey)) {
        next.delete(menuKey);
      } else {
        next.add(menuKey);
      }
      return next;
    });
  };

  return (
    <div className=''>
      <div className='flex justify-between items-center pb-16'>
        <div>
          <h1 className='text-2xl font-bold'>Page Elements</h1>
          <p className="opacity-70">View and Manage the list of Pages.</p>
        </div>
        <div className="flex items-center gap-4">
          <Button intent="primary" onClick={onAdd} leftIcon={Plus}>
            Add Page
          </Button>
        </div>
      </div>
      
      {isLoading ? (
        <MenuTableSkeleton />
      ) : isError ? (
        <div className="p-8 bg-red-100 border border-red-400 text-red-700 rounded-xl">
          <p className="font-bold">Error loading pages</p>
          <p>{error?.message || "An unexpected error occurred."}</p>
        </div>
      ) : (
        <TableShell
          columns={[
            { label: 'Name', className: 'w-1/2' },
            { label: 'Path', className: 'w-1/4' },
            { label: 'Actions', className: 'w-1/4' },
          ]}
        >
          <tbody className="text-gray-700 text-sm">
            {menuTree.map(node => (
              <TreeRow
                key={node.key || node.id}
                node={node}
                expandedMenus={expandedMenus}
                toggleMenu={toggleMenu}
                onEditPage={onEditPage} 
                onEditMenu={onEditMenu}
                onEditSubmenu={onEditSubmenu}
                handleDelete={onDelete} 
              />
            ))}
          </tbody>
        </TableShell>
      )}
    </div>
  );
};

export default MenuTreeTable;