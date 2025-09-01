// src/components/fields/InputField.jsx
import { useState, useId, useMemo } from "react";
import { useField } from "formik";
import { Eye, EyeOff } from "lucide-react";
import clsx from "clsx";

export default function InputField({
  name,
  label,
  type = "text",
  placeholder,
  autoComplete,
  disabled,
  required,
  help,
  leftIcon: LeftIcon,
  showPasswordToggle = false,
  className,
  floating = true,
  labelBgClass = "bg-base-200",
  muteFocus = true,

  // dropdown props
  dropdown = false,
  options = [],
  onSelect,
  filter = true,
  minChars = 0,
  maxItems = 6,

  ...rest
}) {
  const [field, meta, helpers] = useField(name);
  const id = useId();
  const listboxId = `${id}-listbox`;

  const [showPwd, setShowPwd] = useState(false);
  const [isFocused, setFocused] = useState(false);
  const [open, setOpen] = useState(false);

  const hasError = !!meta.error;
  const showError = hasError && meta.touched && !isFocused;

  const actualType =
    type === "password" && showPasswordToggle ? (showPwd ? "text" : "password") : type;

  const hasValue =
    field.value !== undefined && field.value !== null && String(field.value).trim().length > 0;

  const normalized = useMemo(
    () =>
      (options || []).map((o) =>
        typeof o === "string" ? { label: o, value: o } : { label: o.label, value: o.value }
      ),
    [options]
  );
  
  const displayValue = useMemo(() => {
    const selectedOption = normalized.find(opt => String(opt.value) === String(field.value));
    return selectedOption ? selectedOption.label : field.value;
  }, [field.value, normalized]);

  const query = String(field.value ?? "");
  const filtered = useMemo(() => {
    if (!dropdown) return [];
    let list = normalized;
    if (filter && query.length >= minChars) {
      const q = query.toLowerCase();
      list = normalized.filter((o) => o.label.toLowerCase().includes(q));
    }
    return list.slice(0, maxItems);
  }, [dropdown, normalized, filter, minChars, maxItems, query]);

  const listOpen = dropdown && open && filtered.length > 0;

  const pick = (opt) => {
    helpers.setValue(opt.value);
    onSelect?.(opt);
    helpers.setTouched(true, true);
    setOpen(false);
  };

  return (
    <div className={clsx("form-control mb-5", className)}>
      <div className={clsx("relative isolate", listOpen && "mb-44")}>
        {LeftIcon ? (
          <LeftIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 opacity-60 pointer-events-none" />
        ) : null}

        <input
          id={id}
          value={dropdown ? displayValue : field.value}
          onChange={field.onChange}
          onBlur={(e) => {
            setFocused(false);
            field.onBlur(e);
            rest.onBlur?.(e);
            setTimeout(() => setOpen(false), 100);
          }}
          onFocus={(e) => {
            setFocused(true);
            if (dropdown) setOpen(true);
            rest.onFocus?.(e);
          }}
          name={field.name}
          {...rest}
          type={actualType}
          placeholder={floating ? " " : placeholder}
          autoComplete={autoComplete}
          disabled={disabled}
          aria-invalid={showError || undefined}
          aria-describedby={showError ? `${id}-error` : undefined}
          role={dropdown ? "combobox" : undefined}
          aria-expanded={dropdown ? open : undefined}
          aria-controls={dropdown ? listboxId : undefined}
          aria-autocomplete={dropdown ? "list" : undefined}
          className={clsx(
            "input input-bordered w-full rounded-lg bg-white transition-colors peer relative z-0",
            LeftIcon && "pl-9",
            showPasswordToggle && type === "password" && "pr-10",
            muteFocus &&
              "focus:outline-none focus-visible:outline-none focus:ring-0 focus:ring-transparent !focus:border-base-300 !focus-visible:border-base-300 !shadow-none",
            showError && "input-error"
          )}
        />

        {type === "password" && showPasswordToggle ? (
          <button
            type="button"
            onClick={() => setShowPwd((v) => !v)}
            className="btn btn-ghost btn-xs absolute right-1 top-1/2 -translate-y-1/2 z-10"
            tabIndex={-1}
            aria-label={showPwd ? "Hide password" : "Show password"}
          >
            {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        ) : null}
        
        {floating && label ? (
          <label
            htmlFor={id}
            className={clsx(
              "absolute z-30 pointer-events-none select-none leading-none transition-all duration-200 bg-white",
              LeftIcon ? "left-9" : "left-3",
              !hasValue && !isFocused && "top-1/2 -translate-y-1/2 text-sm opacity-90",
              (isFocused || hasValue) && "-top-2.5 translate-y-0 text-xs px-1 rounded",
              isFocused ? "text-primary" : showError ? "text-error" : "text-base-content/70",
              (isFocused || hasValue) && labelBgClass
            )}
          >
            {label} {required ? <span className="text-error">*</span> : null}
          </label>
        ) : null}

        {listOpen && (
          <ul
            id={listboxId}
            role="listbox"
            className="absolute z-50 mt-1 w-full max-h-60 overflow-auto rounded-lg border border-base-300 bg-base-100 shadow-xl"
          >
            {filtered.map((opt) => (
              <li
                key={`${opt.value}`}
                role="option"
                aria-selected={String(opt.value) === String(field.value)}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => pick(opt)}
                className={clsx(
                  "px-3 py-2 cursor-pointer hover:bg-base-200",
                  String(opt.value) === String(field.value) && "bg-base-200"
                )}
              >
                {opt.label}
              </li>
            ))}
          </ul>
        )}
      </div>

      {showError ? (
        <p id={`${id}-error`} className="text-error text-sm mt-1">
          {meta.error}
        </p>
      ) : help ? (
        <p className="text-xs opacity-70 mt-1">{help}</p>
      ) : null}
    </div>
  );
}