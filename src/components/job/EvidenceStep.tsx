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
  Info,
  Smartphone,
  Cpu,
  Edit3
} from 'lucide-react';

interface EvidenceStepProps {
  job: Job;
}

export const EvidenceStep: React.FC<EvidenceStepProps> = ({ job }) => {
  const { 
    setActiveJobStage, 
    loadBundledEvidence, 
    isProcessingEvidence, 
    addCustomEvidence,
    correctCheckValue,
    showToast
  } = useJobContext();

  const [activeTab, setActiveTab] = useState<'inventory' | 'ingest'>('inventory');
  const [ingestMode, setIngestMode] = useState<'mobile' | 'ocr' | 'instrument' | 'manual'>('ocr');

  // Manual bench entry inputs
  const [benchParam, setBenchParam] = useState('Moisture & Volatile Matter');
  const [benchValue, setBenchValue] = useState('12.8%');
  const [benchMethod, setBenchMethod] = useState('ISO 662 / Oven 103°C');

  // Inspector note inputs
  const [noteText, setNoteText] = useState('');
  const [noteAuthor, setNoteAuthor] = useState('Inspector Mobile Terminal (Berth 14)');

  const [activePreviewItem, setActivePreviewItem] = useState<EvidenceItem | null>(job.evidence[0] || null);

  const handleManualBenchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!benchValue.trim()) return;

    addCustomEvidence(job.id, {
      name: `Laboratory Bench Titration (${benchParam})`,
      category: 'lab_results',
      source: 'Analyst Manual Bench Entry',
      contentSnippet: `Direct testing on duplicate sample: ${benchParam} recorded as ${benchValue} via ${benchMethod}.`,
      provenance: 'Inspection team'
    });

    if (benchParam.includes('Moisture')) {
      correctCheckValue(job.id, 'chk-moisture', benchValue, 'Manual analyst bench entry recorded via digital worksheet.');
    }

    showToast(`Bench measurement ${benchValue} logged for ${benchParam}.`);
    setActiveTab('inventory');
  };

  const handleMobileVoiceSubmit = () => {
    const mobileNote = "Voice Memo [14:15 CET]: Pneumatic discharge from Hold 2 to Silo 4B started. Weather dry, 21°C. Tank seal #NL-9921 inspected intact. Sample composite drawn at 15-minute intervals.";
    addCustomEvidence(job.id, {
      name: 'Mobile Voice Transcript & Photo Feed',
      category: 'field_notes',
      source: 'Inspector Mobile Terminal',
      contentSnippet: mobileNote,
      provenance: 'Inspection team'
    });
    showToast('Mobile field voice note and geo-stamped seal photo ingested.');
    setActiveTab('inventory');
  };

  const handleSimulatedFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      addCustomEvidence(job.id, {
        name: file.name,
        category: 'lab_results',
        source: 'Instrument File Ingestion (CSV / PDF)',
        contentSnippet: `File ${file.name} (${(file.size / 1024).toFixed(1)} KB) ingested. Normalized into job evidence log.`,
        fileDetails: {
          size: `${(file.size / 1024).toFixed(1)} KB`,
          format: file.name.split('.').pop()?.toUpperCase() || 'DATA'
        },
        provenance: 'Inspection team'
      });
      setActiveTab('inventory');
    }
  };

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

        {/* Action Controls */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab(activeTab === 'inventory' ? 'ingest' : 'inventory')}
            className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg border transition-colors ${
              activeTab === 'ingest'
                ? 'bg-[#183C2C] text-white border-[#183C2C]'
                : 'bg-white text-[#183C2C] border-[#C6D8CC] hover:bg-[#E6EFEA]'
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{activeTab === 'ingest' ? 'View Received Evidence' : '+ Ingest New Data Stream'}</span>
          </button>

          {job.id === 'job-4401' && (
            <button
              type="button"
              onClick={() => loadBundledEvidence(job.id)}
              disabled={isProcessingEvidence}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-[#183C2C] bg-[#E6EFEA] hover:bg-[#D5E6DC] rounded-lg border border-[#C6D8CC] transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#183C2C]" />
              <span>{isProcessingEvidence ? 'Extracting...' : 'Reload Bundled Set'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Ingestion Channels Drawer / Surface */}
      {activeTab === 'ingest' ? (
        <div className="bg-white rounded-xl border border-[#E6E4DD] p-6 shadow-2xs space-y-6">
          <div>
            <h3 className="text-base font-bold text-[#0E241A]">
              Data Ingestion Channels
            </h3>
            <p className="text-xs text-[#73847B] mt-0.5">
              How operational inputs enter Veras: choose an ingestion mechanism to simulate data arrival.
            </p>
          </div>

          {/* 4 Ingestion Mode Tabs */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <button
              type="button"
              onClick={() => setIngestMode('ocr')}
              className={`p-3.5 rounded-xl border text-left transition-all ${
                ingestMode === 'ocr'
                  ? 'border-[#183C2C] bg-[#E6EFEA] text-[#183C2C] font-semibold'
                  : 'border-[#E6E4DD] bg-[#FAF9F6] text-[#43544B] hover:border-[#CDC9BD]'
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <FileText className="w-4 h-4 text-[#183C2C]" />
                <span className="text-xs font-bold">1. Supplier CoA OCR</span>
              </div>
              <p className="text-[11px] text-[#73847B] font-normal leading-tight">
                Upload PDF/scan for tabular extraction & normalization.
              </p>
            </button>

            <button
              type="button"
              onClick={() => setIngestMode('mobile')}
              className={`p-3.5 rounded-xl border text-left transition-all ${
                ingestMode === 'mobile'
                  ? 'border-[#183C2C] bg-[#E6EFEA] text-[#183C2C] font-semibold'
                  : 'border-[#E6E4DD] bg-[#FAF9F6] text-[#43544B] hover:border-[#CDC9BD]'
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <Smartphone className="w-4 h-4 text-[#183C2C]" />
                <span className="text-xs font-bold">2. Field Mobile Feed</span>
              </div>
              <p className="text-[11px] text-[#73847B] font-normal leading-tight">
                Inspector transcribed audio notes & geo-tagged seal photos.
              </p>
            </button>

            <button
              type="button"
              onClick={() => setIngestMode('instrument')}
              className={`p-3.5 rounded-xl border text-left transition-all ${
                ingestMode === 'instrument'
                  ? 'border-[#183C2C] bg-[#E6EFEA] text-[#183C2C] font-semibold'
                  : 'border-[#E6E4DD] bg-[#FAF9F6] text-[#43544B] hover:border-[#CDC9BD]'
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <Cpu className="w-4 h-4 text-[#183C2C]" />
                <span className="text-xs font-bold">3. Instrument / LIMS</span>
              </div>
              <p className="text-[11px] text-[#73847B] font-normal leading-tight">
                Automated CSV/JSON export from spectrometer or test rig.
              </p>
            </button>

            <button
              type="button"
              onClick={() => setIngestMode('manual')}
              className={`p-3.5 rounded-xl border text-left transition-all ${
                ingestMode === 'manual'
                  ? 'border-[#183C2C] bg-[#E6EFEA] text-[#183C2C] font-semibold'
                  : 'border-[#E6E4DD] bg-[#FAF9F6] text-[#43544B] hover:border-[#CDC9BD]'
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <Edit3 className="w-4 h-4 text-[#183C2C]" />
                <span className="text-xs font-bold">4. Manual Bench Entry</span>
              </div>
              <p className="text-[11px] text-[#73847B] font-normal leading-tight">
                Direct entry of spot-test measurements by lab analyst.
              </p>
            </button>
          </div>

          {/* Ingestion Mode Specific Actions */}
          <div className="p-5 bg-[#FAF9F6] rounded-xl border border-[#E6E4DD] space-y-4">
            {ingestMode === 'ocr' && (
              <div className="space-y-3">
                <div className="text-xs font-bold text-[#0E241A]">
                  Channel 1: Supplier Document Dropzone & Tabular Normalization
                </div>
                <p className="text-xs text-[#73847B]">
                  Upload supplier Certificate of Analysis (PDF or TIFF). The system parses tabular analyte names, units, and values, aligning them against client specification limits.
                </p>
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-[#183C2C] hover:bg-[#24523D] rounded-lg transition-colors cursor-pointer shadow-xs">
                    <Upload className="w-4 h-4" />
                    <span>Upload Supplier Certificate (PDF)</span>
                    <input type="file" onChange={handleSimulatedFileUpload} className="hidden" />
                  </label>
                  <button
                    type="button"
                    onClick={() => loadBundledEvidence(job.id)}
                    className="px-4 py-2 text-xs font-semibold text-[#183C2C] bg-white border border-[#C6D8CC] hover:bg-[#E6EFEA] rounded-lg transition-colors"
                  >
                    Simulate AgroCorp Lot 449 Ingestion
                  </button>
                </div>
              </div>
            )}

            {ingestMode === 'mobile' && (
              <div className="space-y-3">
                <div className="text-xs font-bold text-[#0E241A]">
                  Channel 2: Field Inspector Mobile Terminal
                </div>
                <p className="text-xs text-[#73847B]">
                  Simulates field inspectors speaking voice notes and taking timestamped seal photographs at the port terminal.
                </p>
                <div className="p-3 bg-white rounded-lg border border-[#E6E4DD] text-xs space-y-1">
                  <span className="font-semibold text-[#183C2C]">Ready to Ingest:</span>
                  <div className="text-[11px] text-[#43544B] italic">
                    &ldquo;Sample drawn from pneumatic discharge chute 4B at 14:15 CET. Seal #NL-9921 intact. Ambient temperature 21°C.&rdquo;
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleMobileVoiceSubmit}
                  className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-[#183C2C] hover:bg-[#24523D] rounded-lg transition-colors shadow-xs"
                >
                  <Smartphone className="w-4 h-4" />
                  <span>Ingest Mobile Audio & Seal Photo</span>
                </button>
              </div>
            )}

            {ingestMode === 'instrument' && (
              <div className="space-y-3">
                <div className="text-xs font-bold text-[#0E241A]">
                  Channel 3: Laboratory Instrument Direct Readout (LIMS / Telemetry)
                </div>
                <p className="text-xs text-[#73847B]">
                  Upload digital calibration or test export files directly from spectrometer or testing rigs.
                </p>
                <label className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-[#183C2C] hover:bg-[#24523D] rounded-lg transition-colors cursor-pointer shadow-xs">
                  <Upload className="w-4 h-4" />
                  <span>Attach Instrument Export (CSV / JSON / LOG)</span>
                  <input type="file" onChange={handleSimulatedFileUpload} className="hidden" />
                </label>
              </div>
            )}

            {ingestMode === 'manual' && (
              <form onSubmit={handleManualBenchSubmit} className="space-y-3">
                <div className="text-xs font-bold text-[#0E241A]">
                  Channel 4: Analyst Manual Bench Entry Worksheet
                </div>
                <p className="text-xs text-[#73847B]">
                  When an analyst conducts a physical titration, moisture oven test, or balance reading on the bench, they record the measured value directly into the job record.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[10px] font-semibold text-[#73847B] uppercase mb-1">Parameter</label>
                    <input
                      type="text"
                      value={benchParam}
                      onChange={(e) => setBenchParam(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs bg-white border border-[#E6E4DD] rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-[#73847B] uppercase mb-1">Measured Value</label>
                    <input
                      type="text"
                      value={benchValue}
                      onChange={(e) => setBenchValue(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs bg-white border border-[#E6E4DD] rounded-md font-mono-numbers font-bold text-[#0E241A]"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-[#73847B] uppercase mb-1">Test Method</label>
                    <input
                      type="text"
                      value={benchMethod}
                      onChange={(e) => setBenchMethod(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs bg-white border border-[#E6E4DD] rounded-md font-mono-numbers"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-1">
                  <button
                    type="submit"
                    className="px-4 py-2 text-xs font-semibold text-white bg-[#183C2C] hover:bg-[#24523D] rounded-lg shadow-xs transition-colors"
                  >
                    Log Bench Measurement to Job
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      ) : (
        /* Standard Received Evidence Inventory */
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
      )}

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
