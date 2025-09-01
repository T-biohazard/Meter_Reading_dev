// src/components/table/FilterMenu.jsx

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Filter, X, ChevronRight } from 'lucide-react';
import clsx from 'clsx';
import { useOutside } from '../../hooks/useOutside';
import Button from '../ui/Button';

const FilterInput = ({ column, value, onChange }) => {
    switch (column.key) {
        case 'status':
            return (
                <select 
                    className="w-full text-sm border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    value={value || ''}
                    onChange={e => onChange(e.target.value)}
                >
                    <option value="">All</option>
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                </select>
            );
        case 'threshold':
            return (
                <input
                    type="number"
                    placeholder="Min value"
                    className="w-full text-sm border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    value={value || ''}
                    onChange={e => onChange(e.target.value)}
                />
            );
        default:
            return (
                <input
                    type="text"
                    placeholder={`Filter by ${column.header}`}
                    className="w-full text-sm border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    value={value || ''}
                    onChange={e => onChange(e.target.value)}
                />
            );
    }
};

const FilterMenu = ({ columns, onFilterChange }) => {
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [filters, setFilters] = useState({});
    const drawerRef = useRef(null);
    useOutside(drawerRef, () => setDrawerOpen(false));

    useEffect(() => {
        onFilterChange(filters);
    }, [filters, onFilterChange]);

    const handleFilterChange = (key, value) => {
        setFilters(prev => {
            const newFilters = { ...prev };
            if (value && String(value).trim() !== '') {
                newFilters[key] = value;
            } else {
                delete newFilters[key];
            }
            return newFilters;
        });
    };

    const clearFilters = () => {
        setFilters({});
    };

    const applyFilters = () => {
        setDrawerOpen(false);
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

                <div className="flex-1 p-4 space-y-4 overflow-y-auto">
                    {columns.filter(c => c.key !== 'actions').map(col => (
                        <div key={col.key}>
                            <label className="text-sm font-medium text-gray-700 block mb-1">
                                {col.header || col.key}
                            </label>
                            <FilterInput
                                column={col}
                                value={filters[col.key]}
                                onChange={value => handleFilterChange(col.key, value)}
                            />
                        </div>
                    ))}
                </div>

                <div className="flex-none p-4 border-t border-gray-200 bg-white flex justify-end gap-2">
                    <Button onClick={clearFilters} intent="ghost">
                        Clear All
                    </Button>
                    <Button onClick={applyFilters} intent="primary">
                        Apply
                    </Button>
                </div>
            </div>
        </>
    );
};

export default FilterMenu;