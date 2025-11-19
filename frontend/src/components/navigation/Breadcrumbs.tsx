import React from 'react';
import { Link, useLocation } from 'react-router-dom';

export function Breadcrumbs() {
  const location = useLocation();
  const parts = location.pathname.split('/').filter(Boolean);
  const crumbs = parts.map((p, idx) => ({
    label: p.charAt(0).toUpperCase() + p.slice(1),
    to: '/' + parts.slice(0, idx + 1).join('/'),
  }));

  return (
    <nav className="text-sm" aria-label="Breadcrumb">
      <ol className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
        <li>
          <Link to="/" className="hover:text-gray-900 dark:hover:text-gray-100">Home</Link>
        </li>
        {crumbs.map((c, i) => (
          <li key={c.to} className="flex items-center gap-1">
            <span aria-hidden="true">/</span>
            {i === crumbs.length - 1 ? (
              <span className="text-gray-900 dark:text-gray-100" aria-current="page">{c.label}</span>
            ) : (
              <Link to={c.to} className="hover:text-gray-900 dark:hover:text-gray-100">{c.label}</Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
