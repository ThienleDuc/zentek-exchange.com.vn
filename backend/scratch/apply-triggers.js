const fs = require('fs');
const path = require('path');
const { poolPromise } = require('../src/config/db');

async function main() {
  try {
    const triggerSqlPath = path.join(__dirname, '../../database/Trigger.sql');
    console.log('Reading Trigger.sql from:', triggerSqlPath);
    const triggerSql = fs.readFileSync(triggerSqlPath, 'utf8');

    // Split SQL by 'GO' statements (on their own lines, case-insensitive)
    const batches = triggerSql
      .split(/\r?\n[gG][oO]\r?\n/)
      .map(batch => batch.trim())
      .filter(batch => batch.length > 0);

    console.log(`Split SQL into ${batches.length} batch(es). Connecting to database...`);
    const pool = await poolPromise;
    console.log('Connected. Executing batches...');

    for (let i = 0; i < batches.length; i++) {
      console.log(`Executing batch ${i + 1}...`);
      await pool.request().query(batches[i]);
    }

    console.log('Triggers successfully applied to the database!');
    process.exit(0);
  } catch (err) {
    console.error('Error applying triggers:', err);
    process.exit(1);
  }
}

main();
