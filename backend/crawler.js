import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { fetchJobsFromATS, fetchRemoteOKJobs } from './atsParsers.js';
import { detectInterviewInsights, detectBenefitsAndPerks, detectVisaRelocation, detectInterviewPrepDetails } from './helpers.js';


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CACHE_FILE = path.join(__dirname, '../src/data/jobs_cache.json');
const REGISTRY_FILE = path.join(__dirname, '../src/data/companies_registry.json');

// Global State
export let jobsCache = {
  jobs: [],
  companies: [],
  lastCrawlTime: null
};

export let crawlerStatus = {
  isCrawling: false,
  lastSuccessCrawl: null,
  companiesAttempted: 0,
  companiesSucceeded: 0,
  activeJobsCount: 0
};

// Initial Load from Disk
export function loadCacheFromDisk() {
  try {
    if (fs.existsSync(CACHE_FILE)) {
      jobsCache = JSON.parse(fs.readFileSync(CACHE_FILE, 'utf8'));
      crawlerStatus.lastSuccessCrawl = jobsCache.lastCrawlTime;
      crawlerStatus.activeJobsCount = jobsCache.jobs.length;
      console.log(`Loaded ${jobsCache.jobs.length} jobs from cache.`);
    }
  } catch (e) {
    console.error("Could not load initial cache:", e.message);
  }
}

function discoverATSFromUrl(careersUrl) {
  const url = careersUrl.toLowerCase();
  
  if (url.includes('boards.greenhouse.io/')) {
    const slug = url.split('boards.greenhouse.io/')[1].split('/')[0].split('?')[0];
    return { atsType: 'Greenhouse', atsSlug: slug };
  }
  
  if (url.includes('jobs.lever.co/')) {
    const slug = url.split('jobs.lever.co/')[1].split('/')[0].split('?')[0];
    return { atsType: 'Lever', atsSlug: slug };
  }
  
  if (url.includes('jobs.ashbyhq.com/')) {
    const slug = url.split('jobs.ashbyhq.com/')[1].split('/')[0].split('?')[0];
    return { atsType: 'Ashby', atsSlug: slug };
  }
  
  if (url.includes('myworkdayjobs.com/')) {
    try {
      const parsedUrl = new URL(careersUrl);
      const hostParts = parsedUrl.hostname.split('.');
      const slug = hostParts[0];
      return { atsType: 'Workday', atsSlug: slug };
    } catch(e) {}
  }
  
  if (url.includes('smartrecruiters.com/')) {
    const slug = url.split('smartrecruiters.com/')[1].split('/')[0].split('?')[0];
    return { atsType: 'SmartRecruiters', atsSlug: slug };
  }
  
  if (url.includes('bamboohr.com/jobs/')) {
    try {
      const parsedUrl = new URL(careersUrl);
      const hostParts = parsedUrl.hostname.split('.');
      const slug = hostParts[0];
      return { atsType: 'BambooHR', atsSlug: slug };
    } catch(e) {}
  }

  if (url.includes('teamtailor.com/')) {
    try {
      const parsedUrl = new URL(careersUrl);
      const hostParts = parsedUrl.hostname.split('.');
      const slug = hostParts[0];
      return { atsType: 'Teamtailor', atsSlug: slug };
    } catch(e) {}
  }

  if (url.includes('recruitee.com/')) {
    try {
      const parsedUrl = new URL(careersUrl);
      const hostParts = parsedUrl.hostname.split('.');
      const slug = hostParts[0];
      return { atsType: 'Recruitee', atsSlug: slug };
    } catch(e) {}
  }
  
  return null;
}

function calculateQualityScore(job, companyType) {
  let score = 0;
  
  // 1. Salary (30% weight)
  if (job.salaryMax) {
    const salary = Math.min(Math.max(job.salaryMax, 7), 30);
    const ratio = (salary - 7) / (30 - 7);
    score += ratio * 30;
  } else {
    score += 15; // default middle points if not specified
  }
  
  // 2. Recency (30% weight)
  const age = job.ageOfPosting || 0;
  if (age <= 1) score += 30;
  else if (age <= 3) score += 25;
  else if (age <= 7) score += 20;
  else if (age <= 14) score += 15;
  else if (age <= 30) score += 10;
  
  // 3. Reputation (20% weight)
  if (companyType === 'AI-Startup') score += 20;
  else if (companyType === 'Unicorn') score += 20;
  else if (companyType === 'Product') score += 18;
  else if (companyType === 'Remote-First') score += 18;
  else if (companyType === 'YC-Startup') score += 15;
  else if (companyType === 'Startup') score += 12;
  else score += 8; // Service
  
  // 4. Remote Availability (10% weight)
  if (job.workMode === 'Remote') score += 10;
  else if (job.workMode === 'Hybrid') score += 7;
  else score += 4;
  
  // 5. Skills Tag completeness (10% weight)
  const skillsCount = job.skills ? job.skills.length : 0;
  score += Math.min(skillsCount * 2.5, 10);
  
  return Math.round(score);
}

