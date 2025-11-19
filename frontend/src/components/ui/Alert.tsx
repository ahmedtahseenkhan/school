import React from 'react';
import clsx from 'clsx';

type Variant = 'info' | 'success' | 'warning' | 'error';

type Props = React.PropsWithChildren<{
  title?: string;
  variant?: Variant;
  className?: string;
}>;

export function Alert({ title, variant = 'info', className, children }: Props) {
  const base = 'rounded-md border px-4 py-3 text-sm';
  const styles: Record<Variant, string> = {
    info: 'bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-900/20 dark:border-blue-900 dark:text-blue-200',
    success: 'bg-green-50 border-green-200 text-green-800 dark:bg-green-900/20 dark:border-green-900 dark:text-green-200',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800 dark:bg-yellow-900/20 dark:border-yellow-900 dark:text-yellow-200',
    error: 'bg-red-50 border-red-200 text-red-800 dark:bg-red-900/20 dark:border-red-900 dark:text-red-200'
  };
  return (
    <div role="alert" className={clsx(base, styles[variant], className)}>
      {title && <div className="font-semibold mb-1">{title}</div>}
      <div>{children}</div>
    </div>
  );
}
