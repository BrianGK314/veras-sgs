import React from 'react';
import { useJobContext } from '../../context/JobContext';
import { FileText, Download, CheckCircle2, ArrowRight, Printer, Sparkles } from 'lucide-react';

export const ReportsList: React.FC = () => {
  const { jobs, openJob, showToast } = useJobContext();

  // All jobs with prepared or approved reports
  const reportJobs = jobs.filter(
    j => j.releaseStatus === 'Approved for Release' || j.stage === 'Draft' || j.stage === 'Release'
  );

  const handleDownloadReport = (job: any, e: React.MouseEvent) => {
    e.stopPropagation();
    const reportContent = `
================================================================================
VERAS REPORTING WORKSPACE — TECHNICAL INSPECTION CERTIFICATE
Dossier: ${job.code} | Version: ${job.version}
Client: ${job.client} | Date: ${job.inspectionDate}
================================================================================

1. IDENTIFICATION & SCOPE
Sample Reference: ${job.sampleRef}
Location: ${job.location}
Service: ${job.serviceType}
Scope: ${job.scopeDescription}

2. ANALYTICAL RESULTS MATRIX
${job.checks.map((c: any) => `• ${c.analyte.padEnd(35)} : ${c.currentValue.padEnd(10)} [Spec: ${c.clientSpec}]`).join('\n')}

3. TECHNICAL EXCEPTIONS & FINDINGS
${job.checks.find((c: any) => c.id === 'chk-moisture')?.currentValue.includes('12.8')
  ? 'WARNING: Observed Moisture (12.8% m/m) exceeds contractual threshold (12.0% m/m) by +0.8%. Documented for commercial resolution.'
  : 'No technical exceptions noted.'}

4. RELEASE & VERIFICATION
Status: ${job.releaseStatus}
Reviewer: ${job.approvedBy || 'In review'}
Timestamp: ${job.approvedAt || 'In review'}
================================================================================
Generated locally via Veras Reporting Workspace.
    `.trim();

    const blob = new Blob([reportContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${job.code}_${job.version}_Report.txt`;
    link.click();
    URL.revokeObjectURL(url);
    showToast(`Downloaded ${job.code}_${job.version}_Report.txt.`);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-[#0E241A]">
          Reports Repository
        </h1>
        <p className="text-sm text-[#73847B] mt-0.5">
          Prepared, reviewed, and approved inspection certificates and analytical findings.
        </p>
      </div>

      <div className="bg-white rounded-xl border border-[#E6E4DD] shadow-2xs overflow-hidden">
        <div className="p-4 bg-[#FAF9F6] border-b border-[#E6E4DD] flex items-center justify-between text-xs text-[#43544B]">
          <div className="flex items-center gap-2 font-semibold">
            <FileText className="w-4 h-4 text-[#183C2C]" />
            <span>{reportJobs.length} report versions in dossier register</span>
          </div>
          <span className="text-[11px] text-[#73847B]">
            Local archival with complete audit provenance
          </span>
        </div>

        <div className="divide-y divide-[#E6E4DD]">
          {reportJobs.map((job) => {
            const isApproved = job.releaseStatus === 'Approved for Release';

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
                      isApproved
                        ? 'bg-[#ECF7F0] text-[#1A6338] border-[#BCE3CB]'
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
                    <span>Template: {job.reportTemplate}</span>
                    <span>·</span>
                    <span>Language: {job.reportLanguage === 'fr' ? 'Français' : 'English'}</span>
                  </div>

                  {job.approvedAt && (
                    <div className="text-[11px] text-[#1A6338] font-medium pt-0.5">
                      ✓ Approved by {job.approvedBy} on {job.approvedAt}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={(e) => handleDownloadReport(job, e)}
                    className="px-3.5 py-1.5 text-xs font-semibold text-[#183C2C] bg-[#E6EFEA] hover:bg-[#D5E6DC] rounded-lg border border-[#C6D8CC] transition-colors flex items-center gap-1.5"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => openJob(job.id, 'Release')}
                    className="px-3.5 py-1.5 text-xs font-semibold text-white bg-[#183C2C] hover:bg-[#24523D] rounded-lg shadow-xs transition-colors flex items-center gap-1.5"
                  >
                    <span>View Report</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
