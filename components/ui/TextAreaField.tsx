
import React from 'react';

interface TextAreaFieldProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  error?: string;
  containerClassName?: string;
}

const TextAreaField: React.FC<TextAreaFieldProps> = ({ label, id, error, className = '', containerClassName = '', ...props }) => {
  return (
    <div className={`mb-4 ${containerClassName}`}>
      <label htmlFor={id} className="block text-sm font-medium text-text-dark mb-1">
        {label}
      </label>
      <textarea
        id={id}
        rows={3}
        className={`w-full px-3 py-2 border border-neutral-light-gray rounded-md shadow-sm focus:ring-primary-dark focus:border-primary-dark sm:text-sm text-text-dark ${error ? 'border-red-500' : ''} ${className}`}
        {...props}
      />
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
};

export default TextAreaField;
