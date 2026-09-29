'use client';

import React, { ButtonHTMLAttributes, ReactNode } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'green' | 'blue' | 'red' | 'white' | 'gray';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  children: ReactNode;
}

export function Button({
  variant = 'green',
  size = 'md',
  fullWidth = false,
  className = '',
  disabled = false,
  children,
  ...props
}: ButtonProps) {
  const baseClasses =
    'btn-3d font-black uppercase tracking-wider rounded-2xl flex items-center justify-center select-none transition-all duration-100';

  const sizeClasses = {
    sm: 'py-2 px-4 text-xs',
    md: 'py-3 px-6 text-sm',
    lg: 'py-4 px-8 text-base',
  };

  const variantClasses = {
    green: disabled ? 'btn-3d-disabled' : 'btn-3d-green',
    blue: disabled ? 'btn-3d-disabled' : 'btn-3d-blue',
    red: disabled ? 'btn-3d-disabled' : 'btn-3d-red',
    white: disabled ? 'btn-3d-disabled' : 'btn-3d-white',
    gray: 'btn-3d-disabled',
  };

  return (
    <button
      disabled={disabled}
      className={`${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${
        fullWidth ? 'w-full' : ''
      } ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

export default Button;
