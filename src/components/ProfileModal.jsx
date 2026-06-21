import React, { useEffect, useRef, useState } from 'react';
import { CloseIcon } from './Icons';

export default function ProfileModal({ isOpen, onClose, profile, onSave }) {
  const dialogRef = useRef(null);

  // Local state during edit
  const [skills, setSkills] = useState(profile.skills || []);
  const [experience, setExperience] = useState(profile.experience || 0);
  const [salaryMin, setSalaryMin] = useState(profile.salaryMin || 7);

  const availableSkills = [
    'JavaScript',
    'TypeScript',
    'Python',
    'Java',
    'Go',
    'C++',
    'C#',
    'Ruby',
    'PHP',
    'Rust',
    'Swift',
    'Kotlin',
    'MERN',
    'React',
    'Angular',
    'Vue.js',
    'Node.js',
    'Express',
    'HTML/CSS',
    'SQL',
    'NoSQL',
    'AWS',
    'GCP',
    'Docker',
    'Kubernetes',
    'Terraform',
    'Flutter',
    'React Native',
    'AI/ML',
    'GenAI',
    'Data Engineering',
    'QA Testing',
    'UI/UX Design',
    'Product Management',
    'DSA'
  ];

  // Keep local state in sync when modal opens
  useEffect(() => {
    if (isOpen) {
      setSkills(profile.skills || []);
      setExperience(profile.experience || 0);
      setSalaryMin(profile.salaryMin || 7);
      
      const dialog = dialogRef.current;
      if (dialog && !dialog.open) {
        dialog.showModal();
      }
    } else {
      const dialog = dialogRef.current;
      if (dialog && dialog.open) {
        dialog.close();
      }
    }
  }, [isOpen, profile]);

  // Handle backdrop click fallback for browsers without native closedby support
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    const handleBackdropClick = (event) => {
      // If target is the dialog element itself, it was a click on the backdrop
      if (event.target !== dialog) return;

      const rect = dialog.getBoundingClientRect();
      const isClickInside = (
        rect.top <= event.clientY &&
        event.clientY <= rect.top + rect.height &&
        rect.left <= event.clientX &&
        event.clientX <= rect.left + rect.width
      );

      if (!isClickInside) {
        onClose();
      }
    };

    // Add listener if closedby isn't supported or to be safe
    dialog.addEventListener('click', handleBackdropClick);
    return () => {
      dialog.removeEventListener('click', handleBackdropClick);
    };
  }, [onClose]);

  const handleToggleSkill = (skill) => {
    if (skills.includes(skill)) {
      setSkills(skills.filter(s => s !== skill));
    } else {
      setSkills([...skills, skill]);
    }
  };

  const handleSave = (e) => {
    e.preventDefault();
    onSave({
      skills,
      experience: Number(experience),
      salaryMin: Number(salaryMin)
    });
    onClose();
  };

  return (
    <dialog
      ref={dialogRef}
      closedby="any"
      onClose={onClose}
      aria-labelledby="profileModalTitle"
    >
      <div className="modal-header">
        <div className="modal-title">
          <h2 id="profileModalTitle">Candidate Profile Settings</h2>
        </div>
        <button className="modal-close-btn" onClick={onClose} aria-label="Close modal">
          <CloseIcon />
        </button>
      </div>

      <div className="modal-body">
        <form onSubmit={handleSave} className="profile-form">
          {/* Skills checklist */}
          <div className="form-group">
            <label className="form-label">Core Skills (Used for Match Score)</label>
            <div className="form-skills-grid">
              {availableSkills.map((skill) => {
                const isSelected = skills.includes(skill);
                return (
                  <div
                    key={skill}
                    className={`skill-checkbox-card ${isSelected ? 'selected' : ''}`}
                    onClick={() => handleToggleSkill(skill)}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => {}} // Controlled by card onClick
                      id={`skill-${skill}`}
                    />
                    <span>{skill}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Experience slider */}
          <div className="form-group slider-group">
            <div className="slider-header">
              <span className="form-label">Your Experience</span>
              <span className="slider-val">{experience} {experience === 1 ? 'Year' : 'Years'}</span>
            </div>
            <input
              type="range"
              min="0"
              max="3"
              step="1"
              value={experience}
              onChange={(e) => setExperience(e.target.value)}
              className="range-slider"
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              <span>0 (Fresher)</span>
              <span>1 Year</span>
              <span>2 Years</span>
              <span>3 Years</span>
            </div>
          </div>

          {/* Preferred salary slider */}
          <div className="form-group slider-group">
            <div className="slider-header">
              <span className="form-label">Min Preferred Salary</span>
              <span className="slider-val">{salaryMin} LPA</span>
            </div>
            <input
              type="range"
              min="7"
              max="30"
              step="1"
              value={salaryMin}
              onChange={(e) => setSalaryMin(e.target.value)}
              className="range-slider"
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              <span>7 LPA</span>
              <span>15 LPA</span>
              <span>22 LPA</span>
              <span>30 LPA</span>
            </div>
          </div>

          <div className="modal-footer" style={{ padding: '1rem 0 0 0', borderTop: '1px solid var(--glass-border)' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Save Profile
            </button>
          </div>
        </form>
      </div>
    </dialog>
  );
}
