import api from './api';

export const superAdminService = {
    // Branches
    getBranches: async () => {
        const { data } = await api.get('/super-admin/branches');
        return data.branches;
    },
    createBranch: async (branchData) => {
        const { data } = await api.post('/super-admin/branches', branchData);
        return data.branch;
    },
    updateBranch: async (id, branchData) => {
        const { data } = await api.put(`/super-admin/branches/${id}`, branchData);
        return data.branch;
    },
    deleteBranch: async (id) => {
        await api.delete(`/super-admin/branches/${id}`);
    },

    // Modules
    getModules: async () => {
        const { data } = await api.get('/super-admin/modules');
        return data.modules;
    },
    toggleModule: async (slug, isEnabled) => {
        const { data } = await api.put(`/super-admin/modules/${slug}`, { is_enabled: isEnabled });
        return data.module;
    },
    getBranchModules: async (branchId) => {
        const { data } = await api.get(`/super-admin/branches/${branchId}/modules`);
        return data.modules;
    },
    updateBranchModule: async (branchId, moduleSlug, data) => {
        const { data: res } = await api.put(`/super-admin/branches/${branchId}/modules/${moduleSlug}`, data);
        return res.module;
    },

    // Server Stats
    getServerStats: async () => {
        const { data } = await api.get('/super-admin/server/stats');
        return data;
    }
};
