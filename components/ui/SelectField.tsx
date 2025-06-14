import React from 'react';

interface SelectFieldProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  error?: string;
  options: { value: string | number; label: string }[];
  containerClassName?: string;
}

const SelectField: React.FC<SelectFieldProps> = ({ label, id, error, options, className = '', containerClassName = '', ...props }) => {
  return (
    <div className={`mb-4 ${containerClassName}`}>
      <label htmlFor={id} className="block text-sm font-medium text-text-dark mb-1">
        {label}
      </label>
      <select
        id={id}
        className={`w-full px-3 py-2 border border-neutral-light-gray rounded-md shadow-sm focus:ring-primary-dark focus:border-primary-dark sm:text-sm text-text-dark ${error ? 'border-red-500' : ''} ${className}`}
        {...props}
      >
        <option value="">Selecione {label.toLowerCase()}</option>
        {options.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
};

export default SelectField;