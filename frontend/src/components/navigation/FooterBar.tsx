import React from 'react';

export function FooterBar() {
  return (
    <footer className="mt-auto border-t border-gray-200 dark:border-gray-800 px-4 h-12 flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
      <span>© {new Date().getFullYear()} School Management</span>
      <span>v0.1.0</span>
    </footer>
  );
}
