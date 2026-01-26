import { cn } from '@/lib/utils';
import { ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'destructive' | 'outline';
  size?: 'sm' | 'md' | 'lg';
}

export function Button({ 
  className, 
  variant = 'primary', 
  size = 'md', 
  children,
  ...props 
}: ButtonProps) {
  return (
    <button
      className={cn(
        'font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed',
        {
          'bg-blue-600 hover:bg-blue-700 text-white': variant === 'primary',
          'bg-gray-200 hover:bg-gray-300 text-gray-900': variant === 'secondary',
          'bg-red-600 hover:bg-red-700 text-white': variant === 'destructive',
          'border-2 border-gray-300 hover:bg-gray-100 text-gray-900': variant === 'outline',
          'px-3 py-1.5 text-sm': size === 'sm',
          'px-4 py-2': size === 'md',
          'px-6 py-3 text-lg': size === 'lg',
        },
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
