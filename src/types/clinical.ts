export type ModalityType = 'text' | 'vision' | 'tabular';

export type FusionMode = 'early' | 'late' | 'hybrid';

export type ColormapType = 'jet' | 'turbo' | 'inferno' | 'viridis';

export type WindowingPreset = 'default' | 'lung' | 'mediastinum' | 'bone';

export interface VitalsData {
  heartRate: number; // bpm
  systolicBp: number; // mmHg
  diastolicBp: number; // mmHg
  respiratoryRate: number; // breaths/min
  spO2: number; // %
  temperature: number; // °C
  gcs: number; // Glasgow Coma Scale 3-15
}

export interface LabBiomarker {
  name: string;
  value: number;
  unit: string;
  normalRange: string;
  status: 'normal' | 'low' | 'high' | 'critical';
  clinicalCategory: 'cardiac' | 'inflammatory' | 'hematology' | 'renal' | 'metabolic' | 'pulmonary';
}

export interface TokenSaliency {
  token: string;
  score: number; // -1.0 to +1.0 (positive = exacerbates risk/differential, negative = protective/ruled out)
  category?: 'symptom' | 'history' | 'exam' | 'pertinent_negative';
}

export interface ShapFeature {
  featureName: string;
  modality: 'tabular';
  valueDisplay: string;
  shapValue: number; // positive increases probability of top condition, negative decreases
  category: 'vital' | 'lab' | 'demographic';
}

export interface DifferentialDiagnosis {
  id: string;
  name: string;
  icd10: string;
  probability: number; // 0 to 100
  confidenceInterval: [number, number]; // [lower, upper] e.g. [74, 88]
  mcVariance: number; // Monte Carlo dropout variance
  conformalInclusion: boolean; // included in conformal prediction set
  primaryModalityDriver: 'Clinical Notes' | 'Radiograph' | 'Biomarkers' | 'Tabular' | 'Cross-Modal Synergy';
  rationale: string;
}

export interface MonteCarloSample {
  sampleIndex: number;
  predictions: Record<string, number>; // diagnosisId -> probability
  latentEntropy: number;
}

export interface ConformalSetResult {
  alpha: number; // significance level (e.g. 0.05 for 95% coverage)
  certifiedCoverage: string; // "95%"
  includedDiagnoses: string[];
  setEmpiricalSize: number;
  ambiguityLevel: 'low' | 'moderate' | 'high';
}

export interface PatientCase {
  id: string;
  name: string;
  age: number;
  sex: 'Male' | 'Female' | 'Other';
  admissionTime: string;
  chiefComplaint: string;
  triagePriority: 1 | 2 | 3 | 4 | 5; // ESI 1 (immediate) to 5 (non-urgent)
  esiLabel: string;
  clinicalNotes: string;
  tokenSaliencies: TokenSaliency[];
  vitals: VitalsData;
  labs: LabBiomarker[];
  imagingType: string;
  imagingDescription: string;
  imagingFindings: string[];
  radiographSvgPath: string; // custom SVG or vector radiological representation
  gradCamRegion: {
    cx: number; // normalized 0-1
    cy: number;
    rx: number;
    ry: number;
    intensity: number;
    description: string;
  }[];
  shapFeatures: ShapFeature[];
  differentials: DifferentialDiagnosis[];
  crossModalSynergies: {
    modalities: ('Text' | 'Vision' | 'Tabular')[];
    interaction: string;
    clinicalImpact: string;
  }[];
}

export interface BenchmarkModelMetrics {
  id: string;
  name: string;
  type: 'unimodal_text' | 'unimodal_vision' | 'unimodal_tabular' | 'early_fusion' | 'late_fusion' | 'hybrid_fusion';
  rocAuc: number;
  macroF1: number;
  prAuc: number;
  ece: number; // Expected Calibration Error (lower is better)
  brierScore: number; // lower is better
  inferenceLatencyMs: number;
  paramCountM: number;
  color: string;
}

export interface GeminiDiagnosisResponse {
  esiTriageLevel: number;
  esiCategory: string;
  criticalRiskScore: number;
  triageSummary: string;
  differentialDiagnoses: {
    condition: string;
    probability: number;
    confidenceInterval: string;
    clinicalRationale: string;
    primarySupportingModality?: string;
  }[];
  crossModalInteractions: {
    modalitiesInvolved: string[];
    finding: string;
    clinicalSignificance: string;
  }[];
  redFlags: string[];
  acuteInterventions: {
    timeframe: string;
    action: string;
    guidelineReference?: string;
  }[];
  modalityContributionBreakdown?: {
    textNotesPercent: number;
    imagingPercent: number;
    tabularEhrPercent: number;
    synergyGainPercent: number;
  };
}
