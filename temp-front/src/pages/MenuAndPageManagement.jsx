// src/pages/MenuAndPageManagement.jsx

import React, { useState, useMemo } from 'react';
import MenuTreeTable from '../components/page-elements/MenuTreeTable';
import PageElementForm from '../components/page-elements/PageElementForm';
import { useQueryClient } from "@tanstack/react-query";
import { usePageElements } from '../hooks/usePageElements';
import { useApi } from '../hooks/useApi';
import PageUpdateModal from '../components/page-elements/PageUpdateModal'; // New
import MenuUpdateModal from '../components/page-elements/MenuUpdateModal'; // New
import SubmenuUpdateModal from '../components/page-elements/SubmenuUpdateModal'; // New

// Helper function to process the fetched data
const buildFormData = (rows = []) => {
    const allMenus = [];
    const submenusByMenu = new Map();

    rows.forEach(r => {
        if (r.menu_name && !allMenus.find(m => m.name === r.menu_name)) {
            allMenus.push({ name: r.menu_name, icon: r.menu_icon });
        }
        if (r.menu_name && r.sub_menu_name) {
            if (!submenusByMenu.has(r.menu_name)) {
                submenusByMenu.set(r.menu_name, new Map());
            }
            submenusByMenu.get(r.menu_name).set(r.sub_menu_name, r.sub_menu_icon);
        }
    });

    return { allMenus, submenusByMenu };
};

export default function MenuAndPageManagement() {
    const [view, setView] = useState('table');
    const [pageToEdit, setPageToEdit] = useState(null);
    const [menuToEdit, setMenuToEdit] = useState(null);
    const [submenuToEdit, setSubmenuToEdit] = useState(null);
    const queryClient = useQueryClient();
    const api = useApi();

    // Fetch the data for the form and modals
    const { data: pageElements, isLoading } = usePageElements();

    // Memoize the processed data for the form and modals
    const { allMenus, submenusByMenu } = useMemo(() => buildFormData(pageElements), [pageElements]);

    // Handlers for opening the different modals
    const handleCreatePage = () => {
        setPageToEdit(null);
        setMenuToEdit(null);
        setSubmenuToEdit(null);
        setView('create-page');
    };

    const handleEditPage = (page) => {
        setPageToEdit(page);
        setView('edit-page');
    };
    
    const handleEditMenu = (menu) => {
        setMenuToEdit(menu);
        setView('edit-menu');
    };

    const handleEditSubmenu = (submenu) => {
        setSubmenuToEdit(submenu);
        setView('edit-submenu');
    };

    // Generic handler to close all modals
    const handleCloseModal = () => {
        setView('table');
        setPageToEdit(null);
        setMenuToEdit(null);
        setSubmenuToEdit(null);
    };

    // New, unified submit handler
    const handleSubmit = async (payload, id) => {
        try {
            await api.updateMenuPageElement(id, payload);
            console.log(`Successfully updated element with ID ${id}:`, payload);
            await queryClient.invalidateQueries(["menu-page-elements:composer"]);
            handleCloseModal(); // Close modal on success

        } catch (error) {
            console.error("API Error:", error);
        }
    };
    
    // The create handler remains the same, but for page creation only
    const handleCreateSubmit = async (values) => {
        try {
            await api.createMenuPageElement(values);
            console.log("Successfully created page element:", values);
            await queryClient.invalidateQueries(["menu-page-elements:composer"]);
            handleCloseModal(); // Close form on success
        } catch (error) {
            console.error("API Error:", error);
        }
    };
    
    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this page element?")) {
            try {
                await api.deleteMenuPageElement(id);
                await queryClient.invalidateQueries(["menu-page-elements:composer"]);
                console.log("Successfully deleted page element with ID:", id);
            } catch (error) {
                console.error("Delete Error:", error);
            }
        }
    };

    // Render logic for different views
    const renderView = () => {
        switch (view) {
            case 'create-page':
                return (
                    <PageElementForm
                        onSubmit={handleCreateSubmit}
                        onCancel={handleCloseModal}
                        allMenus={allMenus}
                        submenusByMenu={submenusByMenu}
                        isLoading={isLoading}
                    />
                );
            case 'edit-page':
                return (
                    <PageUpdateModal
                        onClose={handleCloseModal}
                        pageData={pageToEdit}
                        allMenus={allMenus}
                        submenusByMenu={submenusByMenu}
                        onSubmit={handleSubmit}
                    />
                );
            case 'edit-menu':
                return (
                    <MenuUpdateModal
                        onClose={handleCloseModal}
                        menuData={menuToEdit}
                        onSubmit={handleSubmit}
                    />
                );
            case 'edit-submenu':
                return (
                    <SubmenuUpdateModal
                        onClose={handleCloseModal}
                        submenuData={submenuToEdit}
                        allMenus={allMenus}
                        submenusByMenu={submenusByMenu}
                        onSubmit={handleSubmit}
                    />
                );
            case 'table':
            default:
                return (
                    <MenuTreeTable
                        onAdd={handleCreatePage}
                        onEditPage={handleEditPage}
                        onEditMenu={handleEditMenu}
                        onEditSubmenu={handleEditSubmenu}
                        onDelete={handleDelete} 
                    />
                );
        }
    };

    return (
        // <div className="p-4 md:p-8">
        //     {renderView()}
        // </div>
        <div>
            {renderView()}
        </div>
    );
}