import React from 'react';
import { useJobContext } from '../../context/JobContext';
import { JobStage } from '../../types';
import { 
  ArrowLeft, 
  Layers, 
  CheckSquare, 
  FileText, 
  Award, 
  UserCheck, 
  Clock, 
  AlertCircle 
} from 'lucide-react';
import { EvidenceStep } from './EvidenceStep';
import { ChecksStep } from './ChecksStep';
import { DraftStep } from './DraftStep';
import { ReleaseStep } from './ReleaseStep';

export const JobWorkspace: React.FC = () => {
  const { 
    activeJob, 
    activeJobStage, 
    setActiveJobStage, 
    closeJob, 
    currentRole 
  } = useJobContext();

  if (!activeJob) {
    return null;
  }

  const steps: { stage: JobStage; label: string; icon: any }[] = [
    { stage: 'Evidence', label: '1. Evidence', icon: Layers },
    { stage: 'Checks', label: '2. Checks', icon: CheckSquare },
    { stage: 'Draft', label: '3. Draft', icon: FileText },
    { stage: 'Release', label: '4. Release', icon: Award },
  ];

  const renderStepContent = () => {
    switch (activeJobStage) {
      case 'Evidence':
        return <EvidenceStep job={activeJob} />;
      case 'Checks':
        return <ChecksStep job={activeJob} />;
      case 'Draft':
        return <DraftStep job={activeJob} />;
      case 'Release':
        return <ReleaseStep job={activeJob} />;
      default:
        return <EvidenceStep job={activeJob} />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Breadcrumb & Job Header Bar (Always visible) */}
      <div className="bg-white p-5 rounded-xl border border-[#E6E4DD] shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E6E4DD] pb-4">
          <button
            type="button"
            onClick={closeJob}
            className="flex items-center gap-1.5 text-xs font-semibold text-[#183C2C] hover:text-[#24523D] transition-colors self-start"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Work Queue</span>
          </button>

          {/* Current Next Action Indicator */}
          <div className="flex items-center gap-2 text-xs">
            <span className="text-[#73847B]">Next action:</span>
            <span className="font-semibold text-[#0E241A] bg-[#FAF9F6] px-2.5 py-1 rounded-md border border-[#E6E4DD]">
              {activeJob.nextAction}
            </span>
          </div>
        </div>

        {/* Job Identity Information */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono-numbers font-bold text-base text-[#0E241A]">
                {activeJob.code}
              </span>
              <span className="text-xs text-[#73847B]">·</span>
              <span className="text-xs font-semibold text-[#43544B]">
                {activeJob.client}
              </span>
              <span className="text-xs text-[#73847B]">·</span>
              <span className="text-xs text-[#73847B] font-mono-numbers">
                Sample: {activeJob.sampleRef}
              </span>
            </div>
            <h1 className="text-xl font-bold tracking-tight text-[#0E241A] mt-1">
              {activeJob.title}
            </h1>
          </div>

          <div className="flex items-center gap-3 shrink-0 text-xs text-[#43544B]">
            <div>
              <span className="text-[10px] uppercase text-[#73847B] block font-semibold">Owner</span>
              <span className="font-medium text-[#19241E]">{activeJob.ownerName}</span>
            </div>
            <div className="h-6 w-px bg-[#E6E4DD]" />
            <div>
              <span className="text-[10px] uppercase text-[#73847B] block font-semibold">Due Date</span>
              <span className="font-mono-numbers font-medium text-[#19241E]">{activeJob.dueDate}</span>
            </div>
          </div>
        </div>

        {/* Step Navigation Bar: Evidence · Checks · Draft · Release */}
        <div className="pt-2 border-t border-[#E6E4DD]">
          <nav className="flex items-center gap-2 overflow-x-auto py-1">
            {steps.map((st) => {
              const Icon = st.icon;
              const isActive = activeJobStage === st.stage;
              const isPast = 
                (st.stage === 'Evidence' && ['Checks', 'Draft', 'Release'].includes(activeJobStage)) ||
                (st.stage === 'Checks' && ['Draft', 'Release'].includes(activeJobStage)) ||
                (st.stage === 'Draft' && activeJobStage === 'Release');

              return (
                <button
                  key={st.stage}
                  onClick={() => setActiveJobStage(st.stage)}
                  className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg transition-all whitespace-nowrap ${
                    isActive
                      ? 'bg-[#183C2C] text-white shadow-xs'
                      : isPast
                      ? 'text-[#183C2C] bg-[#E6EFEA] hover:bg-[#D5E6DC]'
                      : 'text-[#43544B] bg-[#FAF9F6] hover:bg-[#ECEAE4]'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{st.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Dynamic Step View Content */}
      <div className="min-h-[500px]">
        {renderStepContent()}
      </div>
    </div>
  );
};
