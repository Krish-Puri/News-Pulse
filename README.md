# News Pulse — Topic-Clustered News Timeline

> A full-stack news intelligence application that pulls live articles from public RSS feeds, automatically groups them into topic clusters, and presents the results as a polished visual timeline.

**🚧 Under Construction** — Implementation in progress.

## Architecture

| Component | Technology | Hosting |
|---|---|---|
| Scraper/Clustering | Python (Flask, scikit-learn, trafilatura) | Render (Free) |
| Backend API | Node.js (Express, pg) | Render (Free) |
| Frontend | Next.js / React (TanStack Query) | Vercel (Free) |
| Database | PostgreSQL | Neon (Free) |

## Repository Structure

```
/scraper    → Python: RSS ingestion, article extraction, topic clustering
/backend    → Node.js: REST API serving clusters, articles, and timeline data
/frontend   → Next.js: Timeline visualization and cluster explorer
```

## Setup

_Coming soon — see implementation plan for details._
