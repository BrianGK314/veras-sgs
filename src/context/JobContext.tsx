import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  Job, 
  UserRole, 
  JobStage, 
  EvidenceItem, 
  CheckItem, 
  ReviewerComment,
  ServiceType 
} from '../types';

interface JobContextType {
  // Navigation
  activeView: 'work' | 'review' | 'reports';
  setActiveView: (view: 'work' | 'review' | 'reports') => void;
  activeJobId: string | null;
  activeJob: Job | null;
  activeJobStage: JobStage;
  setActiveJobStage: (stage: JobStage) => void;
  openJob: (id: string, initialStage?: JobStage) => void;
  closeJob: () => void;

  // Role perspective
  currentRole: UserRole;
  setCurrentRole: (role: UserRole) => void;

  // Work filter
  workFilter: 'all' | 'mine' | 'attention';
  setWorkFilter: (filter: 'all' | 'mine' | 'attention') => void;

  // Jobs state
  jobs: Job[];
  loadBundledEvidence: (jobId: string) => void;
  isProcessingEvidence: boolean;
  addCustomEvidence: (jobId: string, item: Partial<EvidenceItem>) => void;
  correctCheckValue: (jobId: string, checkId: string, newValue: string, notes?: string) => void;
  confirmCheck: (jobId: string, checkId: string) => void;
  updateDraftOptions: (
    jobId: string, 
    template: 'Standard Technical Inspection Certificate' | 'Commercial Trade Certificate' | 'Abbreviated Letter of Findings',
    language: 'en' | 'fr',
    findingsSummary?: string
  ) => void;
  sendForReview: (jobId: string) => void;
  returnReportWithComment: (jobId: string, commentText: string) => void;
  approveReportForRelease: (jobId: string) => void;
  createNewJob: (jobData: Partial<Job>) => void;

  // Toast notifications
  toastMessage: string | null;
  showToast: (msg: string) => void;
}

const STORAGE_KEY = 'veras_reporting_workspace_jobs_v2';

