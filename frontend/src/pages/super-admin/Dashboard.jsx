import React, { useEffect, useState } from 'react';
import api from '@/services/api';
import PermissionGuard from '@/components/auth/PermissionGuard.jsx';

export default function SuperAdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState({ totals: {}, items: [] });

  useEffect(() => {
    setLoading(true);
    api.get('/branches/reports/overview-all')
      .then(({ data }) => setData(data))
      .catch((e) => setError(e?.response?.data?.message || e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-6">Loading...</div>;
  if (error) return <div className="p-6 text-red-600">{error}</div>;

  const t = data.totals || {};
  const items = data.items || [];

  return (
    <PermissionGuard anyOf={["*:manage"]}>
      <div className="p-6 space-y-6">
        <h1 className="text-2xl font-semibold">Super Admin Dashboard</h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard title="Branches" value={t.branches || 0} />
          <MetricCard title="Students" value={t.total_students || 0} />
          <MetricCard title="Staff" value={t.total_staff || 0} />
          <MetricCard title="Active Users" value={t.active_users || 0} />
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-4 py-3 border-b font-medium">Branch Performance</div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-left">
                  <th className="px-4 py-2">Branch</th>
                  <th className="px-4 py-2">Code</th>
                  <th className="px-4 py-2">Students</th>
                  <th className="px-4 py-2">Staff</th>
                  <th className="px-4 py-2">Active Users</th>
                  <th className="px-4 py-2">Revenue</th>
                </tr>
              </thead>
              <tbody>
                {items.map((b) => (
                  <tr key={b.id} className="border-t">
                    <td className="px-4 py-2">{b.name}</td>
                    <td className="px-4 py-2">{b.code}</td>
                    <td className="px-4 py-2">{b.total_students}</td>
                    <td className="px-4 py-2">{b.total_staff}</td>
                    <td className="px-4 py-2">{b.active_users}</td>
                    <td className="px-4 py-2">₹{(b.revenue || 0).toLocaleString()}</td>
                  </tr>
                ))}
                {!items.length && (
                  <tr><td className="px-4 py-6 text-center text-gray-500" colSpan={6}>No branches found</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </PermissionGuard>
  );
}

function MetricCard({ title, value }) {
  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="text-sm text-gray-500">{title}</div>
      <div className="text-2xl font-semibold mt-1">{value}</div>
    </div>
  );
}
