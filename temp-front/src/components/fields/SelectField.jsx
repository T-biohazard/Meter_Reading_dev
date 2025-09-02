// src/components/fields/SelectField.jsx
import React, {
  useId,
  useState,
  useMemo,
  useRef,
  useEffect,
  useCallback,
} from 'react';
import { useField, useFormikContext } from 'formik';
import clsx from 'clsx';
import { ChevronDown, X, XCircle, Loader2 } from 'lucide-react';

function debounce(fn, delay) {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => fn(...args), delay);
  };
}

export default function SelectField({
  name,
  label,
  options = [],
  className,
  multiple = false,
  searchable = false,
  disabled = false,
  placeholder,
  isLoading = false,
  noOptionsMessage = 'No results',
  loadingMessage = 'Loading…',
  searchDebounce = 0,
  validateOnSelect = true,
  classNames = {}, // { trigger, list, option, chip, error }
  value: controlledValue,
  onChange,
  ...rest
}) {
  const formik = useFormikContext?.();
  const [field, meta, helpers] = name
    ? useField(name)
    : [null, {}, { setValue: onChange, setTouched: () => {} }];

  const id = useId();
  const rootRef = useRef(null);
  const inputRef = useRef(null);
  const listRef = useRef(null);

  const [isFocused, setFocused] = useState(false);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(-1);

  const rawValue = name ? field?.value : controlledValue;
  const hasError = !!meta.error && meta.touched;

  /* ---------- normalize options ---------- */
  const normalizedOptions = useMemo(() => {
    return (options || []).map((o) => {
      if (typeof o === 'string' || typeof o === 'number') {
        return { label: String(o), value: o, disabled: false };
      }
      return {
        label: String(o?.label ?? o?.value ?? ''),
        value: o?.value ?? o?.label ?? '',
        disabled: !!o?.disabled,
      };
    });
  }, [options]);

  const keyOf = (v) => String(v);
  const keyToValue = useMemo(() => {
    const m = new Map();
    normalizedOptions.forEach((o) => m.set(keyOf(o.value), o.value));
    return m;
  }, [normalizedOptions]);

  const selectedKeySet = useMemo(() => {
    if (multiple) {
      const arr = Array.isArray(rawValue) ? rawValue : [];
      return new Set(arr.map(keyOf));
    }
    return new Set(rawValue == null ? [] : [keyOf(rawValue)]);
  }, [rawValue, multiple]);

  const hasValue = useMemo(() => {
    if (multiple) return selectedKeySet.size > 0;
    return rawValue !== undefined && rawValue !== null && String(rawValue).length > 0;
  }, [rawValue, multiple, selectedKeySet]);

  const getLabelForValue = useCallback(
    (val) =>
      normalizedOptions.find((o) => keyOf(o.value) === keyOf(val))?.label ??
      String(val ?? ''),
    [normalizedOptions]
  );

  const displayLabel = useMemo(() => {
    if (multiple) {
      const arr = Array.isArray(rawValue) ? rawValue : [];
      return arr.map(getLabelForValue).join(', ');
    }
    return hasValue ? getLabelForValue(rawValue) : '';
  }, [rawValue, multiple, getLabelForValue, hasValue]);

  /* ---------- filtering (debounced support) ---------- */
  const [internalQuery, setInternalQuery] = useState('');
  const updateQuery = useMemo(
    () => (searchDebounce ? debounce(setInternalQuery, searchDebounce) : setInternalQuery),
    [searchDebounce]
  );

  useEffect(() => {
    setInternalQuery(query);
  }, [query]);

  const filteredOptions = useMemo(() => {
    if (!searchable || !internalQuery.trim()) return normalizedOptions;
    const q = internalQuery.toLowerCase();
    return normalizedOptions.filter((o) => o.label.toLowerCase().includes(q));
  }, [normalizedOptions, searchable, internalQuery]);

  /* ---------- outside click ---------- */
  useEffect(() => {
    const onOutside = (e) => {
      if (!rootRef.current) return;
      if (!rootRef.current.contains(e.target)) {
        setOpen(false);
        setFocused(false);
        if (name) helpers.setTouched(true);
      }
    };
    if (open) {
      document.addEventListener('mousedown', onOutside);
      return () => document.removeEventListener('mousedown', onOutside);
    }
  }, [open, helpers, name]);

  /* ---------- active index ---------- */
  useEffect(() => {
    if (!open) return;
    let nextIndex = -1;
    if (!multiple && hasValue) {
      const selKey = keyOf(rawValue);
      const idx = filteredOptions.findIndex(
        (o) => keyOf(o.value) === selKey && !o.disabled
      );
      if (idx !== -1) nextIndex = idx;
    } else {
      // default to first non-disabled
      nextIndex = filteredOptions.findIndex((o) => !o.disabled);
    }
    setActiveIndex(nextIndex);
  }, [open, filteredOptions, multiple, hasValue, rawValue]);

  useEffect(() => {
    if (!open || activeIndex < 0 || !listRef.current) return;
    const el = listRef.current.querySelector(`[data-index="${activeIndex}"]`);
    el?.scrollIntoView({ block: 'nearest' });
  }, [activeIndex, open]);

  /* ---------- commit & selection ---------- */
  const formValidateField = (n) => {
    try {
      formik?.validateField?.(n);
    } catch (_) {}
  };

  const commitValue = useCallback(
    (val) => {
      if (name) {
        helpers.setValue(val);
        if (validateOnSelect) {
          // mark touched and force validation
          helpers.setTouched(true, true);
          formValidateField(name);
        }
      } else {
        onChange?.(val);
      }
    },
    [helpers, name, validateOnSelect, onChange] // formValidateField reads formik via closure
  );

  const applySelection = (option) => {
    if (option.disabled) return;
    if (multiple) {
      const keys = new Set(selectedKeySet);
      const k = keyOf(option.value);
      keys.has(k) ? keys.delete(k) : keys.add(k);
      const next = Array.from(keys)
        .map((key) => keyToValue.get(key))
        .filter((v) => v !== undefined);
      commitValue(next);
      setQuery('');
      setOpen(true);
      if (searchable) inputRef.current?.focus();
    } else {
      commitValue(option.value);
      setQuery('');
      setOpen(false);
      setFocused(false);
    }
  };

  const clearSelection = (e) => {
    e.stopPropagation();
    if (disabled) return;
    commitValue(multiple ? [] : '');
    // force re-validate immediately
    if (name) {
      helpers.setTouched(true, true);
      formValidateField(name);
    }
    setQuery('');
    setOpen(searchable);
    if (searchable) inputRef.current?.focus();
  };

  /* ---------- keyboard ---------- */
  const moveActive = (delta) => {
    if (!open) {
      setOpen(true);
      return;
    }
    if (filteredOptions.length === 0) return;
    let i = activeIndex;
    for (let steps = 0; steps < filteredOptions.length; steps++) {
      i = (i + delta + filteredOptions.length) % filteredOptions.length;
      if (!filteredOptions[i].disabled) {
        setActiveIndex(i);
        break;
      }
    }
  };

  const handleKeyDown = (e) => {
    if (disabled) return;
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        moveActive(1);
        break;
      case 'ArrowUp':
        e.preventDefault();
        moveActive(-1);
        break;
      case 'Home':
        e.preventDefault();
        setActiveIndex(filteredOptions.findIndex((o) => !o.disabled));
        break;
      case 'End':
        e.preventDefault();
        setActiveIndex(
          [...filteredOptions].reverse().findIndex((o) => !o.disabled)
        );
        break;
      case 'Enter':
        if (open && activeIndex >= 0 && activeIndex < filteredOptions.length) {
          e.preventDefault();
          applySelection(filteredOptions[activeIndex]);
        } else if (!open) {
          e.preventDefault();
          setOpen(true);
        }
        break;
      case 'Escape':
        if (open) {
          e.preventDefault();
          setOpen(false);
          setFocused(false);
          if (name) helpers.setTouched(true);
        }
        break;
      default:
        // typeahead for non-searchable
        if (!searchable && /^[a-z0-9]$/i.test(e.key)) {
          const idx = filteredOptions.findIndex((o) =>
            o.label.toLowerCase().startsWith(e.key.toLowerCase())
          );
          if (idx !== -1) setActiveIndex(idx);
        }
        break;
    }
  };

  const listboxId = `${id}-listbox`;

  /* ---------- FIX: derived input value and floating label logic ---------- */
  // show label floated only when a committed value exists or the control is focused
  const showFloatingLabel = hasValue || isFocused;

  // input should show the typing query while the control is open or focused, otherwise show the selected label
  const inputValue = (open || isFocused) ? query : displayLabel;

  /* ---------- render ---------- */
  return (
    <div ref={rootRef} className={clsx('form-control mb-5', className)} {...rest}>
      <div className="relative">
        {/* Wrapper: keep DaisyUI look but remove focus rings (double border) */}
        <div
          role="combobox"
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-controls={listboxId}
          aria-disabled={disabled}
          className={clsx(
            'input input-bordered w-full rounded-lg bg-white relative flex items-center justify-between',
            // remove any focus ring / extra border when child input receives focus
            'focus-within:outline-none focus-within:ring-0 focus-within:shadow-none focus-within:border-base-300',
            'outline-none ring-0',
            hasError && 'input-error',
            disabled && 'opacity-60 cursor-not-allowed',
            classNames.trigger
          )}
          onClick={() => {
            if (disabled) return;
            setFocused(true);
            setOpen((o) => !o);
            if (searchable) inputRef.current?.focus();
          }}
          onKeyDown={(e) => {
            if (!searchable) handleKeyDown(e);
          }}
        >
          {searchable ? (
            <input
              id={id}
              ref={inputRef}
              type="text"
              autoComplete="off"
              disabled={disabled}
              // FIX: controlled derived value to avoid flicker/duplication
              className="w-full h-full bg-transparent border-none outline-none appearance-none px-3 py-3 focus:outline-none focus:ring-0 focus:border-0"
              value={inputValue}
              placeholder=""
              onChange={(e) => {
                setQuery(e.target.value);
                if (!open) setOpen(true);
                updateQuery(e.target.value);
              }}
              onFocus={(e) => {
                e.stopPropagation();
                setFocused(true);
                setOpen(true);
              }}
              onBlur={() => {
                setFocused(false);
                // mark touched on blur so Formik validation behaves predictably
                if (name) helpers.setTouched(true);
              }}
              onClick={(e) => e.stopPropagation()}
              onKeyDown={handleKeyDown}
              aria-autocomplete="list"
              aria-controls={listboxId}
              aria-describedby={hasError ? `${id}-error` : undefined}
            />
          ) : (
            <span className="block w-full h-full pl-3 pr-2 py-3 select-none truncate">
              {displayLabel || placeholder || '\u00A0'}
            </span>
          )}

          {/* Right side icons */}
          {hasValue && !disabled ? (
            <button
              type="button"
              aria-label="Clear selection"
              className="mr-3"
              onClick={clearSelection}
              onMouseDown={(e) => e.preventDefault()}
            >
              <XCircle className="h-5 w-5 text-gray-500 cursor-pointer transition-transform hover:scale-110" />
            </button>
          ) : isLoading ? (
            <Loader2 className="h-5 w-5 mr-3 animate-spin text-gray-400" />
          ) : (
            <ChevronDown
              className={clsx(
                'h-5 w-5 mr-3 transition-transform duration-200',
                open && 'rotate-180'
              )}
            />
          )}
        </div>

        {/* Floating label: background matches the wrapper so it visually 'floats' cleanly */}
        <label
          htmlFor={id}
          className={clsx(
            'absolute pointer-events-none select-none transition-all duration-200 left-3',
            !showFloatingLabel && 'top-1/2 -translate-y-1/2 text-sm opacity-90',
            showFloatingLabel && '-top-2.5 translate-y-0 text-xs px-1 rounded',
            hasError ? 'text-error' : 'text-base-content/70',
            // put label above input text so it does not clip, small z-index
            'bg-white z-10'
          )}
        >
          {label}
        </label>

        {/* Dropdown list */}
        {open && (
          <ul
            id={listboxId}
            ref={listRef}
            className={clsx(
              'absolute z-50 mt-1 w-full max-h-60 overflow-auto rounded-lg border border-base-300 bg-base-100 shadow-xl',
              classNames.list
            )}
            role="listbox"
            aria-multiselectable={multiple || undefined}
            onMouseDown={(e) => e.preventDefault()}
          >
            {isLoading ? (
              <li className="px-4 py-2 text-base-content/60 select-none">
                {loadingMessage}
              </li>
            ) : filteredOptions.length === 0 ? (
              <li className="px-4 py-2 text-base-content/60 select-none">
                {noOptionsMessage}
              </li>
            ) : (
              filteredOptions.map((opt, idx) => {
                const isSelected = selectedKeySet.has(keyOf(opt.value));
                const isActive = idx === activeIndex;
                return (
                  <li
                    id={`${id}-option-${idx}`}
                    data-index={idx}
                    key={keyOf(opt.value)}
                    role="option"
                    aria-selected={isSelected}
                    className={clsx(
                      'px-4 py-2 cursor-pointer',
                      !opt.disabled && 'hover:bg-base-200',
                      opt.disabled && 'opacity-50 cursor-not-allowed',
                      (isSelected || isActive) && 'bg-base-200',
                      isSelected && 'font-semibold',
                      classNames.option
                    )}
                    onClick={() => !opt.disabled && applySelection(opt)}
                  >
                    {opt.label}
                  </li>
                );
              })
            )}
          </ul>
        )}
      </div>

      {hasError && (
        <p id={`${id}-error`} className={clsx('text-red-500 text-xs mt-1', classNames.error)}>
          {meta.error}
        </p>
      )}

      {/* multiple chips */}
      {multiple && hasValue && (
        <div className="mt-2 flex flex-wrap gap-2">
          {Array.from(selectedKeySet).map((k) => {
            const val = keyToValue.get(k);
            return (
              <span
                key={k}
                className={clsx(
                  'badge badge-primary badge-outline flex items-center gap-1',
                  classNames.chip
                )}
              >
                {getLabelForValue(val)}
                <X
                  className="h-3 w-3 cursor-pointer"
                  onClick={() => applySelection({ value: val, disabled: false })}
                />
              </span>
            );
          })}
        </div>
      )}
    </div>
  );
}
