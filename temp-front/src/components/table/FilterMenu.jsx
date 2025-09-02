// src/components/table/FilterMenu.jsx

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Filter, X } from 'lucide-react';
import clsx from 'clsx';
import { useOutside } from '../../hooks/useOutside';
import Button from '../ui/Button';
import { useFormik, FormikProvider } from 'formik';

const FilterMenu = ({ columns, onFilterChange }) => {
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [filters, setFilters] = useState({});
    const drawerRef = useRef(null);
    useOutside(drawerRef, () => setDrawerOpen(false));

    const formik = useFormik({
        initialValues: filters,
        onSubmit: (values) => {
            setFilters(values);
            onFilterChange(values);
            setDrawerOpen(false);
        },
        enableReinitialize: true,
    });

    const clearFilters = () => {
        formik.resetForm({ values: {} });
    };

    const applyFilters = () => {
        formik.handleSubmit();
    };

    const activeFiltersCount = useMemo(() => Object.keys(filters).length, [filters]);

    return (
        <>
            <Button onClick={() => setDrawerOpen(true)} leftIcon={Filter} intent="ghost">
                Filters
                {activeFiltersCount > 0 && (
                    <span className="inline-flex items-center justify-center h-4 w-4 rounded-full text-xs font-semibold bg-blue-500 text-white ml-1">
                        {activeFiltersCount}
                    </span>
                )}
            </Button>

            {drawerOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-40 z-40"
                    onClick={() => setDrawerOpen(false)}
                ></div>
            )}

            <div
                ref={drawerRef}
                className={clsx(
                    "fixed top-0 right-0 h-full w-80 bg-white shadow-lg z-50 transform transition-transform duration-300 ease-in-out flex flex-col",
                    drawerOpen ? "translate-x-0" : "translate-x-full"
                )}
            >
                <div className="flex-none flex items-center justify-between p-4 border-b border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                        <Filter className="h-5 w-5" /> Filter
                    </h2>
                    <Button onClick={() => setDrawerOpen(false)} variant="icon" size="sm" title="Close Filters">
                        <X className="h-5 w-5 text-gray-500 hover:text-gray-800" />
                    </Button>
                </div>

                <FormikProvider value={formik}>
                    <form className="flex-1 p-4 space-y-4 overflow-y-auto" onSubmit={formik.handleSubmit}>
                        {columns
                            .filter(col => col.key !== 'actions' && col.field)
                            .map(col => {
                                const FieldComponent = col.field;
                                return (
                                    <div key={col.key}>
                                        <FieldComponent
                                            {...col.fieldProps}
                                            name={col.key}
                                            label={col.header || col.key}
                                            // Change floating to true so the label renders
                                            floating={true}
                                            className="mb-0"
                                        />
                                    </div>
                                );
                            })}
                        <div className="flex-none p-4 border-t border-gray-200 bg-white flex justify-end gap-2">
                            <Button onClick={clearFilters} intent="ghost" type="button">
                                Clear All
                            </Button>
                            <Button intent="primary" type="submit">
                                Apply
                            </Button>
                        </div>
                    </form>
                </FormikProvider>
            </div>
        </>
    );
};

export default FilterMenu;