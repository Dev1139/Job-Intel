import React, { useState, useEffect, useRef } from 'react';
import { SearchIcon, LocationIcon, SalaryIcon, ExperienceIcon, GlobeIcon, CalendarIcon, LinkIcon, AwardIcon } from './Icons';
export const calculateMatchScore = (job, profile) => {
  if (!profile) return 0;
  let score = 0;
  
  // 1. Skills (60%)
  const jobSkills = job.skills || [];
  const userSkills = profile.skills || [];
  if (jobSkills.length > 0) {
    const overlaps = jobSkills.filter(s => {
      if (userSkills.includes(s)) return true;
      if (userSkills.includes('MERN') && ['React', 'Node.js', 'Express', 'MongoDB'].includes(s)) return true;
      return false;
    });
    score += (overlaps.length / jobSkills.length) * 60;
  } else {
    score += 60;
  }
  
  // 2. Experience (20%)
  const reqExp = job.experience;
  const userExp = profile.experience;
  if (userExp >= reqExp) {
    score += 20;
  } else if (userExp + 1 === reqExp) {
    score += 10;
  }
  
  // 3. Salary (20%)
  const jobMaxSalary = job.salaryMax;
  const userMinPrefSalary = profile.salaryMin;
  if (jobMaxSalary) {
    if (jobMaxSalary >= userMinPrefSalary) {
      score += 20;
    } else {
      const diff = userMinPrefSalary - jobMaxSalary;
      if (diff <= 3) score += 10;
    }
  } else {
    score += 10; // default for not specified
  }
  
  return Math.round(score);
};

