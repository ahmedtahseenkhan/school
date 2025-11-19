import React from 'react';
import clsx from 'clsx';

type Option = { label: string; value: string };

type Props = React.SelectHTMLAttributes<HTMLSelectElement> & {
  label?: string;
  error?: string;
  hint?: string;
  options?: Option[];
};

export const Select = React.forwardRef<HTMLSelectElement, Props>(
  ({ className, label, error, hint, id, options = [] as Option[], children, ...props }, ref) => {
    const inputId = id || (label ? label.replace(/\s+/g, '-').toLowerCase() : undefined);
    return (
      <div className="space-y-0.5 text-sm">
        {label && (
          <label htmlFor={inputId} className="block text-xs font-medium text-gray-700 dark:text-gray-300">
            {label}
          </label>
        )}
        <select
          ref={ref}
          id={inputId}
          className={clsx(
            'w-full rounded-md border bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700 px-3 py-1.5 text-xs',
            'focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600',
            error && 'border-red-500 focus:ring-red-600 focus:border-red-600',
            className
          )}
          {...props}
        >
          {options.map((o: Option) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
          {children}
        </select>
        {hint && !error && <p className="text-xs text-gray-500">{hint}</p>}
        {error && <p className="text-xs text-red-600">{error}</p>}
      </div>
    );
  }
);
Select.displayName = 'Select';
