import React from 'react';

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className = '', type, ...props }, ref) => {
    const baseStyles =
      'flex h-10 w-full rounded-md border border-gray-300 bg-transparent px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50';

    const combinedClassName = `${baseStyles} ${className}`;

    return <input type={type} className={combinedClassName} ref={ref} {...props} />;
  }
);

Input.displayName = 'Input';