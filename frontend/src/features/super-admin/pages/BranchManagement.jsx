import React, { useState, useEffect } from 'react';
import { superAdminService } from '../../../services/super-admin.service';
import { PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';

export default function BranchManagement() {
    const [branches, setBranches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingBranch, setEditingBranch] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        code: '',
        type: 'branch',
        subdomain: '',
        status: 'active'
    });

    useEffect(() => {
        loadBranches();
    }, []);

    const loadBranches = async () => {
        try {
            const data = await superAdminService.getBranches();
            setBranches(data);
        } catch (error) {
            toast.error('Failed to load branches');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingBranch) {
                await superAdminService.updateBranch(editingBranch.id, formData);
                toast.success('Branch updated successfully');
            } else {
                await superAdminService.createBranch(formData);
                toast.success('Branch created successfully');
            }
            setIsModalOpen(false);
            loadBranches();
        } catch (error) {
            toast.error('Failed to save branch');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this branch?')) return;
        try {
            await superAdminService.deleteBranch(id);
            toast.success('Branch deleted');
            loadBranches();
        } catch (error) {
            toast.error('Failed to delete branch');
        }
    };

    const openModal = (branch = null) => {
        setEditingBranch(branch);
        setFormData(branch || {
            name: '',
            code: '',
            type: 'branch',
            subdomain: '',
            status: 'active'
        });
        setIsModalOpen(true);
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Branch Management</h1>
                <button
                    onClick={() => openModal()}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                    <PlusIcon className="w-5 h-5" />
                    Add Branch
                </button>
            </div>

            <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-900">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Code</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Subdomain</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Type</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {branches.map((branch) => (
                            <tr key={branch.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{branch.name}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{branch.code}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{branch.subdomain}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 capitalize">{branch.type}</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${branch.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                        }`}>
                                        {branch.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <button onClick={() => openModal(branch)} className="text-indigo-600 hover:text-indigo-900 mr-4">
                                        <PencilIcon className="w-5 h-5" />
                                    </button>
                                    <button onClick={() => handleDelete(branch.id)} className="text-red-600 hover:text-red-900">
                                        <TrashIcon className="w-5 h-5" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg w-full max-w-md">
                        <h2 className="text-xl font-bold mb-4">{editingBranch ? 'Edit Branch' : 'Add Branch'}</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Name</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full rounded-md border-gray-300 dark:bg-gray-700 dark:border-gray-600"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Code</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full rounded-md border-gray-300 dark:bg-gray-700 dark:border-gray-600"
                                    value={formData.code}
                                    onChange={e => setFormData({ ...formData, code: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Subdomain</label>
                                <input
                                    type="text"
                                    className="w-full rounded-md border-gray-300 dark:bg-gray-700 dark:border-gray-600"
                                    value={formData.subdomain}
                                    onChange={e => setFormData({ ...formData, subdomain: e.target.value })}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Type</label>
                                    <select
                                        className="w-full rounded-md border-gray-300 dark:bg-gray-700 dark:border-gray-600"
                                        value={formData.type}
                                        onChange={e => setFormData({ ...formData, type: e.target.value })}
                                    >
                                        <option value="main">Main</option>
                                        <option value="branch">Branch</option>
                                        <option value="campus">Campus</option>
                                        <option value="wing">Wing</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Status</label>
                                    <select
                                        className="w-full rounded-md border-gray-300 dark:bg-gray-700 dark:border-gray-600"
                                        value={formData.status}
                                        onChange={e => setFormData({ ...formData, status: e.target.value })}
                                    >
                                        <option value="active">Active</option>
                                        <option value="inactive">Inactive</option>
                                        <option value="suspended">Suspended</option>
                                    </select>
                                </div>
                            </div>
                            <div className="flex justify-end gap-2 mt-6">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                                >
                                    Save
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
