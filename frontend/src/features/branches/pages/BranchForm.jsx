import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import * as branchApi from '@/services/branch.service.js';
import PermissionGuard from '@/components/auth/PermissionGuard.jsx';

export default function BranchForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [form, setForm] = useState({
    school_id: '',
    name: '',
    code: '',
    type: 'branch',
    address: '',
    phone: '',
    email: ''
  });

  useEffect(() => {
    if (!isEdit) return;
    setLoading(true);
    branchApi
      .get(id)
      .then((b) => setForm({
        school_id: b.school_id || '',
        name: b.name || '',
        code: b.code || '',
        type: b.type || 'branch',
        address: b.address || '',
        phone: b.phone || '',
        email: b.email || ''
      }))
      .catch((e) => setError(e?.response?.data?.message || e.message))
      .finally(() => setLoading(false));
  }, [id, isEdit]);

  const onChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const onSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (isEdit) await branchApi.update(id, form);
      else await branchApi.create(form);
      navigate('/admin/branches');
    } catch (e2) {
      setError(e2?.response?.data?.message || e2.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <PermissionGuard anyOf={["*:manage"]}>
      <div className="max-w-2xl">
        <h1 className="text-xl font-semibold mb-4">{isEdit ? 'Edit Branch' : 'Create Branch'}</h1>
        {error && <div className="mb-4 text-sm text-red-600">{error}</div>}
        <form onSubmit={onSubmit} className="space-y-4">
          {!isEdit && (
            <div>
              <label className="block text-sm mb-1">School ID</label>
              <input name="school_id" value={form.school_id} onChange={onChange} className="w-full border rounded px-3 py-2" required />
            </div>
          )}
          <div>
            <label className="block text-sm mb-1">Name</label>
            <input name="name" value={form.name} onChange={onChange} className="w-full border rounded px-3 py-2" required />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm mb-1">Code</label>
              <input name="code" value={form.code} onChange={onChange} className="w-full border rounded px-3 py-2" required />
            </div>
            <div>
              <label className="block text-sm mb-1">Type</label>
              <select name="type" value={form.type} onChange={onChange} className="w-full border rounded px-3 py-2">
                <option value="main">Main</option>
                <option value="branch">Branch</option>
                <option value="campus">Campus</option>
                <option value="wing">Wing</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm mb-1">Address</label>
            <input name="address" value={form.address} onChange={onChange} className="w-full border rounded px-3 py-2" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm mb-1">Phone</label>
              <input name="phone" value={form.phone} onChange={onChange} className="w-full border rounded px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm mb-1">Email</label>
              <input type="email" name="email" value={form.email} onChange={onChange} className="w-full border rounded px-3 py-2" />
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button disabled={saving} className="px-4 py-2 bg-blue-600 text-white rounded">{saving ? 'Saving...' : 'Save'}</button>
            <button type="button" onClick={() => navigate('/admin/branches')} className="px-4 py-2 border rounded">Cancel</button>
          </div>
        </form>
      </div>
    </PermissionGuard>
  );
}
