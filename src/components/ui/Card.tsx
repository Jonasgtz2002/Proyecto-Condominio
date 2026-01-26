import { cn } from '@/lib/utils';
import { HTMLAttributes } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {}

export function Card({ className, children, ...props }: CardProps) {
  return (
    <div
      className={cn('bg-white rounded-lg shadow-md border border-gray-200', className)}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ className, children, ...props }: CardProps) {
  return (
    <div className={cn('p-6 border-b border-gray-200', className)} {...props}>
      {children}
    </div>
  );
}

export function CardContent({ className, children, ...props }: CardProps) {
  return (
    <div className={cn('p-6', className)} {...props}>
      {children}
    </div>
  );
}

export function CardTitle({ className, children, ...props }: HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3 className={cn('text-xl font-semibold text-gray-900', className)} {...props}>
      {children}
    </h3>
  );
}
