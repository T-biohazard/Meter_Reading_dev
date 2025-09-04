import { useField, useFormikContext } from 'formik';
import clsx from 'clsx';
import { useId, useMemo } from 'react';

const RadioGroup = ({
  name,
  label,
  options,
  className,
  optionClassName,
  disabled,
  ...rest
}) => {
  const formik = useFormikContext();
  const [field, meta] = useField(name);
  const id = useId();
  
  const hasError = !!meta.error && meta.touched;
  
  const normalizedOptions = useMemo(() => {
    return (options || []).map(o => {
      if (typeof o === 'string' || typeof o === 'number') {
        return { label: String(o), value: o, disabled: false };
      }
      return {
        label: o.label,
        value: o.value,
        disabled: !!o.disabled,
      };
    });
  }, [options]);

  const handleChange = (value) => {
    formik.setFieldValue(name, value);
  };
  
  return (
    <div className={clsx('form-control', className)} {...rest}>
      {label && ( // Conditionally render the label only if it exists
        <label className="label cursor-default">
          <span className="label-text font-medium">{label}</span>
        </label>
      )}
      <div className="flex flex-wrap gap-2">
        {normalizedOptions.map((option, index) => {
          const optionId = `${id}-${name}-${index}`;
          const isSelected = field.value === option.value;
          const isDisabled = disabled || option.disabled;
          
          return (
            <div key={option.value} className={clsx("flex-none", optionClassName)}>
              <label 
                htmlFor={optionId}
                className={clsx(
                  'label cursor-pointer px-4 py-2 border rounded-lg transition-colors duration-200',
                  isSelected ? 'bg-blue-600 border-blue-600 text-white' : 'bg-gray-100 border-gray-300 text-gray-700 hover:bg-gray-200',
                  isDisabled && 'opacity-50 cursor-not-allowed'
                )}
              >
                <input
                  id={optionId}
                  type="radio"
                  name={name}
                  value={option.value}
                  checked={isSelected}
                  onChange={() => handleChange(option.value)}
                  disabled={isDisabled}
                  className="hidden"
                />
                <span className="label-text font-medium">{option.label}</span>
              </label>
            </div>
          );
        })}
      </div>
      {hasError && (
        <p className="text-red-500 text-xs mt-1">{meta.error}</p>
      )}
    </div>
  );
};

export default RadioGroup;