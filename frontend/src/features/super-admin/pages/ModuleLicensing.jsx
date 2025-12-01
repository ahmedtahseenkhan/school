import React, { useState, useEffect } from 'react';
import { superAdminService } from '../../../services/super-admin.service';
import { Switch } from '@headlessui/react';
import { toast } from 'react-hot-toast';

export default function ModuleLicensing() {
    const [branches, setBranches] = useState([]);
    const [selectedBranch, setSelectedBranch] = useState(null);
    const [modules, setModules] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadInitialData();
    }, []);

    useEffect(() => {
        if (selectedBranch) {
            loadBranchModules(selectedBranch);
        }
    }, [selectedBranch]);

    const loadInitialData = async () => {
        try {
            const branchData = await superAdminService.getBranches();
            setBranches(branchData);
            if (branchData.length > 0) {
                setSelectedBranch(branchData[0].id);
            }
        } catch (error) {
            toast.error('Failed to load branches');
        } finally {
            setLoading(false);
        }
    };

    const loadBranchModules = async (branchId) => {
        try {
            setLoading(true);
            const data = await superAdminService.getBranchModules(branchId);
            setModules(data);
        } catch (error) {
            toast.error('Failed to load modules');
        } finally {
            setLoading(false);
        }
    };

    const handleToggle = async (slug, currentState) => {
        try {
            const newState = !currentState;
            // Optimistic update
            setModules(prev => prev.map(m =>
                m.slug === slug ? { ...m, branch_enabled: newState } : m
            ));

            await superAdminService.updateBranchModule(selectedBranch, slug, { is_enabled: newState });
            toast.success('Module updated');
        } catch (error) {
            toast.error('Failed to update module');
            loadBranchModules(selectedBranch); // Revert
        }
    };

    if (loading && branches.length === 0) return <div>Loading...</div>;

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Module Licensing</h1>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {/* Branch Selection Sidebar */}
                <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-4">
                    <h2 className="text-lg font-semibold mb-4">Select Branch</h2>
                    <div className="space-y-2">
                        {branches.map(branch => (
                            <button
                                key={branch.id}
                                onClick={() => setSelectedBranch(branch.id)}
                                className={`w-full text-left px-4 py-2 rounded-md transition-colors ${selectedBranch === branch.id
                                        ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                                        : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                                    }`}
                            >
                                <div className="font-medium">{branch.name}</div>
                                <div className="text-xs text-gray-500">{branch.code}</div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Modules List */}
                <div className="md:col-span-3 bg-white dark:bg-gray-800 shadow rounded-lg p-6">
                    <h2 className="text-lg font-semibold mb-4">Module Access</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {modules.map((module) => (
                            <div key={module.slug} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 flex flex-col justify-between">
                                <div>
                                    <div className="flex justify-between items-start mb-2">
                                        <h3 className="font-medium text-gray-900 dark:text-white">{module.name}</h3>
                                        <Switch
                                            checked={module.branch_enabled}
                                            onChange={() => handleToggle(module.slug, module.branch_enabled)}
                                            className={`${module.branch_enabled ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
                                                } relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
                                        >
                                            <span
                                                className={`${module.branch_enabled ? 'translate-x-6' : 'translate-x-1'
                                                    } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
                                            />
                                        </Switch>
                                    </div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                                        {module.description || 'No description available'}
                                    </p>
                                </div>
                                <div className="text-xs text-gray-400">
                                    Global Status: {module.global_enabled ? 'Enabled' : 'Disabled'}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
