import React, { useState } from 'react';
import { useJobContext } from '../../context/JobContext';
import { Job, JobStage } from '../../types';
import { 
  Plus, 
  ArrowRight, 
  Search, 
  Clock, 
  AlertCircle,
  FileText,
  Filter
} from 'lucide-react';
import { NewJobModal } from '../modals/NewJobModal';

export const WorkList: React.FC = () => {
  const { 
    jobs, 
    openJob, 
    workFilter, 
    setWorkFilter, 
    currentRole 
  } = useJobContext();

  const [isNewJobOpen, setIsNewJobOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Filtering
  const filteredJobs = jobs.filter(job => {
    // Search
    const matchesSearch = 
      job.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.serviceType.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;

    if (workFilter === 'mine') {
      return job.ownerRole === currentRole;
    }
    if (workFilter === 'attention') {
      return (
        job.checks.some(c => c.needsAttention) ||
        job.releaseStatus === 'Returned for Revision' ||
        job.evidence.some(e => e.status === 'pending')
      );
    }
    return true;
  });

  const getStageTag = (stage: JobStage) => {
    switch (stage) {
      case 'Evidence':
        return 'bg-[#FDF3EC] text-[#964F1A] border-[#F8DCB8]'; // Peach
      case 'Checks':
        return 'bg-[#FEF6EC] text-[#925316] border-[#F8D8B6]'; // Amber/warm
      case 'Draft':
        return 'bg-[#F4F1FA] text-[#594280] border-[#DCD4ED]'; // Lavender
      case 'Release':
        return 'bg-[#ECF7F0] text-[#1A6338] border-[#BCE3CB]'; // Sage / Forest
      default:
        return 'bg-[#FAF9F6] text-[#43544B] border-[#E6E4DD]';
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Action & Filter Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#0E241A]">
            Work Queue
          </h1>
          <p className="text-sm text-[#73847B] mt-0.5">
            Active inspection, testing, and certification jobs organized by operational stage.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsNewJobOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-[#183C2C] hover:bg-[#24523D] rounded-lg shadow-xs transition-colors self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New job</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white p-2.5 rounded-xl border border-[#E6E4DD] shadow-2xs">
        {/* Simple Filters: All · Mine · Needs attention */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => setWorkFilter('all')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              workFilter === 'all'
                ? 'bg-[#183C2C] text-white shadow-xs'
                : 'text-[#43544B] hover:text-[#19241E] hover:bg-[#FAF9F6]'
            }`}
          >
            All jobs ({jobs.length})
          </button>
          <button
            onClick={() => setWorkFilter('mine')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              workFilter === 'mine'
                ? 'bg-[#183C2C] text-white shadow-xs'
                : 'text-[#43544B] hover:text-[#19241E] hover:bg-[#FAF9F6]'
            }`}
          >
            Mine ({jobs.filter(j => j.ownerRole === currentRole).length})
          </button>
          <button
            onClick={() => setWorkFilter('attention')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              workFilter === 'attention'
                ? 'bg-[#183C2C] text-white shadow-xs'
                : 'text-[#43544B] hover:text-[#19241E] hover:bg-[#FAF9F6]'
            }`}
          >
            Needs attention ({
              jobs.filter(j => 
                j.checks.some(c => c.needsAttention) ||
                j.releaseStatus === 'Returned for Revision' ||
                j.evidence.some(e => e.status === 'pending')
              ).length
            })
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 text-[#73847B] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search job, client, service..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 pr-3.5 py-1.5 text-xs bg-[#FAF9F6] border border-[#E6E4DD] rounded-lg focus:outline-none focus:border-[#183C2C] text-[#19241E] w-full md:w-64 placeholder-[#73847B]"
          />
        </div>
      </div>

      {/* Main Table: Job · Client · Due date · Stage · Next action · Owner */}
      <div className="bg-white rounded-xl border border-[#E6E4DD] shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#FAF9F6] border-b border-[#E6E4DD] text-xs font-semibold text-[#43544B]">
                <th className="py-3 px-4">Job & Service</th>
                <th className="py-3 px-4">Client</th>
                <th className="py-3 px-4">Due Date</th>
                <th className="py-3 px-4">Stage</th>
                <th className="py-3 px-4">Next Action</th>
                <th className="py-3 px-4">Owner</th>
                <th className="py-3 px-4 text-right">Open</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E6E4DD] text-sm">
              {filteredJobs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-[#73847B] text-sm">
                    No jobs match the current filter criteria.
                  </td>
                </tr>
              ) : (
                filteredJobs.map((job) => {
                  const hasAttention = job.checks.some(c => c.needsAttention);
                  const isWalkthrough = job.id === 'job-4401';

                  return (
                    <tr
                      key={job.id}
                      onClick={() => openJob(job.id, job.stage)}
                      className={`hover:bg-[#FAF9F6] cursor-pointer transition-colors ${
                        isWalkthrough ? 'bg-[#EBF2ED]/25' : ''
                      }`}
                    >
                      {/* Job & Service */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <span className="font-mono-numbers font-bold text-sm text-[#0E241A]">
                            {job.code}
                          </span>
                          {hasAttention && (
                            <span 
                              className="w-2 h-2 rounded-full bg-[#D97706]" 
                              title="Needs attention" 
                            />
                          )}
                        </div>
                        <div className="text-xs text-[#19241E] font-medium truncate max-w-xs mt-0.5">
                          {job.title}
                        </div>
                        <div className="text-[11px] text-[#73847B] truncate max-w-xs">
                          {job.serviceType}
                        </div>
                      </td>

                      {/* Client */}
                      <td className="py-3.5 px-4 font-medium text-xs text-[#19241E]">
                        {job.client}
                        <span className="block text-[11px] text-[#73847B] font-mono-numbers">
                          {job.sampleRef}
                        </span>
                      </td>

                      {/* Due date */}
                      <td className="py-3.5 px-4 text-xs font-mono-numbers text-[#43544B]">
                        {job.dueDate}
                      </td>

                      {/* Stage */}
                      <td className="py-3.5 px-4">
                        <span className={`inline-block px-2.5 py-1 text-xs font-semibold rounded-md border ${getStageTag(job.stage)}`}>
                          {job.stage}
                        </span>
                      </td>

                      {/* Next action */}
                      <td className="py-3.5 px-4 text-xs">
                        <span className="font-medium text-[#0E241A] block">
                          {job.nextAction}
                        </span>
                        {job.releaseStatus === 'Returned for Revision' && (
                          <span className="text-[11px] text-[#A32828] font-medium">
                            Revision requested by reviewer
                          </span>
                        )}
                      </td>

                      {/* Owner */}
                      <td className="py-3.5 px-4 text-xs text-[#43544B]">
                        <span className="font-medium text-[#19241E] block">{job.ownerName}</span>
                        <span className="text-[11px] text-[#73847B]">({job.ownerRole})</span>
                      </td>

                      {/* Open Action */}
                      <td className="py-3.5 px-4 text-right">
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#183C2C] hover:text-[#24523D]">
                          <span>Open</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* New Job Modal */}
      <NewJobModal isOpen={isNewJobOpen} onClose={() => setIsNewJobOpen(false)} />
    </div>
  );
};
