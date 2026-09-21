import requests
import feedparser

urls = [
    "https://news.google.com/rss/search?q=site:reuters.com&hl=en-US&gl=US&ceid=US:en",
    "https://news.google.com/rss/search?q=reuters+world&hl=en-US&gl=US&ceid=US:en",
    "https://www.aljazeera.com/xml/rss/all.xml"
]

headers = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"}

for url in urls:
    try:
        r = requests.get(url, headers=headers, timeout=8)
        print(f"URL: {url}")
        print(f"  Status: {r.status_code}")
        if r.status_code == 200:
            feed = feedparser.parse(r.content)
            count = len(feed.entries) if feed.entries else 0
            print(f"  Parsed entries: {count}")
    except Exception as e:
        print(f"URL: {url} -> Error: {e}")