export default function JobList({ jobs, savedJobIds, onToggleSave, profile, presetFilters, clearPresets }) {
  const [search, setSearch] = useState('');
  
  // Collections Tab state
  const [activeCollection, setActiveCollection] = useState('all'); // 'all', 'remote', 'highestPaying', 'product', 'startups', 'fresh', 'aiml', 'genai'

  // Active Filter state
  const [selectedRoles, setSelectedRoles] = useState([]);
  const [minSalaryFilter, setMinSalaryFilter] = useState(0);
  const [selectedExperience, setSelectedExperience] = useState([]);
  const [selectedWorkModes, setSelectedWorkModes] = useState([]);
  const [selectedCompanyTypes, setSelectedCompanyTypes] = useState([]);
  const [selectedLocations, setSelectedLocations] = useState([]);

  
  // Active selected job for detail modal
  const [activeDetailJob, setActiveDetailJob] = useState(null);
  const [detailTab, setDetailTab] = useState('info');
  const detailDialogRef = useRef(null);


  // Apply preset filters from Dashboard if any
  useEffect(() => {
    if (presetFilters) {
      if (presetFilters.postedToday) {
        setActiveCollection('fresh');
      }
      if (presetFilters.workMode && presetFilters.workMode.includes('Remote')) {
        setActiveCollection('remote');
      }
      if (presetFilters.minSalary) {
        setMinSalaryFilter(presetFilters.minSalary);
      }
      if (presetFilters.highestPaying) {
        setActiveCollection('highestPaying');
      }
      if (presetFilters.freshJobs) {
        setActiveCollection('fresh');
      }
      if (presetFilters.jobId) {
        const found = jobs.find(j => j.id === presetFilters.jobId);
        if (found) {
          handleOpenDetails(found);
        }
      }
      if (presetFilters.companySearch) {
        // Find company
        setSearch(presetFilters.companySearch);
      }
      if (presetFilters.location) {
        setSelectedLocations([presetFilters.location]);
      }
      clearPresets();

    }
  }, [presetFilters, jobs]);

  // Open detail modal helper
  const handleOpenDetails = (job) => {
    setActiveDetailJob(job);
    setDetailTab('info');
    setTimeout(() => {
      const dialog = detailDialogRef.current;
      if (dialog) dialog.showModal();
    }, 50);
  };


  const handleCloseDetails = () => {
    const dialog = detailDialogRef.current;
    if (dialog) dialog.close();
    setActiveDetailJob(null);
  };

  // Click outside dialog backdrop close logic
  useEffect(() => {
    const dialog = detailDialogRef.current;
    if (!dialog) return;

    const handleBackdropClick = (event) => {
      if (event.target !== dialog) return;
      const rect = dialog.getBoundingClientRect();
      const isInside = (
        rect.top <= event.clientY &&
        event.clientY <= rect.top + rect.height &&
        rect.left <= event.clientX &&
        event.clientX <= rect.left + rect.width
      );
      if (!isInside) {
        handleCloseDetails();
      }
    };
    dialog.addEventListener('click', handleBackdropClick);
    return () => {
      dialog.removeEventListener('click', handleBackdropClick);
    };
  }, [activeDetailJob]);

  // Toggle handlers for filters
  const handleToggleRole = (role) => {
    setSelectedRoles(prev => 
      prev.includes(role) ? prev.filter(r => r !== role) : [...prev, role]
    );
  };

  const handleToggleExp = (exp) => {
    setSelectedExperience(prev => 
      prev.includes(exp) ? prev.filter(e => e !== exp) : [...prev, exp]
    );
  };

  const handleToggleWorkMode = (mode) => {
    setSelectedWorkModes(prev => 
      prev.includes(mode) ? prev.filter(m => m !== mode) : [...prev, mode]
    );
  };

  const handleToggleCompanyType = (type) => {
    setSelectedCompanyTypes(prev => 
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    );
  };

  const handleToggleLocation = (loc) => {
    setSelectedLocations(prev => 
      prev.includes(loc) ? prev.filter(l => l !== loc) : [...prev, loc]
    );
  };

  const handleResetFilters = () => {
    setSearch('');
    setActiveCollection('all');
    setSelectedRoles([]);
    setMinSalaryFilter(0);
    setSelectedExperience([]);
    setSelectedWorkModes([]);
    setSelectedCompanyTypes([]);
    setSelectedLocations([]);
  };


  // Filter & Search Logic
  const filteredJobs = jobs.filter(job => {
    // 1. Text Search (Role, Company, Skills)
    if (search.trim() !== '') {
      const q = search.toLowerCase();
      const matchRole = job.role.toLowerCase().includes(q);
      const matchCompany = job.company.toLowerCase().includes(q);
      const matchSkills = job.skills.some(s => s.toLowerCase().includes(q));
      if (!matchRole && !matchCompany && !matchSkills) {
        return false;
      }
    }

    // 2. Collection Filters
    if (activeCollection === 'remote' && job.workMode !== 'Remote') return false;
    if (activeCollection === 'highestPaying' && (!job.salaryMax || job.salaryMax < 20)) return false;
    if (activeCollection === 'product' && !['Product', 'Unicorn'].includes(job.companyType)) return false;
    if (activeCollection === 'startups' && !['Startup', 'AI-Startup', 'YC-Startup', 'Indian-Startup'].includes(job.companyType)) return false;
    if (activeCollection === 'fresh' && job.ageOfPosting > 7) return false;
    if (activeCollection === 'aiml' && !job.skills.includes('AI/ML')) return false;
    if (activeCollection === 'genai' && !job.skills.includes('GenAI')) return false;

    // 3. Role Filter
    if (selectedRoles.length > 0) {
      const matchSelectedRole = selectedRoles.some(roleFilter => {
        if (job.roleCategory && job.roleCategory.toLowerCase() === roleFilter.toLowerCase()) {
          return true;
        }
        return job.role.toLowerCase().includes(roleFilter.toLowerCase());
      });
      if (!matchSelectedRole) return false;
    }

    // 4. Salary filter
    if (minSalaryFilter > 0) {
      if (!job.salaryMax || job.salaryMax < minSalaryFilter) {
        return false;
      }
    }

    // 5. Experience filter
    if (selectedExperience.length > 0) {
      if (!selectedExperience.includes(job.experience)) {
        return false;
      }
    }

    // 6. Work Mode filter
    if (selectedWorkModes.length > 0) {
      if (!selectedWorkModes.includes(job.workMode)) {
        return false;
      }
    }

    // 7. Company Type filter
    if (selectedCompanyTypes.length > 0) {
      // Map frontend types
      if (!selectedCompanyTypes.includes(job.companyType)) {
        return false;
      }
    }

    // 8. Location filter
    if (selectedLocations.length > 0) {
      const matchSelectedLoc = selectedLocations.some(locFilter => {
        const locLower = (job.location || '').toLowerCase();
        const modeLower = (job.workMode || '').toLowerCase();
        
        if (locFilter === 'remote') {
          return modeLower === 'remote' || locLower.includes('remote');
        }
        
        const isIndia = locLower.includes('india') || 
                        locLower.includes('bangalore') || 
                        locLower.includes('bengaluru') || 
                        locLower.includes('mumbai') || 
                        locLower.includes('pune') || 
                        locLower.includes('gurugram') || 
                        locLower.includes('gurgaon') || 
                        locLower.includes('noida') || 
                        locLower.includes('delhi') || 
                        locLower.includes('hyderabad') || 
                        locLower.includes('chennai');
        
        if (locFilter === 'india') {
          return isIndia;
        }
        if (locFilter === 'blr') {
          return locLower.includes('bangalore') || locLower.includes('bengaluru');
        }
        if (locFilter === 'ncr') {
          return locLower.includes('delhi') || locLower.includes('gurugram') || locLower.includes('gurgaon') || locLower.includes('noida');
        }
        if (locFilter === 'mum-pune') {
          return locLower.includes('mumbai') || locLower.includes('pune');
        }
        if (locFilter === 'hyd-chennai') {
          return locLower.includes('hyderabad') || locLower.includes('chennai');
        }
        if (locFilter === 'intl') {
          return !isIndia && modeLower !== 'remote' && !locLower.includes('remote');
        }
        return false;
      });
      if (!matchSelectedLoc) return false;
    }

    return true;
  });


  // Calculate Match & Quality Scores, sort by Quality Score desc
  const processedJobs = filteredJobs.map(job => {
    return {
      ...job,
      matchScore: calculateMatchScore(job, profile)
    };
  }).sort((a, b) => b.qualityScore - a.qualityScore || b.matchScore - a.matchScore);

  const getScoreColorClass = (score) => {
    if (score >= 80) return '#10b981'; // Green
    if (score >= 50) return '#f59e0b'; // Orange
    return '#ef4444'; // Red
  };

  const getAgeLabel = (age) => {
    if (age === 0) return 'New Today';
    if (age === 1) return 'Yesterday';
    return `${age} Days Ago`;
  };

  const isAnyFilterActive = search !== '' || activeCollection !== 'all' || selectedRoles.length > 0 || minSalaryFilter > 0 || selectedExperience.length > 0 || selectedWorkModes.length > 0 || selectedCompanyTypes.length > 0 || selectedLocations.length > 0;


  return (
    <div className="jobs-layout">
      {/* Filters Sidebar */}
      <aside className="filters-panel">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--glass-border)', paddingBottom: '0.75rem' }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: '700' }}>Filters</h2>
          {isAnyFilterActive && (
            <button 
              onClick={handleResetFilters}
              style={{ background: 'transparent', border: 'none', color: 'var(--accent-primary)', fontSize: '0.8rem', fontWeight: '600', cursor: 'pointer' }}
            >
              Reset All
            </button>
          )}
        </div>

        {/* Role Group */}
        <div className="filter-group">
          <span className="filter-group-title">Job Role</span>
          <div className="filter-options">
            {[
              { id: 'Frontend', label: 'Frontend Engineer' },
              { id: 'Backend', label: 'Backend Engineer' },
              { id: 'Full Stack', label: 'Full Stack Engineer' },
              { id: 'Mobile', label: 'Mobile Engineer' },
              { id: 'DevOps', label: 'DevOps / Cloud' },
              { id: 'QA', label: 'QA / Testing' },
              { id: 'Data Engineering', label: 'Data Engineering' },
              { id: 'Data Science / Analytics', label: 'Data Science / Analytics' },
              { id: 'AI / ML', label: 'AI / ML' },
              { id: 'UI/UX Design', label: 'UI/UX Design' },
              { id: 'Product Management', label: 'Product Management' },
              { id: 'Software Engineering', label: 'Software Engineering' }
            ].map(role => (
              <label key={role.id} className="checkbox-label">
                <input 
                  type="checkbox" 
                  checked={selectedRoles.includes(role.id)} 
                  onChange={() => handleToggleRole(role.id)}
                />
                <span>{role.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Work Mode */}
        <div className="filter-group">
          <span className="filter-group-title">Work Mode</span>
          <div className="filter-options">
            {['Remote', 'Hybrid', 'Onsite'].map(mode => (
              <label key={mode} className="checkbox-label">
                <input 
                  type="checkbox" 
                  checked={selectedWorkModes.includes(mode)} 
                  onChange={() => handleToggleWorkMode(mode)}
                />
                <span>{mode}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Location */}
        <div className="filter-group">
          <span className="filter-group-title">Location / Hubs</span>
          <div className="filter-options">
            {[
              { id: 'remote', label: 'Remote Only' },
              { id: 'india', label: 'Any India Location' },
              { id: 'blr', label: 'Bengaluru / Bangalore' },
              { id: 'ncr', label: 'Delhi NCR (Gurgaon/Noida)' },
              { id: 'mum-pune', label: 'Mumbai / Pune' },
              { id: 'hyd-chennai', label: 'Hyderabad / Chennai' },
              { id: 'intl', label: 'International (US/EU/etc)' }
            ].map(loc => (
              <label key={loc.id} className="checkbox-label">
                <input 
                  type="checkbox" 
                  checked={selectedLocations.includes(loc.id)} 
                  onChange={() => handleToggleLocation(loc.id)}
                />
                <span>{loc.label}</span>
              </label>
            ))}
          </div>
        </div>


        {/* Experience */}
        <div className="filter-group">
          <span className="filter-group-title">Experience</span>
          <div className="filter-options">
            {[{ label: '0 Years (Fresher)', val: 0 }, { label: '1 Year', val: 1 }, { label: '2 Years', val: 2 }, { label: '3 Years', val: 3 }].map(exp => (
              <label key={exp.val} className="checkbox-label">
                <input 
                  type="checkbox" 
                  checked={selectedExperience.includes(exp.val)} 
                  onChange={() => handleToggleExp(exp.val)}
                />
                <span>{exp.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Company Type */}
        <div className="filter-group">
          <span className="filter-group-title">Company Type</span>
          <div className="filter-options">
            {['Product', 'Service', 'Startup', 'Unicorn', 'Remote-First', 'AI-Startup', 'YC-Startup', 'Indian-Startup'].map(type => (
              <label key={type} className="checkbox-label">
                <input 
                  type="checkbox" 
                  checked={selectedCompanyTypes.includes(type)} 
                  onChange={() => handleToggleCompanyType(type)}
                />
                <span>{type.replace('-', ' ')}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Salary Slider */}
        <div className="filter-group">
          <div className="slider-header" style={{ marginBottom: '0.25rem' }}>
            <span className="filter-group-title">Min Salary</span>
            <span style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--success)' }}>
              {minSalaryFilter > 0 ? `${minSalaryFilter} LPA` : 'Any'}
            </span>
          </div>
          <input 
            type="range" 
            min="0" 
            max="30" 
            value={minSalaryFilter} 
            onChange={(e) => setMinSalaryFilter(Number(e.target.value))}
            className="range-slider"
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
            <span>Any</span>
            <span>15LPA</span>
            <span>30LPA</span>
          </div>
        </div>
      </aside>

      {/* Main Jobs Section */}
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {/* Search */}
        <div className="search-container" style={{ marginBottom: '1.25rem' }}>
          <SearchIcon className="search-icon" />
          <input 
            type="text" 
            placeholder="Search roles, companies, or skills (e.g. React, Python, Vercel)..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="search-input"
          />
          {search && (
            <button 
              onClick={() => setSearch('')}
              style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}
            >
              Clear
            </button>
          )}
        </div>

        {/* Smart Collections Tab Bar */}
        <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.75rem', marginBottom: '1.25rem', scrollbarWidth: 'none' }} className="collections-tab-bar">
          {[
            { id: 'all', label: 'All Live Jobs' },
            { id: 'remote', label: 'Top Remote' },
            { id: 'highestPaying', label: 'High Paying' },
            { id: 'product', label: 'Products & Unicorns' },
            { id: 'startups', label: 'Startups Now' },
            { id: 'fresh', label: 'Fresh (<7d)' },
            { id: 'aiml', label: 'AI/ML' },
            { id: 'genai', label: 'GenAI' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveCollection(tab.id)}
              style={{
                padding: '0.45rem 0.9rem',
                borderRadius: '20px',
                border: '1px solid',
                borderColor: activeCollection === tab.id ? 'var(--accent-primary)' : 'var(--glass-border)',
                background: activeCollection === tab.id ? 'var(--glass-bg)' : 'transparent',
                color: activeCollection === tab.id ? 'var(--text-primary)' : 'var(--text-secondary)',
                fontSize: '0.8rem',
                fontWeight: '600',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.2s ease'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Active tags visualizer */}
        {isAnyFilterActive && (
          <div className="active-filters-row" style={{ marginTop: 0 }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Active filters:</span>
            {search && <span className="active-filter-tag" onClick={() => setSearch('')}>Search: "{search}" ✖</span>}
            {activeCollection !== 'all' && <span className="active-filter-tag" onClick={() => setActiveCollection('all')}>Collection: {activeCollection} ✖</span>}
            {selectedRoles.map(r => <span className="active-filter-tag" key={r} onClick={() => handleToggleRole(r)}>{r} ✖</span>)}
            {selectedWorkModes.map(m => <span className="active-filter-tag" key={m} onClick={() => handleToggleWorkMode(m)}>{m} ✖</span>)}
            {selectedExperience.map(e => <span className="active-filter-tag" key={e} onClick={() => handleToggleExp(e)}>{e} Yr Exp ✖</span>)}
            {selectedCompanyTypes.map(t => <span className="active-filter-tag" key={t} onClick={() => handleToggleCompanyType(t)}>{t} ✖</span>)}
            {selectedLocations.map(l => (
              <span className="active-filter-tag" key={l} onClick={() => handleToggleLocation(l)}>
                Loc: {l === 'blr' ? 'Bengaluru' : l === 'ncr' ? 'Delhi NCR' : l === 'mum-pune' ? 'Mumbai/Pune' : l === 'hyd-chennai' ? 'Hyd/Chennai' : l === 'india' ? 'Any India' : l === 'intl' ? 'International' : 'Remote'} ✖
              </span>
            ))}
            {minSalaryFilter > 0 && <span className="active-filter-tag" onClick={() => setMinSalaryFilter(0)}>{minSalaryFilter}+ LPA ✖</span>}

          </div>
        )}

        {/* Active counter */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
          <span>Found <strong>{processedJobs.length}</strong> active opportunities</span>
          <span>Sorted by platform Quality Score</span>
        </div>

        {/* Job Cards */}
        {processedJobs.length === 0 ? (
          <div className="empty-state">
            <SearchIcon />
            <h3>No jobs found matching your criteria</h3>
            <p>Try switching to "All Live Jobs" or clearing some filters.</p>
            <button className="btn btn-primary" onClick={handleResetFilters}>
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="job-cards-list">
            {processedJobs.map(job => {
              const isSaved = savedJobIds.includes(job.id);
              return (
                <div key={job.id} className="job-card">
                  <div className="job-card-main">
                    <div className="job-card-header">
                      <div className="company-logo-placeholder">
                        {job.company.substring(0, 2).toUpperCase()}
                      </div>
                      <div className="company-role-info">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                          <h3 className="job-role">{job.role}</h3>
                          <span style={{ 
                            fontSize: '0.7rem', 
                            padding: '0.15rem 0.4rem', 
                            borderRadius: '4px',
                            background: job.ageOfPosting <= 2 ? 'rgba(16, 185, 129, 0.15)' : 'rgba(255, 255, 255, 0.05)',
                            color: job.ageOfPosting <= 2 ? 'var(--success)' : 'var(--text-secondary)',
                            fontWeight: '600'
                          }}>
                            {getAgeLabel(job.ageOfPosting)}
                          </span>
                        </div>
                        <div className="job-company-row">
                          <span className="job-company">{job.company}</span>
                          <span className="job-company-type">{job.companyType}</span>
                          {job.roleCategory && (
                            <span className="job-company-type" style={{ background: 'rgba(99, 102, 241, 0.15)', color: 'var(--accent-primary)', border: 'none', fontWeight: '600' }}>
                              {job.roleCategory}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="job-meta-grid">
                      <div className="job-meta-item">
                        <LocationIcon />
                        <span>{job.location} ({job.workMode})</span>
                      </div>
                      <div className="job-meta-item">
                        <SalaryIcon />
                        <span style={{ fontWeight: '700', color: 'var(--text-primary)' }}>
                          {job.salaryMin ? `${job.salaryMin} - ${job.salaryMax} LPA` : 'Not specified'}
                        </span>
                      </div>
                      <div className="job-meta-item">
                        <ExperienceIcon />
                        <span>{job.experience === 0 ? 'Fresher' : `${job.experience} Yr${job.experience > 1 ? 's' : ''} Exp`}</span>
                      </div>
                    </div>

                    <div className="job-skills">
                      {job.skills.map(skill => (
                        <span key={skill} className="skill-tag">{skill}</span>
                      ))}
                    </div>
                  </div>

                  <div className="job-card-actions">
                    {/* Score section (Quality and Match) */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'flex-end' }}>
                      {/* Quality Score Meter */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                        <span>QS:</span>
                        <div style={{ width: '60px', height: '6px', background: 'var(--bg-tertiary)', borderRadius: '3px', overflow: 'hidden' }}>
                          <div style={{ height: '100%', width: `${job.qualityScore}%`, background: getScoreColorClass(job.qualityScore) }}></div>
                        </div>
                        <span style={{ fontWeight: '700', color: getScoreColorClass(job.qualityScore) }}>{job.qualityScore}</span>
                      </div>
                      
                      {/* Profile Match Score */}
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                        Match: <strong style={{ color: 'var(--accent-primary)' }}>{job.matchScore}%</strong>
                      </div>
                    </div>

                    <div className="job-card-buttons">
                      <button 
                        className={`btn-icon ${isSaved ? 'active' : ''}`} 
                        onClick={() => onToggleSave(job.id)}
                        title={isSaved ? "Remove from bookmarks" : "Save job"}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill={isSaved ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
                          <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                        </svg>
                      </button>
                      
                      <button className="btn btn-secondary" onClick={() => handleOpenDetails(job)}>
                        Details
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Job Details dialog */}
      <dialog 
        ref={detailDialogRef} 
        closedby="any" 
        onClose={handleCloseDetails}
        aria-labelledby="detailJobTitle"
      >
        {activeDetailJob && (
          <>
            <div className="modal-header">
              <div className="modal-title">
                <h2 id="detailJobTitle">{activeDetailJob.role}</h2>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem', flexWrap: 'wrap' }}>
                  <span style={{ fontWeight: '600', color: 'var(--accent-primary)' }}>{activeDetailJob.company}</span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>•</span>
                  <span className="job-company-type" style={{ fontSize: '0.7rem' }}>{activeDetailJob.companyType}</span>
                  {activeDetailJob.roleCategory && (
                    <>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>•</span>
                      <span className="job-company-type" style={{ fontSize: '0.7rem', background: 'rgba(99, 102, 241, 0.15)', color: 'var(--accent-primary)', border: 'none', fontWeight: '600' }}>
                        {activeDetailJob.roleCategory}
                      </span>
                    </>
                  )}
                </div>
              </div>
              <button className="modal-close-btn" onClick={handleCloseDetails} aria-label="Close modal">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
              </button>
            </div>

            <div className="modal-body">
              {/* Tabs Navigation */}
              <div style={{ display: 'flex', gap: '0.25rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '0.5rem', marginBottom: '1.25rem' }}>
                {[
                  { id: 'info', label: 'Job Info & Perks' },
                  { id: 'roadmap', label: 'Interview Roadmap' },
                  { id: 'prep', label: 'Resources & Questions' }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setDetailTab(tab.id)}
                    style={{
                      padding: '0.5rem 0.85rem',
                      background: detailTab === tab.id ? 'rgba(99, 102, 241, 0.1)' : 'transparent',
                      border: 'none',
                      borderBottom: detailTab === tab.id ? '2px solid var(--accent-primary)' : 'none',
                      color: detailTab === tab.id ? 'var(--text-primary)' : 'var(--text-secondary)',
                      fontSize: '0.8rem',
                      fontWeight: '700',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      borderRadius: '4px 4px 0 0'
                    }}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {detailTab === 'info' && (
                <>
                  {/* Score Indicator */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--glass-border)', padding: '1rem', borderRadius: '8px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Job Quality Score</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <strong style={{ fontSize: '1.25rem', color: getScoreColorClass(activeDetailJob.qualityScore) }}>{activeDetailJob.qualityScore}/100</strong>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>based on compensation & recency</span>
                      </div>
                    </div>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', borderLeft: '1px solid var(--glass-border)', paddingLeft: '1rem' }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Developer Profile Match</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <strong style={{ fontSize: '1.25rem', color: 'var(--accent-primary)' }}>{calculateMatchScore(activeDetailJob, profile)}% Match</strong>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>based on your config</span>
                      </div>
                    </div>
                  </div>

                  {/* Grid Metadata */}
                  <div className="detail-meta-list" style={{ marginTop: '1.25rem' }}>
                    <div className="job-meta-item">
                      <LocationIcon />
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Location</span>
                        <span>{activeDetailJob.location} ({activeDetailJob.workMode})</span>
                      </div>
                    </div>

                    <div className="job-meta-item">
                      <SalaryIcon />
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Normalised Salary</span>
                        <span style={{ fontWeight: '700', color: 'var(--success)' }}>
                          {activeDetailJob.salaryMin ? `${activeDetailJob.salaryMin} - ${activeDetailJob.salaryMax} LPA` : 'Not specified'}
                        </span>
                      </div>
                    </div>

                    <div className="job-meta-item">
                      <ExperienceIcon />
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Experience Required</span>
                        <span>{activeDetailJob.experience === 0 ? '0 Years (Fresher)' : `${activeDetailJob.experience} Year${activeDetailJob.experience > 1 ? 's' : ''}`}</span>
                      </div>
                    </div>

                    <div className="job-meta-item">
                      <GlobeIcon />
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Source Board</span>
                        <span>{activeDetailJob.source}</span>
                      </div>
                    </div>
                  </div>

                  {/* Required Skills */}
                  <div className="form-group" style={{ marginTop: '1.25rem' }}>
                    <span className="form-label" style={{ fontSize: '0.85rem' }}>Skills Required</span>
                    <div className="job-skills" style={{ marginTop: '0.25rem' }}>
                      {activeDetailJob.skills.map(skill => (
                        <span key={skill} className="skill-tag" style={{ fontSize: '0.85rem', padding: '0.3rem 0.75rem' }}>{skill}</span>
                      ))}
                    </div>
                  </div>

                  {/* Perks & Benefits Offered */}
                  {activeDetailJob.perks && activeDetailJob.perks.length > 0 && (
                    <div className="form-group" style={{ marginTop: '1.25rem' }}>
                      <span className="form-label" style={{ fontSize: '0.85rem' }}>Perks & Benefits Offered</span>
                      <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginTop: '0.35rem' }}>
                        {activeDetailJob.perks.map(perk => (
                          <span key={perk} style={{ 
                            fontSize: '0.75rem', 
                            padding: '0.2rem 0.5rem', 
                            borderRadius: '4px',
                            background: 'rgba(16, 185, 129, 0.1)', 
                            color: 'var(--success)',
                            border: '1px solid rgba(16, 185, 129, 0.2)',
                            fontWeight: '600'
                          }}>
                            {perk}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Description */}
                  <div className="form-group" style={{ marginTop: '1.25rem' }}>
                    <span className="detail-desc-title">Job Details</span>
                    <p className="detail-desc-text" style={{ marginTop: '0.25rem', whiteSpace: 'pre-line' }}>{activeDetailJob.description}</p>
                  </div>
                </>
              )}

              {detailTab === 'roadmap' && (
                <>
                  {/* Hiring Stats & Process parameters */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', fontSize: '0.85rem', background: 'rgba(255, 255, 255, 0.01)', border: '1px solid var(--glass-border)', padding: '1rem', borderRadius: '8px' }}>
                    <div>
                      <span style={{ color: 'var(--text-secondary)', display: 'block', fontSize: '0.75rem' }}>Prep Difficulty</span>
                      <strong style={{ 
                        color: activeDetailJob.prepDifficulty === 'Easy' ? 'var(--success)' : activeDetailJob.prepDifficulty === 'Hard' ? 'var(--danger)' : 'var(--warning)',
                        fontWeight: '700' 
                      }}>
                        {activeDetailJob.prepDifficulty || 'Medium'} ({activeDetailJob.prepTime || '1-2 weeks'} prep)
                      </strong>
                    </div>

                    <div>
                      <span style={{ color: 'var(--text-secondary)', display: 'block', fontSize: '0.75rem' }}>Interview Process Loop</span>
                      <strong>{activeDetailJob.loopDuration || '2-3 weeks'}</strong>
                    </div>

                    <div>
                      <span style={{ color: 'var(--text-secondary)', display: 'block', fontSize: '0.75rem' }}>Visa Sponsorship</span>
                      <strong>{activeDetailJob.visaSponsorship || 'Not mentioned'}</strong>
                    </div>

                    <div>
                      <span style={{ color: 'var(--text-secondary)', display: 'block', fontSize: '0.75rem' }}>Relocation Support</span>
                      <strong>{activeDetailJob.relocation || 'Not mentioned'}</strong>
                    </div>
                  </div>

                  {/* Interview Process Timeline */}
                  <div style={{ marginTop: '1.5rem', background: 'rgba(255, 255, 255, 0.01)', border: '1px solid var(--glass-border)', padding: '1.25rem', borderRadius: '8px' }}>
                    <span style={{ color: 'var(--accent-primary)', display: 'block', fontSize: '0.9rem', fontWeight: '700', borderBottom: '1px solid var(--glass-border)', paddingBottom: '0.5rem', marginBottom: '1rem' }}>
                      📋 Step-by-Step Interview Process:
                    </span>
                    {activeDetailJob.interviewSteps && activeDetailJob.interviewSteps.length > 0 ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', borderLeft: '2px solid var(--glass-border)', paddingLeft: '1.25rem', marginLeft: '0.5rem', position: 'relative' }}>
                        {activeDetailJob.interviewSteps.map((step, idx) => (
                          <div key={idx} style={{ position: 'relative' }}>
                            <div style={{
                              position: 'absolute',
                              left: '-1.65rem',
                              top: '0.2rem',
                              width: '10px',
                              height: '10px',
                              borderRadius: '50%',
                              background: 'var(--accent-primary)',
                              border: '2px solid var(--bg-primary)'
                            }}></div>
                            <strong style={{ fontSize: '0.85rem', color: 'var(--text-primary)', display: 'block' }}>Stage {idx + 1}: {step.split(' (')[0]}</strong>
                            {step.includes(' (') && (
                              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginTop: '0.15rem' }}>
                                ({step.split(' (')[1]}
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Crawl active database to populate timeline steps.</span>
                    )}
                  </div>

                  {/* Focus Areas & Preparation Strategy */}
                  {activeDetailJob.focusAreas && activeDetailJob.focusAreas.length > 0 && (
                    <div style={{ marginTop: '1.25rem', background: 'rgba(255, 255, 255, 0.01)', border: '1px solid var(--glass-border)', padding: '1rem', borderRadius: '8px' }}>
                      <span style={{ color: 'var(--text-secondary)', display: 'block', fontSize: '0.75rem', marginBottom: '0.5rem', fontWeight: '700', textTransform: 'uppercase' }}>Interview Focus Areas</span>
                      <ul style={{ margin: 0, paddingLeft: '1.25rem', color: 'var(--text-primary)', fontSize: '0.85rem', lineHeight: '1.4' }}>
                        {activeDetailJob.focusAreas.map((area, idx) => (
                          <li key={idx}>{area}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div style={{ marginTop: '1.25rem', background: 'rgba(99, 102, 241, 0.03)', border: '1px solid rgba(99, 102, 241, 0.1)', padding: '1.25rem', borderRadius: '8px' }}>
                    <span style={{ color: 'var(--accent-primary)', display: 'block', fontSize: '0.85rem', fontWeight: '700', marginBottom: '0.35rem' }}>
                      🎯 How to Prepare Roadmap
                    </span>
                    <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-primary)', lineHeight: '1.5' }}>
                      {activeDetailJob.prepRoadmap || "No custom roadmap generated. Align preparation with the skills and technologies listed for the job."}
                    </p>
                  </div>
                </>
              )}

              {detailTab === 'prep' && (
                <>
                  {/* Curated Resources */}
                  <div>
                    <span style={{ color: 'var(--accent-primary)', display: 'block', fontSize: '0.9rem', fontWeight: '700', marginBottom: '0.75rem' }}>
                      📚 Recommended Study Resources
                    </span>
                    {activeDetailJob.prepResources && activeDetailJob.prepResources.length > 0 ? (
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '0.75rem' }}>
                        {activeDetailJob.prepResources.map((res, idx) => (
                          <div key={idx} style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--glass-border)', padding: '0.85rem 1rem', borderRadius: '8px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <strong style={{ fontSize: '0.88rem', color: 'var(--text-primary)' }}>{res.name}</strong>
                              <span style={{ fontSize: '0.7rem', background: 'rgba(99, 102, 241, 0.15)', color: 'var(--accent-primary)', padding: '0.15rem 0.4rem', borderRadius: '4px', fontWeight: '600' }}>
                                {res.type}
                              </span>
                            </div>
                            <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                              {res.desc}
                            </p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Crawl active database to populate curated training books and courses.</span>
                    )}
                  </div>

                  {/* Core Concepts / Frequently Asked */}
                  <div style={{ marginTop: '1.5rem' }}>
                    <span style={{ color: 'var(--accent-primary)', display: 'block', fontSize: '0.9rem', fontWeight: '700', marginBottom: '0.75rem' }}>
                      ❓ What They Mainly Ask (Interview Focus Questions)
                    </span>
                    {activeDetailJob.mainlyAsked && activeDetailJob.mainlyAsked.length > 0 ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                        {activeDetailJob.mainlyAsked.map((q, idx) => (
                          <div key={idx} style={{ display: 'flex', gap: '0.6rem', background: 'rgba(245, 158, 11, 0.03)', border: '1px solid rgba(245, 158, 11, 0.1)', padding: '0.85rem 1rem', borderRadius: '8px' }}>
                            <strong style={{ color: 'var(--warning)', fontSize: '0.85rem', flexShrink: 0 }}>Q{idx + 1}:</strong>
                            <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--text-primary)', lineHeight: '1.4' }}>
                              {q}
                            </p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Crawl database to sync key interview questions.</span>
                    )}
                  </div>
                </>
              )}

              {/* Verification and Age */}
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-muted)', borderTop: '1px solid var(--glass-border)', paddingTop: '1rem', marginTop: '1rem' }}>
                <span>Posted Date: {activeDetailJob.postedDate}</span>
                <span>Last Verified: {activeDetailJob.lastVerifiedDate || 'Recently'}</span>
              </div>
            </div>


            <div className="modal-footer">
              <button 
                className="btn btn-secondary" 
                onClick={() => onToggleSave(activeDetailJob.id)}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill={savedJobIds.includes(activeDetailJob.id) ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
                  <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                </svg>
                {savedJobIds.includes(activeDetailJob.id) ? 'Saved' : 'Save Job'}
              </button>

              <a 
                href={activeDetailJob.applyLink} 
                target="_blank" 
                rel="noopener noreferrer"
                className="btn btn-primary"
                style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
              >
                <LinkIcon style={{ width: '16px', height: '16px' }} />
                Apply on {activeDetailJob.source}
              </a>
            </div>
          </>
        )}
      </dialog>
    </div>
  );
}
