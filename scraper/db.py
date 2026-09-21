"""
Database helper module for News Pulse Python service.
Uses psycopg2 for PostgreSQL connections with environment variable configuration.
"""

import os
import psycopg2
from psycopg2.extras import RealDictCursor, execute_values

def get_db_connection():
    """Get a database connection using DATABASE_URL env var."""
    db_url = os.environ.get("DATABASE_URL", "postgresql://postgres:postgres@localhost:5432/newspulse")
    conn = psycopg2.connect(db_url, sslmode="prefer")
    return conn

def update_job_status(job_id, status=None, step=None, step_number=None, progress=None,
                      articles_found=None, articles_new=None, articles_failed=None,
                      duplicates_skipped=None, clusters_created=None, error_message=None):
    """Update ingestion job progress and status in the database."""
    if not job_id:
        return
    
    conn = get_db_connection()
    cursor = conn.cursor()
    
    updates = []
    params = []
    
    if status is not None:
        updates.append("status = %s")
        params.append(status)
        if status == "running":
            updates.append("started_at = NOW()")
        elif status in ("completed", "failed"):
            updates.append("completed_at = NOW()")
            
    if step is not None:
        updates.append("step = %s")
        params.append(step)
    if step_number is not None:
        updates.append("step_number = %s")
        params.append(step_number)
    if progress is not None:
        updates.append("progress = %s")
        params.append(progress)
    if articles_found is not None:
        updates.append("articles_found = %s")
        params.append(articles_found)
    if articles_new is not None:
        updates.append("articles_new = %s")
        params.append(articles_new)
    if articles_failed is not None:
        updates.append("articles_failed = %s")
        params.append(articles_failed)
    if duplicates_skipped is not None:
        updates.append("duplicates_skipped = %s")
        params.append(duplicates_skipped)
    if clusters_created is not None:
        updates.append("clusters_created = %s")
        params.append(clusters_created)
    if error_message is not None:
        updates.append("error_message = %s")
        params.append(error_message)
        
    if not updates:
        conn.close()
        return

    params.append(job_id)
    query = f"UPDATE ingestion_jobs SET {', '.join(updates)} WHERE id = %s"
    
    try:
        cursor.execute(query, params)
        conn.commit()
    except Exception as e:
        print(f"Error updating job status: {e}")
        conn.rollback()
    finally:
        conn.close()

def save_articles(articles):
    """
    Save normalized articles into database using ON CONFLICT DO NOTHING.
    Returns tuple: (new_inserted_count, skipped_duplicates_count)
    """
    if not articles:
        return 0, 0
    
    conn = get_db_connection()
    cursor = conn.cursor()
    
    inserted = 0
    skipped = 0
    
    query = """
        INSERT INTO articles (url, title, source, description, body_text, published_at, extraction_ok)
        VALUES (%s, %s, %s, %s, %s, %s, %s)
        ON CONFLICT (url) DO NOTHING;
    """
    
    for a in articles:
        cursor.execute(query, (
            a["url"],
            a["title"],
            a["source"],
            a.get("description"),
            a.get("body_text"),
            a["published_at"],
            a.get("extraction_ok", True)
        ))
        if cursor.rowcount > 0:
            inserted += 1
        else:
            skipped += 1
            
    conn.commit()
    conn.close()
    return inserted, skipped

def get_articles_for_clustering(time_window_hours=48):
    """Fetch all articles from database published in the last time_window_hours."""
    conn = get_db_connection()
    cursor = conn.cursor(cursor_factory=RealDictCursor)
    
    query = """
        SELECT id, url, title, source, description, body_text, published_at
        FROM articles
        WHERE published_at >= NOW() - (%s || ' hours')::INTERVAL
        ORDER BY published_at ASC;
    """
    cursor.execute(query, (time_window_hours,))
    articles = cursor.fetchall()
    conn.close()
    return articles

def save_cluster_rebuild_transaction(clusters_with_articles):
    """
    Atomically rebuild cluster tables inside a single transaction.
    If any error occurs, transaction is rolled back preserving previous state.
    
    clusters_with_articles is a list of dicts:
      {
        'label': str,
        'start_time': datetime,
        'end_time': datetime,
        'article_ids': list[int]
      }
    """
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        # 1. Unlink existing articles
        cursor.execute("UPDATE articles SET cluster_id = NULL;")
        
        # 2. Delete existing clusters
        cursor.execute("DELETE FROM clusters;")
        
        clusters_created = 0
        
        # 3. Insert new clusters & re-link articles
        for c in clusters_with_articles:
            cursor.execute("""
                INSERT INTO clusters (label, start_time, end_time, article_count)
                VALUES (%s, %s, %s, %s)
                RETURNING id;
            """, (c["label"], c["start_time"], c["end_time"], len(c["article_ids"])))
            
            cluster_id = cursor.fetchone()[0]
            clusters_created += 1
            
            # Link articles to new cluster
            cursor.execute("""
                UPDATE articles
                SET cluster_id = %s
                WHERE id = ANY(%s);
            """, (cluster_id, c["article_ids"]))
            
        # Commit transaction atomically
        conn.commit()
        return clusters_created
    except Exception as e:
        conn.rollback()
        raise e
    finally:
        conn.close()
