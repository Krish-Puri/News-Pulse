const db = require('./db');

async function clearStaleJobs() {
  try {
    const res = await db.query(`
      UPDATE ingestion_jobs
      SET status = 'failed', error_message = 'Reset stale job'
      WHERE status IN ('pending', 'running')
      RETURNING id, status;
    `);
    console.log(`Cleared ${res.rows.length} stale job(s) from database.`);
  } catch (err) {
    console.error('Error clearing stale jobs:', err);
  } finally {
    process.exit(0);
  }
}

clearStaleJobs();
