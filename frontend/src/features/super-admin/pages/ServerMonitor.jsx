import React, { useState, useEffect } from 'react';
import { superAdminService } from '../../../services/super-admin.service';
import { ArrowPathIcon } from '@heroicons/react/24/outline';

export default function ServerMonitor() {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    const loadStats = async () => {
        try {
            setLoading(true);
            const data = await superAdminService.getServerStats();
            setStats(data);
        } catch (error) {
            console.error('Failed to load stats', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadStats();
        const interval = setInterval(loadStats, 30000); // Refresh every 30s
        return () => clearInterval(interval);
    }, []);

    if (loading && !stats) return <div className="p-6">Loading server stats...</div>;

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Server Monitor</h1>
                <button
                    onClick={loadStats}
                    className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white"
                >
                    <ArrowPathIcon className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {/* CPU Card */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">CPU Load</h3>
                    <div className="flex items-end gap-2">
                        <span className="text-3xl font-bold text-gray-900 dark:text-white">
                            {stats.cpu.load.toFixed(1)}%
                        </span>
                        <span className="text-sm text-gray-500 mb-1">{stats.cpu.cores} Cores</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5 mt-4 dark:bg-gray-700">
                        <div
                            className={`h-2.5 rounded-full ${stats.cpu.load > 80 ? 'bg-red-600' : 'bg-blue-600'}`}
                            style={{ width: `${Math.min(stats.cpu.load, 100)}%` }}
                        ></div>
                    </div>
                </div>

                {/* Memory Card */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Memory Usage</h3>
                    <div className="flex items-end gap-2">
                        <span className="text-3xl font-bold text-gray-900 dark:text-white">
                            {((stats.memory.active / stats.memory.total) * 100).toFixed(1)}%
                        </span>
                        <span className="text-sm text-gray-500 mb-1">
                            {(stats.memory.active / 1024 / 1024 / 1024).toFixed(1)} GB / {(stats.memory.total / 1024 / 1024 / 1024).toFixed(1)} GB
                        </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5 mt-4 dark:bg-gray-700">
                        <div
                            className="bg-purple-600 h-2.5 rounded-full"
                            style={{ width: `${(stats.memory.active / stats.memory.total) * 100}%` }}
                        ></div>
                    </div>
                </div>

                {/* Uptime Card */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">System Uptime</h3>
                    <div className="text-3xl font-bold text-gray-900 dark:text-white">
                        {(stats.uptime / 3600).toFixed(1)} hrs
                    </div>
                    <p className="text-sm text-gray-500 mt-2">
                        {stats.os.distro} {stats.os.release}
                    </p>
                </div>
            </div>

            {/* Disk Usage */}
            <h2 className="text-lg font-semibold mb-4">Disk Usage</h2>
            <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-900">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Mount</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Size</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Used</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Usage</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                        {stats.disk.map((disk, idx) => (
                            <tr key={idx}>
                                <td className="px-6 py-4 text-sm font-medium">{disk.mount}</td>
                                <td className="px-6 py-4 text-sm text-gray-500">{disk.type}</td>
                                <td className="px-6 py-4 text-sm text-gray-500">{(disk.size / 1024 / 1024 / 1024).toFixed(1)} GB</td>
                                <td className="px-6 py-4 text-sm text-gray-500">{(disk.used / 1024 / 1024 / 1024).toFixed(1)} GB</td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-2">
                                        <div className="w-24 bg-gray-200 rounded-full h-2 dark:bg-gray-700">
                                            <div
                                                className="bg-green-500 h-2 rounded-full"
                                                style={{ width: `${(disk.used / disk.size) * 100}%` }}
                                            ></div>
                                        </div>
                                        <span className="text-xs text-gray-500">{((disk.used / disk.size) * 100).toFixed(0)}%</span>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
