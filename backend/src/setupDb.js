const fs = require('fs');
const path = require('path');
const { pool } = require('./db');

async function setupDatabase() {
  console.log('Connecting to database to run schema setup...');
  try {
    const schemaPath = path.join(__dirname, '../schema.sql');
    const sql = fs.readFileSync(schemaPath, 'utf8');

    console.log('Executing schema.sql...');
    await pool.query(sql);

    console.log('✅ Database schema setup completed successfully!');
    console.log('Tables created: clusters, articles, ingestion_jobs');
  } catch (err) {
    console.error('❌ Database setup failed:', err.message);
  } finally {
    await pool.end();
  }
}

setupDatabase();
