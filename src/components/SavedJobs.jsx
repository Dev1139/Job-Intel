import React, { useState, useRef, useEffect } from 'react';
import { calculateMatchScore } from './JobList';
import { LocationIcon, SalaryIcon, ExperienceIcon, GlobeIcon, CalendarIcon, LinkIcon, BookmarksIcon, CloseIcon } from './Icons';

export default function SavedJobs({ jobs, savedJobIds, onToggleSave, profile, savedJobStatuses, onUpdateJobStatus }) {
  const statuses = savedJobStatuses || {};

  const getStatusBadgeStyle = (status) => {
    switch (status) {
      case 'applied':
        return { background: 'rgba(59, 130, 246, 0.15)', color: '#60a5fa', border: '1px solid rgba(59, 130, 246, 0.3)' };
      case 'interviewing':
        return { background: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24', border: '1px solid rgba(245, 158, 11, 0.3)' };
      case 'offered':
        return { background: 'rgba(16, 185, 129, 0.15)', color: '#34d399', border: '1px solid rgba(16, 185, 129, 0.3)' };
      case 'rejected':
        return { background: 'rgba(239, 68, 68, 0.15)', color: '#f87171', border: '1px solid rgba(239, 68, 68, 0.3)' };
      default:
        return { background: 'rgba(255, 255, 255, 0.05)', color: 'var(--text-secondary)', border: '1px solid var(--glass-border)' };
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'applied': return 'Applied';
      case 'interviewing': return 'Interviewing';
      case 'offered': return 'Offered';
      case 'rejected': return 'Archived';
      default: return 'Bookmarked';
    }
  };

  const [activeDetailJob, setActiveDetailJob] = useState(null);
  const [detailTab, setDetailTab] = useState('info');
  const detailDialogRef = useRef(null);


  // Filter jobs by saved ID
  const savedJobs = jobs.filter(job => savedJobIds.includes(job.id));

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

  // Close details dialog if user clicks backdrop
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

  const getScoreClass = (score) => {
    if (score >= 80) return 'match-score-badge';
    if (score >= 50) return 'match-score-badge medium';
    return 'match-score-badge low';
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--glass-border)', paddingBottom: '1rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: '700' }}>Bookmarked Opportunities</h2>
        <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
          You have saved <strong>{savedJobs.length}</strong> jobs
        </span>
      </div>

      {savedJobs.length === 0 ? (
        <div className="empty-state" style={{ padding: '6rem 2rem' }}>
          <BookmarksIcon style={{ width: '48px', height: '48px', color: 'var(--text-muted)' }} />
          <h3>No bookmarked jobs yet</h3>
          <p>Explore active listings on the Jobs page and click the bookmark button to save them here.</p>
        </div>
      ) : (
        <div className="job-cards-list">
          {savedJobs.map(job => {
            const matchScore = calculateMatchScore(job, profile);
            return (
              <div key={job.id} className="job-card">
                <div className="job-card-main">
                  <div className="job-card-header">
                    <div className="company-logo-placeholder">
                      {job.company.substring(0, 2).toUpperCase()}
                    </div>
                    <div className="company-role-info">
                      <h3 className="job-role">{job.role}</h3>
                      <div className="job-company-row" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
                        <span className="job-company">{job.company}</span>
                        <span className="job-company-type">{job.companyType}</span>
                        {statuses[job.id] && (
                          <span style={{ 
                            fontSize: '0.68rem', 
                            padding: '0.1rem 0.35rem', 
                            borderRadius: '4px',
                            fontWeight: '700',
                            ...getStatusBadgeStyle(statuses[job.id])
                          }}>
                            {getStatusLabel(statuses[job.id])}
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
                      <span style={{ fontWeight: '700', color: 'var(--text-primary)' }}>{job.salaryMin} - {job.salaryMax} LPA</span>
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

                <div className="job-card-actions" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <div className={getScoreClass(matchScore)}>
                      <span>Match:</span>
                      <strong>{matchScore}%</strong>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <select 
                        value={statuses[job.id] || 'bookmarked'} 
                        onChange={(e) => onUpdateJobStatus(job.id, e.target.value)}
                        style={{
                          background: 'var(--bg-tertiary)',
                          border: '1px solid var(--glass-border)',
                          color: 'var(--text-primary)',
                          padding: '0.25rem 0.5rem',
                          borderRadius: '6px',
                          fontSize: '0.75rem',
                          cursor: 'pointer',
                          fontWeight: '600',
                          outline: 'none'
                        }}
                      >
                        <option value="bookmarked">Bookmarked</option>
                        <option value="applied">Applied</option>
                        <option value="interviewing">Interviewing</option>
                        <option value="offered">Offered 🎉</option>
                        <option value="rejected">Archived</option>
                      </select>
                    </div>
                  </div>


                  <div className="job-card-buttons">
                    <button 
                      className="btn-icon active" 
                      onClick={() => onToggleSave(job.id)}
                      title="Remove bookmark"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2">
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

      {/* Details dialog */}
      <dialog 
        ref={detailDialogRef} 
        closedby="any" 
        onClose={handleCloseDetails}
        aria-labelledby="savedDetailJobTitle"
      >
        {activeDetailJob && (
          <>
            <div className="modal-header">
              <div className="modal-title">
                <h2 id="savedDetailJobTitle">{activeDetailJob.role}</h2>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem' }}>
                  <span style={{ fontWeight: '600', color: 'var(--accent-primary)' }}>{activeDetailJob.company}</span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>•</span>
                  <span className="job-company-type" style={{ fontSize: '0.7rem' }}>{activeDetailJob.companyType}</span>
                </div>
              </div>
              <button className="modal-close-btn" onClick={handleCloseDetails} aria-label="Close modal">
                <CloseIcon />
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
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--glass-border)', padding: '1rem', borderRadius: '8px', alignItems: 'center' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Profile Match:</span>
                      <div className={getScoreClass(calculateMatchScore(activeDetailJob, profile))} style={{ fontSize: '0.9rem', padding: '0.3rem 0.6rem' }}>
                        <strong>{calculateMatchScore(activeDetailJob, profile)}% Match</strong>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', borderLeft: '1px solid var(--glass-border)', paddingLeft: '1rem' }}>
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Stage:</span>
                      <select 
                        value={statuses[activeDetailJob.id] || 'bookmarked'} 
                        onChange={(e) => onUpdateJobStatus(activeDetailJob.id, e.target.value)}
                        style={{
                          background: 'var(--bg-tertiary)',
                          border: '1px solid var(--glass-border)',
                          color: 'var(--text-primary)',
                          padding: '0.35rem 0.5rem',
                          borderRadius: '6px',
                          fontSize: '0.82rem',
                          cursor: 'pointer',
                          fontWeight: '600',
                          outline: 'none',
                          flex: 1
                        }}
                      >
                        <option value="bookmarked">Bookmarked</option>
                        <option value="applied">Applied</option>
                        <option value="interviewing">Interviewing</option>
                        <option value="offered">Offered 🎉</option>
                        <option value="rejected">Archived</option>
                      </select>
                    </div>
                  </div>


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
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Compensation</span>
                        <span style={{ fontWeight: '700', color: 'var(--success)' }}>{activeDetailJob.salaryMin} - {activeDetailJob.salaryMax} LPA</span>
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
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Listed Source</span>
                        <span>{activeDetailJob.source}</span>
                      </div>
                    </div>
                  </div>

                  <div className="form-group" style={{ marginTop: '1.25rem' }}>
                    <span className="form-label" style={{ fontSize: '0.85rem' }}>Skills Required</span>
                    <div className="job-skills" style={{ marginTop: '0.25rem' }}>
                      {activeDetailJob.skills.map(skill => (
                        <span key={skill} className="skill-tag" style={{ fontSize: '0.85rem', padding: '0.3rem 0.75rem' }}>{skill}</span>
                      ))}
                    </div>
                  </div>

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

                  <div className="form-group" style={{ marginTop: '1.25rem' }}>
                    <span className="detail-desc-title">Job Description</span>
                    <p className="detail-desc-text" style={{ marginTop: '0.25rem' }}>{activeDetailJob.description}</p>
                  </div>

                  {activeDetailJob.aboutCompany && (
                    <div className="form-group" style={{ marginTop: '1.25rem' }}>
                      <span className="detail-desc-title">About {activeDetailJob.company}</span>
                      <p className="detail-desc-text" style={{ marginTop: '0.25rem' }}>{activeDetailJob.aboutCompany}</p>
                    </div>
                  )}
                </>
              )}

              {detailTab === 'roadmap' && (
                <>
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

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-muted)', borderTop: '1px solid var(--glass-border)', paddingTop: '1rem', marginTop: '1rem' }}>
                <span>Posted Date: {activeDetailJob.postedDate}</span>
                <span>Job ID: {activeDetailJob.id}</span>
              </div>
            </div>


            <div className="modal-footer">
              <button 
                className="btn btn-secondary" 
                onClick={() => {
                  onToggleSave(activeDetailJob.id);
                  handleCloseDetails();
                }}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                </svg>
                Unsave Job
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