const initialJobs: Job[] = [
  {
    id: 'job-4401',
    code: 'JOB-2026-4401',
    title: 'Bulk Soybean Vessel Discharge & Moisture Clearance',
    serviceType: 'Agricultural shipment inspection',
    client: 'Meridian Agri-Logistics B.V.',
    sampleRef: 'SAMPLE-SOYA-LOT-449',
    batchRef: 'VESSEL-DISCHARGE-HOLD-2',
    location: 'Terminal 4B, Grain Silos Quay',
    dueDate: 'Today, 17:00',
    stage: 'Checks',
    nextAction: 'Check two extracted values',
    ownerRole: 'Inspector',
    ownerName: 'Field Inspection Team',
    version: 'v1.0',
    releaseStatus: 'Draft',
    scopeDescription: 'Continuous sampling during pneumatic vessel discharge in accordance with ISO 5555 / GAFTA 124 sampling rules. Physical parameter check for moisture, impurities, and contractual threshold compliance.',
    inspectionDate: '2026-10-20 14:15 CET',
    findingsSummary: 'Vessel discharge sampled at continuous intervals from Silo 4B. Visual appearance nominal. Moisture content requires specific attention regarding contractual threshold.',
    evidence: [
      {
        id: 'ev-1',
        name: 'Field Inspector Intake Notes & Voice Log',
        category: 'field_notes',
        source: 'Mobile Inspector Feed (Berth 14)',
        date: '2026-10-20 14:15 CET',
        status: 'received',
        sampleRef: 'SAMPLE-SOYA-LOT-449',
        sampleRefMatches: true,
        contentSnippet: 'Sample drawn from pneumatic discharge chute 4B. Weather clear, ambient temperature 21°C. Silo intake seal #NL-9921 intact prior to sampling. Slight grain haze observed.',
        provenance: 'Inspection team'
      },
      {
        id: 'ev-2',
        name: 'Discharge Silo Tamper Seal Photo #NL-9921',
        category: 'photo',
        source: 'Terminal Camera Feed',
        date: '2026-10-20 14:18 CET',
        status: 'received',
        sampleRef: 'SAMPLE-SOYA-LOT-449',
        sampleRefMatches: true,
        contentSnippet: 'High-resolution photograph of brass security tag #NL-9921 locked on inspection port 4B.',
        fileDetails: { size: '3.8 MB', format: 'JPEG' },
        provenance: 'Inspection team'
      },
      {
        id: 'ev-3',
        name: 'Supplier Certificate of Analysis (Lot 449)',
        category: 'supplier_cert',
        source: 'Supplier Scanned PDF Upload',
        date: '2026-10-20 08:30 CET',
        status: 'received',
        sampleRef: 'SAMPLE-SOYA-LOT-449',
        sampleRefMatches: true,
        contentSnippet: 'AgroCorp Loading Certificate Lot #449. Analyzed moisture, foreign matter, oil content, and heavy metals.',
        fileDetails: { size: '2.4 MB', format: 'PDF' },
        provenance: 'Supplier-provided'
      },
      {
        id: 'ev-4',
        name: 'Meridian Commercial Contract Specification',
        category: 'client_spec',
        source: 'Client Trade Terms (Spec AG-2026-14)',
        date: '2026-10-15',
        status: 'received',
        sampleRef: 'SAMPLE-SOYA-LOT-449',
        sampleRefMatches: true,
        contentSnippet: 'Max moisture: 12.0% m/m; Max foreign matter: 1.50% m/m; Min total oil: 18.0% m/m.',
        provenance: 'Client contract'
      }
    ],
    checks: [
      {
        id: 'chk-moisture',
        analyte: 'Moisture & Volatile Matter',
        testMethod: 'ISO 662 / Oven 103°C',
        rawValue: '128%',
        currentValue: '128%',
        isCorrected: false,
        unit: '% m/m',
        clientSpec: '≤ 12.0% max',
        specThreshold: 12.0,
        specComparator: '<=',
        sourceDoc: 'Supplier_AgroCorp_CoA_Lot449.pdf',
        sourceExcerpt: 'Moisture and volatile matter (ISO 662) ................... 12.8 % m/m',
        sourcePage: 1,
        needsAttention: true,
        issueType: 'extraction_error',
        issueDescription: 'Extracted value "128%" appears to be an OCR decimal omission from line 4 of supplier certificate (source states 12.8%).',
        provenance: 'Supplier-provided',
        isConfirmed: false
      },
      {
        id: 'chk-foreign',
        analyte: 'Insoluble Foreign Matter',
        testMethod: 'ISO 663:2017',
        rawValue: '0.82%',
        currentValue: '0.82%',
        isCorrected: false,
        unit: '% m/m',
        clientSpec: '≤ 1.50% max',
        specThreshold: 1.50,
        specComparator: '<=',
        sourceDoc: 'Supplier_AgroCorp_CoA_Lot449.pdf',
        sourceExcerpt: 'Insoluble foreign matter ................................. 0.82 % m/m',
        sourcePage: 1,
        needsAttention: false,
        issueType: 'none',
        provenance: 'Supplier-provided',
        isConfirmed: true
      },
      {
        id: 'chk-oil',
        analyte: 'Total Oil Content (Dry Basis)',
        testMethod: 'ISO 659 (Hexane extraction)',
        rawValue: '18.64%',
        currentValue: '18.64%',
        isCorrected: false,
        unit: '% m/m',
        clientSpec: '≥ 18.00% min',
        specThreshold: 18.00,
        specComparator: '>=',
        sourceDoc: 'Supplier_AgroCorp_CoA_Lot449.pdf',
        sourceExcerpt: 'Total oil content (dry basis) ............................ 18.64 % m/m',
        sourcePage: 1,
        needsAttention: false,
        issueType: 'none',
        provenance: 'Supplier-provided',
        isConfirmed: true
      },
      {
        id: 'chk-ffa',
        analyte: 'Free Fatty Acids (FFA as Oleic)',
        testMethod: 'ISO 660:2020 Titration',
        rawValue: '1.42%',
        currentValue: '1.42%',
        isCorrected: false,
        unit: '% m/m',
        clientSpec: '≤ 1.50% max',
        specThreshold: 1.50,
        specComparator: '<=',
        sourceDoc: 'Supplier_AgroCorp_CoA_Lot449.pdf',
        sourceExcerpt: 'Free fatty acids as oleic ............................... 1.42 % m/m',
        sourcePage: 1,
        needsAttention: false,
        issueType: 'none',
        provenance: 'Inspection team',
        isConfirmed: true
      },
      {
        id: 'chk-cadmium',
        analyte: 'Cadmium Trace Metal (Cd)',
        testMethod: 'EN 14538 (ICP-OES)',
        rawValue: '0.042 mg/kg',
        currentValue: '0.042 mg/kg',
        isCorrected: false,
        unit: 'mg/kg',
        clientSpec: '≤ 0.050 mg/kg max',
        specThreshold: 0.050,
        specComparator: '<=',
        sourceDoc: 'Supplier_AgroCorp_CoA_Lot449.pdf',
        sourceExcerpt: 'Cadmium (Cd) ICP-OES ................................... 0.042 mg/kg',
        sourcePage: 1,
        needsAttention: false,
        issueType: 'none',
        provenance: 'External lab',
        isConfirmed: true
      }
    ],
    reportTemplate: 'Standard Technical Inspection Certificate',
    reportLanguage: 'en',
    reviewerComments: []
  },
  {
    id: 'job-1180',
    code: 'JOB-2026-1180',
    title: 'Children’s Silicone Teether Phthalate Migration Assay',
    serviceType: 'Consumer-product testing',
    client: 'Solari Playwares Ltd',
    sampleRef: 'BATCH-SP-782',
    batchRef: 'MOLD-LINE-04',
    location: 'Central Polymer Safety Lab',
    dueDate: 'Tomorrow, 12:00',
    stage: 'Draft',
    nextAction: 'Review the draft',
    ownerRole: 'Reviewer',
    ownerName: 'Technical Reviewer',
    version: 'v1.0',
    releaseStatus: 'In Review',
    scopeDescription: 'Total plasticizer migration and elemental safety evaluation under EN 71-3 toy safety standard. Assessment for restricted phthalates (DEHP, DBP, BBP, DINP).',
    inspectionDate: '2026-10-19 11:00 CET',
    findingsSummary: 'All migration thresholds are within allowable limits for oral contact toy products. Clean toxicological profile.',
    evidence: [
      {
        id: 'ev-1180-1',
        name: 'Laboratory Chromatograph HPLC-MS Report',
        category: 'lab_results',
        source: 'Instrument Console LIMS-2',
        date: '2026-10-19 16:30 CET',
        status: 'received',
        sampleRef: 'BATCH-SP-782',
        sampleRefMatches: true,
        contentSnippet: 'Target phthalate peak detection below quantification threshold (< 0.005%).',
        provenance: 'Inspection team'
      },
      {
        id: 'ev-1180-2',
        name: 'Solari Toy Safety Contract Specification',
        category: 'client_spec',
        source: 'Contract Doc CS-TOY-26',
        date: '2026-10-10',
        status: 'received',
        sampleRef: 'BATCH-SP-782',
        sampleRefMatches: true,
        contentSnippet: 'EN 71-3 compliance; zero detectable phthalate compounds.',
        provenance: 'Client contract'
      }
    ],
    checks: [
      {
        id: 'chk-phthalate',
        analyte: 'Total Phthalate Content (DEHP + DBP + BBP)',
        testMethod: 'EN 14372 / GC-MS',
        rawValue: '< 0.005%',
        currentValue: '< 0.005%',
        isCorrected: false,
        unit: '% w/w',
        clientSpec: '< 0.01% max',
        sourceDoc: 'LIMS_Chromatogram_SP782.pdf',
        sourceExcerpt: 'No detectable peaks above baseline limit of detection 0.005%.',
        sourcePage: 1,
        needsAttention: false,
        issueType: 'none',
        provenance: 'Inspection team',
        isConfirmed: true
      },
      {
        id: 'chk-migration',
        analyte: 'Heavy Metals Migration (Lead Pb)',
        testMethod: 'EN 71-3 Category III',
        rawValue: '0.12 mg/kg',
        currentValue: '0.12 mg/kg',
        unit: 'mg/kg',
        clientSpec: '≤ 2.0 mg/kg max',
        sourceDoc: 'ICP_Screening_Solari.pdf',
        sourceExcerpt: 'Extracted lead: 0.12 mg/kg in simulated saliva solution.',
        sourcePage: 1,
        isCorrected: false,
        needsAttention: false,
        issueType: 'none',
        provenance: 'Inspection team',
        isConfirmed: true
      }
    ],
    reportTemplate: 'Standard Technical Inspection Certificate',
    reportLanguage: 'en',
    reviewerComments: []
  },
  {
    id: 'job-8922',
    code: 'JOB-2026-8922',
    title: 'Cryogenic Tank Pressure Vessel Ultrasonic Weld Verification',
    serviceType: 'Industrial equipment inspection',
    client: 'Nordic Alloy Systems Oy',
    sampleRef: 'VESSEL-ASME-902',
    location: 'Fabrication Bay Delta-3',
    dueDate: '24 Oct 2026',
    stage: 'Release',
    nextAction: 'Prepare the release package',
    ownerRole: 'Coordinator',
    ownerName: 'Operations Coordinator',
    version: 'v1.2 Approved',
    releaseStatus: 'Approved for Release',
    scopeDescription: 'Phased Array Ultrasonic Testing (PAUT) of circumferential seam welds in accordance with ASME Section VIII Division 1 and ISO 17640 Level B.',
    inspectionDate: '2026-10-18 10:00 CET',
    findingsSummary: 'Circumferential welds Seams A-1 through A-4 evaluated. Zero planar indications detected. Weld sound quality complies with ASME acceptance standards.',
    approvedAt: '2026-10-19 15:40 CET',
    approvedBy: 'Senior Technical Reviewer',
    evidence: [
      {
        id: 'ev-8922-1',
        name: 'Ultrasonic Ultrasonic B-Scan Calibration Log',
        category: 'lab_results',
        source: 'OmniScan Field Unit #PA-44',
        date: '2026-10-18 11:30 CET',
        status: 'received',
        sampleRef: 'VESSEL-ASME-902',
        sampleRefMatches: true,
        contentSnippet: 'Calibration on 25mm carbon steel reference block verified before and after inspection.',
        provenance: 'Inspection team'
      }
    ],
    checks: [
      {
        id: 'chk-weld',
        analyte: 'Circumferential Seam Weld Integrity (PAUT)',
        testMethod: 'ISO 17640 / ASME VIII',
        rawValue: 'Acceptable (0 planar defects)',
        currentValue: 'Acceptable (0 planar defects)',
        isCorrected: false,
        unit: 'class',
        clientSpec: 'ASME Section VIII Level 1',
        sourceDoc: 'PAUT_Inspection_Report_ASME902.pdf',
        sourceExcerpt: 'No planar or volumetric reflectors exceeding reference amplitude.',
        sourcePage: 2,
        needsAttention: false,
        issueType: 'none',
        provenance: 'Inspection team',
        isConfirmed: true
      }
    ],
    reportTemplate: 'Commercial Trade Certificate',
    reportLanguage: 'en',
    reviewerComments: []
  },
  {
    id: 'job-3021',
    code: 'JOB-2026-3021',
    title: 'Bulk Extra Virgin Olive Oil Acidity & UV Spectrometry',
    serviceType: 'Food & edible oil testing',
    client: 'Aura Bio-Nutrients S.A.',
    sampleRef: 'LOT-EVOO-501',
    location: 'Central Fats & Oils Testing Bed',
    dueDate: 'Today, 18:30',
    stage: 'Evidence',
    nextAction: 'Add missing evidence',
    ownerRole: 'Inspector',
    ownerName: 'Field Inspection Team',
    version: 'v0.9 Draft',
    releaseStatus: 'Draft',
    scopeDescription: 'Evaluation of free acidity, peroxide value, and UV absorption (K232, K270) under IOC Trade Standard COI/T.15/NC No 3/Rev. 19.',
    inspectionDate: '2026-10-20 09:15 CET',
    findingsSummary: 'Awaiting laboratory UV spectrophotometer raw data export before completing technical checks.',
    evidence: [
      {
        id: 'ev-3021-1',
        name: 'Field Sample Tank Intake Dispatch Form',
        category: 'field_notes',
        source: 'Courier Reception',
        date: '2026-10-20 09:15 CET',
        status: 'received',
        sampleRef: 'LOT-EVOO-501',
        sampleRefMatches: true,
        contentSnippet: 'Three 500ml amber glass bottles received in temperature-controlled cooler box (14°C).',
        provenance: 'Inspection team'
      },
      {
        id: 'ev-3021-2',
        name: 'UV Spectrometry Export (K232 / K270)',
        category: 'lab_results',
        source: 'Shimadzu UV-1900i Spectrophotometer',
        date: 'Pending',
        status: 'pending',
        sampleRef: 'LOT-EVOO-501',
        sampleRefMatches: true,
        contentSnippet: 'Spectrophotometric curve awaiting laboratory analyst verification.',
        provenance: 'Inspection team'
      }
    ],
    checks: [
      {
        id: 'chk-acidity',
        analyte: 'Free Fatty Acids (Acidity as Oleic)',
        testMethod: 'ISO 660 (Cold solvent titration)',
        rawValue: '0.28%',
        currentValue: '0.28%',
        isCorrected: false,
        unit: '% m/m',
        clientSpec: '≤ 0.80% max',
        sourceDoc: 'Titration_Bench_Log.pdf',
        sourceExcerpt: 'Free acidity: 0.28 g oleic acid per 100g oil.',
        sourcePage: 1,
        needsAttention: false,
        issueType: 'none',
        provenance: 'Inspection team',
        isConfirmed: true
      }
    ],
    reportTemplate: 'Standard Technical Inspection Certificate',
    reportLanguage: 'en',
    reviewerComments: []
  },
  {
    id: 'job-5510',
    code: 'JOB-2026-5510',
    title: 'Precast Concrete Cylinder 28-Day Compressive Strength',
    serviceType: 'Construction materials certification',
    client: 'Vanguard Infrastructure Group',
    sampleRef: 'CYLINDER-C40-88',
    location: 'Civil Engineering Materials Lab',
    dueDate: '26 Oct 2026',
    stage: 'Checks',
    nextAction: 'Verify cylinder curing records',
    ownerRole: 'Inspector',
    ownerName: 'Field Inspection Team',
    version: 'v1.0',
    releaseStatus: 'Draft',
    scopeDescription: 'Determination of compressive strength of 150mm concrete cylinders after 28-day water curing in accordance with EN 12390-3.',
    inspectionDate: '2026-10-18 14:00 CET',
    findingsSummary: 'Compression fracture mode verified as conical. Mean compressive strength exceeds class C40/50 requirement.',
    evidence: [
      {
        id: 'ev-5510-1',
        name: 'Hydraulic Press Machine Calibration Certificate',
        category: 'lab_results',
        source: 'Instron 3000kN Testing Rig',
        date: '2026-10-18 14:30 CET',
        status: 'received',
        sampleRef: 'CYLINDER-C40-88',
        sampleRefMatches: true,
        contentSnippet: 'Rig calibrated to Class 1 accuracy under EN ISO 7500-1.',
        provenance: 'Inspection team'
      }
    ],
    checks: [
      {
        id: 'chk-compressive',
        analyte: 'Compressive Strength (28-day mean)',
        testMethod: 'EN 12390-3:2019',
        rawValue: '46.8 MPa',
        currentValue: '46.8 MPa',
        isCorrected: false,
        unit: 'MPa',
        clientSpec: '≥ 40.0 MPa min',
        sourceDoc: 'Instron_Failure_Data_88.csv',
        sourceExcerpt: 'Max load: 827.1 kN; cross-sectional area: 17,671 mm²; strength: 46.8 MPa',
        sourcePage: 1,
        needsAttention: false,
        issueType: 'none',
        provenance: 'Inspection team',
        isConfirmed: true
      }
    ],
    reportTemplate: 'Standard Technical Inspection Certificate',
    reportLanguage: 'en',
    reviewerComments: []
  }
];

