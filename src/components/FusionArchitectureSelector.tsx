import React from 'react';
import { FusionMode, ModalityType } from '../types/clinical';
import {
  GitMerge,
  Cpu,
  Split,
  Network,
  Zap,
  CheckCircle2,
  AlertCircle,
  FileText,
  Image,
  Table,
} from 'lucide-react';

interface FusionArchitectureSelectorProps {
  fusionMode: FusionMode;
  onSelectFusionMode: (mode: FusionMode) => void;
  activeModalities: Record<ModalityType, boolean>;
  onToggleModality: (modality: ModalityType) => void;
}

export const FusionArchitectureSelector: React.FC<FusionArchitectureSelectorProps> = ({
  fusionMode,
  onSelectFusionMode,
  activeModalities,
  onToggleModality,
}) => {
  const getArchitectureSpecs = (mode: FusionMode) => {
    switch (mode) {
      case 'early':
        return {
          title: 'Early Fusion (Feature-Level)',
          description:
            'Raw embeddings concatenated: z = [e_nlp || e_vit || e_tab] ∈ ℝ¹⁹² with unified dense projection head.',
          pros: 'Models low-level joint interactions',
          cons: 'Vulnerable to missing modalities',
          latency: '34 ms',
          auc: '0.918',
        };
      case 'late':
        return {
          title: 'Late Fusion (Decision-Level)',
          description:
            'Separate unimodal classifiers combined via confidence-weighted Bayesian gating network: P_fused = Σ αᵢ Pᵢ(y|xᵢ).',
          pros: 'Robust to missing modality ablation',
          cons: 'Misses cross-modal feature-level correlations',
          latency: '51 ms',
          auc: '0.929',
        };
      case 'hybrid':
      default:
        return {
          title: 'Hybrid Cross-Attention Fusion (SOTA)',
          description:
            'Bidirectional multi-head cross-attention (Q_text × K_vit & W_vitals ⊙ H_vis) capturing non-linear clinical synergies.',
          pros: 'Highest diagnostic ROC-AUC & calibrated uncertainty',
          cons: 'Higher computational complexity',
          latency: '42 ms',
          auc: '0.954',
        };
    }
  };

  const currentSpecs = getArchitectureSpecs(fusionMode);
  const activeCount = Object.values(activeModalities).filter(Boolean).length;

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 shadow-sm space-y-4">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
        <div>
          <div className="flex items-center space-x-2">
            <Network className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Multimodal Fusion Engine Architecture
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Select embedding fusion paradigm and simulate modality ablation impact
          </p>
        </div>

        {/* Fusion Architecture Mode Switcher */}
        <div className="flex items-center bg-slate-950 p-1 rounded-lg border border-slate-800">
          <button
            onClick={() => onSelectFusionMode('early')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition flex items-center space-x-1.5 ${
              fusionMode === 'early'
                ? 'bg-purple-600 text-white shadow-sm shadow-purple-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Split className="w-3.5 h-3.5" />
            <span>Early Fusion</span>
          </button>

          <button
            onClick={() => onSelectFusionMode('late')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition flex items-center space-x-1.5 ${
              fusionMode === 'late'
                ? 'bg-pink-600 text-white shadow-sm shadow-pink-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <GitMerge className="w-3.5 h-3.5" />
            <span>Late Fusion</span>
          </button>

          <button
            onClick={() => onSelectFusionMode('hybrid')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition flex items-center space-x-1.5 ${
              fusionMode === 'hybrid'
                ? 'bg-cyan-600 text-white shadow-sm shadow-cyan-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>Hybrid Attention</span>
          </button>
        </div>
      </div>

      {/* Architecture Specs & Modality Ablation Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Architecture details */}
        <div className="md:col-span-2 bg-slate-950/60 rounded-lg p-3 border border-slate-800/80 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-cyan-300 font-mono">
                {currentSpecs.title}
              </span>
              <div className="flex items-center space-x-2 text-xs">
                <span className="text-slate-400">Latency:</span>
                <span className="font-mono text-emerald-400 font-semibold">{currentSpecs.latency}</span>
                <span className="text-slate-600">&bull;</span>
                <span className="text-slate-400">Val ROC-AUC:</span>
                <span className="font-mono text-cyan-400 font-semibold">{currentSpecs.auc}</span>
              </div>
            </div>
            <p className="text-xs text-slate-300 mt-1 font-mono leading-relaxed">
              {currentSpecs.description}
            </p>
          </div>

          <div className="flex items-center space-x-4 mt-2 pt-2 border-t border-slate-800/60 text-xs">
            <span className="text-emerald-400 flex items-center space-x-1">
              <CheckCircle2 className="w-3 h-3" />
              <span>{currentSpecs.pros}</span>
            </span>
            <span className="text-amber-400 flex items-center space-x-1">
              <AlertCircle className="w-3 h-3" />
              <span>{currentSpecs.cons}</span>
            </span>
          </div>
        </div>

        {/* Modality Ablation Experimenter */}
        <div className="bg-slate-950/60 rounded-lg p-3 border border-slate-800/80">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center space-x-1">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>Modality Ablation</span>
            </span>
            <span
              className={`text-xs px-1.5 py-0.5 rounded font-mono font-semibold ${
                activeCount === 3
                  ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                  : 'bg-amber-950 text-amber-400 border border-amber-800'
              }`}
            >
              {activeCount}/3 Active
            </span>
          </div>

          <div className="space-y-1.5">
            {/* Text Modality Toggle */}
            <button
              onClick={() => onToggleModality('text')}
              className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded text-xs transition border ${
                activeModalities.text
                  ? 'bg-emerald-950/40 text-emerald-300 border-emerald-800/60'
                  : 'bg-slate-900 text-slate-500 border-slate-800 line-through'
              }`}
            >
              <div className="flex items-center space-x-2">
                <FileText className="w-3.5 h-3.5" />
                <span className="font-medium">Text (Clinical NLP)</span>
              </div>
              <span className="text-xs font-mono font-bold">
                {activeModalities.text ? 'ON' : 'OFF'}
              </span>
            </button>

            {/* Vision Modality Toggle */}
            <button
              onClick={() => onToggleModality('vision')}
              className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded text-xs transition border ${
                activeModalities.vision
                  ? 'bg-blue-950/40 text-blue-300 border-blue-800/60'
                  : 'bg-slate-900 text-slate-500 border-slate-800 line-through'
              }`}
            >
              <div className="flex items-center space-x-2">
                <Image className="w-3.5 h-3.5" />
                <span className="font-medium">Vision (Radiology ViT)</span>
              </div>
              <span className="text-xs font-mono font-bold">
                {activeModalities.vision ? 'ON' : 'OFF'}
              </span>
            </button>

            {/* Tabular Modality Toggle */}
            <button
              onClick={() => onToggleModality('tabular')}
              className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded text-xs transition border ${
                activeModalities.tabular
                  ? 'bg-amber-950/40 text-amber-300 border-amber-800/60'
                  : 'bg-slate-900 text-slate-500 border-slate-800 line-through'
              }`}
            >
              <div className="flex items-center space-x-2">
                <Table className="w-3.5 h-3.5" />
                <span className="font-medium">Tabular (EHR Labs/Vitals)</span>
              </div>
              <span className="text-xs font-mono font-bold">
                {activeModalities.tabular ? 'ON' : 'OFF'}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
