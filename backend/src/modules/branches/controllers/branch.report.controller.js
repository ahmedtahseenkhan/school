const db = require('../../../utils/database/connection');

exports.overview = async (req, res, next) => {
  try {
    const { id } = req.params;
    const [{ rows: students }, { rows: staff }, { rows: activeUsers }] = await Promise.all([
      db.query("SELECT COUNT(*)::int AS count FROM users WHERE role = 'student' AND branch_id = $1", [id]),
      db.query("SELECT COUNT(*)::int AS count FROM users WHERE role IN ('teacher','accountant','librarian','principal') AND branch_id = $1", [id]),
      db.query("SELECT COUNT(*)::int AS count FROM users WHERE status = 'active' AND branch_id = $1", [id])
    ]);
    res.json({
      branch_id: id,
      total_students: students[0]?.count || 0,
      total_staff: staff[0]?.count || 0,
      active_users: activeUsers[0]?.count || 0,
      revenue: 0,
      alerts: []
    });
  } catch (e) { next(e); }
};

exports.overviewAll = async (_req, res, next) => {
  try {
    const [{ rows: branches }, { rows: students }, { rows: staff }, { rows: activeUsers }] = await Promise.all([
      db.query("SELECT id, name, code, is_active FROM branches ORDER BY name ASC"),
      db.query("SELECT branch_id, COUNT(*)::int AS count FROM users WHERE role = 'student' GROUP BY branch_id"),
      db.query("SELECT branch_id, COUNT(*)::int AS count FROM users WHERE role IN ('teacher','accountant','librarian','principal') GROUP BY branch_id"),
      db.query("SELECT branch_id, COUNT(*)::int AS count FROM users WHERE status = 'active' GROUP BY branch_id")
    ]);

    const mapCount = (rows) => rows.reduce((acc, r) => { acc[r.branch_id || 'null'] = r.count; return acc; }, {});
    const sMap = mapCount(students);
    const stMap = mapCount(staff);
    const aMap = mapCount(activeUsers);

    const items = branches.map(b => ({
      id: b.id,
      name: b.name,
      code: b.code,
      is_active: b.is_active,
      total_students: sMap[b.id] || 0,
      total_staff: stMap[b.id] || 0,
      active_users: aMap[b.id] || 0,
      revenue: 0
    }));

    const totals = items.reduce((t, i) => ({
      branches: (t.branches || 0) + 1,
      total_students: (t.total_students || 0) + i.total_students,
      total_staff: (t.total_staff || 0) + i.total_staff,
      active_users: (t.active_users || 0) + i.active_users,
      revenue: (t.revenue || 0) + i.revenue
    }), {});

    res.json({ totals, items });
  } catch (e) { next(e); }
};
