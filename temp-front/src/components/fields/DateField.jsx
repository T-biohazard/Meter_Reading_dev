// components/fields/DateField.jsx

import React from 'react';
import clsx from 'clsx';

const DateField = ({ label, value, onChange, disabled, className, ...rest }) => {
  const handleChange = (e) => {
    // Emit the ISO string directly, or null if empty
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
        type="date"
        // The value prop now expects an ISO string
        value={value || ''}
        onChange={handleChange}
        disabled={disabled}
        className="input input-bordered w-full"
        {...rest}
      />
    </div>
  );
};

export default DateField;