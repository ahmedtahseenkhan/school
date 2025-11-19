const db = require('../../../utils/database/connection');

exports.switchBranch = async (req, res, next) => {
  try {
    const { branch_id = null, branch_code = null } = req.body || {};
    const isElevated = req.user && (req.user.role === 'super_admin' || req.user.role === 'admin');

    let row = null;
    if (branch_id) {
      const { rows } = await db.query('SELECT id, name, code, subdomain, is_active FROM branches WHERE id = $1', [branch_id]);
      row = rows[0] || null;
    } else if (branch_code) {
      const { rows } = await db.query('SELECT id, name, code, subdomain, is_active FROM branches WHERE code = $1', [branch_code]);
      row = rows[0] || null;
    } else if (req.user?.branch_id) {
      const { rows } = await db.query('SELECT id, name, code, subdomain, is_active FROM branches WHERE id = $1', [req.user.branch_id]);
      row = rows[0] || null;
    }

    if (!row || !row.is_active) return res.status(404).json({ message: 'Branch not found' });

    if (!isElevated && row.id !== (req.user.branch_id || null)) {
      return res.status(403).json({ message: 'Forbidden: cannot switch branch' });
    }

    res.json({ selected: { id: row.id, name: row.name, code: row.code, subdomain: row.subdomain } });
  } catch (e) { next(e); }
};
