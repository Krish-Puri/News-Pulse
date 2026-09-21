"""
Fetcher module — retrieves RSS feeds and extracts full article body text.
"""

import logging
import feedparser
import trafilatura
from feeds import FEEDS
from normalizer import normalize_article

logger = logging.getLogger("newspulse.fetcher")

def fetch_feed_entries(feed_config):
    """
    Fetch and parse a single RSS feed.
    Tries primary URL first, followed by fallbacks if provided.
    """
    urls_to_try = [feed_config["url"]] + feed_config.get("fallback_urls", [])
    
    for url in urls_to_try:
        try:
            logger.info(f"Fetching RSS feed for {feed_config['source_label']}: {url}")
            feed = feedparser.parse(url)
            if feed.entries and len(feed.entries) > 0:
                logger.info(f"Successfully fetched {len(feed.entries)} entries from {feed_config['source_label']}")
                return feed.entries
        except Exception as e:
            logger.warning(f"Failed to fetch feed {url}: {e}")
            
    logger.error(f"All feed URLs failed for {feed_config['source_label']}")
    return []

def extract_article_body(url):
    """
    Extract full text content from an article page using trafilatura.
    Returns (body_text, extraction_ok).
    """
    if not url:
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
        logger.warning(f"Trafilatura extraction exception for {url}: {e}")
        return "", False

def fetch_and_normalize_all(progress_callback=None):
    """
    Fetch articles from all configured feeds, normalize them, and extract body text.
    Calls progress_callback(step_name, step_num, percent) if provided.
    """
    all_normalized = []
    total_feeds = len(FEEDS)
    
    for i, feed_config in enumerate(FEEDS):
        if progress_callback:
            percent = int(10 + (i / total_feeds) * 35)
            progress_callback("Fetching feeds", 1, percent)
            
        entries = fetch_feed_entries(feed_config)
        for entry in entries:
            norm = normalize_article(entry, feed_config)
            if norm:
                all_normalized.append(norm)
                
    # Extract body text for articles
    total_articles = len(all_normalized)
    logger.info(f"Starting body text extraction for {total_articles} articles...")
    
    for i, article in enumerate(all_normalized):
        if progress_callback and total_articles > 0:
            percent = int(10 + (i / total_articles) * 40)
            progress_callback("Extracting articles", 2, percent)
            
        # Extract body text (optional fallback to summary if fails)
        body_text, ok = extract_article_body(article["url"])
        article["body_text"] = body_text if ok else article["description"]
        article["extraction_ok"] = ok
        
    return all_normalized
