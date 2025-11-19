import React from 'react';
import * as branchApi from '@/services/branch.service.js';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { Bars3Icon, SunIcon, MoonIcon, ChevronDownIcon } from '@heroicons/react/24/outline';
import { Breadcrumbs } from './Breadcrumbs';

export function Topbar({ onToggleSidebar }: { onToggleSidebar?: () => void }) {
  const { theme, toggleTheme } = useTheme();
  const auth: any = useAuth();
  const { user, logout } = auth;
  const [branches, setBranches] = React.useState<Array<{ id: string; name: string; code?: string }>>([]);
  const [selectedBranchId, setSelectedBranchId] = React.useState<string | null>(
    typeof window !== 'undefined' ? localStorage.getItem('branch_id') : null
  );
  const [branchMenuOpen, setBranchMenuOpen] = React.useState(false);
  const [userMenuOpen, setUserMenuOpen] = React.useState(false);

  React.useEffect(() => {
    let mounted = true;
    branchApi
      .list()
      .then((list) => {
        if (!mounted) return;
        setBranches(list || []);
        if (!selectedBranchId && list?.length) {
          // No selection yet; do nothing. User can choose.
        }
      })
      .catch(() => {})
      .finally(() => {});
    return () => {
      mounted = false;
    };
  }, []);

  const selected = React.useMemo(() => branches.find((b) => b.id === selectedBranchId) || null, [branches, selectedBranchId]);

  async function handleSwitch(id: string) {
    try {
      const sel = await branchApi.switchBranch({ branch_id: id, branch_code: null as any });
      setSelectedBranchId(sel?.id || id);
      setBranchMenuOpen(false);
      // Force full app reload so data is refetched for the new branch
      if (typeof window !== 'undefined') {
        window.location.reload();
      }
    } catch (e) {
      // no-op
    }
  }

  return (
    <header className="sticky top-0 z-30 h-14 backdrop-blur bg-white/75 dark:bg-gray-900/80 border-b border-gray-200 dark:border-gray-800 flex items-center">
      <div className="flex-1 flex items-center gap-2 px-4">
        <button
          onClick={onToggleSidebar}
          className="lg:hidden p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
          aria-label="Toggle sidebar"
        >
          <Bars3Icon className="w-5 h-5" />
        </button>
        <Breadcrumbs />
      </div>
      <div className="px-4 flex items-center gap-2">
        <div className="relative">
          <button
            onClick={() => setBranchMenuOpen((v) => !v)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
            aria-haspopup="menu"
          >
            <span className="inline-flex h-2 w-2 rounded-full bg-emerald-500" aria-hidden="true" />
            <span className="text-sm">
              {selected ? selected.name : 'Select Branch'}
            </span>
          </button>
          {branchMenuOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-md shadow-lg z-50">
              <div className="max-h-64 overflow-auto py-1">
                {branches.map((b) => (
                  <button
                    key={b.id}
                    onClick={() => handleSwitch(b.id)}
                    className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-800 ${
                      selectedBranchId === b.id ? 'font-medium' : ''
                    }`}
                  >
                    {b.name}
                    {b.code ? <span className="text-gray-500"> · {b.code}</span> : null}
                  </button>
                ))}
                {!branches.length && (
                  <div className="px-3 py-2 text-sm text-gray-500">No branches</div>
                )}
              </div>
            </div>
          )}
        </div>
        <button
          onClick={toggleTheme}
          className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? <SunIcon className="w-5 h-5" /> : <MoonIcon className="w-5 h-5" />}
        </button>
        <div className="relative">
          <button
            onClick={() => setUserMenuOpen((v) => !v)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
            aria-haspopup="menu"
          >
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-purple-500" aria-hidden="true" />
            <span className="text-sm">
              {user?.first_name || user?.last_name
                ? `${user?.first_name || ''}${user?.last_name ? ` ${user.last_name}` : ''}`.trim()
                : user?.email || 'User'}
            </span>
            <ChevronDownIcon className="w-4 h-4" />
          </button>
          {userMenuOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-md shadow-lg z-50">
              <div className="py-2 text-sm">
                <div className="px-3 pb-2 border-b border-gray-100 dark:border-gray-800 mb-1">
                  <div className="font-medium truncate">
                    {user?.first_name || user?.last_name
                      ? `${user?.first_name || ''}${user?.last_name ? ` ${user.last_name}` : ''}`.trim()
                      : user?.email || 'Signed in'}
                  </div>
                  {user?.email && (
                    <div className="text-xs text-gray-500 truncate">{user.email}</div>
                  )}
                </div>
                <button
                  onClick={() => {
                    setUserMenuOpen(false);
                    logout();
                    if (typeof window !== 'undefined') {
                      window.location.href = '/login';
                    }
                  }}
                  className="w-full text-left px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 text-sm"
                >
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
