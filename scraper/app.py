"""
Flask Micro-Service for News Pulse Ingestion and Clustering.
Triggered asynchronously via HTTP POST /run from the Node.js API.
"""

import os
import logging
from flask import Flask, request, jsonify
from flask_cors import CORS
from fetcher import fetch_and_normalize_all
from clusterer import build_cluster_payloads
from db import (
    update_job_status,
    save_articles,
    get_articles_for_clustering,
    save_cluster_rebuild_transaction,
    get_db_connection
)

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("newspulse.service")

app = Flask(__name__)
CORS(app)

# In-memory lock set to ensure Python processing idempotency per jobId
PROCESSED_JOBS = set()

@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "ok", "service": "news-pulse-scraper"}), 200

@app.route("/run", methods=["POST"])
def run_ingestion():
    data = request.get_json() or {}
    job_id = data.get("jobId")
    
    if not job_id:
        return jsonify({"error": "jobId is required"}), 400

    # Quick in-memory optimization — avoids redundant DB query on retries
    if job_id in PROCESSED_JOBS:
        logger.info(f"Job {job_id} is already processed or processing (in-memory cache hit).")
        return jsonify({"message": "Job already processing", "jobId": job_id}), 200

    # PostgreSQL is the source of truth for job idempotency
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute(
            "SELECT status FROM ingestion_jobs WHERE id = %s",
            (job_id,)
        )
        row = cursor.fetchone()
        conn.close()
        
        if row and row[0] in ("running", "completed"):
            PROCESSED_JOBS.add(job_id)
            logger.info(f"Job {job_id} already has DB status '{row[0]}' — skipping.")
            return jsonify({"message": f"Job already {row[0]}", "jobId": job_id}), 200
    except Exception as e:
        logger.warning(f"DB idempotency check failed for {job_id}: {e}")

    PROCESSED_JOBS.add(job_id)
    
    # Progress callback helper
    def progress_cb(step_name, step_num, percent):
        update_job_status(job_id, status="running", step=step_name, step_number=step_num, progress=percent)
        
    try:
        logger.info(f"Starting ingestion run for job {job_id}")
        progress_cb("Fetching feeds", 1, 10)
        
        # 1. Fetch & normalize RSS articles
        normalized_articles = fetch_and_normalize_all(progress_callback=progress_cb)
        found_count = len(normalized_articles)
        
        # 2. Save articles to database (ON CONFLICT DO NOTHING)
        inserted_count, skipped_count = save_articles(normalized_articles)
        logger.info(f"Saved articles: {inserted_count} new, {skipped_count} skipped duplicates.")
        
        # 3. Topic Clustering
        progress_cb("Grouping topics", 3, 60)
        active_articles = get_articles_for_clustering(time_window_hours=48)
        logger.info(f"Clustering {len(active_articles)} articles from active time window...")
        
        cluster_payloads = build_cluster_payloads(active_articles)
        
        # 4. Atomic Transaction DB Rebuild
        progress_cb("Updating timeline", 4, 85)
        clusters_created = save_cluster_rebuild_transaction(cluster_payloads)
        logger.info(f"Successfully created {clusters_created} clusters in atomic transaction.")
        
        # 5. Mark Completed
        update_job_status(
            job_id,
            status="completed",
            step="Completed",
            step_number=4,
            progress=100,
            articles_found=found_count,
            articles_new=inserted_count,
            duplicates_skipped=skipped_count,
            clusters_created=clusters_created
        )
        
        return jsonify({
            "status": "completed",
            "jobId": job_id,
            "articlesNew": inserted_count,
            "clustersCreated": clusters_created
        }), 200

    except Exception as e:
        logger.error(f"Error during ingestion run for job {job_id}: {e}", exc_info=True)
        update_job_status(
            job_id,
            status="failed",
            error_message=str(e),
            progress=100
        )
        return jsonify({"error": str(e), "jobId": job_id}), 500

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5001))
    app.run(host="0.0.0.0", port=port, debug=True)
