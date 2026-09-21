"""
Article normalizer — cleans and standardizes fields from different RSS feeds.
Includes graceful standard library fallbacks for bs4 and python-dateutil.
"""

import re
from datetime import datetime, timezone

try:
    from dateutil import parser as dateparser
except ImportError:
    dateparser = None

try:
    from bs4 import BeautifulSoup
except ImportError:
    BeautifulSoup = None


def strip_html(text):
    """Remove HTML tags from text, returning plain text."""
    if not text:
        return ""
    if BeautifulSoup is not None:
        try:
            soup = BeautifulSoup(text, "html.parser")
            return soup.get_text(separator=" ", strip=True)
        except Exception:
            pass
    # Standard library regex fallback if bs4 is missing or fails
    clean = re.sub(r"<[^>]+>", " ", text)
    return " ".join(clean.split())


def parse_date(date_str):
    """
    Parse a date string into a timezone-aware UTC datetime.
    Handles RFC 2822, ISO 8601, and various RSS date formats.
    Falls back to current UTC time if parsing fails or dateutil is unavailable.
    """
    if not date_str:
        return datetime.now(timezone.utc)
    
    if dateparser is not None:
        try:
            dt = dateparser.parse(date_str)
            if dt is not None:
                # Make timezone-aware if naive
                if dt.tzinfo is None:
                    dt = dt.replace(tzinfo=timezone.utc)
                return dt
        except (ValueError, OverflowError, Exception):
            pass

    return datetime.now(timezone.utc)


def normalize_article(entry, feed_config):
    """
    Normalize a single RSS entry into a consistent article dict.
    
    Args:
        entry: feedparser entry object
        feed_config: feed configuration dict from feeds.py
    
    Returns:
        dict with keys: url, title, source, description, published_at
        or None if the entry is missing critical fields
    """
    url = (entry.get("link") or "").strip()
    title = strip_html(entry.get("title") or "").strip()
    
    # Skip entries missing URL or title
    if not url or not title:
        return None
    
    # Get description from various possible fields
    description_raw = ""
    if entry.get("summary"):
        description_raw = entry.get("summary")
    elif entry.get("description"):
        description_raw = entry.get("description")
    elif entry.get("content") and len(entry.get("content")) > 0:
        description_raw = entry.get("content")[0].get("value", "")

    description = strip_html(description_raw).strip()
    
    # Truncate very long descriptions
    if len(description) > 1000:
        description = description[:997] + "..."
    
    # Parse publication date from various fields
    date_str = (
        entry.get("published")
        or entry.get("pubDate")
        or entry.get("updated")
        or entry.get("created")
    )
    published_at = parse_date(date_str)
    
    return {
        "url": url,
        "title": title,
        "source": feed_config["source_label"],
        "description": description,
        "published_at": published_at,
    }
