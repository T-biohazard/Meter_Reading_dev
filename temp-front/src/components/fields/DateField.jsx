// components/fields/DateField.jsx

import React from 'react';
import clsx from 'clsx';

const DateField = ({
  label,
  value, // string (yyyy-mm-dd) or null
  onChange, // (isoString | null) => void
  disabled,
  className,
  ...nativeProps
}) => {
  const handleChange = (e) => {
    // Keep it a string (or null if empty)
    onChange?.(e.target.value || null);
  };

  return (
    <div className={clsx('form-control w-full', className)}>
      {label && (
        <label className="label">
          <span className="label-text font-medium">{label}</span>
        </label>
      )}
      <input
        {...nativeProps}
        type="date"
        value={value ?? ''}
        onChange={handleChange}
        disabled={disabled}
        className="input input-bordered w-full"
      />
    </div>
  );
};

export default DateField;