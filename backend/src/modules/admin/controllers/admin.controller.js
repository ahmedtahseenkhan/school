const db = require('../../../utils/database/connection');

exports.getUsageStats = async (req, res) => {
  try {
    if (!req.superAdmin) return res.status(403).json({ error: 'Super admin access required' });

    const [{ rows: activeUsers }, { rows: totalStudents }] = await Promise.all([
      db.query("SELECT COUNT(*)::int AS count FROM users WHERE status = 'active'"),
      db.query("SELECT COUNT(*)::int AS count FROM users WHERE role = 'student'")
    ]);

    const stats = {
      active_users: activeUsers[0]?.count || 0,
      total_students: totalStudents[0]?.count || 0,
      storage_used_mb: 0,
      last_activity: new Date(),
      module_usage: []
    };

    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.toggleModule = async (req, res) => {
  try {
    if (!req.superAdmin) return res.status(403).json({ error: 'Super admin access required' });
    const { module, enabled } = req.body;
    if (!module || typeof enabled !== 'boolean') {
      return res.status(400).json({ error: 'module and enabled required' });
    }
    // Placeholder: persist if you add a module_config table
    console.log(`Module toggle requested: ${module} -> ${enabled}`);
    res.json({ success: true, message: `Module ${module} ${enabled ? 'enabled' : 'disabled'}` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
