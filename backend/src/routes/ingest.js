const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const axios = require('axios');
const db = require('../db');

const PYTHON_SERVICE_URL = process.env.PYTHON_SERVICE_URL || 'http://localhost:5001';

/**
 * POST /ingest/trigger
 * Trigger an ingestion & clustering run. Returns 409 if a job is currently active.
 * Automatically cleans up stale jobs created > 3 minutes ago.
 */
router.post('/trigger', async (req, res) => {
  try {
    // 1. Cleanup stale jobs stuck in pending or running for > 3 minutes
    const staleCleanupQuery = `
      UPDATE ingestion_jobs
      SET status = 'failed', error_message = 'Job timed out after 3 minutes of inactivity'
      WHERE status IN ('pending', 'running')
        AND created_at < NOW() - INTERVAL '3 minutes';
    `;
    await db.query(staleCleanupQuery);

    // 2. Check for active (pending or running) ingestion job
    const activeCheckQuery = `
      SELECT id, status, created_at FROM ingestion_jobs
      WHERE status IN ('pending', 'running')
      ORDER BY created_at DESC
      LIMIT 1;
    `;
    const activeRes = await db.query(activeCheckQuery);

    if (activeRes.rows.length > 0) {
      const activeJob = activeRes.rows[0];
      return res.status(409).json({
        error: 'An ingestion job is already in progress',
        existingJobId: activeJob.id,
        status: activeJob.status
      });
    }

    // 3. Create new pending job record
    const jobId = uuidv4();
    const insertJobQuery = `
      INSERT INTO ingestion_jobs (id, status, step, step_number, progress, started_at)
      VALUES ($1, 'pending', 'Fetching feeds', 1, 10, NOW())
      RETURNING id, status;
    `;
    await db.query(insertJobQuery, [jobId]);

    // 4. Trigger Python service asynchronously (retry loop to tolerate cold starts)
    const triggerPythonService = async (attempt = 1) => {
      try {
        console.log(`[INGEST] Triggering Python service (Attempt ${attempt}) for job ${jobId}...`);
        await axios.post(`${PYTHON_SERVICE_URL}/run`, { jobId }, { timeout: 45000 });
      } catch (err) {
        console.warn(`[INGEST] Python trigger attempt ${attempt} warning/error: ${err.message}`);
        if (attempt < 3) {
          setTimeout(() => triggerPythonService(attempt + 1), 3000);
        } else {
          await db.query(
            `UPDATE ingestion_jobs SET status = 'failed', error_message = $1 WHERE id = $2 AND status = 'pending'`,
            [`Python scraper service unreachable: ${err.message}`, jobId]
          );
        }
      }
    };

    // Fire & forget python trigger asynchronously
    triggerPythonService();

    return res.status(202).json({
      jobId,
      status: 'pending',
      message: 'Ingestion job created'
    });

  } catch (error) {
    console.error('Error in POST /ingest/trigger:', error);
    return res.status(500).json({ error: 'Failed to trigger ingestion job' });
  }
});

/**
 * GET /ingest/status/:jobId
 * Check real-time progress of an ingestion job.
 */
router.get('/status/:jobId', async (req, res) => {
  const { jobId } = req.params;

  try {
    const query = `
      SELECT 
        id AS "jobId",
        status,
        step,
        step_number AS "stepNumber",
        total_steps AS "totalSteps",
        progress,
        articles_found AS "articlesFound",
        articles_new AS "articlesNew",
        articles_failed AS "articlesFailed",
        duplicates_skipped AS "duplicatesSkipped",
        clusters_created AS "clustersCreated",
        error_message AS "error",
        started_at AS "startedAt",
        completed_at AS "completedAt"
      FROM ingestion_jobs
      WHERE id = $1;
    `;
    const result = await db.query(query, [jobId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Job not found' });
    }

    return res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error(`Error in GET /ingest/status/${jobId}:`, error);
    return res.status(500).json({ error: 'Failed to fetch job status' });
  }
});

module.exports = router;
