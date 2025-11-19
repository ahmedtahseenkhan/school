const fs = require('fs');
const path = require('path');
const db = require('./connection');

async function ensureTable() {
  await db.query(`CREATE TABLE IF NOT EXISTS migrations (id SERIAL PRIMARY KEY, name VARCHAR(255) UNIQUE NOT NULL, run_on TIMESTAMP DEFAULT NOW())`);
}

async function run() {
  await ensureTable();
  const dir = path.join(__dirname, 'migrations');
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.sql')).sort();
  for (const f of files) {
    const exists = await db.query('SELECT 1 FROM migrations WHERE name = $1', [f]);
    if (exists.rowCount) { console.log('Already applied:', f); continue; }
    const sql = fs.readFileSync(path.join(dir, f), 'utf8');
    console.log('Applying migration:', f);
    await db.query('BEGIN');
    try { await db.query(sql); await db.query('INSERT INTO migrations (name) VALUES ($1)', [f]); await db.query('COMMIT'); }
    catch (e) { await db.query('ROLLBACK'); console.error('Migration failed:', f, e.message); process.exit(1); }
  }
  console.log('Migrations complete');
  process.exit(0);
}
run().catch(e => { console.error(e); process.exit(1); });
