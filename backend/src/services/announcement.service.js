const db = require('../utils/database/connection');

exports.listPublished = async () => {
  const { rows } = await db.query(
    `SELECT id, title, content, category, priority, target_audience, publish_date, expiry_date, is_published, created_by
     FROM announcements
     WHERE is_published = TRUE AND (expiry_date IS NULL OR expiry_date > NOW())
     ORDER BY publish_date DESC`
  );
  return rows;
};

exports.create = async (payload, actor) => {
  if (!['super_admin','admin','principal'].includes(actor.role)) {
    const err = new Error('Forbidden'); err.status = 403; throw err;
  }
  const { title, content, category = 'general', priority = 'medium', target_audience = 'all', publish_date = new Date(), expiry_date = null, is_published = false } = payload;
  const { rows } = await db.query(
    `INSERT INTO announcements (title, content, category, priority, target_audience, publish_date, expiry_date, is_published, created_by)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
     RETURNING id, title, content, category, priority, target_audience, publish_date, expiry_date, is_published, created_by`,
    [title, content, category, priority, target_audience, publish_date, expiry_date, is_published, actor.id]
  );
  return rows[0];
};
