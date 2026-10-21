import React from 'react';
import { useJobContext } from '../../context/JobContext';
import { UserRole } from '../../types';
import { 
  Briefcase, 
  CheckSquare, 
  FileText, 
  UserCheck, 
  ChevronDown,
  Sparkles
} from 'lucide-react';

export const Header: React.FC = () => {
  const { 
    activeView, 
    setActiveView, 
    activeJobId,
    closeJob,
    currentRole, 
    setCurrentRole,
    jobs 
  } = useJobContext();

  const reviewCount = jobs.filter(j => j.releaseStatus === 'In Review').length;
  const reportsCount = jobs.filter(j => j.releaseStatus === 'Approved for Release').length;

  const handleNavClick = (view: 'work' | 'review' | 'reports') => {
    closeJob(); // return to list view of that section
    setActiveView(view);
  };

  const roles: { role: UserRole; label: string; desc: string }[] = [
    { role: 'Inspector', label: 'Inspector', desc: 'Supplies evidence & checks extracted values' },
    { role: 'Reviewer', label: 'Reviewer', desc: 'Examines findings, approves or returns report' },
    { role: 'Coordinator', label: 'Coordinator', desc: 'Follows deadlines & handles release' }
  ];

  return (
    <header className="sticky top-0 z-30 bg-[#FFFFFF] border-b border-[#E6E4DD] shadow-2xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-6">
        {/* Brand Zone */}
        <div className="flex items-center gap-3 shrink-0">
          <div 
            onClick={() => handleNavClick('work')}
            className="flex items-center gap-2.5 cursor-pointer select-none group"
          >
            <div className="w-8 h-8 rounded-lg bg-[#183C2C] flex items-center justify-center text-white shadow-xs group-hover:bg-[#24523D] transition-colors">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2v20M2 12h20M4.93 4.93l14.14 14.14M4.93 19.07L19.07 4.93"/>
              </svg>
            </div>
            <div>
              <span className="text-lg font-bold tracking-tight text-[#0E241A] block leading-tight">
                Veras
              </span>
              <span className="text-[11px] font-medium text-[#73847B] tracking-tight block">
                Reporting Workspace
              </span>
            </div>
          </div>
        </div>

        {/* Primary Navigation: Work · Review · Reports (Max 3 items) */}
        <nav className="flex items-center gap-1 sm:gap-2">
          {/* Work */}
          <button
            type="button"
            onClick={() => handleNavClick('work')}
            className={`px-3 sm:px-4 py-2 text-sm font-semibold rounded-lg transition-colors whitespace-nowrap flex items-center gap-2 ${
              activeView === 'work' && !activeJobId
                ? 'bg-[#E6EFEA] text-[#183C2C]'
                : activeView === 'work' && activeJobId
                ? 'text-[#183C2C] font-semibold hover:bg-[#F4F3EE]'
                : 'text-[#43544B] hover:text-[#19241E] hover:bg-[#F4F3EE]'
            }`}
          >
            <Briefcase className="w-4 h-4 text-[#73847B]" />
            <span>Work</span>
          </button>

          {/* Review */}
          <button
            type="button"
            onClick={() => handleNavClick('review')}
            className={`px-3 sm:px-4 py-2 text-sm font-semibold rounded-lg transition-colors whitespace-nowrap flex items-center gap-2 ${
              activeView === 'review'
                ? 'bg-[#E6EFEA] text-[#183C2C]'
                : 'text-[#43544B] hover:text-[#19241E] hover:bg-[#F4F3EE]'
            }`}
          >
            <CheckSquare className="w-4 h-4 text-[#73847B]" />
            <span>Review</span>
            {reviewCount > 0 && (
              <span className="text-xs font-mono-numbers px-1.5 py-0.2 rounded-full bg-[#FEF6EC] text-[#925316] border border-[#F8D8B6]">
                {reviewCount}
              </span>
            )}
          </button>

          {/* Reports */}
          <button
            type="button"
            onClick={() => handleNavClick('reports')}
            className={`px-3 sm:px-4 py-2 text-sm font-semibold rounded-lg transition-colors whitespace-nowrap flex items-center gap-2 ${
              activeView === 'reports'
                ? 'bg-[#E6EFEA] text-[#183C2C]'
                : 'text-[#43544B] hover:text-[#19241E] hover:bg-[#F4F3EE]'
            }`}
          >
            <FileText className="w-4 h-4 text-[#73847B]" />
            <span>Reports</span>
            {reportsCount > 0 && (
              <span className="text-xs font-mono-numbers px-1.5 py-0.2 rounded-full bg-[#ECF7F0] text-[#1A6338] border border-[#BCE3CB]">
                {reportsCount}
              </span>
            )}
          </button>
        </nav>

        {/* Discreet Role Selector (Section 5: Ownership and Handoffs) */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="flex items-center gap-1.5 bg-[#FAF9F6] border border-[#E6E4DD] rounded-lg p-1 text-xs">
            <span className="text-[#73847B] hidden sm:inline px-1.5 font-medium">Role:</span>
            {roles.map(r => (
              <button
                key={r.role}
                onClick={() => setCurrentRole(r.role)}
                title={r.desc}
                className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-all ${
                  currentRole === r.role
                    ? 'bg-[#183C2C] text-white shadow-xs'
                    : 'text-[#43544B] hover:text-[#19241E] hover:bg-[#ECEAE4]'
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </header>
  );
};
