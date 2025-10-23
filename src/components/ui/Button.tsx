import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  className?: string;
}

export const Button: React.FC<ButtonProps> = ({ children, className = '', ...props }) => {
  const baseClasses =
    'inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white focus:outline-none focus:ring-2 focus:ring-offset-2';

  const themeClasses =
    'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500';

  const disabledClasses =
    'disabled:bg-gray-300 disabled:cursor-not-allowed';

  return (
    <button
      className={`${baseClasses} ${themeClasses} ${disabledClasses} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};