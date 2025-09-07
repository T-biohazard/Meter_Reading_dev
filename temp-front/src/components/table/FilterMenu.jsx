import React, { useState, useEffect, useRef } from 'react';
import { Filter, X } from 'lucide-react';
import clsx from 'clsx';
import { useOutside } from '../../hooks/useOutside';
import Button from '../ui/Button';
import { useFormik, FormikProvider, Field } from 'formik';

const FilterMenu = ({ columns, onFilterChange, live = false }) => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const drawerRef = useRef(null);
  useOutside(drawerRef, () => setDrawerOpen(false));

  const initialValues = {
    datacenterId: null,
    customerId: null,
    meterId: null,
  };

  const formik = useFormik({
    initialValues,
    onSubmit: (values) => {
      onFilterChange(values);
      setDrawerOpen(false);
    },
  });

  // Use a state to hold the live filter values
  const [liveFilters, setLiveFilters] = useState(initialValues);

  // Sync Formik's values with our live state
  useEffect(() => {
    if (live) {
      setLiveFilters(formik.values);
    }
  }, [formik.values, live]);

  // Push live filters to the parent
  useEffect(() => {
    if (live) {
      onFilterChange(liveFilters);
    }
  }, [liveFilters, onFilterChange, live]);

  const clearFilters = () => {
    formik.resetForm({ values: initialValues });
    if (live) {
      onFilterChange({});
    }
  };

  const activeFiltersCount = React.useMemo(() => {
    return Object.values(live ? liveFilters : formik.values).filter(
      (value) => value !== null
    ).length;
  }, [live, liveFilters, formik.values]);

  return (
    <>
      <Button onClick={() => setDrawerOpen(true)} leftIcon={Filter} variant="icon">
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
            onClick={() => setDrawerOpen(false)}
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