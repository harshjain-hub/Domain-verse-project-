import React from 'react';
import { X, Network, Cpu, Brain, Flame, Layers, ShieldCheck, CheckCircle2 } from 'lucide-react';

interface ArchitectureInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ArchitectureInfoModal: React.FC<ArchitectureInfoModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-4xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-slate-950 px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-950/80 border border-cyan-700/80 flex items-center justify-center text-cyan-400">
              <Network className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">
                Multimodal Clinical Diagnostic Fusion Architecture
              </h2>
              <p className="text-xs text-slate-400">
                End-to-End System Specifications: NLP + Vision ViT + Tabular EHR
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6 text-xs text-slate-300 leading-relaxed scrollbar-thin scrollbar-thumb-slate-800">
          {/* Motivation & Overview */}
          <div className="space-y-2">
            <h4 className="text-sm font-bold text-white flex items-center space-x-2">
              <Brain className="w-4 h-4 text-cyan-400" />
              <span>Clinical Motivation & Problem Statement</span>
            </h4>
            <p>
              Standard clinical machine learning models operate in silos: NLP on doctor notes, Computer Vision on chest radiographs, or tree-based models on tabular EHRs. In emergency medicine and acute triage, misdiagnoses often occur because single modalities miss critical cross-modal interactions (e.g. an ambiguous wedge opacity on a CXR is non-specific in isolation, but in the context of a D-dimer &gt; 4,000 ng/mL and sudden pleuritic pain following orthopedic surgery, it clinches the diagnosis of acute pulmonary embolism).
            </p>
          </div>

          {/* Fusion Paradigms */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-white flex items-center space-x-2">
              <Cpu className="w-4 h-4 text-purple-400" />
              <span>Embedding Fusion Paradigms Implemented</span>
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-1.5">
                <span className="font-bold text-purple-300 block font-mono text-xs">
                  1. Early Fusion (Feature-Level)
                </span>
                <p className="text-slate-400 text-[11px]">
                  Extracts representations from BioClinical-BERT (768d), ChestViT-16 (768d), and TabNet (64d), linearly projects each to a common 64d latent space, and concatenates them:
                  <code className="block mt-1 font-mono text-cyan-300 bg-slate-900 p-1 rounded">
                    z_early = [e_nlp || e_vit || e_tab] ∈ ℝ¹⁹²
                  </code>
                </p>
              </div>

              <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-1.5">
                <span className="font-bold text-pink-300 block font-mono text-xs">
                  2. Late Fusion (Decision-Level)
                </span>
                <p className="text-slate-400 text-[11px]">
                  Trains three independent unimodal classifiers. Predictions are pooled via a confidence-weighted meta-classifier with gating weights:
                  <code className="block mt-1 font-mono text-cyan-300 bg-slate-900 p-1 rounded">
                    P(y|x) = Σ α_m(x_m) P_m(y|x_m)
                  </code>
                </p>
              </div>

              <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-1.5">
                <span className="font-bold text-cyan-300 block font-mono text-xs">
                  3. Hybrid Cross-Attention (SOTA)
                </span>
                <p className="text-slate-400 text-[11px]">
                  Bidirectional cross-attention layers where clinical text queries attend to visual patches (Q_text × K_vit), and tabular vital signs dynamically scale visual feature maps via gating networks.
                </p>
              </div>
            </div>
          </div>

          {/* Explainability Suite */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-white flex items-center space-x-2">
              <Flame className="w-4 h-4 text-rose-400" />
              <span>Multi-Modal Explainability Pipeline</span>
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-1">
                <span className="font-bold text-rose-400 text-xs block">
                  Vision: Grad-CAM
                </span>
                <p className="text-slate-400 text-[11px]">
                  Computes gradients of the target diagnosis logit with respect to the final convolutional/attention feature maps, projecting anatomical heatmaps with selectable colormaps (Jet, Turbo, Inferno, Viridis).
                </p>
              </div>

              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-1">
                <span className="font-bold text-emerald-400 text-xs block">
                  NLP: Token Saliency
                </span>
                <p className="text-slate-400 text-[11px]">
                  Calculates Integrated Gradients across token embeddings to highlight both exacerbating symptoms (red/orange) and protective pertinent negatives (blue/cyan).
                </p>
              </div>

              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-1">
                <span className="font-bold text-amber-400 text-xs block">
                  Tabular: SHAP Waterfall
                </span>
                <p className="text-slate-400 text-[11px]">
                  Shapley Additive exPlanations quantify the exact marginal odds shift driven by each physiological vital sign and laboratory biomarker.
                </p>
              </div>
            </div>
          </div>

          {/* Uncertainty Quantification */}
          <div className="space-y-2">
            <h4 className="text-sm font-bold text-white flex items-center space-x-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Uncertainty Estimation: Monte Carlo Dropout & Conformal Prediction</span>
            </h4>
            <p>
              Clinical diagnostic AI must know when it does not know. SynapseMD integrates:
            </p>
            <ul className="space-y-1 text-slate-400 pl-4 list-disc">
              <li>
                <strong className="text-slate-200">Monte Carlo Dropout:</strong> Keeps dropout active (p=0.2) across 30 stochastic forward inference passes to quantify epistemic model uncertainty (&sigma;&sup2;).
              </li>
              <li>
                <strong className="text-slate-200">Split-Conformal Prediction:</strong> Emits distribution-free prediction sets with mathematically proven 95% coverage guarantees (1 - &alpha; = 0.95), alerting clinicians if multi-hypothesis ambiguity exists.
              </li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-950 px-6 py-3 border-t border-slate-800 flex items-center justify-between">
          <span className="text-slate-500 text-xs">Developed for Emergency Room & Critical Care Diagnostics</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
