import React from 'react';
import { JobsIcon, CompanyIcon, GlobeIcon, SalaryIcon, AwardIcon, CalendarIcon } from './Icons';

export default function Dashboard({ jobs, companies, analytics, onNavigate }) {
  // Stats calculations
  const totalJobs = jobs.length;
  
  // Aggregate stats from analytics feed or fallback
  const newJobsToday = analytics?.newJobsToday ?? 0;
  const newJobsThisWeek = analytics?.newJobsThisWeek ?? 0;
  const totalHiringCompanies = analytics?.totalHiringCompanies ?? 0;
  const surgeCompaniesCount = analytics?.surgeCompanies ?? 0;
  const roleDistribution = analytics?.roleDistribution || {
    'Frontend': 0,
    'Backend': 0,
    'Full Stack': 0,
    'Mobile': 0,
    'DevOps / Cloud': 0,
    'QA / Testing': 0,
    'Data Science & Eng': 0,
    'AI / ML': 0,
    'UI/UX Design': 0,
    'Product Management': 0,
    'Other Tech': 0
  };

  // 1. Highest Salary Jobs (Sort by salaryMax desc)
  const highestSalaryJobs = [...jobs]
    .filter(j => j.salaryMax !== null)
    .sort((a, b) => b.salaryMax - a.salaryMax || b.salaryMin - a.salaryMin)
    .slice(0, 5);

  // 2. Active Company Hiring Surge list
  const activeCompanies = companies
    .filter(c => c.openJobsCount > 0)
    .sort((a, b) => b.openJobsCount - a.openJobsCount)
    .slice(0, 6);

  return (
    <div className="dashboard-grid">
      {/* Analytics stats row */}
      <div className="stats-row">
        <div 
          className="stat-card" 
          style={{ cursor: 'pointer' }}
          onClick={() => onNavigate('jobs', {})}
        >
          <div className="stat-header">
            <span>Total Live Positions</span>
            <div className="stat-icon-wrapper">
              <JobsIcon style={{ width: '18px', height: '18px' }} />
            </div>
          </div>
          <div className="stat-value">{totalJobs}</div>
          <div className="stat-desc">Deduplicated active postings</div>
        </div>

        <div 
          className="stat-card"
          style={{ cursor: 'pointer' }}
          onClick={() => onNavigate('jobs', { postedToday: true })}
        >
          <div className="stat-header">
            <span>New Jobs Today</span>
            <div className="stat-icon-wrapper" style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)' }}>
              <CalendarIcon style={{ width: '18px', height: '18px' }} />
            </div>
          </div>
          <div className="stat-value" style={{ color: 'var(--success)' }}>{newJobsToday}</div>
          <div className="stat-desc">Added in last 24h</div>
        </div>

        <div 
          className="stat-card"
          style={{ cursor: 'pointer' }}
          onClick={() => onNavigate('jobs', { freshJobs: true })}
        >
          <div className="stat-header">
            <span>New Jobs This Week</span>
            <div className="stat-icon-wrapper" style={{ background: 'rgba(14, 165, 233, 0.1)', color: 'var(--info)' }}>
              <GlobeIcon style={{ width: '18px', height: '18px' }} />
            </div>
          </div>
          <div className="stat-value" style={{ color: 'var(--info)' }}>{newJobsThisWeek}</div>
          <div className="stat-desc">Added in last 7 days</div>
        </div>

        <div 
          className="stat-card"
          style={{ cursor: 'pointer' }}
          onClick={() => onNavigate('companies', {})}
        >
          <div className="stat-header">
            <span>Hiring Companies</span>
            <div className="stat-icon-wrapper" style={{ background: 'rgba(245, 158, 11, 0.1)', color: 'var(--warning)' }}>
              <CompanyIcon style={{ width: '18px', height: '18px' }} />
            </div>
          </div>
          <div className="stat-value">{totalHiringCompanies}</div>
          <div className="stat-desc">{surgeCompaniesCount} in a hiring surge</div>
        </div>
      </div>

      {/* Analytics Visualization Panel */}
      <div className="dash-panel" style={{ gridColumn: '1 / -1' }}>
        <div className="panel-header">
          <h2>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: 'var(--accent-primary)' }}>
              <line x1="18" y1="20" x2="18" y2="10" />
              <line x1="12" y1="20" x2="12" y2="4" />
              <line x1="6" y1="20" x2="6" y2="14" />
            </svg>
            Hiring Market Trends & Distribution
          </h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
          {/* Chart 1: Sector Distribution */}
          <div>
            <h3 style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Jobs by Tech Domain
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {Object.entries(roleDistribution).map(([name, count]) => {
                const percentage = totalJobs > 0 ? Math.round((count / totalJobs) * 100) : 0;
                return (
                  <div key={name} style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                      <span style={{ fontWeight: '600' }}>{name}</span>
                      <span style={{ color: 'var(--text-secondary)' }}>{count} ({percentage}%)</span>
                    </div>
                    <div style={{ height: '8px', background: 'var(--bg-tertiary)', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${percentage}%`, background: 'var(--accent-gradient)', borderRadius: '4px' }}></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Grid statistics: Crawler analytics */}
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <h3 style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Hiring Velocity & Freshness
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--glass-border)', padding: '1rem', borderRadius: '8px', textAlign: 'center' }}>
                  <div style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--info)' }}>
                    {companies.filter(c => c.hiringStatus === 'Recently Opened New Roles').length}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.15rem' }}>
                    Companies hiring this week
                  </div>
                </div>

                <div style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--glass-border)', padding: '1rem', borderRadius: '8px', textAlign: 'center' }}>
                  <div style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--success)' }}>
                    {companies.filter(c => c.openJobsCount > 0).length}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.15rem' }}>
                    Companies hiring this month
                  </div>
                </div>
              </div>
            </div>

            <div style={{ background: 'rgba(99, 102, 241, 0.03)', border: '1px solid rgba(99, 102, 241, 0.1)', padding: '1rem', borderRadius: '8px', fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '1rem' }}>
              <p>💡 <strong>Platform Insight:</strong> The database scans Greenhouse, Lever, Ashby, Workday, SmartRecruiters, and RemoteOK feeds. Stale roles older than 30 days are automatically deleted to maintain 100% active, verifiable links.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main sections */}
      <div className="dashboard-sections">
        {/* Highest Salary Jobs */}
        <div className="dash-panel">
          <div className="panel-header">
            <h2>
              <AwardIcon style={{ width: '20px', height: '20px' }} />
              Highest Paying Openings Normalised (INR)
            </h2>
            <button 
              className="btn btn-secondary" 
              style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }} 
              onClick={() => onNavigate('jobs', { highestPaying: true })}
            >
              View All
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {highestSalaryJobs.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                No active roles listing salary details in crawler cache.
              </div>
            ) : (
              highestSalaryJobs.map((job) => (
                <div 
                  key={job.id} 
                  className="company-summary-card" 
                  style={{ gridTemplateColumns: '1fr auto', display: 'grid', alignItems: 'center' }}
                  onClick={() => onNavigate('jobs', { jobId: job.id })}
                >
                  <div>
                    <h3 style={{ fontSize: '0.95rem', fontWeight: '700' }}>{job.role}</h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.15rem' }}>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{job.company}</span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>•</span>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{job.location} ({job.workMode})</span>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.95rem', fontWeight: '800', color: 'var(--success)' }}>
                      {job.salaryMin} - {job.salaryMax} LPA
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      via {job.source}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Top Hiring Companies */}
        <div className="dash-panel">
          <div className="panel-header">
            <h2>
              <CompanyIcon style={{ width: '20px', height: '20px' }} />
              Active Hiring Intel
            </h2>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {activeCompanies.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                No active hiring events found in crawler database.
              </div>
            ) : (
              activeCompanies.map((comp) => (
                <div 
                  key={comp.name} 
                  className="company-summary-card"
                  onClick={() => onNavigate('companies', { search: comp.name })}
                >
                  <div className="company-sum-info">
                    <h3>{comp.name}</h3>
                    <p style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span>{comp.companyType}</span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>•</span>
                      <span style={{ 
                        color: comp.hiringStatus === 'Hiring Surge' ? 'var(--success)' : comp.hiringStatus === 'Actively Hiring' ? 'var(--accent-primary)' : 'var(--info)',
                        fontWeight: '700',
                        fontSize: '0.75rem'
                      }}>
                        {comp.hiringStatus}
                      </span>
                    </p>
                  </div>
                  <div className="company-sum-badge">
                    {comp.openJobsCount} Openings
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Future Hiring Outlook Predictor */}
        <div className="dash-panel" style={{ gridColumn: '1 / -1' }}>
          <div className="panel-header">
            <h2>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--success)" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
              6-12 Month Future Recruiting Outlook (Top Forecasts)
            </h2>
            <button 
              className="btn btn-secondary" 
              style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }} 
              onClick={() => onNavigate('companies', {})}
            >
              View Directory
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1rem' }}>
            {companies
              .filter(c => c.hiringForecast)
              .sort((a, b) => b.hiringForecast.probability - a.hiringForecast.probability)
              .slice(0, 4)
              .map((comp) => (
                <div 
                  key={comp.name} 
                  className="company-summary-card"
                  style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'flex-start', cursor: 'pointer' }}
                  onClick={() => onNavigate('companies', { search: comp.name })}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                    <h3 style={{ fontSize: '1rem', margin: 0, fontWeight: '700' }}>{comp.name}</h3>
                    <span style={{ 
                      fontSize: '0.75rem', 
                      fontWeight: '700', 
                      color: 'var(--success)',
                      background: 'rgba(16, 185, 129, 0.1)',
                      padding: '0.15rem 0.4rem',
                      borderRadius: '4px'
                    }}>
                      {comp.hiringForecast.probability}% Likelihood
                    </span>
                  </div>
                  
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    <span>Timeline: </span>
                    <strong style={{ color: 'var(--text-primary)' }}>{comp.hiringForecast.timeline}</strong>
                  </div>

                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0, lineHeight: '1.4' }}>
                    🔮 {comp.hiringForecast.reasoning}
                  </p>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}
