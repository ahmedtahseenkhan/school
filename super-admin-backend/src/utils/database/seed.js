const fs = require('fs');
const path = require('path');
const db = require('./connection');

async function run() {
  const dir = path.join(__dirname, 'seeds');
  if (!fs.existsSync(dir)) return;
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.sql')).sort();
  for (const file of files) {
    const sql = fs.readFileSync(path.join(dir, file), 'utf8');
    if (!sql.trim()) continue;
    console.log('Running seed:', file);
    await db.query(sql);
  }
  console.log('Seeding complete');
  process.exit(0);
}
run().catch(err => { console.error(err); process.exit(1); });
