import React, { useState } from 'react';
import { useJobContext } from '../../context/JobContext';
import { Job, CheckItem } from '../../types';
import { 
  AlertTriangle, 
  CheckCircle2, 
  ArrowRight, 
  FileText, 
  Edit3, 
  ChevronDown, 
  ChevronUp, 
  Check, 
  Info,
  HelpCircle,
  Clock
} from 'lucide-react';

interface ChecksStepProps {
  job: Job;
}

export const ChecksStep: React.FC<ChecksStepProps> = ({ job }) => {
  const { 
    correctCheckValue, 
    confirmCheck, 
    setActiveJobStage 
  } = useJobContext();

  const [selectedCheckId, setSelectedCheckId] = useState<string>(
    job.checks.find(c => c.needsAttention)?.id || job.checks[0].id
  );
  const [showAllResults, setShowAllResults] = useState(false);

  // Edit value state
  const [editingValue, setEditingValue] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editNotes, setEditNotes] = useState('');

  const selectedCheck = job.checks.find(c => c.id === selectedCheckId) || job.checks[0];

  const attentionItems = job.checks.filter(c => c.needsAttention || !c.isConfirmed);

  const handleStartEdit = (check: CheckItem) => {
    setSelectedCheckId(check.id);
    setEditingValue(check.currentValue);
    setEditNotes(check.inspectorNotes || '');
    setIsEditing(true);
  };

  const handleSaveCorrection = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingValue.trim()) return;
    correctCheckValue(job.id, selectedCheck.id, editingValue, editNotes);
    setIsEditing(false);
  };

  const handleConfirm = (checkId: string) => {
    confirmCheck(job.id, checkId);
  };

  // Quick fix preset for the walkthrough: "128%" -> "12.8%"
  const handleApplyWalkthroughFix = () => {
    correctCheckValue(
      job.id, 
      'chk-moisture', 
      '12.8%', 
      'Corrected OCR decimal omission from line 4 of supplier certificate. Result remains above contractual maximum threshold (12.8% > 12.0%).'
    );
  };

  const getIssueBadge = (type: CheckItem['issueType'], isCorrected: boolean) => {
    switch (type) {
      case 'extraction_error':
        return {
          label: 'Extraction needs checking',
          bg: 'bg-[#FEF6EC] text-[#925316] border-[#F8D8B6]'
        };
      case 'out_of_spec':
        return {
          label: 'Outside client specification',
          bg: 'bg-[#FDF0F0] text-[#A32828] border-[#F7BFBF]'
        };
      case 'missing_evidence':
        return {
          label: 'Missing source evidence',
          bg: 'bg-[#FAF9F6] text-[#73847B] border-[#E6E4DD]'
        };
      default:
        return {
          label: isCorrected ? 'Corrected (Adverse)' : 'Within specification',
          bg: 'bg-[#ECF7F0] text-[#1A6338] border-[#BCE3CB]'
        };
    }
  };

  return (
    <div className="space-y-6">
      {/* Short Summary Lead (Requirement 4) */}
      <div className="p-4 rounded-xl bg-white border border-[#E6E4DD] shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
            attentionItems.length > 0 
              ? 'bg-[#FEF6EC] text-[#925316]' 
              : 'bg-[#ECF7F0] text-[#1A6338]'
          }`}>
            {attentionItems.length > 0 ? (
              <AlertTriangle className="w-4 h-4" />
            ) : (
              <CheckCircle2 className="w-4 h-4" />
            )}
          </div>
          <div>
            <h3 className="text-base font-bold text-[#0E241A]">
              {attentionItems.length === 1 
                ? 'One item needs your attention.' 
                : attentionItems.length > 1
                ? `${attentionItems.length} items need your attention.`
                : 'All analytical results confirmed.'}
            </h3>
            <p className="text-xs text-[#73847B]">
              Verify OCR extracted values against source scan excerpts and client specification limits.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowAllResults(!showAllResults)}
          className="text-xs font-semibold text-[#183C2C] hover:underline flex items-center gap-1 self-start sm:self-auto"
        >
          <span>{showAllResults ? 'Hide all results table' : 'View all results (5 parameters)'}</span>
          {showAllResults ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Main Working Surface: Issues First + Inspector Detail Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Side: Issues First Cards (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#43544B]">
              Flagged Items Requiring Determination
            </h3>
            <span className="text-xs text-[#73847B]">
              Deterministic rule checks
            </span>
          </div>

          {/* Issue Cards */}
          <div className="space-y-3">
            {job.checks
              .filter(c => c.needsAttention || !c.isConfirmed || c.issueType !== 'none')
              .map((check) => {
                const isSelected = selectedCheck.id === check.id;
                const badge = getIssueBadge(check.issueType, check.isCorrected);
                const isMoisture = check.id === 'chk-moisture';

                return (
                  <div
                    key={check.id}
                    onClick={() => {
                      setSelectedCheckId(check.id);
                      setIsEditing(false);
                    }}
                    className={`p-4 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-white border-[#183C2C] ring-1 ring-[#183C2C] shadow-xs'
                        : 'bg-white border-[#E6E4DD] hover:border-[#CDC9BD]'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-[#0E241A]">
                            {check.analyte}
                          </span>
                          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${badge.bg}`}>
                            {badge.label}
                          </span>
                        </div>
                        <div className="text-xs text-[#73847B] mt-0.5">
                          Method: {check.testMethod} · Client Spec: <strong className="text-[#43544B]">{check.clientSpec}</strong>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="font-mono-numbers font-bold text-base text-[#0E241A]">
                          {check.currentValue}
                        </span>
                        {check.isCorrected && (
                          <span className="block text-[10px] text-[#73847B] line-through font-mono-numbers">
                            raw: {check.rawValue}
                          </span>
                        )}
                      </div>
                    </div>

                    {check.issueDescription && (
                      <p className="mt-2.5 text-xs text-[#925316] bg-[#FEF6EC] p-2.5 rounded-lg border border-[#F8D8B6] leading-relaxed">
                        {check.issueDescription}
                      </p>
                    )}

                    {/* Quick walkthrough action if moisture error is uncorrected */}
                    {isMoisture && !check.isCorrected && (
                      <div className="mt-3 pt-3 border-t border-[#E6E4DD] flex items-center justify-between">
                        <span className="text-xs text-[#73847B]">
                          Source scan line 4 reads 12.8%
                        </span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleApplyWalkthroughFix();
                          }}
                          className="px-3 py-1 text-xs font-semibold text-[#183C2C] bg-[#E6EFEA] hover:bg-[#D5E6DC] rounded-md border border-[#C6D8CC] transition-colors"
                        >
                          Correct 128% → 12.8%
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}

            {/* If all attention items are cleared */}
            {job.checks.every(c => !c.needsAttention && c.isConfirmed) && (
              <div className="p-5 bg-white rounded-xl border border-[#BCE3CB] text-center space-y-2">
                <CheckCircle2 className="w-6 h-6 text-[#1A6338] mx-auto" />
                <div className="text-sm font-bold text-[#0E241A]">
                  All analytical results and adverse findings confirmed
                </div>
                <p className="text-xs text-[#73847B] max-w-md mx-auto">
                  Moisture exceedance (12.8% vs 12.0% spec) is recorded and will be faithfully reported in the draft certificate.
                </p>
              </div>
            )}
          </div>

          {/* Full Results Table (revealed behind View all results) */}
          {showAllResults && (
            <div className="mt-6 pt-4 border-t border-[#E6E4DD] space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#43544B]">
                  Full Analytical Specification Matrix
                </h4>
                <span className="text-xs font-mono-numbers text-[#73847B]">
                  {job.checks.length} parameters logged
                </span>
              </div>

              <div className="bg-white rounded-xl border border-[#E6E4DD] overflow-hidden">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-[#FAF9F6] border-b border-[#E6E4DD] text-[11px] font-semibold text-[#43544B]">
                    <tr>
                      <th className="py-2.5 px-3">Analyte</th>
                      <th className="py-2.5 px-3">Method</th>
                      <th className="py-2.5 px-3 text-right">Measured</th>
                      <th className="py-2.5 px-3">Client Specification</th>
                      <th className="py-2.5 px-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E6E4DD]">
                    {job.checks.map(c => {
                      const isOut = c.issueType === 'out_of_spec';
                      return (
                        <tr 
                          key={c.id}
                          onClick={() => setSelectedCheckId(c.id)}
                          className={`hover:bg-[#FAF9F6] cursor-pointer ${
                            selectedCheck.id === c.id ? 'bg-[#EBF2ED]/30' : ''
                          }`}
                        >
                          <td className="py-2.5 px-3 font-medium text-[#19241E]">{c.analyte}</td>
                          <td className="py-2.5 px-3 text-[#73847B] font-mono-numbers">{c.testMethod}</td>
                          <td className="py-2.5 px-3 text-right font-bold font-mono-numbers text-[#0E241A]">
                            {c.currentValue}
                          </td>
                          <td className="py-2.5 px-3 text-[#43544B] font-mono-numbers">{c.clientSpec}</td>
                          <td className="py-2.5 px-3">
                            <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded border ${
                              isOut 
                                ? 'bg-[#FDF0F0] text-[#A32828] border-[#F7BFBF]' 
                                : 'bg-[#ECF7F0] text-[#1A6338] border-[#BCE3CB]'
                            }`}>
                              {isOut ? 'Exceeds Spec' : 'Within Spec'}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Right Side: Selected Result Verification & Source Inspector (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-xl border border-[#E6E4DD] shadow-2xs p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#E6E4DD]">
            <div>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-[#73847B] block">
                Verification Inspector
              </span>
              <h4 className="text-sm font-bold text-[#0E241A]">
                {selectedCheck.analyte}
              </h4>
            </div>
            <button
              onClick={() => handleStartEdit(selectedCheck)}
              className="flex items-center gap-1 text-xs font-semibold text-[#183C2C] hover:underline"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Correct value</span>
            </button>
          </div>

          {/* Current Measured Value & Comparison */}
          <div className="p-3.5 bg-[#FAF9F6] rounded-xl border border-[#E6E4DD] space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs text-[#73847B]">Verified Value:</span>
              <span className="text-lg font-bold font-mono-numbers text-[#0E241A]">
                {selectedCheck.currentValue}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-[#73847B]">Client Specification:</span>
              <span className="font-semibold text-[#19241E] font-mono-numbers">
                {selectedCheck.clientSpec}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs pt-2 border-t border-[#E6E4DD]">
              <span className="text-[#73847B]">Test Outcome:</span>
              <span className={`font-semibold ${
                selectedCheck.issueType === 'out_of_spec' 
                  ? 'text-[#A32828]' 
                  : selectedCheck.issueType === 'extraction_error'
                  ? 'text-[#925316]'
                  : 'text-[#1A6338]'
              }`}>
                {selectedCheck.issueType === 'out_of_spec'
                  ? 'Adverse: Out of Specification'
                  : selectedCheck.issueType === 'extraction_error'
                  ? 'Pending Correction'
                  : 'Conforms to Specification'}
              </span>
            </div>
          </div>

          {/* Supporting Source Scan Excerpt (Traceability) */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-[#43544B] flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-[#183C2C]" />
                <span>Supporting Source Evidence:</span>
              </span>
              <span className="text-[11px] font-mono-numbers text-[#73847B]">
                {selectedCheck.sourceDoc}
              </span>
            </div>

            <div className="p-3 bg-[#FAF9F6] rounded-lg border border-[#E6E4DD] text-xs font-mono-numbers text-[#19241E] leading-relaxed">
              <div className="text-[10px] text-[#73847B] mb-1">
                [Page {selectedCheck.sourcePage} Line Excerpt]
              </div>
              <div className="bg-white p-2 rounded border border-[#E6E4DD]">
                {selectedCheck.sourceExcerpt}
              </div>
            </div>
          </div>

          {/* Inline Edit Form when User clicks Correct value */}
          {isEditing && (
            <form onSubmit={handleSaveCorrection} className="p-3.5 bg-[#FAF9F6] rounded-xl border border-[#183C2C] space-y-3">
              <div className="text-xs font-bold text-[#0E241A]">
                Correct Extracted Value
              </div>
              <div>
                <label className="block text-[11px] text-[#73847B] mb-1">
                  New Value (include unit)
                </label>
                <input
                  type="text"
                  value={editingValue}
                  onChange={(e) => setEditingValue(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs bg-white border border-[#E6E4DD] rounded-md font-mono-numbers font-bold text-[#0E241A] focus:outline-none focus:border-[#183C2C]"
                />
              </div>
              <div>
                <label className="block text-[11px] text-[#73847B] mb-1">
                  Inspector Explanation / Audit Note
                </label>
                <input
                  type="text"
                  placeholder="e.g. Corrected decimal point based on source certificate line 4"
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs bg-white border border-[#E6E4DD] rounded-md text-[#19241E] focus:outline-none focus:border-[#183C2C]"
                />
              </div>
              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-3 py-1 text-xs text-[#73847B]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3 py-1 text-xs font-semibold text-white bg-[#183C2C] hover:bg-[#24523D] rounded-md transition-colors"
                >
                  Save & Evaluate Spec
                </button>
              </div>
            </form>
          )}

          {/* Confirm Button for Selected Item */}
          <div className="pt-2">
            {!selectedCheck.isConfirmed ? (
              <button
                type="button"
                onClick={() => handleConfirm(selectedCheck.id)}
                className="w-full py-2.5 px-4 text-xs font-semibold text-[#183C2C] bg-[#E6EFEA] hover:bg-[#D5E6DC] rounded-lg border border-[#C6D8CC] transition-colors flex items-center justify-center gap-1.5"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Confirm Finding & Acknowledge Outcome</span>
              </button>
            ) : (
              <div className="p-2.5 bg-[#ECF7F0] rounded-lg border border-[#BCE3CB] text-xs text-[#1A6338] flex items-center justify-between font-medium">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Finding Confirmed</span>
                </span>
                <button
                  onClick={() => handleStartEdit(selectedCheck)}
                  className="text-[11px] text-[#183C2C] underline"
                >
                  Change
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Primary Action Button */}
      <div className="pt-4 border-t border-[#E6E4DD] flex items-center justify-between">
        <div className="text-xs text-[#73847B]">
          Correcting transcription errors does not alter the underlying test outcome.
        </div>
        <button
          type="button"
          onClick={() => setActiveJobStage('Draft')}
          className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-[#183C2C] hover:bg-[#24523D] rounded-lg shadow-xs transition-colors"
        >
          <span>Prepare Draft Report</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
