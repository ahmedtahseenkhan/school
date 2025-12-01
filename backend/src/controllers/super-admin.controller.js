const db = require('../utils/database/connection');
const si = require('systeminformation');

// --- Branch Management ---

exports.listBranches = async (req, res, next) => {
    try {
        const { rows } = await db.query('SELECT * FROM branches ORDER BY created_at DESC');
        res.json({ branches: rows });
    } catch (e) { next(e); }
};

exports.createBranch = async (req, res, next) => {
    try {
        const { name, code, type, status, subdomain } = req.body;
        const { rows } = await db.query(
            `INSERT INTO branches (name, code, type, status, subdomain, created_by) 
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
            [name, code, type, status || 'active', subdomain, req.user.id]
        );
        res.status(201).json({ branch: rows[0] });
    } catch (e) { next(e); }
};

exports.updateBranch = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { name, code, type, status, subdomain } = req.body;
        const { rows } = await db.query(
            `UPDATE branches SET name = $1, code = $2, type = $3, status = $4, subdomain = $5, updated_at = NOW() 
       WHERE id = $6 RETURNING *`,
            [name, code, type, status, subdomain, id]
        );
        if (rows.length === 0) return res.status(404).json({ message: 'Branch not found' });
        res.json({ branch: rows[0] });
    } catch (e) { next(e); }
};

exports.deleteBranch = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { rowCount } = await db.query('DELETE FROM branches WHERE id = $1', [id]);
        if (rowCount === 0) return res.status(404).json({ message: 'Branch not found' });
        res.json({ message: 'Branch deleted successfully' });
    } catch (e) { next(e); }
};

// --- Module Management ---

exports.listModules = async (req, res, next) => {
    try {
        const { rows } = await db.query('SELECT * FROM modules ORDER BY name');
        res.json({ modules: rows });
    } catch (e) { next(e); }
};

exports.toggleModule = async (req, res, next) => {
    try {
        const { slug } = req.params;
        const { is_enabled } = req.body;
        const { rows } = await db.query(
            'UPDATE modules SET is_enabled = $1, updated_at = NOW() WHERE slug = $2 RETURNING *',
            [is_enabled, slug]
        );
        if (rows.length === 0) return res.status(404).json({ message: 'Module not found' });
        res.json({ module: rows[0] });
    } catch (e) { next(e); }
};

exports.getBranchModules = async (req, res, next) => {
    try {
        const { branchId } = req.params;
        // Get all modules and left join with branch_modules to see overrides
        const { rows } = await db.query(
            `SELECT m.slug, m.name, m.is_enabled as global_enabled, 
              COALESCE(bm.is_enabled, m.is_enabled) as branch_enabled,
              bm.config
       FROM modules m
       LEFT JOIN branch_modules bm ON m.slug = bm.module_name AND bm.branch_id = $1
       ORDER BY m.name`,
            [branchId]
        );
        res.json({ modules: rows });
    } catch (e) { next(e); }
};

exports.updateBranchModule = async (req, res, next) => {
    try {
        const { branchId, moduleSlug } = req.params;
        const { is_enabled, config } = req.body;

        // Upsert into branch_modules
        const { rows } = await db.query(
            `INSERT INTO branch_modules (branch_id, module_name, is_enabled, config)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (branch_id, module_name) 
       DO UPDATE SET is_enabled = EXCLUDED.is_enabled, config = EXCLUDED.config, created_at = NOW()
       RETURNING *`,
            [branchId, moduleSlug, is_enabled, config || {}]
        );
        res.json({ module: rows[0] });
    } catch (e) { next(e); }
};

// --- Server Monitoring ---

exports.getServerStats = async (req, res, next) => {
    try {
        const [cpu, mem, disk, os] = await Promise.all([
            si.currentLoad(),
            si.mem(),
            si.fsSize(),
            si.osInfo()
        ]);

        res.json({
            cpu: {
                load: cpu.currentLoad,
                cores: cpu.cpus.length
            },
            memory: {
                total: mem.total,
                used: mem.used,
                free: mem.free,
                active: mem.active
            },
            disk: disk.map(d => ({
                fs: d.fs,
                type: d.type,
                size: d.size,
                used: d.used,
                mount: d.mount
            })),
            os: {
                platform: os.platform,
                distro: os.distro,
                release: os.release,
                hostname: os.hostname
            },
            uptime: si.time().uptime
        });
    } catch (e) { next(e); }
};
