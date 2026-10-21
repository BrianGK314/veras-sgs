import React from 'react';
import { useJobContext } from '../../context/JobContext';
import { CheckSquare, ArrowRight, Clock, AlertTriangle, FileText, CheckCircle2 } from 'lucide-react';

export const ReviewList: React.FC = () => {
  const { jobs, openJob, currentRole } = useJobContext();

  // Jobs awaiting technical review or recently reviewed
  const reviewJobs = jobs.filter(
    j => j.releaseStatus === 'In Review' || j.stage === 'Release' || j.releaseStatus === 'Returned for Revision'
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-[#0E241A]">
          Technical Review Queue
        </h1>
        <p className="text-sm text-[#73847B] mt-0.5">
          Jobs awaiting signatory examination, compliance verification, and release approval.
        </p>
      </div>

      <div className="bg-white rounded-xl border border-[#E6E4DD] shadow-2xs overflow-hidden">
        <div className="p-4 bg-[#FAF9F6] border-b border-[#E6E4DD] flex items-center justify-between text-xs text-[#43544B]">
          <div className="flex items-center gap-2 font-semibold">
            <CheckSquare className="w-4 h-4 text-[#183C2C]" />
            <span>{reviewJobs.length} dossiers awaiting or undergoing technical review</span>
          </div>
          <span className="text-[11px] text-[#73847B]">
            Signatory Review Standard: ISO 17020 / ISO 17025 Complete Accuracy
          </span>
        </div>

        <div className="divide-y divide-[#E6E4DD]">
          {reviewJobs.length === 0 ? (
            <div className="p-12 text-center text-[#73847B] text-sm">
              No jobs currently in the review queue. All submitted drafts have been processed.
            </div>
          ) : (
            reviewJobs.map((job) => {
              const hasAdverseMoisture = job.checks.some(c => c.issueType === 'out_of_spec');

              return (
                <div
                  key={job.id}
                  onClick={() => openJob(job.id, 'Release')}
                  className="p-5 hover:bg-[#FAF9F6] transition-colors cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2.5">
                      <span className="font-mono-numbers font-bold text-sm text-[#0E241A]">
                        {job.code}
                      </span>
                      <span className={`text-[11px] font-semibold px-2 py-0.5 rounded border ${
                        job.releaseStatus === 'Approved for Release'
                          ? 'bg-[#ECF7F0] text-[#1A6338] border-[#BCE3CB]'
                          : job.releaseStatus === 'Returned for Revision'
                          ? 'bg-[#FDF0F0] text-[#A32828] border-[#F7BFBF]'
                          : 'bg-[#FEF6EC] text-[#925316] border-[#F8D8B6]'
                      }`}>
                        {job.releaseStatus}
                      </span>
                      <span className="font-mono-numbers text-xs text-[#73847B]">
                        Version {job.version}
                      </span>
                    </div>

                    <div className="text-sm font-semibold text-[#19241E]">
                      {job.title}
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-[#73847B]">
                      <span>Client: <strong className="text-[#43544B]">{job.client}</strong></span>
                      <span>·</span>
                      <span>Sample: {job.sampleRef}</span>
                      <span>·</span>
                      <span>Due: {job.dueDate}</span>
                    </div>

                    {hasAdverseMoisture && (
                      <div className="mt-1 flex items-center gap-1.5 text-xs text-[#A32828] font-medium">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        <span>Contains adverse finding: Moisture (12.8% m/m) outside contractual spec limit</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        openJob(job.id, 'Release');
                      }}
                      className="px-4 py-2 text-xs font-semibold text-white bg-[#183C2C] hover:bg-[#24523D] rounded-lg shadow-xs transition-colors flex items-center gap-1.5"
                    >
                      <span>Open Review & Release</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
