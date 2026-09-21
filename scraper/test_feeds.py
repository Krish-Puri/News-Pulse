import requests
import feedparser
from feeds import FEEDS

def test_feed(feed_config):
    url = feed_config["url"]
    label = feed_config["source_label"]
    headers = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"}
    
    print(f"Testing {label} -> {url}...")
    try:
        resp = requests.get(url, headers=headers, timeout=10)
        print(f"  HTTP Status: {resp.status_code}")
        if resp.status_code == 200:
            feed = feedparser.parse(resp.content)
            entries_count = len(feed.entries) if feed.entries else 0
            print(f"  Parsing: SUCCESS, Entries found: {entries_count}")
            return {
                "source": label,
                "url": url,
                "http_status": resp.status_code,
                "response": "YES",
                "parsing": "YES" if entries_count > 0 else "NO",
                "count": entries_count
            }
        else:
            print(f"  HTTP Error: {resp.status_code}")
            return {
                "source": label,
                "url": url,
                "http_status": resp.status_code,
                "response": "YES",
                "parsing": "NO",
                "count": 0
            }
    except Exception as e:
        print(f"  Exception for {label}: {e}")
        return {
            "source": label,
            "url": url,
            "http_status": "TIMEOUT / ERROR",
            "response": "NO",
            "parsing": "NO",
            "count": 0
        }

if __name__ == "__main__":
    results = []
    for f in FEEDS:
        res = test_feed(f)
        results.append(res)
    print("\n--- TEST SUMMARY ---")
    for r in results:
        print(f"{r['source']:10} | {r['url'][:40]:40} | HTTP {r['http_status']} | Response: {r['response']} | Parse: {r['parsing']} | Count: {r['count']}")
