const express = require('express');
const cors = require('cors');
require('dotenv').config();

const clustersRouter = require('./routes/clusters');
const timelineRouter = require('./routes/timeline');
const ingestRouter = require('./routes/ingest');

const app = express();
const PORT = process.env.PORT || 5000;

// Environment-aware CORS configuration
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  'http://127.0.0.1:3000',
  process.env.CORS_ORIGIN
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, curl, server-to-server)
    if (!origin || allowedOrigins.includes('*') || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(null, true); // Fallback allow in dev
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
}));

app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    console.log(`${req.method} ${req.originalUrl} ${res.statusCode} ${Date.now() - start}ms`);
  });
  next();
});

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', service: 'news-pulse-backend' });
});

// Mount routes
app.use('/clusters', clustersRouter);
app.use('/timeline', timelineRouter);
app.use('/ingest', ingestRouter);

// Centralized error handler
app.use((err, req, res, next) => {
  console.error('Unhandled server error:', err);
  res.status(500).json({ error: 'Internal Server Error', message: err.message });
});

app.listen(PORT, () => {
  console.log(`News Pulse Node.js REST API listening on port ${PORT}`);
});
