export type UserRole = 'Inspector' | 'Reviewer' | 'Coordinator';

export type JobStage = 'Evidence' | 'Checks' | 'Draft' | 'Release';

export type ReleaseStatus = 'Draft' | 'In Review' | 'Returned for Revision' | 'Approved for Release';

export type ServiceType = 
  | 'Agricultural shipment inspection'
  | 'Consumer-product testing'
  | 'Industrial equipment inspection'
  | 'Food & edible oil testing'
  | 'Construction materials certification';

export interface EvidenceItem {
  id: string;
  name: string;
  category: 'field_notes' | 'photo' | 'lab_results' | 'supplier_cert' | 'client_spec';
  source: string;
  date: string;
  status: 'received' | 'pending' | 'needs_review';
  sampleRef: string;
  sampleRefMatches: boolean;
  contentSnippet?: string;
  fileDetails?: {
    size: string;
    format: string;
  };
  provenance: 'Supplier-provided' | 'Inspection team' | 'Client contract';
}

export interface CheckItem {
  id: string;
  analyte: string;
  testMethod: string;
  rawValue: string;
  currentValue: string;
  isCorrected: boolean;
  unit: string;
  clientSpec: string;
  specThreshold?: number;
  specComparator?: '<=' | '>=' | 'range';
  sourceDoc: string;
  sourceExcerpt: string;
  sourcePage: number;
  needsAttention: boolean;
  issueType: 'extraction_error' | 'out_of_spec' | 'missing_evidence' | 'none';
  issueDescription?: string;
  provenance: 'Supplier-provided' | 'Inspection team' | 'External lab';
  inspectorNotes?: string;
  isConfirmed: boolean;
}

export interface ReviewerComment {
  id: string;
  date: string;
  author: string;
  comment: string;
  version: string;
  status: 'active' | 'resolved';
}

export interface Job {
  id: string;
  code: string;
  title: string;
  client: string;
  serviceType: ServiceType;
  sampleRef: string;
  batchRef?: string;
  location: string;
  dueDate: string;
  stage: JobStage;
  nextAction: string;
  ownerRole: UserRole;
  ownerName: string;
  version: string;
  releaseStatus: ReleaseStatus;
  evidence: EvidenceItem[];
  checks: CheckItem[];
  reportTemplate: 'Standard Technical Inspection Certificate' | 'Commercial Trade Certificate' | 'Abbreviated Letter of Findings';
  reportLanguage: 'en' | 'fr';
  reviewerComments: ReviewerComment[];
  scopeDescription: string;
  inspectionDate: string;
  findingsSummary: string;
  approvedAt?: string;
  approvedBy?: string;
}