export async function crawlPlatformJobs() {
  if (crawlerStatus.isCrawling) return;
  crawlerStatus.isCrawling = true;
  console.log("Starting background crawl...");

  const todayStr = new Date().toISOString().substring(0, 10);
  
  // Load Company Registry
  let registry = [];
  try {
    if (fs.existsSync(REGISTRY_FILE)) {
      registry = JSON.parse(fs.readFileSync(REGISTRY_FILE, 'utf8'));
    } else {
      console.log("No registry file found. Waiting for seeder.");
      crawlerStatus.isCrawling = false;
      return;
    }
  } catch(e) {
    console.error("Error reading registry:", e.message);
    crawlerStatus.isCrawling = false;
    return;
  }

  crawlerStatus.companiesAttempted = 0;
  crawlerStatus.companiesSucceeded = 0;

  // 1. Fetch RemoteOK
  const allJobs = await fetchRemoteOKJobs(todayStr);
  console.log(`Fetched ${allJobs.length} jobs from RemoteOK`);

  // 2. Discover ATS for companies without one, then crawl active ones
  const queue = [...registry];
  const concurrency = 20;
  const companyJobs = [];

  // Helper worker
  async function worker() {
    while (queue.length > 0) {
      const company = queue.shift();
      crawlerStatus.companiesAttempted++;
      
      // Auto discover ATS if not set
      if (!company.atsType && company.careersUrl) {
        const discovered = discoverATSFromUrl(company.careersUrl);
        if (discovered) {
          company.atsType = discovered.atsType;
          company.atsSlug = discovered.atsSlug;
        }
      }

      if (company.atsType && company.atsSlug) {
        try {
          const companyPostings = await fetchJobsFromATS(company, todayStr);
          company.lastCrawlTime = new Date().toISOString();
          if (companyPostings.length > 0) {
            company.hiringStatus = companyPostings.length >= 7 ? 'Surge' : 'Active';
            companyJobs.push(...companyPostings);
            crawlerStatus.companiesSucceeded++;
          } else {
            company.hiringStatus = 'Passive';
          }
        } catch (e) {
          company.hiringStatus = 'Passive';
        }
      }
    }
  }

  const workers = Array(concurrency).fill(null).map(() => worker());
  await Promise.all(workers);

  // Combine and deduplicate
  const combinedJobs = [...allJobs, ...companyJobs];
  const uniqueJobsMap = new Map();

  combinedJobs.forEach(job => {
    // Clean URL validation
    if (!job.applyLink || !job.applyLink.startsWith('http')) return;

    // Filter expired / stale jobs > 30 days
    if (job.ageOfPosting > 30) return;

    // Deduplication Key: company name + lowercase title + workMode
    const key = `${job.company.toLowerCase().trim()}_${job.role.toLowerCase().trim()}_${job.workMode}`;
    
    // Add quality score
    const companyMeta = registry.find(c => c.name.toLowerCase() === job.company.toLowerCase()) || {};
    job.qualityScore = calculateQualityScore(job, companyMeta.companyType || 'Startup');

    // Advanced Opening Metadata Extraction
    const searchContent = job.role + ' ' + (job.description || '');
    const visaRelo = detectVisaRelocation(searchContent);
    const interviewInsights = detectInterviewInsights(job.role, searchContent);
    const perks = detectBenefitsAndPerks(searchContent);
    const prepDetails = detectInterviewPrepDetails(job.roleCategory || '', job.role);

    // Merge insights directly into job object
    job.visaSponsorship = visaRelo.visaSponsorship;
    job.relocation = visaRelo.relocation;
    job.prepDifficulty = interviewInsights.prepDifficulty;
    job.focusAreas = interviewInsights.focusAreas;
    job.prepTime = interviewInsights.prepTime;
    job.perks = perks;
    
    // Merge process, roadmap, resources, and frequently asked topics
    job.interviewSteps = prepDetails.steps;
    job.prepRoadmap = prepDetails.prepRoadmap;
    job.prepResources = prepDetails.resources;
    job.mainlyAsked = prepDetails.frequentQuestions;


    // Estimate loop duration based on company tier
    let loopDuration = '2-3 weeks';
    if (companyMeta.companyType === 'Startup' || companyMeta.companyType === 'YC-Startup' || companyMeta.companyType === 'AI-Startup') {
      loopDuration = '1-2 weeks';
    } else if (companyMeta.companyType === 'Unicorn' || companyMeta.companyType === 'Product') {
      loopDuration = '3-5 weeks';
    }
    job.loopDuration = loopDuration;

    if (!uniqueJobsMap.has(key)) {
      uniqueJobsMap.set(key, job);
    } else {
      const existing = uniqueJobsMap.get(key);
      if (job.qualityScore > existing.qualityScore) {
        uniqueJobsMap.set(key, job);
      }
    }
  });

  const deduplicatedJobs = Array.from(uniqueJobsMap.values());

  // Helper function to forecast future hiring timelines
  function calculateHiringForecast(company, openJobsCount) {
    const type = company.companyType;
    let score = 30; // base probability score out of 100
    let timeline = '6-12 Months (Selective)';
    let reasoning = 'Steady operational posture';

    if (type === 'AI-Startup') {
      score += 40;
      reasoning = 'Accelerating sector growth and AI capital investment';
    } else if (type === 'Unicorn') {
      score += 30;
      reasoning = 'Expanding product suites and global market scaling';
    } else if (type === 'YC-Startup') {
      score += 35;
      reasoning = 'Seed capital deployment and early scaling runway';
    } else if (type === 'Product') {
      score += 20;
      reasoning = 'Ongoing core engineering additions';
    } else if (type === 'Remote-First') {
      score += 15;
      reasoning = 'Distributed team scaling and expansion';
    } else if (type === 'Indian-Startup') {
      score += 25;
      reasoning = 'Domestic digital service scaling';
    }

    if (openJobsCount >= 7) {
      score += 30;
      timeline = 'Next 1-3 Months (Surge)';
      reasoning += ' combined with a high volume of active listings currently';
    } else if (openJobsCount >= 3) {
      score += 20;
      timeline = 'Next 3-6 Months (High)';
      reasoning += ' backed by consistent active listings today';
    } else if (openJobsCount > 0) {
      score += 10;
      timeline = 'Next 3-6 Months (Moderate)';
      reasoning += ' with tactical backend openings active';
    } else {
      score -= 15;
      timeline = '6-12 Months (Low)';
      reasoning = 'Cautious operational scaling; selective replacements';
    }

    const probability = Math.min(Math.max(score, 10), 99);
    return { probability, timeline, reasoning };
  }

  // Update dynamic company records with 6-12 Month Future Hiring Forecast
  const companiesOutput = registry.map(c => {
    const openCount = deduplicatedJobs.filter(j => j.company.toLowerCase() === c.name.toLowerCase()).length;
    let hiringStatus = 'Passive';
    if (openCount >= 7) hiringStatus = 'Hiring Surge';
    else if (openCount >= 3) hiringStatus = 'Actively Hiring';
    else if (openCount > 0) hiringStatus = 'Recently Opened New Roles';
    
    const forecast = calculateHiringForecast(c, openCount);

    return {
      ...c,
      hiringStatus,
      openJobsCount: openCount,
      hiringForecast: {
        probability: forecast.probability,
        timeline: forecast.timeline,
        reasoning: forecast.reasoning
      }
    };
  });

  // Update Cache state
  jobsCache.jobs = deduplicatedJobs;
  jobsCache.companies = companiesOutput;
  jobsCache.lastCrawlTime = new Date().toISOString();

  try {
    fs.writeFileSync(CACHE_FILE, JSON.stringify(jobsCache, null, 2), 'utf8');
    fs.writeFileSync(REGISTRY_FILE, JSON.stringify(registry, null, 2), 'utf8');
    
    crawlerStatus.lastSuccessCrawl = jobsCache.lastCrawlTime;
    crawlerStatus.activeJobsCount = jobsCache.jobs.length;
    console.log(`Crawl complete. Wrote ${jobsCache.jobs.length} jobs to cache.`);
  } catch (err) {
    console.error("Failed to write cache:", err.message);
  }

  crawlerStatus.isCrawling = false;
}
