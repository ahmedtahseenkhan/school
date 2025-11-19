import React from 'react';
import clsx from 'clsx';

export function Card({ className, children }: React.PropsWithChildren<{ className?: string }>) {
  return <div className={clsx('rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 shadow-sm', className)}>{children}</div>;
}

export function CardHeader({ className, children }: React.PropsWithChildren<{ className?: string }>) {
  return <div className={clsx('px-3 py-2 border-b border-gray-100 dark:border-gray-800', className)}>{children}</div>;
}

export function CardContent({ className, children }: React.PropsWithChildren<{ className?: string }>) {
  return <div className={clsx('px-3 py-3', className)}>{children}</div>;
}

export function CardFooter({ className, children }: React.PropsWithChildren<{ className?: string }>) {
  return <div className={clsx('px-3 py-2 border-t border-gray-100 dark:border-gray-800', className)}>{children}</div>;
}
