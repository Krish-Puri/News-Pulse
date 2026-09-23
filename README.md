# News Pulse — Topic-Clustered News Timeline

> A full-stack news intelligence platform that automatically ingests live RSS news feeds, extracts article content, groups stories into real-time topic clusters using TF-IDF and cosine similarity, and renders them in a visual editorial timeline.

---

## 🌟 Overview & Key Features

- **Editorial Light Design Tokens**: Modern light editorial aesthetic featuring tailored color palettes, serif header typography (Playfair Display / Inter), and micro-animations matching Figma specs.
- **Visual Topic Timeline**: Horizontal span bars representing story lifespans, tick marks for individual article publications, and active source indicator dots.
- **Coverage Histogram**: Real-time distribution chart showing news coverage density across time buckets.
- **Source Filtering & Time Windows**: Interactive multi-select source filters with article counters, "Clear all", and time window toggles (12h / 24h / 48h).
- **Responsive Mobile UX**: Dedicated mobile view featuring topic card layouts, mini timeline bars, sticky refresh action bar, and slide-over bottom-sheet cluster details.
- **Live Ingestion Workflow**: Interactive step progress indicator tracking feed parsing, duplicate detection, topic clustering, and database updates.
- **Robust Microservices Architecture**: Decoupled Python ML clusterer, Node.js API gateway, and Next.js frontend with PostgreSQL atomic transaction safety.

---

## 🏗 System Architecture

```mermaid
graph TD
    Client["Client Browser (Next.js / TanStack Query)"]
    NodeAPI["Node.js REST API Gateway (Express)"]
    PyScraper["Python Ingestion Service (Flask + Scikit-Learn)"]
    DB[("Neon PostgreSQL Database")]

    Client -->|GET /timeline, GET /clusters| NodeAPI
    Client -->|POST /ingest/trigger| NodeAPI
    NodeAPI -->|Fetch / Query| DB
    NodeAPI -->|POST /run (Async Trigger)| PyScraper
    PyScraper -->|Pull RSS & Scrape| RSS["Public RSS Feeds (BBC, NPR, Reuters, etc.)"]
    PyScraper -->|TF-IDF + Cosine Clustering| PyScraper
    PyScraper -->|Atomic DB Transaction Rebuild| DB
```

| Component | Technology Stack | Purpose |
|---|---|---|
| **Frontend** | Next.js 16, React 19, TailwindCSS v4, TanStack Query | Responsive light-mode UI, custom SVG timeline, mobile bottom sheets |
| **Backend API** | Node.js, Express, `pg`, Axios | Gateway API, timeline aggregation, job progress polling |
| **Scraper & Clusterer** | Python 3, Flask, scikit-learn, feedparser, trafilatura | Async RSS ingestion, TF-IDF vectorization, similarity clustering |
| **Database** | PostgreSQL (Neon / Local) | Relational store for articles, clusters, and ingestion job idempotency |

---

## 🤖 Data Pipeline & Clustering Algorithm

1. **Feed Ingestion**: Fetches active RSS feeds from BBC, NPR, Reuters, and top news outlets using `feedparser`.
2. **Full-Text Extraction**: Uses `trafilatura` to extract main article text and metadata.
3. **Deduplication**: Enforces strict URL and title normalized hashing (`ON CONFLICT DO NOTHING`).
4. **TF-IDF Vectorization**: Tokenizes title + description combinations, removing English stop words and computing TF-IDF n-gram vectors.
5. **Cosine Similarity Clustering**:
   - Computes pairwise cosine similarity across active articles in the selected window.
   - Groups articles exceeding similarity threshold ($\text{similarity} \ge 0.35$).
   - Computes cluster bounds: $\text{startTime} = \min(\text{publishedAt})$, $\text{endTime} = \max(\text{publishedAt})$.
6. **Atomic Transaction Rebuild**: Replaces active timeline clusters within a PostgreSQL transaction to maintain zero downtime and constant data integrity.

