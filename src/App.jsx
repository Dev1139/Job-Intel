import React, { useState, useEffect } from 'react';
import Dashboard from './components/Dashboard';
import JobList from './components/JobList';
import CompanyDirectory from './components/CompanyDirectory';
import SavedJobs from './components/SavedJobs';
import ProfileModal from './components/ProfileModal';
import { DashboardIcon, JobsIcon, CompanyIcon, BookmarksIcon, ProfileIcon, CloseIcon } from './components/Icons';

export default function App() {
  // Navigation
  const [currentTab, setCurrentTab] = useState('dashboard');
  
  // Bookmarks
  const [savedJobIds, setSavedJobIds] = useState(() => {
    const local = localStorage.getItem('saved_jobs_keys');
    return local ? JSON.parse(local) : [];
  });

  const [savedJobStatuses, setSavedJobStatuses] = useState(() => {
    const local = localStorage.getItem('saved_jobs_statuses');
    return local ? JSON.parse(local) : {};
  });


  // Candidate Profile State
  const [profile, setProfile] = useState(() => {
    const local = localStorage.getItem('candidate_profile');
    return local ? JSON.parse(local) : {
      skills: ['React', 'Node.js', 'Express', 'MongoDB'],
      experience: 1,
      salaryMin: 12
    };
  });

  // Jobs and Companies (Loaded from live API)
  const [jobs, setJobs] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Crawler Status
  const [crawlerStatus, setCrawlerStatus] = useState(null);

  // Modal and Alert Drawer Control
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isAlertsOpen, setIsAlertsOpen] = useState(false);
  const [alerts, setAlerts] = useState([]);
  const [hasNewAlertsBadge, setHasNewAlertsBadge] = useState(false);

  // Presets
  const [presetFilters, setPresetFilters] = useState(null);
  const [presetSearch, setPresetSearch] = useState('');

  // 1. Fetch data from backend on mount and sync alerts
  const loadPlatformData = async () => {
    try {
      setLoading(true);
      
      // Fetch jobs
      const jobsRes = await fetch('/api/jobs');
      if (!jobsRes.ok) throw new Error('API server returned error');
      const data = await jobsRes.json();
      
      const incomingJobs = data.jobs || [];
      const incomingCompanies = data.companies || [];
      
      setJobs(incomingJobs);
      setCompanies(incomingCompanies);

      // Fetch analytics
      const analyticsRes = await fetch('/api/analytics');
      if (analyticsRes.ok) {
        const analData = await analyticsRes.json();
        setAnalytics(analData);
      }

      // Fetch status
      const statusRes = await fetch('/api/status');
      if (statusRes.ok) {
        const statData = await statusRes.json();
        setCrawlerStatus(statData);
      }

      // 2. Alert Generation Logic
      const lastSeenIds = JSON.parse(localStorage.getItem('last_seen_job_ids') || '[]');
      const newAlertsList = [];
      const currentCompanies = new Set(incomingJobs.map(j => j.company.toLowerCase()));

      if (lastSeenIds.length > 0 && incomingJobs.length > 0) {
        // Track new companies
        const lastSeenCompanies = new Set(JSON.parse(localStorage.getItem('last_seen_companies') || '[]'));
        
        // Find companies newly hiring
        currentCompanies.forEach(cName => {
          if (!lastSeenCompanies.has(cName)) {
            // Find a job for it
            const sampleJob = incomingJobs.find(j => j.company.toLowerCase() === cName);
            if (sampleJob) {
              newAlertsList.push({
                type: 'company',
                title: 'New Hiring Company Detected',
                text: `${sampleJob.company} has started listing roles on the platform.`,
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
              });
            }
          }
        });

        // Find new matching jobs
        incomingJobs.forEach(job => {
          if (!lastSeenIds.includes(job.id)) {
            // Check skills overlap
            const userSkills = profile.skills || [];
            const overlaps = job.skills.filter(s => {
              if (userSkills.includes(s)) return true;
              if (userSkills.includes('MERN') && ['React', 'Node.js', 'Express', 'MongoDB'].includes(s)) return true;
              return false;
            });

            // If skills match
            if (overlaps.length > 0) {
              newAlertsList.push({
                type: 'match',
                title: 'New Matching Developer Job',
                text: `${job.company} posted ${job.role} matching your skills: ${overlaps.join(', ')}.`,
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
              });
            }

            // If salary exceeds target
            if (job.salaryMin && job.salaryMin >= profile.salaryMin) {
              newAlertsList.push({
                type: 'salary',
                title: 'High Paying Role Detected',
                text: `${job.company} is hiring a ${job.role} at ${job.salaryMin} - ${job.salaryMax} LPA (exceeds your ${profile.salaryMin} LPA target).`,
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
              });
            }
          }
        });
      }

      if (newAlertsList.length > 0) {
        setAlerts(newAlertsList);
        setHasNewAlertsBadge(true);
      }

      // Save currently loaded states for next visit alerts comparison
      if (incomingJobs.length > 0) {
        localStorage.setItem('last_seen_job_ids', JSON.stringify(incomingJobs.map(j => j.id)));
        localStorage.setItem('last_seen_companies', JSON.stringify(Array.from(currentCompanies)));
      }

      setError(null);
    } catch (err) {
      console.error(err);
      setError('Could not connect to the job crawler API. Please check that server.js is running.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPlatformData();
  }, [profile]); // Reload and recompute alerts when profile targets change

  // Sync bookmarks and profile state
  useEffect(() => {
    localStorage.setItem('saved_jobs_keys', JSON.stringify(savedJobIds));
  }, [savedJobIds]);

  useEffect(() => {
    localStorage.setItem('saved_jobs_statuses', JSON.stringify(savedJobStatuses));
  }, [savedJobStatuses]);


  useEffect(() => {
    localStorage.setItem('candidate_profile', JSON.stringify(profile));
  }, [profile]);

  const handleToggleSave = (jobId) => {
    setSavedJobIds(prev => {
      const exists = prev.includes(jobId);
      if (exists) {
        setSavedJobStatuses(statuses => {
          const updated = { ...statuses };
          delete updated[jobId];
          return updated;
        });
        return prev.filter(id => id !== jobId);
      } else {
        setSavedJobStatuses(statuses => ({
          ...statuses,
          [jobId]: 'bookmarked'
        }));
        return [...prev, jobId];
      }
    });
  };

  const handleUpdateJobStatus = (jobId, status) => {
    setSavedJobStatuses(prev => ({
      ...prev,
      [jobId]: status
    }));
  };


  const handleSaveProfile = (updatedProfile) => {
    setProfile(updatedProfile);
  };

  const handleNavigate = (tab, presets = {}) => {
    setCurrentTab(tab);
    if (tab === 'jobs') {
      setPresetFilters(presets);
    }
    if (tab === 'companies') {
      if (presets.search) {
        setPresetSearch(presets.search);
      }
    }
  };

  const getTabTitle = () => {
    switch(currentTab) {
      case 'dashboard': return 'Hiring & Market Intelligence';
      case 'jobs': return 'Software Engineer Opportunities';
      case 'companies': return 'Hiring Company Catalog';
      case 'bookmarks': return 'Bookmarked Positions';
      default: return 'Job Intelligence Platform';
    }
  };

  const handleCloseAlerts = () => {
    setIsAlertsOpen(false);
    setHasNewAlertsBadge(false); // Clear badge on inspect
  };

  return (
    <div className="app-container">
      {/* Sidebar Navigation */}
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-logo">
            <svg viewBox="0 0 24 24">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
            </svg>
          </div>
          <span className="brand-name">JobIntel.io</span>
        </div>

        <nav>
          <ul className="nav-menu">
            <li className={`nav-item ${currentTab === 'dashboard' ? 'active' : ''}`}>
              <button onClick={() => handleNavigate('dashboard')}>
                <DashboardIcon />
                <span>Dashboard</span>
              </button>
            </li>
            <li className={`nav-item ${currentTab === 'jobs' ? 'active' : ''}`}>
              <button onClick={() => handleNavigate('jobs')}>
                <JobsIcon />
                <span>Jobs Directory</span>
              </button>
            </li>
            <li className={`nav-item ${currentTab === 'companies' ? 'active' : ''}`}>
              <button onClick={() => handleNavigate('companies')}>
                <CompanyIcon />
                <span>Companies</span>
              </button>
            </li>
            <li className={`nav-item ${currentTab === 'bookmarks' ? 'active' : ''}`}>
              <button onClick={() => handleNavigate('bookmarks')}>
                <BookmarksIcon />
                <span>Saved Jobs</span>
              </button>
            </li>
          </ul>
        </nav>

        {/* Profile trigger in sidebar footer */}
        <div className="sidebar-footer">
          <div className="profile-card" onClick={() => setIsProfileOpen(true)}>
            <div className="profile-avatar">
              {profile.skills.length > 0 ? profile.skills[0].substring(0, 1) : 'E'}
            </div>
            <div className="profile-info">
              <span className="profile-name">Developer Profile</span>
              <span className="profile-status">{profile.salaryMin} LPA Target</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Panel */}
      <main className="main-content">
        <header className="top-bar">
          <div className="page-title">
            <h1>{getTabTitle()}</h1>
          </div>
          <div className="top-actions">
            {/* Crawler Status Tracker */}
            {crawlerStatus?.isCrawling && (
              <span style={{ fontSize: '0.8rem', color: 'var(--accent-primary)', marginRight: '1rem', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                <span className="crawler-spinner" style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent-primary)', display: 'inline-block' }}></span>
                Updating Live Database...
              </span>
            )}
            
            {/* Alerts Bell trigger */}
            <button 
              className="btn btn-secondary" 
              style={{ position: 'relative', display: 'flex', alignItems: 'center', padding: '0.6rem' }}
              onClick={() => setIsAlertsOpen(true)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
              {hasNewAlertsBadge && (
                <span style={{ position: 'absolute', top: '2px', right: '2px', width: '9px', height: '9px', borderRadius: '50%', background: 'var(--danger)', border: '1px solid var(--bg-secondary)' }}></span>
              )}
            </button>

            <button className="btn btn-primary" onClick={() => setIsProfileOpen(true)}>
              <ProfileIcon style={{ width: '16px', height: '16px' }} />
              Profile Config
            </button>
          </div>
        </header>

        {/* Loading / Error States */}
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: '1rem', color: 'var(--text-secondary)' }}>
            <div className="crawler-spinner" style={{ width: '38px', height: '38px', borderRadius: '50%', border: '3px solid var(--glass-border)', borderTopColor: 'var(--accent-primary)', animation: 'spin 1s linear infinite' }}></div>
            <p>Gathering intelligence from Greenhouse, Lever, Ashby, Workday, SmartRecruiters, Teamtailor...</p>
          </div>
        ) : error ? (
          <div className="content-view">
            <div className="empty-state" style={{ borderColor: 'var(--danger)' }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--danger)" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <h3>Database Connection Error</h3>
              <p>{error}</p>
              <button className="btn btn-primary" onClick={loadPlatformData}>
                Retry Connection
              </button>
            </div>
          </div>
        ) : (
          <div className="content-view">
            {currentTab === 'dashboard' && (
              <Dashboard 
                jobs={jobs} 
                companies={companies} 
                analytics={analytics}
                onNavigate={handleNavigate} 
              />
            )}

            {currentTab === 'jobs' && (
              <JobList 
                jobs={jobs} 
                savedJobIds={savedJobIds} 
                onToggleSave={handleToggleSave} 
                profile={profile}
                presetFilters={presetFilters}
                clearPresets={() => setPresetFilters(null)}
              />
            )}

            {currentTab === 'companies' && (
              <CompanyDirectory 
                companies={companies} 
                jobs={jobs}
                onNavigate={handleNavigate}
                presetSearch={presetSearch}
                clearPresets={() => setPresetSearch('')}
              />
            )}

            {currentTab === 'bookmarks' && (
              <SavedJobs 
                jobs={jobs} 
                savedJobIds={savedJobIds} 
                onToggleSave={handleToggleSave} 
                profile={profile}
                savedJobStatuses={savedJobStatuses}
                onUpdateJobStatus={handleUpdateJobStatus}
              />
            )}

          </div>
        )}
      </main>

      {/* Alerts Drawer */}
      <dialog 
        open={isAlertsOpen} 
        className="alerts-dialog"
        style={{
          margin: '0 0 auto auto',
          height: '100vh',
          maxHeight: '100vh',
          width: '380px',
          borderRadius: '0',
          borderLeft: '1px solid var(--glass-border)',
          transform: isAlertsOpen ? 'translateX(0)' : 'translateX(100%)',
          display: isAlertsOpen ? 'flex' : 'none',
          flexDirection: 'column'
        }}
      >
        <div className="modal-header">
          <div className="modal-title">
            <h2 style={{ fontSize: '1.15rem' }}>Notification Panel</h2>
          </div>
          <button className="modal-close-btn" onClick={handleCloseAlerts} aria-label="Close alerts">
            <CloseIcon />
          </button>
        </div>
        <div className="modal-body" style={{ flex: 1, overflowY: 'auto', padding: '1.25rem', gap: '1rem', display: 'flex', flexDirection: 'column' }}>
          {alerts.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ opacity: 0.5 }}>
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
              <p style={{ fontSize: '0.85rem' }}>No new matching roles or hiring events detected since your last visit.</p>
            </div>
          ) : (
            alerts.map((alert, index) => (
              <div 
                key={index} 
                style={{ 
                  background: 'var(--bg-tertiary)', 
                  border: '1px solid var(--glass-border)', 
                  borderRadius: '8px', 
                  padding: '1rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.35rem'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ 
                    fontSize: '0.75rem', 
                    fontWeight: '700', 
                    color: alert.type === 'salary' ? 'var(--success)' : alert.type === 'match' ? 'var(--accent-primary)' : 'var(--info)',
                    textTransform: 'uppercase'
                  }}>
                    {alert.title}
                  </span>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{alert.timestamp}</span>
                </div>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-primary)', lineHeight: '1.4' }}>{alert.text}</p>
              </div>
            ))
          )}
        </div>
        <div className="modal-footer" style={{ padding: '1rem' }}>
          <button className="btn btn-secondary" style={{ width: '100%', justifyContent: 'center' }} onClick={handleCloseAlerts}>
            Dismiss Notifications
          </button>
        </div>
      </dialog>

      {/* Mobile Nav Bar */}
      <nav className="mobile-nav-bar">
        <button className={`mobile-nav-btn ${currentTab === 'dashboard' ? 'active' : ''}`} onClick={() => handleNavigate('dashboard')}>
          <DashboardIcon />
          <span>Dashboard</span>
        </button>
        <button className={`mobile-nav-btn ${currentTab === 'jobs' ? 'active' : ''}`} onClick={() => handleNavigate('jobs')}>
          <JobsIcon />
          <span>Jobs</span>
        </button>
        <button className={`mobile-nav-btn ${currentTab === 'companies' ? 'active' : ''}`} onClick={() => handleNavigate('companies')}>
          <CompanyIcon />
          <span>Companies</span>
        </button>
        <button className={`mobile-nav-btn ${currentTab === 'bookmarks' ? 'active' : ''}`} onClick={() => handleNavigate('bookmarks')}>
          <BookmarksIcon />
          <span>Saved</span>
        </button>
      </nav>

      {/* Profile Modal */}
      <ProfileModal 
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        profile={profile}
        onSave={handleSaveProfile}
      />
    </div>
  );
}
