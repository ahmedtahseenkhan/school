import React from 'react';
import { usePermission } from '@/contexts/PermissionContext.jsx';

export default function PermissionGuard({ anyOf = [], allOf = [], children, fallback = null }) {
  const { has, hasAny, loading } = usePermission();
  if (loading) return null;
  const passAny = anyOf.length ? hasAny(anyOf) : true;
  const passAll = allOf.length ? allOf.every((p) => has(p)) : true;
  if (passAny && passAll) return <>{children}</>;
  return fallback || <div className="text-sm text-gray-500">You do not have access to view this page.</div>;
}
