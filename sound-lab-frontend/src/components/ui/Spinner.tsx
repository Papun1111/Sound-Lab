import React from 'react';

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const Spinner: React.FC<SpinnerProps> = ({ size = 'md', className = '' }) => {
  const sizeClasses = {
    sm: 'h-4 w-4 border-2',
    md: 'h-8 w-8 border-4',
    lg: 'h-12 w-12 border-4',
  };

  const baseStyles = 'animate-spin rounded-full border-solid border-indigo-600 border-t-transparent';
  
  const combinedClassName = `${baseStyles} ${sizeClasses[size]} ${className}`;

  return <div className={combinedClassName}></div>;
};