---

## 📡 API Specification

### 1. Timeline & Clusters

#### `GET /api/timeline?window=24h`
Returns aggregated cluster timeline data for the given time window (`12h`, `24h`, or `48h`).
- **Response**:
  ```json
  {
    "meta": {
      "totalArticles": 56,
      "totalClusters": 10,
      "sourceCount": 4,
      "sources": ["BBC", "NPR", "Reuters", "Guardian"],
      "windowStart": "2026-09-22T05:00:00Z",
      "windowEnd": "2026-09-23T19:00:00Z"
    },
    "sourceCounts": { "BBC": 18, "NPR": 12, "Reuters": 16, "Guardian": 10 },
    "clusters": [
      {
        "id": 1,
        "label": "Global Tech Policy",
        "startTime": "2026-09-22T06:30:00Z",
        "endTime": "2026-09-23T18:15:00Z",
        "articleCount": 6,
        "sources": ["BBC", "Reuters"],
        "articles": [...]
      }
    ]
  }
  ```

#### `GET /api/clusters`
Returns a summary list of all topic clusters.

#### `GET /api/clusters/:id`
Returns full cluster details including full article text, publication dates, and source metadata.

### 2. Ingestion & Job Status

#### `POST /api/ingest/trigger`
Triggers an asynchronous RSS fetch and clustering job.
- **Response (202 Accepted)**:
  ```json
  {
    "jobId": "c8ec0f45-704b-42bb-876a-685c39307b3f",
    "status": "pending",
    "message": "Ingestion job created"
  }
  ```
- **Response (409 Conflict)**: Returned if an ingestion job is already running.

#### `GET /api/ingest/status/:jobId`
Returns real-time job step progress (`Fetching feeds` $\rightarrow$ `Grouping topics` $\rightarrow$ `Updating timeline`).

---

## 🛠 Local Setup & Installation

### Prerequisites
- Node.js v18+ & `npm`
- Python 3.10+ & `pip`
- PostgreSQL database (or Neon connection string)

### 1. Database Setup
Set your environment variables in `backend/.env` and `scraper/.env`:
```env
DATABASE_URL=postgres://user:password@localhost:5432/newspulse
```

Initialize the database schema:
```bash
cd backend
npm run setup-db
```

### 2. Run Python Microservice
```bash
cd scraper
python -m venv venv
# On Windows: venv\Scripts\activate | On Linux/macOS: source venv/bin/activate
pip install -r requirements.txt
python app.py
```
*Runs on `http://localhost:5001`.*

### 3. Run Node.js API Server
```bash
cd backend
npm install
npm run dev
```
*Runs on `http://localhost:5000`.*

### 4. Run Next.js Frontend
```bash
cd frontend
npm install
npm run dev
```
*Open `http://localhost:3000` in your browser.*

---

## 🚀 Deployment Guide

### 1. Database (Neon)
1. Create a PostgreSQL project on Neon.
2. Run `npm run setup-db` using your Neon pooled connection string.

### 2. Python Scraper (Render)
1. Create a new **Web Service** on Render pointing to `/scraper`.
2. Environment: `Python 3.10`
3. Build Command: `pip install -r requirements.txt`
4. Start Command: `gunicorn app:app --bind 0.0.0.0:$PORT`
5. Set `DATABASE_URL` environment variable.

### 3. Node.js API (Render)
1. Create a new **Web Service** on Render pointing to `/backend`.
2. Environment: `Node`
3. Build Command: `npm install`
4. Start Command: `node src/index.js`
5. Set `DATABASE_URL` and `PYTHON_SERVICE_URL` environment variables.

### 4. Frontend (Vercel)
1. Import repository to Vercel, setting Root Directory to `frontend`.
2. Framework Preset: `Next.js`
3. Set environment variable: `NEXT_PUBLIC_API_URL=https://<your-node-api>.onrender.com/api`

---

## 📄 License

MIT License. Designed for News Pulse Assessment.
