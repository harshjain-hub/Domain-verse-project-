import { BenchmarkModelMetrics } from '../types/clinical';

export const BENCHMARK_MODELS: BenchmarkModelMetrics[] = [
  {
    id: 'hybrid_fusion',
    name: 'Hybrid Cross-Attention Fusion (Ours)',
    type: 'hybrid_fusion',
    rocAuc: 0.954,
    macroF1: 0.912,
    prAuc: 0.938,
    ece: 0.021, // 2.1% Expected Calibration Error (lowest, best calibrated)
    brierScore: 0.068,
    inferenceLatencyMs: 42,
    paramCountM: 148,
    color: '#06b6d4', // Cyan
  },
  {
    id: 'early_fusion',
    name: 'Early Fusion (Feature Concat + MLP)',
    type: 'early_fusion',
    rocAuc: 0.918,
    macroF1: 0.864,
    prAuc: 0.892,
    ece: 0.046,
    brierScore: 0.094,
    inferenceLatencyMs: 34,
    paramCountM: 122,
    color: '#8b5cf6', // Violet
  },
  {
    id: 'late_fusion',
    name: 'Late Fusion (Confidence-Gated Ensemble)',
    type: 'late_fusion',
    rocAuc: 0.929,
    macroF1: 0.879,
    prAuc: 0.906,
    ece: 0.038,
    brierScore: 0.086,
    inferenceLatencyMs: 51,
    paramCountM: 164,
    color: '#ec4899', // Pink
  },
  {
    id: 'unimodal_vision',
    name: 'Unimodal Vision (ChestViT-16)',
    type: 'unimodal_vision',
    rocAuc: 0.842,
    macroF1: 0.768,
    prAuc: 0.795,
    ece: 0.084,
    brierScore: 0.142,
    inferenceLatencyMs: 24,
    paramCountM: 86,
    color: '#3b82f6', // Blue
  },
  {
    id: 'unimodal_text',
    name: 'Unimodal NLP (BioClinical-BERT)',
    type: 'unimodal_text',
    rocAuc: 0.825,
    macroF1: 0.751,
    prAuc: 0.774,
    ece: 0.092,
    brierScore: 0.158,
    inferenceLatencyMs: 19,
    paramCountM: 110,
    color: '#10b981', // Emerald
  },
  {
    id: 'unimodal_tabular',
    name: 'Unimodal Tabular EHR (TabNet/XGBoost)',
    type: 'unimodal_tabular',
    rocAuc: 0.796,
    macroF1: 0.718,
    prAuc: 0.738,
    ece: 0.114,
    brierScore: 0.186,
    inferenceLatencyMs: 4,
    paramCountM: 4.8,
    color: '#f59e0b', // Amber
  },
];

// Pre-computed points for ROC curves (FPR: 0 to 1 -> TPR)
export const ROC_CURVES: Record<string, { fpr: number; tpr: number }[]> = {
  hybrid_fusion: [
    { fpr: 0.0, tpr: 0.0 },
    { fpr: 0.02, tpr: 0.58 },
    { fpr: 0.05, tpr: 0.82 },
    { fpr: 0.10, tpr: 0.92 },
    { fpr: 0.15, tpr: 0.95 },
    { fpr: 0.20, tpr: 0.97 },
    { fpr: 0.30, tpr: 0.985 },
    { fpr: 0.50, tpr: 0.995 },
    { fpr: 1.0, tpr: 1.0 },
  ],
  late_fusion: [
    { fpr: 0.0, tpr: 0.0 },
    { fpr: 0.03, tpr: 0.48 },
    { fpr: 0.08, tpr: 0.76 },
    { fpr: 0.15, tpr: 0.88 },
    { fpr: 0.25, tpr: 0.94 },
    { fpr: 0.40, tpr: 0.97 },
    { fpr: 0.60, tpr: 0.99 },
    { fpr: 1.0, tpr: 1.0 },
  ],
  early_fusion: [
    { fpr: 0.0, tpr: 0.0 },
    { fpr: 0.04, tpr: 0.44 },
    { fpr: 0.10, tpr: 0.73 },
    { fpr: 0.18, tpr: 0.85 },
    { fpr: 0.30, tpr: 0.92 },
    { fpr: 0.50, tpr: 0.96 },
    { fpr: 1.0, tpr: 1.0 },
  ],
  unimodal_vision: [
    { fpr: 0.0, tpr: 0.0 },
    { fpr: 0.06, tpr: 0.32 },
    { fpr: 0.15, tpr: 0.62 },
    { fpr: 0.25, tpr: 0.76 },
    { fpr: 0.40, tpr: 0.86 },
    { fpr: 0.65, tpr: 0.94 },
    { fpr: 1.0, tpr: 1.0 },
  ],
  unimodal_text: [
    { fpr: 0.0, tpr: 0.0 },
    { fpr: 0.08, tpr: 0.30 },
    { fpr: 0.18, tpr: 0.58 },
    { fpr: 0.30, tpr: 0.74 },
    { fpr: 0.50, tpr: 0.85 },
    { fpr: 0.70, tpr: 0.93 },
    { fpr: 1.0, tpr: 1.0 },
  ],
  unimodal_tabular: [
    { fpr: 0.0, tpr: 0.0 },
    { fpr: 0.10, tpr: 0.24 },
    { fpr: 0.22, tpr: 0.52 },
    { fpr: 0.38, tpr: 0.69 },
    { fpr: 0.55, tpr: 0.81 },
    { fpr: 0.75, tpr: 0.91 },
    { fpr: 1.0, tpr: 1.0 },
  ],
};

// Calibration reliability diagrams: predicted probability bins vs observed accuracy
export const CALIBRATION_DATA = [
  { bin: '0.0 - 0.2', predicted: 0.10, hybrid: 0.11, late: 0.13, unimodal: 0.18 },
  { bin: '0.2 - 0.4', predicted: 0.30, hybrid: 0.29, late: 0.26, unimodal: 0.41 },
  { bin: '0.4 - 0.6', predicted: 0.50, hybrid: 0.51, late: 0.46, unimodal: 0.62 },
  { bin: '0.6 - 0.8', predicted: 0.70, hybrid: 0.69, late: 0.74, unimodal: 0.81 },
  { bin: '0.8 - 1.0', predicted: 0.90, hybrid: 0.91, late: 0.87, unimodal: 0.78 },
];
