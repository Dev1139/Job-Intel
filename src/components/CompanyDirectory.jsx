import React, { useState, useEffect } from 'react';
import { SearchIcon, LinkIcon, CompanyIcon } from './Icons';

export default function CompanyDirectory({ companies, jobs, onNavigate, presetSearch, clearPresets }) {
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (presetSearch) {
      setSearch(presetSearch);
      clearPresets();
    }
  }, [presetSearch]);

  const getOpenJobsCount = (companyName) => {
    return jobs.filter(j => j.company.toLowerCase() === companyName.toLowerCase()).length;
  };

  const filteredCompanies = companies.filter(company => {
    return company.name.toLowerCase().includes(search.toLowerCase()) ||
           company.companyType.toLowerCase().includes(search.toLowerCase());
  });

  const getStatusClass = (status) => {
    if (status === 'Hiring Surge') return 'company-meta-val status-active';
    if (status === 'Actively Hiring') return 'company-meta-val status-active';
    if (status === 'Recently Opened New Roles') return 'company-meta-val'; // styled neutral or customized
    return 'company-meta-val status-passive';
  };

  const getStatusColor = (status) => {
    if (status === 'Hiring Surge') return 'var(--success)';
    if (status === 'Actively Hiring') return 'var(--accent-primary)';
    if (status === 'Recently Opened New Roles') return 'var(--info)';
    return 'var(--text-muted)';
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Search and stats bar */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '1rem', alignItems: 'center' }}>
        <div className="search-container" style={{ marginBottom: 0 }}>
          <SearchIcon className="search-icon" />
          <input 
            type="text" 
            placeholder="Search companies by name or type (e.g. AI-Startup, Product)..." 
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

        <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
          Total in registry: <strong>{companies.length}</strong> companies
        </div>
      </div>

      {/* Grid listing */}
      {filteredCompanies.length === 0 ? (
        <div className="empty-state">
          <CompanyIcon />
          <h3>No companies found</h3>
          <p>Try searching for a different company name or clearing the search input.</p>
          {search && (
            <button className="btn btn-primary" onClick={() => setSearch('')}>
              Clear Search
            </button>
          )}
        </div>
      ) : (
        <div className="companies-grid">
          {filteredCompanies.slice(0, 100).map((company) => {
            const openJobsCount = getOpenJobsCount(company.name);
            return (
              <div key={company.name} className="company-card">
                <div className="company-card-header">
                  <div className="company-logo-placeholder">
                    {company.name.substring(0, 2).toUpperCase()}
                  </div>
                  <div className="company-card-info">
                    <h3 className="company-card-name" style={{ fontSize: '1.1rem' }}>{company.name}</h3>
                    <span style={{ fontSize: '0.75rem', color: 'var(--accent-primary)', fontWeight: '600' }}>
                      {company.companyType}
                    </span>
                  </div>
                </div>

                <div className="company-card-meta" style={{ margin: '0.5rem 0' }}>
                  <div className="company-meta-row">
                    <span>Hiring status</span>
                    <span 
                      className={getStatusClass(company.hiringStatus)} 
                      style={{ color: getStatusColor(company.hiringStatus), fontWeight: '700' }}
                    >
                      {company.hiringStatus}
                    </span>
                  </div>

                  <div className="company-meta-row">
                    <span>ATS Engine</span>
                    <span className="company-meta-val">{company.atsType || 'Auto-detect'}</span>
                  </div>

                  <div className="company-meta-row">
                    <span>Active jobs</span>
                    <span className="company-meta-val" style={{ color: openJobsCount > 0 ? 'var(--success)' : 'var(--text-muted)', fontWeight: '800' }}>
                      {openJobsCount}
                    </span>
                  </div>

                  <div className="company-meta-row">
                    <span>Hiring Forecast</span>
                    <span className="company-meta-val" style={{ 
                      color: company.hiringForecast ? (company.hiringForecast.probability >= 70 ? 'var(--success)' : company.hiringForecast.probability >= 45 ? 'var(--info)' : 'var(--text-muted)') : 'var(--text-muted)',
                      fontWeight: '700'
                    }}>
                      {company.hiringForecast ? `${company.hiringForecast.timeline} (${company.hiringForecast.probability}%)` : 'Selective'}
                    </span>
                  </div>
                </div>

                {company.hiringForecast && (
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--glass-border)', padding: '0.4rem 0.6rem', borderRadius: '6px', margin: '0.5rem 0 0.85rem 0', lineHeight: '1.4' }}>
                    🔮 <strong>Forecast Reasoning:</strong> {company.hiringForecast.reasoning}
                  </p>
                )}

                <div style={{ display: 'flex', gap: '0.5rem', marginTop: 'auto' }}>
                  <a 
                    href={company.careersUrl} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="btn btn-secondary"
                    style={{ flex: 1, textDecoration: 'none', justifyContent: 'center', fontSize: '0.75rem', padding: '0.5rem' }}
                  >
                    <LinkIcon style={{ width: '12px', height: '12px' }} />
                    Careers
                  </a>
                  
                  <button 
                    className="btn btn-primary" 
                    style={{ flex: 1.5, fontSize: '0.75rem', padding: '0.5rem', justifyContent: 'center' }}
                    onClick={() => onNavigate('jobs', { companySearch: company.name })}
                    disabled={openJobsCount === 0}
                  >
                    View {openJobsCount} Jobs
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
      
      {filteredCompanies.length > 100 && (
        <div style={{ textAlign: 'center', padding: '1rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
          Showing top 100 matching companies. Use search above to narrow down other results.
        </div>
      )}
    </div>
  );
}
