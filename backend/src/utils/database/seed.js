const fs = require('fs');
const path = require('path');
const db = require('./connection');

function listBaseSeeders() {
  const dir = path.join(__dirname, 'seeders');
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir).filter((f) => f.endsWith('.sql') || f.endsWith('.js')).sort().map((f) => path.join(dir, f));
}

function listModuleSeeders() {
  const modulesRoot = path.join(__dirname, '..', '..', 'modules');
  if (!fs.existsSync(modulesRoot)) return [];
  const items = [];
  for (const mod of fs.readdirSync(modulesRoot)) {
    const seedDir = path.join(modulesRoot, mod, 'seeders');
    if (!fs.existsSync(seedDir) || !fs.statSync(seedDir).isDirectory()) continue;
    const files = fs.readdirSync(seedDir).filter((f) => f.endsWith('.sql') || f.endsWith('.js')).sort();
    for (const f of files) items.push(path.join(seedDir, f));
  }
  return items;
}

async function run() {
  const files = [...listBaseSeeders(), ...listModuleSeeders()];
  for (const fp of files) {
    const file = path.basename(fp);
    console.log('Running seed:', file);
    if (file.endsWith('.sql')) {
      const sql = fs.readFileSync(fp, 'utf8');
      if (!sql.trim()) continue;
      await db.query(sql);
    } else if (file.endsWith('.js')) {
      const mod = require(fp);
      if (typeof mod.run === 'function') {
        await mod.run(db);
      }
    }
  }
  console.log('Seeding complete');
  process.exit(0);
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
