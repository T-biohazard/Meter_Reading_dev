// components/fields/TimeField.jsx

import React from 'react';
import clsx from 'clsx';

const TimeField = ({ label, value, onChange, disabled, className, ...rest }) => {
  const handleChange = (event) => {
    if (onChange) {
      onChange(event.target.value);
    }
  };

  const formattedValue = value instanceof Date 
    ? value.toTimeString().slice(0, 5) 
    : value;

  return (
    <div className={clsx('form-control w-full', className)}>
      {label && (
        <label className="label">
          <span className="label-text font-medium">{label}</span>
        </label>
      )}
      <input
        type="time"
        value={formattedValue || ''}
        onChange={handleChange}
        disabled={disabled}
        className="input input-bordered w-full"
        {...rest}
      />
    </div>
  );
};

export default TimeField;