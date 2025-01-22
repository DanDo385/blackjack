import React from 'react';

const Button = ({ onClick, children, variant = 'primary' }) => {
  const colorClasses = {
    primary: 'bg-blue-500 hover:bg-blue-600',
    success: 'bg-green-500 hover:bg-green-600',
    danger: 'bg-red-500 hover:bg-red-600',
    warning: 'bg-yellow-500 hover:bg-yellow-600',
  };

  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 text-white rounded ${colorClasses[variant]}`}
    >
      {children}
    </button>
  );
};

export default Button; 