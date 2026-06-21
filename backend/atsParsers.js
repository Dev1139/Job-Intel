import { 
  isExcluded, 
  detectExperience, 
  detectSkills, 
  detectWorkMode, 
  detectSalary, 
  stripHtml, 
  capitalize, 
  isTechJob, 
  detectRoleCategory,
  detectInterviewInsights,
  detectBenefitsAndPerks,
  detectVisaRelocation
} from './helpers.js';

export async function fetchJobsFromATS(company, todayStr) {
  const jobs = [];
  const { name, atsType, atsSlug, companyType } = company;
  if (!atsType || !atsSlug) return [];

  const headers = { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36' };

  try {
    if (atsType === 'Greenhouse') {
      const res = await fetch(`https://boards-api.greenhouse.io/v1/boards/${atsSlug}/jobs?content=true`, { headers });
      if (!res.ok) return [];
      const data = await res.json();
      if (!data.jobs) return [];
      
      data.jobs.forEach(gJob => {
        if (isExcluded(gJob.title)) return;
        if (!isTechJob(gJob.title, gJob.content || '')) return;
        const skills = detectSkills(gJob.title, gJob.content || '');

        const location = gJob.location ? gJob.location.name : 'Remote';
        const workMode = detectWorkMode(gJob.title, location, gJob.content || '');
        const salary = detectSalary(gJob.content || '');
        const posted = todayStr; // default to today if not provided

        jobs.push({
          id: `greenhouse-${atsSlug}-${gJob.id}`,
          company: name,
          role: gJob.title,
          roleCategory: detectRoleCategory(gJob.title, gJob.content || ''),
          experience: detectExperience(gJob.title, gJob.content || ''),
          salaryMin: salary.min,
          salaryMax: salary.max,
          salaryStr: salary.str,
          location,
          workMode,
          applyLink: gJob.absolute_url,
          source: 'Greenhouse',
          postedDate: posted,
          lastVerifiedDate: todayStr,
          ageOfPosting: 0,
          skills,
          description: stripHtml(gJob.content || '').substring(0, 300) + '...'
        });
      });
    } 
    
    else if (atsType === 'Lever') {
      const res = await fetch(`https://api.lever.co/v0/postings/${atsSlug}?mode=json`, { headers });
      if (!res.ok) return [];
      const data = await res.json();
      if (!Array.isArray(data)) return [];

      data.forEach(lJob => {
        if (isExcluded(lJob.title)) return;
        const content = (lJob.description || '') + ' ' + (lJob.additional || '');
        if (!isTechJob(lJob.title, content)) return;
        const skills = detectSkills(lJob.title, content);

        const location = lJob.categories?.location || 'Remote';
        const workMode = detectWorkMode(lJob.title, location, content);
        const salary = detectSalary(content);
        const posted = lJob.createdAt ? new Date(lJob.createdAt).toISOString().substring(0, 10) : todayStr;

        jobs.push({
          id: `lever-${atsSlug}-${lJob.id}`,
          company: name,
          role: lJob.title,
          roleCategory: detectRoleCategory(lJob.title, content),
          experience: detectExperience(lJob.title, content),
          salaryMin: salary.min,
          salaryMax: salary.max,
          salaryStr: salary.str,
          location,
          workMode,
          applyLink: lJob.applyUrl,
          source: 'Lever',
          postedDate: posted,
          lastVerifiedDate: todayStr,
          ageOfPosting: Math.max(0, Math.floor((new Date(todayStr) - new Date(posted)) / 86400000)),
          skills,
          description: stripHtml(lJob.description || '').substring(0, 300) + '...'
        });
      });
    } 
    
    else if (atsType === 'Ashby') {
      const res = await fetch(`https://api.ashbyhq.com/posting-api/job-board/${atsSlug}?includeCompensation=true`, { headers });
      if (!res.ok) return [];
      const data = await res.json();
      if (!data.jobs) return [];

      data.jobs.forEach(aJob => {
        if (isExcluded(aJob.title)) return;
        const text = `${aJob.departmentName || ''} ${aJob.locationName || ''}`;
        if (!isTechJob(aJob.title, text)) return;
        const skills = detectSkills(aJob.title, text);

        const location = aJob.locationName || 'Remote';
        const workMode = detectWorkMode(aJob.title, location, '');
        const posted = aJob.publishedAt ? aJob.publishedAt.substring(0, 10) : todayStr;

        let salaryMin = null;
        let salaryMax = null;
        let salaryStr = 'Not specified';
        if (aJob.compensation) {
          const comp = aJob.compensation;
          if (comp.compensationRange?.min && comp.compensationRange?.max) {
            // Convert if in USD or display
            const isUSD = comp.currencyCode === 'USD';
            const mult = isUSD ? 0.000083 : 1;
            salaryMin = Math.round(comp.compensationRange.min * mult);
            salaryMax = Math.round(comp.compensationRange.max * mult);
            salaryStr = `${salaryMin} - ${salaryMax} LPA` + (isUSD ? ` ($${Math.round(comp.compensationRange.min/1000)}k - $${Math.round(comp.compensationRange.max/1000)}k)` : '');
          }
        }

        jobs.push({
          id: `ashby-${atsSlug}-${aJob.id}`,
          company: name,
          role: aJob.title,
          roleCategory: detectRoleCategory(aJob.title, text),
          experience: detectExperience(aJob.title, text),
          salaryMin,
          salaryMax,
          salaryStr,
          location,
          workMode,
          applyLink: aJob.jobBoardUrl,
          source: 'Ashby',
          postedDate: posted,
          lastVerifiedDate: todayStr,
          ageOfPosting: Math.max(0, Math.floor((new Date(todayStr) - new Date(posted)) / 86400000)),
          skills,
          description: `Open developer role in department ${aJob.departmentName || 'Engineering'} at ${name}.`
        });
      });
    } 
    
    else if (atsType === 'Workday') {
      const res = await fetch(`https://${atsSlug}.myworkdayjobs.com/wday/cxs/${atsSlug}/External/jobs`, {
        method: 'POST',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({ appliedFacets: {}, limit: 50, offset: 0, searchText: "" })
      });
      if (!res.ok) return [];
      const data = await res.json();
      if (!data.jobPostings) return [];

      data.jobPostings.forEach(wJob => {
        if (isExcluded(wJob.title)) return;
        const text = wJob.locationsText || '';
        if (!isTechJob(wJob.title, text)) return;
        const skills = detectSkills(wJob.title, text);

        const location = wJob.locationsText || 'Remote';
        const workMode = detectWorkMode(wJob.title, location, '');
        const posted = todayStr;

        jobs.push({
          id: `workday-${atsSlug}-${wJob.bulletinNumber || Math.random().toString(36).substring(4)}`,
          company: name,
          role: wJob.title,
          roleCategory: detectRoleCategory(wJob.title, text),
          experience: detectExperience(wJob.title, text),
          salaryMin: null,
          salaryMax: null,
          salaryStr: 'Not specified',
          location,
          workMode,
          applyLink: `https://${atsSlug}.myworkdayjobs.com${wJob.externalPath}`,
          source: 'Workday',
          postedDate: posted,
          lastVerifiedDate: todayStr,
          ageOfPosting: 0,
          skills,
          description: `Join ${name} in the role of ${wJob.title}.`
        });
      });
    } 
    
    else if (atsType === 'SmartRecruiters') {
      const res = await fetch(`https://api.smartrecruiters.com/v1/companies/${atsSlug}/postings`, { headers });
      if (!res.ok) return [];
      const data = await res.json();
      if (!data.content) return [];

      data.content.forEach(sJob => {
        if (isExcluded(sJob.name)) return;
        const loc = sJob.location ? `${sJob.location.city || ''} ${sJob.location.country || ''}` : 'Remote';
        if (!isTechJob(sJob.name, loc)) return;
        const skills = detectSkills(sJob.name, loc);

        const workMode = detectWorkMode(sJob.name, loc, '');
        const posted = sJob.releasedDate ? sJob.releasedDate.substring(0, 10) : todayStr;

        jobs.push({
          id: `smartrecruiters-${atsSlug}-${sJob.id}`,
          company: name,
          role: sJob.name,
          roleCategory: detectRoleCategory(sJob.name, loc),
          experience: detectExperience(sJob.name, loc),
          salaryMin: null,
          salaryMax: null,
          salaryStr: 'Not specified',
          location: loc,
          workMode,
          applyLink: `https://jobs.smartrecruiters.com/${atsSlug}/${sJob.id}`,
          source: 'SmartRecruiters',
          postedDate: posted,
          lastVerifiedDate: todayStr,
          ageOfPosting: Math.max(0, Math.floor((new Date(todayStr) - new Date(posted)) / 86400000)),
          skills,
          description: `Active role at ${name} in department ${sJob.department?.label || 'Engineering'}.`
        });
      });
    }

    else if (atsType === 'Teamtailor') {
      const res = await fetch(`https://${atsSlug}.teamtailor.com/jobs.json`, { headers });
      if (!res.ok) return [];
      const data = await res.json();
      if (!data.data) return [];

      data.data.forEach(tJob => {
        const attr = tJob.attributes;
        if (!attr || isExcluded(attr.title)) return;
        const content = attr.summary || '';
        if (!isTechJob(attr.title, content)) return;
        const skills = detectSkills(attr.title, content);

        const loc = attr.location || 'Remote';
        const workMode = detectWorkMode(attr.title, loc, content);
        const posted = attr['published-at'] ? attr['published-at'].substring(0, 10) : todayStr;

        jobs.push({
          id: `teamtailor-${atsSlug}-${tJob.id}`,
          company: name,
          role: attr.title,
          roleCategory: detectRoleCategory(attr.title, content),
          experience: detectExperience(attr.title, content),
          salaryMin: null,
          salaryMax: null,
          salaryStr: 'Not specified',
          location: loc,
          workMode,
          applyLink: attr['apply-url'] || `https://${atsSlug}.teamtailor.com/jobs/${tJob.id}`,
          source: 'Teamtailor',
          postedDate: posted,
          lastVerifiedDate: todayStr,
          ageOfPosting: Math.max(0, Math.floor((new Date(todayStr) - new Date(posted)) / 86400000)),
          skills,
          description: stripHtml(attr.summary || '').substring(0, 300) + '...'
        });
      });
    }

    else if (atsType === 'Recruitee') {
      const res = await fetch(`https://api.recruitee.com/c/${atsSlug}/offers`, { headers });
      if (!res.ok) return [];
      const data = await res.json();
      if (!data.offers) return [];

      data.offers.forEach(rJob => {
        if (isExcluded(rJob.title)) return;
        const content = rJob.description || '';
        if (!isTechJob(rJob.title, content)) return;
        const skills = detectSkills(rJob.title, content);

        const loc = rJob.location || 'Remote';
        const workMode = detectWorkMode(rJob.title, loc, content);
        const posted = rJob.created_at ? rJob.created_at.substring(0, 10) : todayStr;

        jobs.push({
          id: `recruitee-${atsSlug}-${rJob.id}`,
          company: name,
          role: rJob.title,
          roleCategory: detectRoleCategory(rJob.title, content),
          experience: detectExperience(rJob.title, content),
          salaryMin: null,
          salaryMax: null,
          salaryStr: 'Not specified',
          location: loc,
          workMode,
          applyLink: rJob.careers_url || `https://${atsSlug}.recruitee.com/o/${rJob.id}`,
          source: 'Recruitee',
          postedDate: posted,
          lastVerifiedDate: todayStr,
          ageOfPosting: Math.max(0, Math.floor((new Date(todayStr) - new Date(posted)) / 86400000)),
          skills,
          description: stripHtml(rJob.description || '').substring(0, 300) + '...'
        });
      });
    }
  } catch (err) {
    // Graceful fail for single company boards
  }

  return jobs;
}

export async function fetchRemoteOKJobs(todayStr) {
  const jobs = [];
  try {
    const res = await fetch('https://remoteok.com/api', {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
    });
    if (!res.ok) return [];
    const data = await res.json();
    if (!Array.isArray(data) || data.length < 2) return [];

    data.slice(1).forEach(rJob => {
      if (isExcluded(rJob.position)) return;
      const desc = rJob.description || '';
      if (!isTechJob(rJob.position, desc)) return;
      
      const skills = detectSkills(rJob.position, desc)
        .concat(rJob.tags ? rJob.tags.map(t => capitalize(t)) : []);
      const uniqueSkills = [...new Set(skills)];

      let salaryMin = null;
      let salaryMax = null;
      let salaryStr = 'Not specified';
      if (rJob.salary_min && rJob.salary_max) {
        salaryMin = Math.round(rJob.salary_min * 0.000083);
        salaryMax = Math.round(rJob.salary_max * 0.000083);
        salaryStr = `${salaryMin} - ${salaryMax} LPA ($${Math.round(rJob.salary_min/1000)}k - $${Math.round(rJob.salary_max/1000)}k)`;
      }

      const posted = rJob.date ? rJob.date.substring(0, 10) : todayStr;

      jobs.push({
        id: `remoteok-${rJob.id}`,
        company: rJob.company || 'Remote Startup',
        role: rJob.position,
        roleCategory: detectRoleCategory(rJob.position, desc),
        experience: detectExperience(rJob.position, desc),
        salaryMin,
        salaryMax,
        salaryStr,
        location: rJob.location || 'Remote',
        workMode: 'Remote',
        applyLink: rJob.url,
        source: 'RemoteOK',
        postedDate: posted,
        lastVerifiedDate: todayStr,
        ageOfPosting: Math.max(0, Math.floor((new Date(todayStr) - new Date(posted)) / 86400000)),
        skills: uniqueSkills,
        description: stripHtml(desc).substring(0, 300) + '...'
      });
    });
  } catch(e) {
    console.error("Error fetching RemoteOK:", e.message);
  }
  return jobs;
}
