import React, { useState } from 'react';
import { useJobContext } from '../../context/JobContext';
import { Job, EvidenceItem } from '../../types';
import { 
  FileText, 
  Camera, 
  Upload, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowRight, 
  FileCheck, 
  Clock, 
  Plus, 
  Layers,
  Sparkles,
  Info
} from 'lucide-react';

interface EvidenceStepProps {
  job: Job;
}

export const EvidenceStep: React.FC<EvidenceStepProps> = ({ job }) => {
  const { 
    setActiveJobStage, 
    loadBundledEvidence, 
    isProcessingEvidence, 
    addCustomEvidence 
  } = useJobContext();

  const [isAddingNote, setIsAddingNote] = useState(false);
  const [noteText, setNoteText] = useState('');
  const [noteAuthor, setNoteAuthor] = useState('Inspector Mobile Terminal');

  const [activePreviewItem, setActivePreviewItem] = useState<EvidenceItem | null>(job.evidence[0] || null);

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteText.trim()) return;
    addCustomEvidence(job.id, {
      name: 'Inspector On-Site Field Note',
      category: 'field_notes',
      source: noteAuthor,
      contentSnippet: noteText,
      provenance: 'Inspection team'
    });
    setNoteText('');
    setIsAddingNote(false);
  };

  const handleSimulatedFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      addCustomEvidence(job.id, {
        name: file.name,
        category: 'lab_results',
        source: 'Local File Selection',
        contentSnippet: `File ${file.name} (${(file.size / 1024).toFixed(1)} KB) logged as received locally.`,
        fileDetails: {
          size: `${(file.size / 1024).toFixed(1)} KB`,
          format: file.name.split('.').pop()?.toUpperCase() || 'DOC'
        },
        provenance: 'Inspection team'
      });
    }
  };

  const hasAllCoreEvidence = job.evidence.length >= 4 && job.evidence.every(e => e.status === 'received');

  return (
    <div className="space-y-6">
      {/* Sample Reference & Scope Context Card */}
      <div className="bg-white p-5 rounded-xl border border-[#E6E4DD] shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-[#73847B] uppercase tracking-wider">
              Sample Verification Context
            </span>
            <span className="text-[11px] font-mono-numbers px-2 py-0.5 rounded bg-[#FAF9F6] text-[#43544B] border border-[#E6E4DD]">
              {job.sampleRef}
            </span>
          </div>
          <div className="text-sm font-semibold text-[#0E241A] mt-1">
            {job.location} · {job.batchRef || 'Lot #449'}
          </div>
          <p className="text-xs text-[#73847B] mt-0.5 max-w-2xl">
            {job.scopeDescription}
          </p>
        </div>

        {/* Walkthrough Quick Loader Button */}
        {job.id === 'job-4401' && (
          <div className="shrink-0">
            <button
              type="button"
              onClick={() => loadBundledEvidence(job.id)}
              disabled={isProcessingEvidence}
              className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-[#183C2C] bg-[#E6EFEA] hover:bg-[#D5E6DC] rounded-lg border border-[#C6D8CC] transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#183C2C]" />
              <span>{isProcessingEvidence ? 'Processing & Extracting...' : 'Reload Bundled Evidence Set'}</span>
            </button>
          </div>
        )}
      </div>

      {/* Main Grid: What arrived vs Source Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Side: Evidence Items List (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-[#0E241A]">
                Received Evidence Inventory
              </h3>
              <p className="text-xs text-[#73847B]">
                Documents, telemetry, and notes logged for this inspection sample
              </p>
            </div>
            <span className="text-xs font-mono-numbers text-[#73847B]">
              {job.evidence.filter(e => e.status === 'received').length} of {job.evidence.length} arrived
            </span>
          </div>

          <div className="space-y-3">
            {job.evidence.map((item) => {
              const isSelected = activePreviewItem?.id === item.id;
              const isSupplier = item.provenance === 'Supplier-provided';

              return (
                <div
                  key={item.id}
                  onClick={() => setActivePreviewItem(item)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-white border-[#183C2C] ring-1 ring-[#183C2C] shadow-xs'
                      : 'bg-white border-[#E6E4DD] hover:border-[#CDC9BD]'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-[#FAF9F6] border border-[#E6E4DD] flex items-center justify-center text-[#183C2C] shrink-0 mt-0.5">
                        {item.category === 'photo' ? (
                          <Camera className="w-4 h-4" />
                        ) : (
                          <FileText className="w-4 h-4" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-[#0E241A]">
                            {item.name}
                          </h4>
                        </div>
                        <div className="text-xs text-[#73847B] mt-0.5">
                          Source: <strong className="text-[#43544B] font-medium">{item.source}</strong> · Date: {item.date}
                        </div>
                        {item.contentSnippet && (
                          <p className="text-xs text-[#19241E] mt-2 line-clamp-2 bg-[#FAF9F6] p-2 rounded border border-[#E6E4DD]/60">
                            {item.contentSnippet}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className={`inline-block text-[11px] font-semibold px-2 py-0.5 rounded border ${
                        isSupplier 
                          ? 'bg-[#FDF3EC] text-[#964F1A] border-[#F8DCB8]'
                          : 'bg-[#ECF7F0] text-[#1A6338] border-[#BCE3CB]'
                      }`}>
                        {item.provenance}
                      </span>
                      <div className="text-[11px] text-[#73847B] mt-1 font-mono-numbers">
                        {item.sampleRef}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quick Intake Controls: Add note or select local file */}
          <div className="pt-2 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => setIsAddingNote(!isAddingNote)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#43544B] bg-white border border-[#E6E4DD] hover:bg-[#FAF9F6] rounded-lg transition-colors"
            >
              <Plus className="w-3.5 h-3.5 text-[#183C2C]" />
              <span>{isAddingNote ? 'Cancel note' : 'Paste inspector note'}</span>
            </button>

            <label className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#43544B] bg-white border border-[#E6E4DD] hover:bg-[#FAF9F6] rounded-lg transition-colors cursor-pointer">
              <Upload className="w-3.5 h-3.5 text-[#183C2C]" />
              <span>Attach local document</span>
              <input
                type="file"
                onChange={handleSimulatedFileUpload}
                className="hidden"
              />
            </label>
          </div>

          {/* Inline Form to add pasted note */}
          {isAddingNote && (
            <form onSubmit={handleAddNote} className="p-4 bg-white rounded-xl border border-[#E6E4DD] space-y-3">
              <div className="text-xs font-semibold text-[#0E241A]">Add Manual Field Note</div>
              <textarea
                rows={3}
                placeholder="Paste on-site observations, weather conditions, or sampling temperature..."
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                required
                className="w-full p-2.5 text-xs bg-[#FAF9F6] border border-[#E6E4DD] rounded-lg focus:outline-none focus:border-[#183C2C] text-[#19241E]"
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddingNote(false)}
                  className="px-3 py-1 text-xs text-[#73847B]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3 py-1 text-xs font-semibold text-white bg-[#183C2C] hover:bg-[#24523D] rounded-md transition-colors"
                >
                  Save Note to Job
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Right Side: Selected Evidence Detail / Document Excerpt (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-xl border border-[#E6E4DD] shadow-2xs p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#E6E4DD]">
            <div className="flex items-center gap-2">
              <FileCheck className="w-4 h-4 text-[#183C2C]" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#43544B]">
                Evidence Provenance Preview
              </h4>
            </div>
            <span className="text-[11px] font-mono-numbers text-[#73847B]">
              Verified Source
            </span>
          </div>

          {activePreviewItem ? (
            <div className="space-y-4">
              <div>
                <div className="text-sm font-bold text-[#0E241A]">
                  {activePreviewItem.name}
                </div>
                <div className="text-xs text-[#73847B] mt-0.5">
                  Logged from {activePreviewItem.source}
                </div>
              </div>

              {/* Provenance breakdown badge */}
              <div className="p-3 bg-[#FAF9F6] rounded-lg border border-[#E6E4DD] text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[#73847B]">Origin:</span>
                  <span className="font-semibold text-[#19241E]">{activePreviewItem.provenance}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#73847B]">Sample Reference:</span>
                  <span className="font-mono-numbers font-medium text-[#19241E]">{activePreviewItem.sampleRef}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#73847B]">Reference Consistency:</span>
                  <span className="text-[#1A6338] font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Exact Match</span>
                  </span>
                </div>
              </div>

              {/* Document Excerpt Preview */}
              <div className="space-y-1.5">
                <div className="text-xs font-semibold text-[#43544B]">
                  Logged Content / Scan Excerpt:
                </div>
                <div className="p-3.5 bg-[#FAF9F6] rounded-lg border border-[#E6E4DD] text-xs font-mono-numbers text-[#19241E] leading-relaxed">
                  {activePreviewItem.contentSnippet || 'No text snippet available.'}
                </div>
              </div>

              {/* Visual simulated attachment if photo */}
              {activePreviewItem.category === 'photo' && (
                <div className="h-44 bg-[#1E2922] rounded-lg border border-[#43544B] p-4 flex flex-col justify-between text-white relative overflow-hidden">
                  <div className="flex items-center justify-between text-xs z-10">
                    <span className="font-mono-numbers bg-black/50 px-2 py-0.5 rounded text-[10px]">
                      TAG #NL-9921
                    </span>
                    <span className="text-[10px] text-[#BCE3CB]">GPS: Terminal Silo 4B</span>
                  </div>
                  {/* Subtle graphic representation of tamper seal tag */}
                  <div className="flex items-center justify-center my-auto">
                    <div className="border-2 border-dashed border-[#F8D8B6] p-3 rounded text-center">
                      <div className="text-xs font-bold text-[#F8D8B6] font-mono-numbers">
                        SEAL #NL-9921 INTACT
                      </div>
                      <div className="text-[10px] text-gray-300">Timestamp: 14:15:22 CET</div>
                    </div>
                  </div>
                  <div className="text-[10px] text-gray-300 text-center">
                    Inspection image logged in chain-of-custody register
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="py-8 text-center text-xs text-[#73847B]">
              Select an evidence item on the left to preview its source.
            </div>
          )}
        </div>
      </div>

      {/* Primary Action Button */}
      <div className="pt-4 border-t border-[#E6E4DD] flex items-center justify-between">
        <div className="text-xs text-[#73847B]">
          Evidence checked and linked to sample <strong>{job.sampleRef}</strong>.
        </div>
        <button
          type="button"
          onClick={() => setActiveJobStage('Checks')}
          className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-[#183C2C] hover:bg-[#24523D] rounded-lg shadow-xs transition-colors"
        >
          <span>Proceed to Checks</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
