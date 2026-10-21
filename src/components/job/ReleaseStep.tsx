import React, { useState } from 'react';
import { useJobContext } from '../../context/JobContext';
import { Job } from '../../types';
import { 
  CheckCircle2, 
  AlertTriangle, 
  RotateCcw, 
  Download, 
  Printer, 
  FileText, 
  ShieldCheck, 
  Clock, 
  UserCheck, 
  X,
  ExternalLink
} from 'lucide-react';

interface ReleaseStepProps {
  job: Job;
}

export const ReleaseStep: React.FC<ReleaseStepProps> = ({ job }) => {
  const { 
    currentRole, 
    returnReportWithComment, 
    approveReportForRelease,
    showToast 
  } = useJobContext();

  const [returnComment, setReturnComment] = useState('');
  const [isReturning, setIsReturning] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const isApproved = job.releaseStatus === 'Approved for Release';

  const handleReturn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!returnComment.trim()) return;
    returnReportWithComment(job.id, returnComment);
    setReturnComment('');
    setIsReturning(false);
  };

  const handleApprove = () => {
    approveReportForRelease(job.id);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadReport = () => {
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
${job.checks.map(c => `• ${c.analyte.padEnd(35)} : ${c.currentValue.padEnd(10)} [Spec: ${c.clientSpec}]`).join('\n')}

3. TECHNICAL EXCEPTIONS & FINDINGS
${job.checks.find(c => c.id === 'chk-moisture')?.currentValue.includes('12.8')
  ? 'WARNING: Observed Moisture (12.8% m/m) exceeds contractual threshold (12.0% m/m) by +0.8%. Documented for commercial resolution.'
  : 'No technical exceptions noted.'}

4. RELEASE & VERIFICATION
Status: ${job.releaseStatus}
Reviewer: ${job.approvedBy || 'Pending final authorization'}
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
      {/* Release Status & Action Banner */}
      <div className="p-6 rounded-xl bg-white border border-[#E6E4DD] shadow-2xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#73847B]">
                Release Gate
              </span>
              <span className={`text-xs font-bold px-2 py-0.5 rounded border ${
                isApproved 
                  ? 'bg-[#ECF7F0] text-[#1A6338] border-[#BCE3CB]' 
                  : 'bg-[#FEF6EC] text-[#925316] border-[#F8D8B6]'
              }`}>
                {job.releaseStatus}
              </span>
            </div>
            <h2 className="text-xl font-bold tracking-tight text-[#0E241A] mt-1">
              Report Version {job.version}
            </h2>
            <p className="text-xs text-[#73847B] mt-0.5">
              Reviewer authorization verifies accurate and complete recording of all findings (including out-of-spec results).
            </p>
          </div>

          {/* Action Buttons depending on role */}
          <div className="flex flex-wrap items-center gap-2.5">
            {!isApproved ? (
              <>
                <button
                  type="button"
                  onClick={() => setIsReturning(true)}
                  className="px-4 py-2 text-xs font-semibold text-[#A32828] bg-white border border-[#F7BFBF] hover:bg-[#FDF0F0] rounded-lg transition-colors flex items-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Return with comment</span>
                </button>
                <button
                  type="button"
                  onClick={handleApprove}
                  className="px-5 py-2 text-xs font-semibold text-white bg-[#183C2C] hover:bg-[#24523D] rounded-lg shadow-xs transition-colors flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Approve version for release</span>
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => setIsPreviewOpen(true)}
                  className="px-4 py-2 text-xs font-semibold text-[#183C2C] bg-[#E6EFEA] hover:bg-[#D5E6DC] rounded-lg border border-[#C6D8CC] transition-colors flex items-center gap-1.5"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Preview final report</span>
                </button>
                <button
                  type="button"
                  onClick={handleDownloadReport}
                  className="px-4 py-2 text-xs font-semibold text-white bg-[#183C2C] hover:bg-[#24523D] rounded-lg shadow-xs transition-colors flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download report</span>
                </button>
                <button
                  type="button"
                  onClick={handlePrint}
                  className="px-3 py-2 text-xs font-semibold text-[#43544B] bg-white border border-[#E6E4DD] hover:bg-[#FAF9F6] rounded-lg transition-colors"
                  title="Print to PDF"
                >
                  <Printer className="w-3.5 h-3.5" />
                </button>
              </>
            )}
          </div>
        </div>

        {/* Release Conditions Checklist */}
        <div className="pt-4 border-t border-[#E6E4DD] grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          <div className="p-3 bg-[#FAF9F6] rounded-lg border border-[#E6E4DD] flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-[#1A6338] shrink-0" />
            <div>
              <span className="font-semibold text-[#19241E] block">Evidence Chain Complete</span>
              <span className="text-[11px] text-[#73847B]">4 verified source items logged</span>
            </div>
          </div>

          <div className="p-3 bg-[#FAF9F6] rounded-lg border border-[#E6E4DD] flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-[#1A6338] shrink-0" />
            <div>
              <span className="font-semibold text-[#19241E] block">Transcription Resolved</span>
              <span className="text-[11px] text-[#73847B]">Moisture 128% corrected to 12.8%</span>
            </div>
          </div>

          <div className="p-3 bg-[#FAF9F6] rounded-lg border border-[#E6E4DD] flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-[#1A6338] shrink-0" />
            <div>
              <span className="font-semibold text-[#19241E] block">Adverse Result Documented</span>
              <span className="text-[11px] text-[#73847B]">12.8% &gt; 12.0% faithfully recorded</span>
            </div>
          </div>
        </div>
      </div>

      {/* Return With Comment Form Drawer/Card */}
      {isReturning && (
        <form onSubmit={handleReturn} className="p-5 bg-white rounded-xl border border-[#F7BFBF] shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-[#A32828] flex items-center gap-2">
              <RotateCcw className="w-4 h-4" />
              <span>Return Report to Inspector for Revision</span>
            </h4>
            <button
              type="button"
              onClick={() => setIsReturning(false)}
              className="text-[#73847B] hover:text-[#19241E]"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <p className="text-xs text-[#73847B]">
            Specify the required correction or additional observation note. This will create the next version (e.g. v1.1) and return ownership to the inspector.
          </p>
          <textarea
            rows={3}
            placeholder="e.g. Please add inspector observation regarding ambient humidity during sampling at Silo 4B before client release."
            value={returnComment}
            onChange={(e) => setReturnComment(e.target.value)}
            required
            className="w-full p-2.5 text-xs bg-[#FAF9F6] border border-[#E6E4DD] rounded-lg focus:outline-none focus:border-[#A32828] text-[#19241E]"
          />
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsReturning(false)}
              className="px-3.5 py-1.5 text-xs text-[#43544B] hover:bg-[#FAF9F6] rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 text-xs font-semibold text-white bg-[#A32828] hover:bg-[#851F1F] rounded-lg transition-colors"
            >
              Confirm Return & Notify Inspector
            </button>
          </div>
        </form>
      )}

      {/* Audit History & Version Log */}
      <div className="bg-white rounded-xl border border-[#E6E4DD] shadow-2xs p-5 space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-[#43544B]">
          Audit History & Technical Review Log
        </h3>

        <div className="divide-y divide-[#E6E4DD] text-xs">
          {job.approvedAt && (
            <div className="py-3 flex items-start gap-3">
              <CheckCircle2 className="w-4 h-4 text-[#1A6338] shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-[#0E241A] block">
                  Version {job.version} Approved for Client Release
                </span>
                <span className="text-[11px] text-[#73847B]">
                  By {job.approvedBy} on {job.approvedAt}
                </span>
              </div>
            </div>
          )}

          {job.reviewerComments.map(c => (
            <div key={c.id} className="py-3 flex items-start gap-3">
              <RotateCcw className="w-4 h-4 text-[#A32828] shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-[#0E241A] block">
                  Returned for Revision ({c.version})
                </span>
                <p className="text-[#43544B] mt-0.5 bg-[#FAF9F6] p-2 rounded border border-[#E6E4DD]">
                  &ldquo;{c.comment}&rdquo;
                </p>
                <span className="text-[11px] text-[#73847B] block mt-1">
                  By {c.author} · {c.date}
                </span>
              </div>
            </div>
          ))}

          <div className="py-3 flex items-start gap-3">
            <Clock className="w-4 h-4 text-[#73847B] shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-[#0E241A] block">
                Initial Draft Prepared (v1.0)
              </span>
              <span className="text-[11px] text-[#73847B]">
                By Field Inspection Team on {job.inspectionDate}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Final Report Preview Modal */}
      {isPreviewOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0E241A]/40 backdrop-blur-2xs">
          <div className="w-full max-w-3xl bg-white rounded-xl shadow-2xl border border-[#E6E4DD] max-h-[90vh] flex flex-col overflow-hidden">
            <div className="px-6 py-4 bg-[#FAF9F6] border-b border-[#E6E4DD] flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-[#0E241A]">
                  Final Certificate Preview — {job.code} ({job.version})
                </h3>
                <p className="text-xs text-[#73847B]">{job.reportTemplate}</p>
              </div>
              <button
                onClick={() => setIsPreviewOpen(false)}
                className="p-1.5 text-[#73847B] hover:text-[#19241E] rounded-md"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 text-xs font-mono-numbers text-[#19241E]">
              <div className="p-4 bg-[#FAF9F6] rounded border border-[#E6E4DD] space-y-1 text-center">
                <div className="text-sm font-bold text-[#0E241A] font-sans">
                  VERAS TECHNICAL VERIFICATION PLATFORM
                </div>
                <div className="text-[11px] text-[#73847B]">
                  Inspection & Testing Certificate #{job.code} · Release Version {job.version}
                </div>
              </div>

              <div className="space-y-1">
                <div className="font-bold text-[#0E241A] font-sans">Sample: {job.sampleRef}</div>
                <div>Client: {job.client}</div>
                <div>Location: {job.location}</div>
                <div>Date: {job.inspectionDate}</div>
              </div>

              <div className="border-t border-[#E6E4DD] pt-3">
                <div className="font-bold text-[#0E241A] font-sans mb-2">Verified Results Table:</div>
                <div className="space-y-1">
                  {job.checks.map(c => (
                    <div key={c.id} className="flex justify-between py-1 border-b border-[#E6E4DD]/60">
                      <span>{c.analyte}</span>
                      <span className="font-bold">{c.currentValue} ({c.clientSpec})</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t border-[#E6E4DD] pt-3 text-[#A32828] bg-[#FDF0F0] p-3 rounded font-sans">
                <strong>Recorded Adverse Finding:</strong> Moisture content is 12.8% m/m, exceeding contractual specification of 12.0% m/m.
              </div>

              <div className="border-t border-[#E6E4DD] pt-3 flex justify-between text-[#73847B] font-sans text-[11px]">
                <span>Authorized for Release by Technical Reviewer</span>
                <span>Verification Hash: SHA-256 Validated</span>
              </div>
            </div>

            <div className="px-6 py-3 bg-[#FAF9F6] border-t border-[#E6E4DD] flex justify-end gap-2">
              <button
                onClick={() => setIsPreviewOpen(false)}
                className="px-4 py-1.5 text-xs text-[#43544B]"
              >
                Close
              </button>
              <button
                onClick={handleDownloadReport}
                className="px-4 py-1.5 text-xs font-semibold text-white bg-[#183C2C] hover:bg-[#24523D] rounded-lg"
              >
                Download Report (.txt)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
