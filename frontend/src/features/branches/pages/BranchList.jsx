import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import * as branchApi from '@/services/branch.service.js';
import PermissionGuard from '@/components/auth/PermissionGuard.jsx';

export default function BranchList() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [branches, setBranches] = useState([]);

  useEffect(() => {
    setLoading(true);
    branchApi
      .list()
      .then(setBranches)
      .catch((e) => setError(e?.response?.data?.message || e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-6">Loading...</div>;
  if (error) return <div className="p-6 text-red-600">{error}</div>;

  return (
    <PermissionGuard anyOf={["*:manage"]}>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold">Branches</h1>
          <Link to="/admin/branches/new" className="px-3 py-2 bg-blue-600 text-white rounded-md text-sm">Create Branch</Link>
        </div>
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-left">
                <th className="px-4 py-2">Name</th>
                <th className="px-4 py-2">Code</th>
                <th className="px-4 py-2">Type</th>
                <th className="px-4 py-2">Phone</th>
                <th className="px-4 py-2">Email</th>
                <th className="px-4 py-2">Status</th>
                <th className="px-4 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {branches.map((b) => (
                <tr key={b.id} className="border-t">
                  <td className="px-4 py-2">{b.name}</td>
                  <td className="px-4 py-2">{b.code}</td>
                  <td className="px-4 py-2">{b.type}</td>
                  <td className="px-4 py-2">{b.phone || '-'}</td>
                  <td className="px-4 py-2">{b.email || '-'}</td>
                  <td className="px-4 py-2">{b.is_active ? 'Active' : 'Inactive'}</td>
                  <td className="px-4 py-2 space-x-2">
                    <Link to={`/admin/branches/${b.id}`} className="text-blue-600">Edit</Link>
                  </td>
                </tr>
              ))}
              {!branches.length && (
                <tr>
                  <td className="px-4 py-6 text-center text-gray-500" colSpan={7}>No branches found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </PermissionGuard>
  );
}
