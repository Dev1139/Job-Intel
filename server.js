// Vanilla Node.js HTTP Server and Live Job Crawler
import http from 'http';
import { handleRequest } from './backend/routes.js';
import { loadCacheFromDisk, crawlPlatformJobs } from './backend/crawler.js';

// Load initial cache from disk if available
loadCacheFromDisk();

// Create Server
const server = http.createServer(handleRequest);

// Start listening
const PORT = 5000;
server.listen(PORT, () => {
  console.log(`Backend API Server running on port ${PORT}`);
  
  // Trigger background crawl on startup (after 5 seconds to let server initialize)
  setTimeout(() => {
    crawlPlatformJobs();
  }, 5000);

  // Setup periodic fetch (every 1 hour)
  setInterval(() => {
    crawlPlatformJobs();
  }, 3600000);
});