const JobContext = createContext<JobContextType | null>(null);

export const JobProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeView, setActiveView] = useState<'work' | 'review' | 'reports'>('work');
  const [activeJobId, setActiveJobId] = useState<string | null>(null);
  const [currentRole, setCurrentRole] = useState<UserRole>('Inspector');
  const [workFilter, setWorkFilter] = useState<'all' | 'mine' | 'attention'>('all');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isProcessingEvidence, setIsProcessingEvidence] = useState(false);

  // Load from localStorage or use initialJobs
  const [jobs, setJobs] = useState<Job[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.warn('Failed to parse saved jobs from localStorage', e);
    }
    return initialJobs;
  });

  // Save to localStorage whenever jobs change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(jobs));
    } catch (e) {
      console.warn('Failed to save jobs to localStorage', e);
    }
  }, [jobs]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4500);
  };

  const activeJob = jobs.find(j => j.id === activeJobId) || null;
  const activeJobStage = activeJob?.stage || 'Evidence';

  const setActiveJobStage = (stage: JobStage) => {
    if (!activeJobId) return;
    setJobs(prev => prev.map(j => {
      if (j.id === activeJobId) {
        return { ...j, stage };
      }
      return j;
    }));
  };

  const openJob = (id: string, initialStage?: JobStage) => {
    setActiveJobId(id);
    if (initialStage) {
      setJobs(prev => prev.map(j => {
        if (j.id === id) {
          return { ...j, stage: initialStage };
        }
        return j;
      }));
    }
  };

  const closeJob = () => {
    setActiveJobId(null);
  };

  // Load bundled evidence for walkthrough
  const loadBundledEvidence = (jobId: string) => {
    setIsProcessingEvidence(true);
    showToast('Ingesting bundled evidence set (notes, photos, and supplier certificate)...');

    setTimeout(() => {
      setIsProcessingEvidence(false);
      setJobs(prev => prev.map(j => {
        if (j.id === jobId) {
          return {
            ...j,
            stage: 'Checks',
            nextAction: 'Check two extracted values',
            evidence: j.evidence.map(e => ({ ...e, status: 'received' }))
          };
        }
        return j;
      }));
      showToast('Evidence set processed. 2 items flagged for technical check.');
    }, 1000);
  };

  const addCustomEvidence = (jobId: string, item: Partial<EvidenceItem>) => {
    setJobs(prev => prev.map(j => {
      if (j.id === jobId) {
        const newItem: EvidenceItem = {
          id: `ev-custom-${Date.now()}`,
          name: item.name || 'Additional Field Document',
          category: item.category || 'field_notes',
          source: item.source || 'Local Upload',
          date: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' Today',
          status: 'received',
          sampleRef: j.sampleRef,
          sampleRefMatches: true,
          contentSnippet: item.contentSnippet || 'Document received and logged into job register.',
          provenance: item.provenance || 'Inspection team'
        };
        return {
          ...j,
          evidence: [newItem, ...j.evidence]
        };
      }
      return j;
    }));
    showToast('Evidence logged into job record.');
  };

  // Correct Check value: core walkthrough step (128% -> 12.8% which exceeds 12.0% spec)
  const correctCheckValue = (jobId: string, checkId: string, newValue: string, notes?: string) => {
    setJobs(prev => prev.map(j => {
      if (j.id === jobId) {
        const updatedChecks = j.checks.map(c => {
          if (c.id === checkId) {
            // Strip percent or non-numbers for comparison
            const numericValue = parseFloat(newValue.replace(/[^0-9.]/g, ''));
            const isMoisture = checkId === 'chk-moisture';
            
            let newIssueType: CheckItem['issueType'] = 'none';
            let newIssueDesc = '';
            let needsAttention = false;

            if (isMoisture) {
              // 12.8% exceeds client spec limit of 12.0% max!
              if (!isNaN(numericValue) && numericValue > 12.0) {
                newIssueType = 'out_of_spec';
                newIssueDesc = `Corrected value ${newValue} is out of specification (Contract max: ≤ 12.0% m/m; Exceedance: +${(numericValue - 12.0).toFixed(1)}%). Recorded as adverse finding.`;
                needsAttention = true;
              } else if (!isNaN(numericValue) && numericValue <= 12.0) {
                newIssueType = 'none';
                needsAttention = false;
              }
            }

            return {
              ...c,
              currentValue: newValue,
              isCorrected: true,
              issueType: newIssueType,
              issueDescription: newIssueDesc || c.issueDescription,
              needsAttention,
              inspectorNotes: notes || c.inspectorNotes || 'Corrected OCR transcription decimal omission from source line 4.',
              isConfirmed: false
            };
          }
          return c;
        });

        // Recalculate job next action
        const remainingAttention = updatedChecks.filter(c => c.needsAttention && !c.isConfirmed).length;
        const nextAction = remainingAttention > 0 
          ? `Review ${remainingAttention} adverse finding` 
          : 'Prepare the draft';

        return {
          ...j,
          checks: updatedChecks,
          nextAction
        };
      }
      return j;
    }));

    showToast(`Value updated to "${newValue}". Evaluated against client contract specification.`);
  };

  const confirmCheck = (jobId: string, checkId: string) => {
    setJobs(prev => prev.map(j => {
      if (j.id === jobId) {
        const updatedChecks = j.checks.map(c => {
          if (c.id === checkId) {
            return {
              ...c,
              isConfirmed: true,
              needsAttention: false
            };
          }
          return c;
        });

        const unconfirmed = updatedChecks.filter(c => !c.isConfirmed && c.needsAttention).length;
        const nextAction = unconfirmed === 0 ? 'Prepare the draft' : `Review ${unconfirmed} remaining item`;

        return {
          ...j,
          checks: updatedChecks,
          nextAction
        };
      }
      return j;
    }));
    showToast('Finding confirmed and recorded in technical audit trail.');
  };

  const updateDraftOptions = (
    jobId: string, 
    template: 'Standard Technical Inspection Certificate' | 'Commercial Trade Certificate' | 'Abbreviated Letter of Findings',
    language: 'en' | 'fr',
    findingsSummary?: string
  ) => {
    setJobs(prev => prev.map(j => {
      if (j.id === jobId) {
        return {
          ...j,
          reportTemplate: template,
          reportLanguage: language,
          findingsSummary: findingsSummary !== undefined ? findingsSummary : j.findingsSummary
        };
      }
      return j;
    }));
  };

  // Send for review: moves job to Review queue
  const sendForReview = (jobId: string) => {
    setJobs(prev => prev.map(j => {
      if (j.id === jobId) {
        return {
          ...j,
          stage: 'Release',
          releaseStatus: 'In Review',
          ownerRole: 'Reviewer',
          ownerName: 'Technical Reviewer',
          nextAction: 'Review the draft'
        };
      }
      return j;
    }));
    showToast('Draft sent for technical review. Job placed in Review queue.');
  };

  // Return report with comment: increments version and sets status
  const returnReportWithComment = (jobId: string, commentText: string) => {
    setJobs(prev => prev.map(j => {
      if (j.id === jobId) {
        const currentVersionNumber = parseFloat(j.version.replace('v', '')) || 1.0;
        const nextVersion = `v${(currentVersionNumber + 0.1).toFixed(1)}`;
        
        const newComment: ReviewerComment = {
          id: `rev-${Date.now()}`,
          date: 'Just now',
          author: 'Technical Reviewer',
          comment: commentText,
          version: j.version,
          status: 'active'
        };

        return {
          ...j,
          version: nextVersion,
          releaseStatus: 'Returned for Revision',
          ownerRole: 'Inspector',
          ownerName: 'Field Inspection Team',
          nextAction: 'Revise moisture observation note',
          reviewerComments: [newComment, ...j.reviewerComments],
          stage: 'Draft'
        };
      }
      return j;
    }));
    showToast('Report returned for revision with technical reviewer comments.');
  };

  // Approve report for release
  const approveReportForRelease = (jobId: string) => {
    setJobs(prev => prev.map(j => {
      if (j.id === jobId) {
        return {
          ...j,
          releaseStatus: 'Approved for Release',
          ownerRole: 'Coordinator',
          ownerName: 'Operations Coordinator',
          nextAction: 'Prepare the release package',
          approvedAt: new Date().toLocaleDateString('en-GB') + ' ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' CET',
          approvedBy: 'Technical Reviewer (Quality Council)'
        };
      }
      return j;
    }));
    showToast('Report approved for release. Accurate documentation of out-of-spec result verified.');
  };

  const createNewJob = (jobData: Partial<Job>) => {
    const codeNum = Math.floor(1000 + Math.random() * 9000);
    const newJob: Job = {
      id: `job-${codeNum}`,
      code: `JOB-2026-${codeNum}`,
      title: jobData.title || 'New Inspection Job',
      client: jobData.client || 'Fictional Industrial Client',
      serviceType: jobData.serviceType || 'Agricultural shipment inspection',
      sampleRef: jobData.sampleRef || `SAMPLE-${codeNum}`,
      batchRef: jobData.batchRef,
      location: jobData.location || 'Terminal Quay Berth 2',
      dueDate: jobData.dueDate || 'Tomorrow, 17:00',
      stage: 'Evidence',
      nextAction: 'Add missing evidence',
      ownerRole: 'Inspector',
      ownerName: 'Field Inspection Team',
      version: 'v1.0',
      releaseStatus: 'Draft',
      scopeDescription: jobData.scopeDescription || 'Standard contractual conformity check against client specification limits.',
      inspectionDate: new Date().toLocaleDateString('en-GB') + ' 09:00 CET',
      findingsSummary: 'Initial evidence intake initiated.',
      evidence: [],
      checks: [
        {
          id: `chk-1-${Date.now()}`,
          analyte: 'Primary Inspection Parameter',
          testMethod: 'ISO Standard Test',
          rawValue: 'Pending',
          currentValue: 'Pending',
          isCorrected: false,
          unit: '%',
          clientSpec: 'Within Contract Limit',
          sourceDoc: 'Awaiting Upload',
          sourceExcerpt: 'No data extracted',
          sourcePage: 1,
          needsAttention: true,
          issueType: 'missing_evidence',
          issueDescription: 'Awaiting initial laboratory or field test readout.',
          provenance: 'Inspection team',
          isConfirmed: false
        }
      ],
      reportTemplate: 'Standard Technical Inspection Certificate',
      reportLanguage: 'en',
      reviewerComments: []
    };

    setJobs(prev => [newJob, ...prev]);
    setActiveJobId(newJob.id);
    showToast(`Job ${newJob.code} created.`);
  };

  return (
    <JobContext.Provider
      value={{
        activeView,
        setActiveView,
        activeJobId,
        activeJob,
        activeJobStage,
        setActiveJobStage,
        openJob,
        closeJob,
        currentRole,
        setCurrentRole,
        workFilter,
        setWorkFilter,
        jobs,
        loadBundledEvidence,
        isProcessingEvidence,
        addCustomEvidence,
        correctCheckValue,
        confirmCheck,
        updateDraftOptions,
        sendForReview,
        returnReportWithComment,
        approveReportForRelease,
        createNewJob,
        toastMessage,
        showToast
      }}
    >
      {children}
    </JobContext.Provider>
  );
};

export const useJobContext = () => {
  const context = useContext(JobContext);
  if (!context) {
    throw new Error('useJobContext must be used within a JobProvider');
  }
  return context;
};
