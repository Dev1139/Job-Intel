import { jobsCache } from './crawler.js';

export function calculateAnalytics() {
  const jobs = jobsCache.jobs || [];
  const companies = jobsCache.companies || [];

  const todayStr = new Date().toISOString().substring(0, 10);
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

  // New jobs counters
  const newJobsToday = jobs.filter(j => j.postedDate === todayStr).length;
  const newJobsThisWeek = jobs.filter(j => new Date(j.postedDate) >= oneWeekAgo).length;

  // Companies hiring counters
  const activeCompanies = companies.filter(c => c.openJobsCount > 0);
  const surgeCompanies = companies.filter(c => c.hiringStatus === 'Hiring Surge');

  // Sector breakdown (Role distributions)
  const roleDistribution = {
    'Frontend': jobs.filter(j => j.roleCategory === 'Frontend').length,
    'Backend': jobs.filter(j => j.roleCategory === 'Backend').length,
    'Full Stack': jobs.filter(j => j.roleCategory === 'Full Stack').length,
    'Mobile': jobs.filter(j => j.roleCategory === 'Mobile').length,
    'DevOps / Cloud': jobs.filter(j => j.roleCategory === 'DevOps').length,
    'QA / Testing': jobs.filter(j => j.roleCategory === 'QA').length,
    'Data Science & Eng': jobs.filter(j => ['Data Engineering', 'Data Science / Analytics'].includes(j.roleCategory)).length,
    'AI / ML': jobs.filter(j => j.roleCategory === 'AI / ML').length,
    'UI/UX Design': jobs.filter(j => j.roleCategory === 'UI/UX Design').length,
    'Product Management': jobs.filter(j => j.roleCategory === 'Product Management').length,
    'Other Tech': jobs.filter(j => ['Software Engineering', 'Tech Role'].includes(j.roleCategory) || !j.roleCategory).length
  };

  return {
    newJobsToday,
    newJobsThisWeek,
    totalHiringCompanies: activeCompanies.length,
    surgeCompanies: surgeCompanies.length,
    roleDistribution,
    lastCrawlTime: jobsCache.lastCrawlTime
  };
}
