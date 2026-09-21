"""
Article normalizer — cleans and standardizes fields from different RSS feeds.
"""

import re
from datetime import datetime, timezone
from dateutil import parser as dateparser
from bs4 import BeautifulSoup


def strip_html(text):
    """Remove HTML tags from text, returning plain text."""
    if not text:
        return ""
    soup = BeautifulSoup(text, "html.parser")
    return soup.get_text(separator=" ", strip=True)


def parse_date(date_str):
    """
    Parse a date string into a timezone-aware UTC datetime.
    Handles RFC 2822, ISO 8601, and various RSS date formats.
    Falls back to current UTC time if parsing fails.
    """
    if not date_str:
        return datetime.now(timezone.utc)
    
    try:
        dt = dateparser.parse(date_str)
        if dt is None:
            return datetime.now(timezone.utc)
        # Make timezone-aware if naive
        if dt.tzinfo is None:
            dt = dt.replace(tzinfo=timezone.utc)
        return dt
    except (ValueError, OverflowError):
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
    description_raw = (
        entry.get("summary")
        or entry.get("description")
        or entry.get("content", [{}])[0].get("value", "") if entry.get("content") else ""
        or ""
    )
    description = strip_html(description_raw).strip()
    
    # Truncate very long descriptions (some feeds include full body)
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
