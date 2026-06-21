import { jobsCache, crawlerStatus, crawlPlatformJobs } from './crawler.js';
import { calculateAnalytics } from './analytics.js';

export function handleRequest(req, res) {
  // CORS configuration
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  const url = new URL(req.url, `http://${req.headers.host}`);

  // Endpoint: GET /api/jobs
  if (url.pathname === '/api/jobs' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(jobsCache));
  } 
  
  // Endpoint: GET /api/analytics
  else if (url.pathname === '/api/analytics' && req.method === 'GET') {
    const analytics = calculateAnalytics();
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(analytics));
  } 
  
  // Endpoint: GET /api/status (Crawler status monitoring)
  else if (url.pathname === '/api/status' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(crawlerStatus));
  } 
  
  // Endpoint: GET /api/crawl (Manual crawl trigger)
  else if (url.pathname === '/api/crawl' && req.method === 'GET') {
    if (!crawlerStatus.isCrawling) {
      crawlPlatformJobs();
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ message: "Crawl triggered successfully." }));
    } else {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: "Crawler is already active." }));
    }
  } 
  
  // 404 Fallback
  else {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not Found');
  }
}
