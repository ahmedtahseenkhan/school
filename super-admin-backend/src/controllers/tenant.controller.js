const TenantService = require('../services/tenant.service');
const SyncService = require('../services/sync.service');

module.exports = {
  async getTenants(_req, res, next) {
    try { const tenants = await TenantService.getAll(); res.json({ tenants }); } catch (e) { next(e); }
  },
  async createTenant(req, res, next) {
    try { const tenant = await TenantService.create(req.body); res.status(201).json({ tenant }); } catch (e) { next(e); }
  },
  async getTenant(req, res, next) {
    try { const tenant = await TenantService.getById(req.params.id); if (!tenant) return res.status(404).json({ message: 'Not found' }); res.json({ tenant }); } catch (e) { next(e); }
  },
  async updateTenant(req, res, next) {
    try { const tenant = await TenantService.update(req.params.id, req.body); res.json({ tenant }); } catch (e) { next(e); }
  },
  async suspendTenant(req, res, next) {
    try { const tenant = await TenantService.setStatus(req.params.id, 'suspended'); res.json({ tenant }); } catch (e) { next(e); }
  },
  async activateTenant(req, res, next) {
    try { const tenant = await TenantService.setStatus(req.params.id, 'active'); res.json({ tenant }); } catch (e) { next(e); }
  },
  async getTenantUsage(req, res, next) {
    try { const usage = await TenantService.getLatestUsage(req.params.id); res.json({ usage }); } catch (e) { next(e); }
  },
  async checkTenantHealth(req, res, next) {
    try { const health = await SyncService.checkTenantHealth(req.params.id); res.json(health); } catch (e) { next(e); }
  },
  async syncTenantData(req, res, next) {
    try { const ok = await SyncService.syncTenantData(req.params.id); res.json({ success: ok }); } catch (e) { next(e); }
  },
  async getTenantModules(req, res, next) {
    try { const modules = await TenantService.getModules(req.params.id); res.json({ modules }); } catch (e) { next(e); }
  },
  async updateTenantModules(req, res, next) {
    try { const modules = await TenantService.updateModules(req.params.id, req.body.modules || []); res.json({ modules }); } catch (e) { next(e); }
  },
  async restartInstance(_req, res) { res.json({ accepted: true, message: 'Restart requested' }); },
  async createBackup(_req, res) { res.json({ accepted: true, message: 'Backup requested' }); }
};
