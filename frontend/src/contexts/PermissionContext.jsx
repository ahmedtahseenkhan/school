import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useAuth } from './AuthContext.jsx';
import * as permApi from '@/services/permission.service.js';

const PermissionContext = createContext(null);

export function PermissionProvider({ children }) {
  const { user, loading } = useAuth();
  const [perms, setPerms] = useState(new Set());
  const [fetching, setFetching] = useState(false);

  useEffect(() => {
    if (loading) return;
    if (!user) { setPerms(new Set()); return; }
    setFetching(true);
    permApi.myPermissions()
      .then((list) => setPerms(new Set(list)))
      .catch(() => setPerms(new Set()))
      .finally(() => setFetching(false));
  }, [user, loading]);

  const has = (permission) => perms.has('*:manage') || perms.has(permission);
  const hasAny = (arr = []) => arr.some((p) => has(p));

  const value = useMemo(() => ({ permissions: perms, has, hasAny, loading: loading || fetching }), [perms, loading, fetching]);
  return <PermissionContext.Provider value={value}>{children}</PermissionContext.Provider>;
}

export function usePermission() {
  const ctx = useContext(PermissionContext);
  if (!ctx) throw new Error('usePermission must be used within PermissionProvider');
  return ctx;
}
