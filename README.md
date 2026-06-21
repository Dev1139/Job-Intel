# 🚀 Magical Hubble: Tech Job Search Engine & Application Tracker

**Magical Hubble** is a modern, high-performance, and feature-rich Technical Job Aggregator & Application Tracking system. It is designed to act as a centralized dashboard for developers, engineers, and tech professionals to discover live job openings, filter by location (including remote and major Indian tech hubs), analyze hiring patterns, track job applications, and access preparation resources.

The application fetches actual live job data directly from corporate ATS platforms (Greenhouse, Lever, etc.) in real-time, completely bypassing outdated or static mocks.

---

## ✨ Key Features

- **🌐 Live ATS Crawler & Scraper**: Real-time Node.js crawler that extracts live job listings from target company career portals. Features an automatic hourly update cycle and manual crawl trigger.
- **📍 Detailed Geographical Filters**: Specific location filter supporting:
  - Work-from-home/Remote roles
  - Pan-India search
  - Indian regional tech hubs (Bengaluru, Delhi NCR, Mumbai/Pune, Hyderabad/Chennai)
  - International opportunities
- **📋 Job Application Status Tracker**: Keep track of the job lifecycle from discovery to offer.
  - Track statuses: `Wishlist`, `Applied`, `Interviewing`, `Offer Received`, and `Rejected`.
  - Stays persistently saved in the browser's `localStorage` across page reloads.
- **💡 Rich Metadata & Preparation Resources**:
  - **Meta Details**: Accurate compensation package (CTC) estimates, required experience levels, and skill tags.
  - **Future Hiring Predictions**: Information on future team expansion/hiring roadmaps (e.g., plans to hire in 6 months or 1 year).
  - **Interview Insights**: Clear breakdown of company-specific hiring processes, how to apply, study resources, and "what they mainly ask".
- **📊 Interactive Dashboard Analytics**: Rich charts and metrics demonstrating distribution of jobs by experience levels, active application counts, and live crawler health monitoring.
- **🎨 Premium Dark UI**: Elegant, dark-themed user interface utilizing glassmorphism, smooth animations, dynamic badge states, and responsive sidebar navigation.

---

## 🏗️ Architecture

The project is structured with a modular, lightweight architecture:

```
├── backend/                  # Vanilla Node.js API server & scraper
│   ├── crawler.js            # Scrapes Greenhouse/Lever jobs and handles caching
│   ├── routes.js             # API route handlers (jobs, analytics, status, crawl)
│   ├── analytics.js          # Aggregates job cache stats for dashboard
│   ├── atsParsers.js         # Dedicated parsers for different ATS structures
│   └── helpers.js            # General utilities and logger
├── scripts/                  # Seed scripts and CLI database tools
│   └── seedRegistry.js       # Sets up default tracked target companies
├── src/                      # Frontend Application (React + Vite)
│   ├── components/
│   │   ├── Dashboard.jsx         # System overview, stats, and charts
│   │   ├── JobList.jsx           # Main job grid, advanced search, and filters
│   │   ├── SavedJobs.jsx         # Status tracker & kanban/board metrics
│   │   ├── CompanyDirectory.jsx  # Tracked company list and health status
│   │   ├── ProfileModal.jsx      # Settings, skills preferences
│   │   └── Icons.jsx             # Reusable SVG vector icons
│   ├── data/
│   │   ├── companies_registry.json # Initial companies to track
│   │   └── jobs_cache.json         # Local crawler cache containing live crawled jobs
│   ├── App.jsx               # Application shell, router, and state manager
│   ├── index.css             # Elegant visual design tokens & custom styling
│   └── main.jsx              # React entry mount
└── server.js                 # Backend server entry point
```

---

## 🛠️ Installation & Setup

Ensure you have [Node.js](https://nodejs.org/) installed (v18+ recommended).

### 1. Clone & Install Dependencies
```bash
# Clone the repository
git clone <your-repository-url>
cd magical-hubble

# Install frontend and backend dependencies
npm install
```

### 2. Start the Backend API Server
The backend runs a vanilla HTTP server on port `5000` and initializes the crawler.
```bash
node server.js
```
*Upon startup, the server automatically reads `src/data/jobs_cache.json` and schedules a background live crawl.*

### 3. Start the Frontend Dev Server
The frontend runs on port `5173`.
```bash
npm run dev
```
Open your browser and navigate to `http://localhost:5173` to explore the dashboard.

---

## ⚙️ How the Live Crawler Works

1. The crawler loads a list of verified technical companies from `companies_registry.json`.
2. It fetches jobs from target companies' primary ATS portals (e.g., Lever, Greenhouse).
3. The raw HTML/JSON response is parsed asynchronously using customized sanitizers to isolate tech jobs, locations, salaries, and description details.
4. Jobs are cached locally in `src/data/jobs_cache.json` to prevent unnecessary API rate limiting and provide immediate load times.
5. The frontend communicates with the backend via `http://localhost:5000/api/jobs`.

---

## 🧪 Development & Quality Assurance

- **Linting**:
  Run code style analysis:
  ```bash
  npm run lint
  ```
- **Production Build**:
  Compile optimized static assets:
  ```bash
  npm run build
  ```
- **Local Preview**:
  Preview the production build locally:
  ```bash
  npm run preview
  ```
