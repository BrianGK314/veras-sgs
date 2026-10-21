import React, { useState } from 'react';
import { useJobContext } from '../../context/JobContext';
import { Job, CheckItem } from '../../types';
import { 
  FileText, 
  Send, 
  Globe, 
  AlertTriangle, 
  CheckCircle2, 
  Camera, 
  Layers, 
  Printer, 
  Info,
  Clock,
  ArrowRight,
  ExternalLink
} from 'lucide-react';

interface DraftStepProps {
  job: Job;
}

export const DraftStep: React.FC<DraftStepProps> = ({ job }) => {
  const { 
    updateDraftOptions, 
    sendForReview, 
    setActiveJobStage 
  } = useJobContext();

  const [selectedResultId, setSelectedResultId] = useState<string | null>(null);

  const templates: Job['reportTemplate'][] = [
    'Standard Technical Inspection Certificate',
    'Commercial Trade Certificate',
    'Abbreviated Letter of Findings'
  ];

  const handleTemplateChange = (tmpl: Job['reportTemplate']) => {
    updateDraftOptions(job.id, tmpl, job.reportLanguage);
  };

  const handleLanguageChange = (lang: 'en' | 'fr') => {
    updateDraftOptions(job.id, job.reportTemplate, lang);
  };

  const selectedResult = job.checks.find(c => c.id === selectedResultId);

  const moistureCheck = job.checks.find(c => c.id === 'chk-moisture');
  const hasMoistureExceedance = moistureCheck && moistureCheck.currentValue.includes('12.8');

  return (
    <div className="space-y-6">
      {/* Draft Control Bar: Template + Language + Primary Action */}
      <div className="p-4 rounded-xl bg-white border border-[#E6E4DD] shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          {/* Template Selector */}
          <div>
            <label className="block text-[10px] font-semibold text-[#73847B] uppercase tracking-wider mb-1">
              Report Template
            </label>
            <select
              value={job.reportTemplate}
              onChange={(e) => handleTemplateChange(e.target.value as any)}
              className="px-3 py-1.5 text-xs font-semibold bg-[#FAF9F6] border border-[#E6E4DD] rounded-lg focus:outline-none focus:border-[#183C2C] text-[#0E241A]"
            >
              {templates.map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          {/* Language Selector: English / French */}
          <div>
            <label className="block text-[10px] font-semibold text-[#73847B] uppercase tracking-wider mb-1">
              Language Output
            </label>
            <div className="flex items-center gap-1 bg-[#FAF9F6] p-0.5 border border-[#E6E4DD] rounded-lg">
              <button
                type="button"
                onClick={() => handleLanguageChange('en')}
                className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors ${
                  job.reportLanguage === 'en'
                    ? 'bg-[#183C2C] text-white shadow-xs'
                    : 'text-[#43544B] hover:text-[#19241E]'
                }`}
              >
                English (EN)
              </button>
              <button
                type="button"
                onClick={() => handleLanguageChange('fr')}
                className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors ${
                  job.reportLanguage === 'fr'
                    ? 'bg-[#183C2C] text-white shadow-xs'
                    : 'text-[#43544B] hover:text-[#19241E]'
                }`}
              >
                Français (FR)
              </button>
            </div>
          </div>
        </div>

        {/* Primary Action Button */}
        <button
          type="button"
          onClick={() => sendForReview(job.id)}
          className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-[#183C2C] hover:bg-[#24523D] rounded-lg shadow-xs transition-colors self-start md:self-auto"
        >
          <Send className="w-4 h-4" />
          <span>Send for review</span>
        </button>
      </div>

      {/* Review Comments Alert if returned */}
      {job.releaseStatus === 'Returned for Revision' && job.reviewerComments.length > 0 && (
        <div className="p-4 bg-[#FDF0F0] rounded-xl border border-[#F7BFBF] text-xs space-y-2">
          <div className="flex items-center gap-2 font-bold text-[#A32828]">
            <AlertTriangle className="w-4 h-4" />
            <span>Technical Reviewer Revision Request ({job.reviewerComments[0].date})</span>
          </div>
          <p className="text-[#19241E] leading-relaxed bg-white p-3 rounded border border-[#F7BFBF]">
            &ldquo;{job.reviewerComments[0].comment}&rdquo;
          </p>
        </div>
      )}

      {/* Main Working Surface: Report Preview Sheet */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Side: Structured Report Document (8 cols) */}
        <div className="lg:col-span-8 bg-white rounded-xl border border-[#CDC9BD] shadow-sm p-8 text-[#19241E] space-y-6">
          {/* Document Header */}
          <div className="border-b-2 border-[#183C2C] pb-5 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div>
              <div className="text-xs font-bold text-[#183C2C] uppercase tracking-wider">
                {job.reportLanguage === 'fr' 
                  ? 'RAPPORT D’INSPECTION ET DE VÉRIFICATION TECHNIQUE' 
                  : 'TECHNICAL INSPECTION & VERIFICATION REPORT'}
              </div>
              <h2 className="text-xl font-bold tracking-tight text-[#0E241A] mt-1">
                {job.title}
              </h2>
              <div className="text-xs text-[#73847B] mt-0.5">
                {job.reportTemplate} · Dossier Ref: <span className="font-mono-numbers font-semibold text-[#19241E]">{job.code}</span>
              </div>
            </div>

            <div className="text-left sm:text-right text-xs">
              <div className="font-mono-numbers font-bold text-[#0E241A]">{job.version}</div>
              <div className="text-[#73847B] mt-0.5">{job.inspectionDate}</div>
              <span className={`inline-block mt-1 text-[10px] font-semibold px-2 py-0.5 rounded border ${
                job.releaseStatus === 'Approved for Release'
                  ? 'bg-[#ECF7F0] text-[#1A6338] border-[#BCE3CB]'
                  : 'bg-[#FEF6EC] text-[#925316] border-[#F8D8B6]'
              }`}>
                {job.releaseStatus}
              </span>
            </div>
          </div>

          {/* Section 1: Job & Sample Particulars */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#43544B]">
              {job.reportLanguage === 'fr' ? '1. Données d’Identification' : '1. Identification & Scope'}
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-3.5 bg-[#FAF9F6] rounded-lg border border-[#E6E4DD] text-xs">
              <div>
                <span className="text-[10px] text-[#73847B] block uppercase">Client:</span>
                <span className="font-semibold text-[#19241E]">{job.client}</span>
              </div>
              <div>
                <span className="text-[10px] text-[#73847B] block uppercase">Sample Reference:</span>
                <span className="font-mono-numbers font-semibold text-[#19241E]">{job.sampleRef}</span>
              </div>
              <div>
                <span className="text-[10px] text-[#73847B] block uppercase">Location / Berth:</span>
                <span className="font-medium text-[#19241E]">{job.location}</span>
              </div>
            </div>
            <p className="text-xs text-[#43544B] leading-relaxed pt-1">
              {job.scopeDescription}
            </p>
          </div>

          {/* Section 2: Analytical Results Matrix */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#43544B]">
                {job.reportLanguage === 'fr' ? '2. Résultats Analytiques Vérifiés' : '2. Verified Analytical Results'}
              </h3>
              <span className="text-[11px] text-[#73847B]">
                Click row to view source provenance
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border border-[#E6E4DD]">
                <thead className="bg-[#FAF9F6] text-[11px] font-semibold text-[#43544B] border-b border-[#E6E4DD]">
                  <tr>
                    <th className="py-2 px-3">Analyte / Test</th>
                    <th className="py-2 px-3">Standard Method</th>
                    <th className="py-2 px-3 text-right">Measured Result</th>
                    <th className="py-2 px-3">Contract Specification</th>
                    <th className="py-2 px-3 text-right">Evaluation</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E6E4DD] font-mono-numbers text-[11px]">
                  {job.checks.map(c => {
                    const isAdverse = c.issueType === 'out_of_spec';
                    const isSelected = selectedResultId === c.id;

                    return (
                      <tr 
                        key={c.id}
                        onClick={() => setSelectedResultId(c.id)}
                        className={`hover:bg-[#FAF9F6] cursor-pointer transition-colors ${
                          isSelected ? 'bg-[#EBF2ED]/40 font-medium' : ''
                        }`}
                      >
                        <td className="py-2 px-3 font-sans font-medium text-[#19241E]">{c.analyte}</td>
                        <td className="py-2 px-3 text-[#73847B]">{c.testMethod}</td>
                        <td className="py-2 px-3 text-right font-bold text-[#0E241A]">
                          {c.currentValue}
                        </td>
                        <td className="py-2 px-3 text-[#43544B]">{c.clientSpec}</td>
                        <td className="py-2 px-3 text-right">
                          {isAdverse ? (
                            <span className="text-[#A32828] font-bold bg-[#FDF0F0] px-1.5 py-0.5 rounded text-[10px]">
                              OUT OF SPEC
                            </span>
                          ) : (
                            <span className="text-[#1A6338] font-semibold">PASS</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Section 3: Technical Exceptions & Adverse Findings (Uncompromised Rigor) */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#A32828]">
              {job.reportLanguage === 'fr' 
                ? '3. Écarts Techniques et Non-Conformités' 
                : '3. Technical Exceptions & Adverse Findings'}
            </h3>

            {hasMoistureExceedance ? (
              <div className="p-4 bg-[#FDF0F0] rounded-lg border border-[#F7BFBF] text-xs space-y-1.5">
                <div className="font-bold text-[#A32828] flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>Moisture Exceedance (ISO 662) — Contract Non-Conformance</span>
                </div>
                <p className="text-[#19241E] leading-relaxed">
                  {job.reportLanguage === 'fr'
                    ? 'La teneur en humidité observée de 12,8 % m/m excède le seuil contractuel stipulé de 12,0 % m/m d’un écart de +0,8 % m/m. L’erreur de transcription OCR initiale a été corrigée selon la ligne 4 du certificat d’origine. Ce résultat est consigné pour résolution commerciale.'
                    : 'The observed moisture content of 12.8% m/m exceeds the contractual threshold of 12.0% m/m by +0.8% m/m. The initial OCR transcription omission was corrected against source certificate line 4. This adverse finding is recorded without compromise for commercial settlement.'}
                </p>
                <div className="text-[11px] text-[#73847B] pt-1 border-t border-[#F7BFBF]">
                  Evidence: Supplier Certificate Lot 449 & Silo Pneumatic Chute Sample
                </div>
              </div>
            ) : (
              <div className="p-3 bg-[#FAF9F6] rounded-lg border border-[#E6E4DD] text-xs text-[#73847B]">
                No technical exceptions or non-conformances identified.
              </div>
            )}
          </div>

          {/* Section 4: Selected Photographic Evidence */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#43544B]">
              {job.reportLanguage === 'fr' ? '4. Photographies du Prélèvement' : '4. Photographic Records'}
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-[#FAF9F6] rounded-lg border border-[#E6E4DD] text-xs">
                <div className="flex items-center gap-1.5 font-semibold text-[#0E241A] mb-1">
                  <Camera className="w-3.5 h-3.5 text-[#183C2C]" />
                  <span>Discharge Seal #NL-9921</span>
                </div>
                <p className="text-[11px] text-[#73847B]">
                  Tamper-evident seal intact at inspection chute 4B prior to vessel discharge.
                </p>
              </div>
              <div className="p-3 bg-[#FAF9F6] rounded-lg border border-[#E6E4DD] text-xs">
                <div className="flex items-center gap-1.5 font-semibold text-[#0E241A] mb-1">
                  <Camera className="w-3.5 h-3.5 text-[#183C2C]" />
                  <span>Continuous Chute Sampler</span>
                </div>
                <p className="text-[11px] text-[#73847B]">
                  Pneumatic cross-cut diverter drawing representative composite increments.
                </p>
              </div>
            </div>
          </div>

          {/* Section 5: Language Notice if French */}
          {job.reportLanguage === 'fr' && (
            <div className="p-2.5 bg-[#FAF9F6] rounded-lg border border-[#E6E4DD] text-[11px] text-[#73847B] flex items-center gap-2">
              <Globe className="w-3.5 h-3.5 text-[#183C2C]" />
              <span>Traduction préparée pour examen linguistique. Les valeurs numériques et les méthodes ISO restent inchangées.</span>
            </div>
          )}
        </div>

        {/* Right Side: Source Provenance Inspector (4 cols) */}
        <div className="lg:col-span-4 bg-white rounded-xl border border-[#E6E4DD] shadow-2xs p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#E6E4DD]">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#43544B]">
              Source Provenance Link
            </h4>
            <span className="text-xs text-[#73847B]">Traceability</span>
          </div>

          {selectedResult ? (
            <div className="space-y-3">
              <div>
                <span className="text-[10px] text-[#73847B] uppercase block">Selected Parameter:</span>
                <span className="text-sm font-bold text-[#0E241A]">{selectedResult.analyte}</span>
              </div>

              <div className="p-3 bg-[#FAF9F6] rounded-lg border border-[#E6E4DD] text-xs space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[#73847B]">Reported Value:</span>
                  <span className="font-mono-numbers font-bold text-[#0E241A]">{selectedResult.currentValue}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#73847B]">Contract Limit:</span>
                  <span className="font-mono-numbers text-[#43544B]">{selectedResult.clientSpec}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#73847B]">Source Document:</span>
                  <span className="font-mono-numbers text-[#183C2C]">{selectedResult.sourceDoc}</span>
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-xs font-medium text-[#43544B]">Source Excerpt (Page {selectedResult.sourcePage}):</span>
                <div className="p-2.5 bg-[#FAF9F6] rounded border border-[#E6E4DD] text-xs font-mono-numbers text-[#19241E]">
                  {selectedResult.sourceExcerpt}
                </div>
              </div>

              {selectedResult.inspectorNotes && (
                <div className="p-2.5 bg-[#E6EFEA] rounded border border-[#C6D8CC] text-xs text-[#183C2C]">
                  <strong className="block text-[10px] uppercase font-bold">Inspector Note:</strong>
                  {selectedResult.inspectorNotes}
                </div>
              )}
            </div>
          ) : (
            <div className="py-8 text-center text-xs text-[#73847B]">
              Click any row in the verified results table to view its linked source excerpt.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
