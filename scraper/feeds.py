"""
RSS Feed configuration for News Pulse.
Each feed has a name, primary URL, fallbacks, source label, and color for the frontend.
"""

FEEDS = [
    {
        "name": "BBC News",
        "url": "https://feeds.bbci.co.uk/news/world/rss.xml",
        "source_label": "BBC",
        "color": "#DC2626"
    },
    {
        "name": "NPR News",
        "url": "https://feeds.npr.org/1001/rss.xml",
        "source_label": "NPR",
        "color": "#2563EB"
    },
    {
        "name": "Reuters",
        "url": "https://news.google.com/rss/search?q=site:reuters.com&hl=en-US&gl=US&ceid=US:en",
        "source_label": "Reuters",
        "color": "#D97706",
        "fallback_urls": [
            "https://news.google.com/rss/search?q=reuters+world&hl=en-US&gl=US&ceid=US:en"
        ]
    },
    {
        "name": "The Guardian",
        "url": "https://www.theguardian.com/world/rss",
        "source_label": "Guardian",
        "color": "#059669"
    }
]
