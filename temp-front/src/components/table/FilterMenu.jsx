import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Filter, X } from 'lucide-react';
import clsx from 'clsx';
import { useOutside } from '../../hooks/useOutside';
import Button from '../ui/Button';
import { useFormik, FormikProvider, Field } from 'formik';

const FilterMenu = ({ columns, onFilterChange, live = false }) => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const drawerRef = useRef(null);

  // Dynamically generate initial values from columns
  const initialValues = useMemo(() => {
    return columns.reduce((acc, col) => {
      if (col.key !== 'actions' && col.field) {
        acc[col.key] = '';
      }
      return acc;
    }, {});
  }, [columns]);

  const formik = useFormik({
    initialValues,
    onSubmit: (values) => {
      // Aggressively clean up empty values before sending
      const activeFilters = Object.entries(values).reduce((acc, [key, value]) => {
        if (value !== null && value !== '' && value !== undefined) {
          acc[key] = value;
        }
        return acc;
      }, {});
      
      onFilterChange(activeFilters);
      setDrawerOpen(false);
    },
  });

  // Handle live updates
  const handleLiveChange = useCallback(() => {
    if (live) {
      onFilterChange(formik.values);
    }
  }, [live, onFilterChange, formik.values]);

  useEffect(() => {
    handleLiveChange();
  }, [formik.values, handleLiveChange]);

  // Handle 'Escape' key to close the drawer for improved accessibility
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape' && drawerOpen) {
        setDrawerOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [drawerOpen]);

  // Use the useOutside hook for clicks outside the drawer
  useOutside(drawerRef, () => setDrawerOpen(false));

  const clearFilters = () => {
    // Reset the form values to their initial empty state
    formik.resetForm({ values: initialValues });
    // Always notify the parent component that filters have been cleared
    // by sending an empty object. This is the fix.
    onFilterChange({});
  };

  const activeFiltersCount = useMemo(() => {
    return Object.values(formik.values).filter(
      (value) => value !== null && value !== ''
    ).length;
  }, [formik.values]);

  const handleOpenDrawer = () => {
    setDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setDrawerOpen(false);
  };

  return (
    <>
      <Button onClick={handleOpenDrawer} leftIcon={Filter} variant="icon">
        Filters
        {activeFiltersCount > 0 && (
          <span className="inline-flex items-center justify-center h-4 w-4 rounded-full text-xs font-semibold bg-blue-500 text-white ml-1">
            {activeFiltersCount}
          </span>
        )}
      </Button>

      {/* The overlay is now conditionally rendered for a cleaner DOM */}
      {drawerOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-40 z-40"
          onClick={handleCloseDrawer}
        />
      )}

      <div
        ref={drawerRef}
        className={clsx(
          'fixed top-0 right-0 h-full w-80 bg-white shadow-lg z-50 transform transition-transform duration-300 ease-in-out flex flex-col',
          drawerOpen ? 'translate-x-0' : 'translate-x-full'
        )}
      >
        {/* Header */}
        <div className="flex-none flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <Filter className="h-5 w-5" /> Filter
          </h2>
          <Button
            onClick={handleCloseDrawer}
            variant="icon"
            size="sm"
            title="Close Filters"
          >
            <X className="h-5 w-5 text-gray-500 hover:text-gray-800" />
          </Button>
        </div>

        {/* Body */}
        <FormikProvider value={formik}>
          <form
            className="flex-1 p-4 space-y-4 overflow-y-auto"
            onSubmit={formik.handleSubmit}
          >
            {columns
              .filter((col) => col.key !== 'actions' && col.field)
              .map((col) => {
                const FieldComponent = col.field;
                const fieldProps = col.fieldProps || {};
                const options = fieldProps.options || [];

                return (
                  <div key={col.key}>
                    <Field
                      name={col.key}
                      as={FieldComponent}
                      label={col.header || col.key}
                      floating={true}
                      className="mb-0"
                      {...fieldProps}
                      options={options}
                    />
                  </div>
                );
              })}
          </form>
        </FormikProvider>

        {/* Footer */}
        <div className="flex-none p-4 border-t border-gray-200 bg-white flex justify-end gap-2">
          <Button onClick={clearFilters} intent="ghost" type="button">
            Clear All
          </Button>
          {!live && (
            <Button intent="primary" type="submit" onClick={formik.handleSubmit}>
              Apply
            </Button>
          )}
        </div>
      </div>
    </>
  );
};

export default FilterMenu;