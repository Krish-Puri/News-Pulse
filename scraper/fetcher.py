"""
Fetcher module — retrieves RSS feeds with explicit timeouts and extracts article body text.
Includes resilient fallback to feed summaries if trafilatura body extraction fails or times out.
"""

import logging
import requests
import feedparser

try:
    import trafilatura
except ImportError:
    trafilatura = None

from feeds import FEEDS
from normalizer import normalize_article

logger = logging.getLogger("newspulse.fetcher")

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36"
}

def fetch_feed_entries(feed_config):
    """
    Fetch and parse a single RSS feed with explicit 10s timeout.
    Tries primary URL first, followed by fallbacks if provided.
    """
    urls_to_try = [feed_config["url"]] + feed_config.get("fallback_urls", [])
    
    for url in urls_to_try:
        try:
            logger.info(f"[INGEST] Fetching {feed_config['source_label']}: {url}")
            resp = requests.get(url, headers=HEADERS, timeout=10)
            
            if resp.status_code == 200 and resp.content:
                feed = feedparser.parse(resp.content)
                if feed.entries and len(feed.entries) > 0:
                    logger.info(f"[INGEST] {feed_config['source_label']} returned {len(feed.entries)} items (HTTP {resp.status_code})")
                    return feed.entries
            else:
                logger.warning(f"[INGEST] {feed_config['source_label']} returned HTTP {resp.status_code} for {url}")
        except Exception as e:
            logger.warning(f"[INGEST] Exception fetching {feed_config['source_label']} ({url}): {e}")
            
    logger.error(f"[INGEST] All feed URLs failed for {feed_config['source_label']}")
    return []

def extract_article_body(url):
    """
    Extract full text content from an article page using trafilatura with safety timeout.
    Returns (body_text, extraction_ok).
    """
    if not url or trafilatura is None:
        return "", False
    
    try:
        downloaded = trafilatura.fetch_url(url)
        if downloaded is None:
            return "", False
        
        extracted = trafilatura.extract(
            downloaded,
            include_comments=False,
            include_tables=False,
            no_fallback=False
        )
        
        if extracted and len(extracted.strip()) >= 50:
            return extracted.strip(), True
        return "", False
    except Exception as e:
        logger.warning(f"[INGEST] Trafilatura extraction exception for {url}: {e}")
        return "", False

def fetch_and_normalize_all(progress_callback=None):
    """
    Fetch articles from all configured feeds, normalize them, and extract body text.
    Tolerates individual feed failures gracefully.
    Calls progress_callback(step_name, step_num, percent) if provided.
    """
    all_normalized = []
    total_feeds = len(FEEDS)
    
    for i, feed_config in enumerate(FEEDS):
        if progress_callback:
            percent = int(10 + (i / total_feeds) * 25)
            progress_callback("Fetching feeds", 1, percent)
            
        entries = fetch_feed_entries(feed_config)
        for entry in entries:
            norm = normalize_article(entry, feed_config)
            if norm:
                all_normalized.append(norm)
                
    total_articles = len(all_normalized)
    logger.info(f"[INGEST] Fetch complete. Total normalized articles: {total_articles}")
    
    # Body extraction phase (capped for performance)
    articles_to_extract = all_normalized[:40]
    
    for i, article in enumerate(all_normalized):
        if progress_callback and total_articles > 0:
            percent = int(35 + (i / total_articles) * 25)
            progress_callback("Extracting articles", 2, percent)
            
        if i < len(articles_to_extract):
            body_text, ok = extract_article_body(article["url"])
            article["body_text"] = body_text if ok else article["description"]
            article["extraction_ok"] = ok
        else:
            article["body_text"] = article["description"]
            article["extraction_ok"] = False
            
    return all_normalized
