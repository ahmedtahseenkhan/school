const axios = require('axios');
const TenantService = require('./tenant.service');
const { generateInstanceToken } = require('../middleware/superAuth');

class TenantSyncService {
  constructor() { this.clients = new Map(); }
  getTenantClient(tenant) {
    if (!this.clients.has(tenant.id)) {
      const client = axios.create({ baseURL: tenant.server_url, timeout: 10000 });
      client.interceptors.request.use((cfg) => {
        cfg.headers = cfg.headers || {};
        cfg.headers.Authorization = `Bearer ${generateInstanceToken(tenant)}`;
        cfg.headers['X-Super-Admin'] = 'true';
        return cfg;
      });
      this.clients.set(tenant.id, client);
    }
    return this.clients.get(tenant.id);
  }
  async checkTenantHealth(tenantId) {
    try {
      const tenant = await TenantService.getById(tenantId);
      const client = this.getTenantClient(tenant);
      const start = Date.now();
      const res = await client.get('/api/health');
      return { status: 'healthy', responseTime: Date.now()-start, version: res.data.version || null, timestamp: new Date() };
    } catch (e) { return { status: 'unhealthy', error: e.message, timestamp: new Date() }; }
  }
  async syncTenantData(tenantId) {
    try {
      const tenant = await TenantService.getById(tenantId);
      const client = this.getTenantClient(tenant);
      const { data: usageData } = await client.get('/api/admin/usage-stats');
      await TenantService.upsertUsage(tenantId, usageData);
      // Could also pull modules from tenant if needed
      return true;
    } catch (e) { return false; }
  }
}

module.exports = new TenantSyncService();
