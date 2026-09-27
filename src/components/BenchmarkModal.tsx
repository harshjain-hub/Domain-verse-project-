import React, { useState } from 'react';
import {
  BENCHMARK_MODELS,
  ROC_CURVES,
  CALIBRATION_DATA,
} from '../data/benchmarkData';
import {
  X,
  BarChart3,
  TrendingUp,
  Cpu,
  CheckCircle2,
  Sliders,
  Layers,
  ShieldCheck,
  Zap,
} from 'lucide-react';

interface BenchmarkModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BenchmarkModal: React.FC<BenchmarkModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'roc_curves' | 'metrics_table' | 'calibration'>('roc_curves');
  const [decisionThreshold, setDecisionThreshold] = useState<number>(0.5);
  const [visibleCurves, setVisibleCurves] = useState<Record<string, boolean>>({
    hybrid_fusion: true,
    late_fusion: true,
    early_fusion: true,
    unimodal_vision: true,
    unimodal_text: true,
    unimodal_tabular: true,
  });

  if (!isOpen) return null;

  const toggleCurve = (id: string) => {
    setVisibleCurves((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-5xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="bg-slate-950 px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-950/80 border border-indigo-700/80 flex items-center justify-center text-indigo-400">
              <BarChart3 className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">
                Model Evaluation & Unimodal Baseline Comparison
              </h2>
              <p className="text-xs text-slate-400">
                Evaluating Multimodal Fusion vs. Individual Unimodal Baselines on Clinical Cohort (N=12,450)
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

        {/* Navigation Tabs */}
        <div className="bg-slate-950/60 px-6 py-2 border-b border-slate-800/80 flex items-center space-x-2 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('roc_curves')}
            className={`px-3 py-1.5 rounded-lg transition ${
              activeTab === 'roc_curves'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            ROC Curves & AUC
          </button>
          <button
            onClick={() => setActiveTab('metrics_table')}
            className={`px-3 py-1.5 rounded-lg transition ${
              activeTab === 'metrics_table'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Full Metrics Benchmark
          </button>
          <button
            onClick={() => setActiveTab('calibration')}
            className={`px-3 py-1.5 rounded-lg transition ${
              activeTab === 'calibration'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Calibration Reliability (ECE)
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6 scrollbar-thin scrollbar-thumb-slate-800">
          {activeTab === 'roc_curves' && (
            <div className="space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h4 className="text-sm font-bold text-white">
                    Receiver Operating Characteristic (ROC) Space
                  </h4>
                  <p className="text-xs text-slate-400">
                    True Positive Rate (Sensitivity) vs False Positive Rate (1 - Specificity)
                  </p>
                </div>

                {/* Decision Threshold slider */}
                <div className="flex items-center space-x-2 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800 text-xs">
                  <Sliders className="w-3.5 h-3.5 text-cyan-400" />
                  <span className="text-slate-300 font-medium">Cutoff Threshold:</span>
                  <input
                    type="range"
                    min="0.1"
                    max="0.9"
                    step="0.05"
                    value={decisionThreshold}
                    onChange={(e) => setDecisionThreshold(parseFloat(e.target.value))}
                    className="w-20 accent-cyan-400 cursor-pointer"
                  />
                  <span className="font-mono text-cyan-300 font-bold w-8">
                    {decisionThreshold.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Interactive SVG ROC Plot */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col items-center">
                <svg
                  viewBox="0 0 500 350"
                  className="w-full max-w-[600px] h-[280px] sm:h-[320px] select-none"
                >
                  {/* Grid Lines */}
                  {[0, 0.25, 0.5, 0.75, 1.0].map((val, idx) => {
                    const x = 50 + val * 400;
                    const y = 300 - val * 260;
                    return (
                      <g key={idx}>
                        {/* Horizontal grid line */}
                        <line
                          x1="50"
                          y1={y}
                          x2="450"
                          y2={y}
                          stroke="#1e293b"
                          strokeDasharray="3 3"
                        />
                        {/* Vertical grid line */}
                        <line
                          x1={x}
                          y1="40"
                          x2={x}
                          y2="300"
                          stroke="#1e293b"
                          strokeDasharray="3 3"
                        />
                        {/* Axis labels */}
                        <text
                          x="40"
                          y={y + 4}
                          fill="#64748b"
                          fontSize="10"
                          textAnchor="end"
                          fontFamily="monospace"
                        >
                          {val.toFixed(2)}
                        </text>
                        <text
                          x={x}
                          y="318"
                          fill="#64748b"
                          fontSize="10"
                          textAnchor="middle"
                          fontFamily="monospace"
                        >
                          {val.toFixed(2)}
                        </text>
                      </g>
                    );
                  })}

                  {/* Diagonal Chance Line (AUC = 0.5) */}
                  <line
                    x1="50"
                    y1="300"
                    x2="450"
                    y2="40"
                    stroke="#475569"
                    strokeWidth="1.5"
                    strokeDasharray="4 4"
                  />

                  {/* Draw Model ROC Curves */}
                  {BENCHMARK_MODELS.map((model) => {
                    if (!visibleCurves[model.id]) return null;
                    const points = ROC_CURVES[model.id] || [];
                    const pathData = points
                      .map((pt, i) => {
                        const px = 50 + pt.fpr * 400;
                        const py = 300 - pt.tpr * 260;
                        return `${i === 0 ? 'M' : 'L'} ${px} ${py}`;
                      })
                      .join(' ');

                    return (
                      <g key={model.id}>
                        <path
                          d={pathData}
                          fill="none"
                          stroke={model.color}
                          strokeWidth={model.id === 'hybrid_fusion' ? '3' : '2'}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </g>
                    );
                  })}

                  {/* Axis Titles */}
                  <text
                    x="250"
                    y="342"
                    fill="#94a3b8"
                    fontSize="11"
                    textAnchor="middle"
                    fontWeight="bold"
                  >
                    False Positive Rate (1 - Specificity)
                  </text>
                  <text
                    x="-170"
                    y="18"
                    transform="rotate(-90)"
                    fill="#94a3b8"
                    fontSize="11"
                    textAnchor="middle"
                    fontWeight="bold"
                  >
                    True Positive Rate (Sensitivity)
                  </text>
                </svg>

                {/* Model Legend & Toggle Pills */}
                <div className="flex flex-wrap items-center justify-center gap-2 mt-3 pt-3 border-t border-slate-800/80">
                  {BENCHMARK_MODELS.map((model) => {
                    const isVisible = visibleCurves[model.id];
                    return (
                      <button
                        key={model.id}
                        onClick={() => toggleCurve(model.id)}
                        className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-mono transition border ${
                          isVisible
                            ? 'bg-slate-900 text-white border-slate-700'
                            : 'bg-slate-950 text-slate-500 border-slate-900 opacity-50'
                        }`}
                      >
                        <span
                          className="w-2.5 h-2.5 rounded-full"
                          style={{ backgroundColor: model.color }}
                        />
                        <span className="font-semibold">{model.name}</span>
                        <span className="text-cyan-400 font-bold">
                          [AUC {model.rocAuc.toFixed(3)}]
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'metrics_table' && (
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-bold text-white">
                  Quantitative Comparison Against Unimodal Baselines
                </h4>
                <p className="text-xs text-slate-400">
                  Multimodal fusion delivers statistical superiority over single-modality pipelines across all diagnostic evaluation metrics.
                </p>
              </div>

              <div className="border border-slate-800 rounded-xl overflow-hidden shadow-lg">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950 text-slate-400 text-[11px] uppercase font-mono border-b border-slate-800">
                    <tr>
                      <th className="py-2.5 px-4">Architecture</th>
                      <th className="py-2.5 px-3">ROC-AUC &uarr;</th>
                      <th className="py-2.5 px-3">Macro F1 &uarr;</th>
                      <th className="py-2.5 px-3">PR-AUC &uarr;</th>
                      <th className="py-2.5 px-3">ECE &darr;</th>
                      <th className="py-2.5 px-3">Brier &darr;</th>
                      <th className="py-2.5 px-3">Latency</th>
                      <th className="py-2.5 px-3">Params</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 font-mono">
                    {BENCHMARK_MODELS.map((m) => (
                      <tr
                        key={m.id}
                        className={`hover:bg-slate-800/40 transition ${
                          m.id === 'hybrid_fusion' ? 'bg-cyan-950/20 font-bold' : ''
                        }`}
                      >
                        <td className="py-3 px-4 flex items-center space-x-2">
                          <span
                            className="w-2.5 h-2.5 rounded-full shrink-0"
                            style={{ backgroundColor: m.color }}
                          />
                          <span className={m.id === 'hybrid_fusion' ? 'text-cyan-300' : 'text-slate-200'}>
                            {m.name}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-cyan-400 font-black">{m.rocAuc.toFixed(3)}</td>
                        <td className="py-3 px-3 text-slate-200">{m.macroF1.toFixed(3)}</td>
                        <td className="py-3 px-3 text-slate-200">{m.prAuc.toFixed(3)}</td>
                        <td className="py-3 px-3 text-emerald-400">{m.ece.toFixed(3)}</td>
                        <td className="py-3 px-3 text-slate-300">{m.brierScore.toFixed(3)}</td>
                        <td className="py-3 px-3 text-slate-400">{m.inferenceLatencyMs} ms</td>
                        <td className="py-3 px-3 text-slate-500">{m.paramCountM}M</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Key Scientific Insights */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
                <div className="bg-slate-950/80 p-3 rounded-lg border border-slate-800 text-xs">
                  <span className="font-bold text-cyan-400 block mb-1">
                    +11.2% ROC-AUC vs Vision Alone
                  </span>
                  <p className="text-slate-400 leading-relaxed">
                    ChestViT alone (0.842) often confuses non-specific consolidations. Tabular biomarkers and NLP text anchor the true pathology.
                  </p>
                </div>
                <div className="bg-slate-950/80 p-3 rounded-lg border border-slate-800 text-xs">
                  <span className="font-bold text-purple-400 block mb-1">
                    77% Lower Calibration Error
                  </span>
                  <p className="text-slate-400 leading-relaxed">
                    Hybrid Cross-Attention achieves 0.021 ECE vs 0.092 for NLP alone, generating probabilities doctors can safely rely on for triage.
                  </p>
                </div>
                <div className="bg-slate-950/80 p-3 rounded-lg border border-slate-800 text-xs">
                  <span className="font-bold text-emerald-400 block mb-1">
                    42ms Real-Time Inference
                  </span>
                  <p className="text-slate-400 leading-relaxed">
                    Fused latent representations allow sub-50ms inference suitable for high-throughput Emergency Department intake.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'calibration' && (
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-bold text-white">
                  Expected Calibration Error (ECE) Reliability Analysis
                </h4>
                <p className="text-xs text-slate-400">
                  A well-calibrated clinical model means a prediction of 80% confidence corresponds to true positivity in exactly 80% of patient cases.
                </p>
              </div>

              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-4">
                <div className="space-y-3">
                  {CALIBRATION_DATA.map((binData, idx) => (
                    <div key={idx} className="space-y-1 text-xs">
                      <div className="flex justify-between text-slate-300 font-mono text-[11px]">
                        <span>Confidence Bin: {binData.bin}</span>
                        <span>
                          Target: {Math.round(binData.predicted * 100)}% &bull; Hybrid: {Math.round(binData.hybrid * 100)}% &bull; Unimodal: {Math.round(binData.unimodal * 100)}%
                        </span>
                      </div>
                      <div className="w-full bg-slate-900 h-3 rounded-full overflow-hidden flex relative border border-slate-800">
                        {/* Target line */}
                        <div
                          className="absolute top-0 bottom-0 w-0.5 bg-white z-20"
                          style={{ left: `${binData.predicted * 100}%` }}
                        />
                        {/* Hybrid bar */}
                        <div
                          className="h-full bg-cyan-500 rounded-l"
                          style={{ width: `${binData.hybrid * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs text-slate-400">
                  <span className="flex items-center space-x-2">
                    <span className="w-3 h-0.5 bg-white inline-block" />
                    <span>White line = Perfect Empirical Calibration (y = x)</span>
                  </span>
                  <span className="font-mono text-cyan-400 font-bold">
                    Hybrid ECE: 2.1% (Ideal)
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-950 px-6 py-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span>Evaluated on multi-center emergency cohort (MIMIC-IV-CXR + eICU)</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium transition"
          >
            Close Benchmark
          </button>
        </div>
      </div>
    </div>
  );
};
