const fs = require('fs');
const path = require('path');
const db = require('./connection');

async function ensureMigrationsTable() {
  await db.query(`CREATE TABLE IF NOT EXISTS migrations (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) UNIQUE NOT NULL,
    run_on TIMESTAMP DEFAULT NOW()
  )`);
}

function listBaseMigrations() {
  const baseDir = path.join(__dirname, 'migrations');
  if (!fs.existsSync(baseDir)) return [];
  return fs
    .readdirSync(baseDir)
    .filter((f) => f.endsWith('.sql'))
    .sort()
    .map((f) => ({ key: f, file: path.join(baseDir, f) }));
}

function listModuleMigrations() {
  const modulesRoot = path.join(__dirname, '..', '..', 'modules');
  if (!fs.existsSync(modulesRoot)) return [];
  const items = [];
  for (const mod of fs.readdirSync(modulesRoot)) {
    const migDir = path.join(modulesRoot, mod, 'migrations');
    if (!fs.existsSync(migDir) || !fs.statSync(migDir).isDirectory()) continue;
    const files = fs.readdirSync(migDir).filter((f) => f.endsWith('.sql')).sort();
    for (const f of files) {
      items.push({ key: `${mod}/${f}`, file: path.join(migDir, f) });
    }
  }
  // Global sort by key to ensure deterministic ordering across modules
  return items.sort((a, b) => a.key.localeCompare(b.key));
}

async function run() {
  await ensureMigrationsTable();
  const all = [...listBaseMigrations(), ...listModuleMigrations()];
  for (const entry of all) {
    const { rows } = await db.query('SELECT 1 FROM migrations WHERE name = $1', [entry.key]);
    if (rows.length) {
      console.log('Already applied:', entry.key);
      continue;
    }
    const sql = fs.readFileSync(entry.file, 'utf8');
    if (!sql.trim()) continue;
    console.log('Applying migration:', entry.key);
    await db.query('BEGIN');
    try {
      await db.query(sql);
      await db.query('INSERT INTO migrations (name) VALUES ($1)', [entry.key]);
      await db.query('COMMIT');
    } catch (err) {
      await db.query('ROLLBACK');
      console.error('Migration failed:', entry.key, err.message);
      process.exit(1);
    }
  }
  console.log('Migrations complete');
  process.exit(0);
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
