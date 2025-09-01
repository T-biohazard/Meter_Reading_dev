// src/components/fields/SelectField.jsx
import React, { useId, useState } from "react";
import { useField } from "formik";
import clsx from "clsx";

export default function SelectField({ name, label, options, className, ...rest }) {
  const [field, meta] = useField(name);
  const id = `${name}-select`;
  const hasError = !!meta.error;
  const showError = hasError && meta.touched;

  // Track focus state
  const [isFocused, setFocused] = useState(false);

  const hasValue = field.value !== undefined && field.value !== null && String(field.value).length > 0;

  return (
    <div className={clsx("form-control mb-5", className)}>
      <div className="relative">
        <select
          id={id}
          {...field}
          className={clsx(
            "select select-bordered w-full rounded-lg bg-white peer relative z-0",
            "focus:outline-none focus-visible:outline-none focus:ring-0 focus:ring-transparent !focus:border-base-300 !focus-visible:border-base-300 !shadow-none",
            showError && "select-error"
          )}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          {...rest}
        >
          <option value="" disabled hidden></option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <label
          htmlFor={id}
          className={clsx(
            "absolute z-30 pointer-events-none select-none leading-none transition-all duration-200 bg-white",
            "left-3",
            !hasValue && !isFocused && "top-1/2 -translate-y-1/2 text-sm opacity-90",
            (isFocused || hasValue) && "-top-2.5 translate-y-0 text-xs px-1 rounded",
            showError ? "text-error" : "text-base-content/70"
          )}
        >
          {label}
        </label>
      </div>
      {showError && (
        <p className="text-red-500 text-xs mt-1">{meta.error}</p>
      )}
    </div>
  );
}