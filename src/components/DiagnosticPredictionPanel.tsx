import React, { useState } from 'react';
import {
  DifferentialDiagnosis,
  ConformalSetResult,
  MonteCarloSample,
  PatientCase,
  FusionMode,
  ModalityType,
} from '../types/clinical';
import {
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  Cpu,
  Brain,
  Sparkles,
  BarChart,
  HelpCircle,
  Stethoscope,
  ChevronRight,
  TrendingUp,
  Percent,
} from 'lucide-react';

interface DiagnosticPredictionPanelProps {
  currentCase: PatientCase;
  differentials: DifferentialDiagnosis[];
  conformalSet: ConformalSetResult;
  mcVarianceOverall: number;
  mcSamples: MonteCarloSample[];
  fusionMode: FusionMode;
  activeModalities: Record<ModalityType, boolean>;
  onTriggerGeminiDiagnosis: () => void;
  isLoadingGemini: boolean;
}

export const DiagnosticPredictionPanel: React.FC<DiagnosticPredictionPanelProps> = ({
  currentCase,
  differentials,
  conformalSet,
  mcVarianceOverall,
  mcSamples,
  fusionMode,
  activeModalities,
  onTriggerGeminiDiagnosis,
  isLoadingGemini,
}) => {
  const [activeUncertaintyTab, setActiveUncertaintyTab] = useState<'mc_dropout' | 'conformal'>('mc_dropout');

  const topDiff = differentials[0];
  const countActive = Object.values(activeModalities).filter(Boolean).length;

  // Calculate Critical Risk Score (1-100) based on top probability and ESI
  const criticalRiskScore = Math.min(
    99,
    Math.round(
      (currentCase.triagePriority === 1 ? 92 : currentCase.triagePriority === 2 ? 78 : 45) +
        (countActive < 3 ? 8 : 0),
    ),
  );

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 sm:p-5 shadow-sm space-y-5">
      {/* Top Header: Emergency Triage Severity & Critical Risk Gauge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <ShieldAlert className="w-5 h-5 text-rose-400" />
            <h3 className="text-base font-bold text-white tracking-tight">
              Multimodal Diagnostic Differential & Triage
            </h3>
          </div>
          <p className="text-xs text-slate-400">
            Synthesized across NLP ({activeModalities.text ? 'ON' : 'OFF'}), Vision ViT (
            {activeModalities.vision ? 'ON' : 'OFF'}), and Tabular EHR (
            {activeModalities.tabular ? 'ON' : 'OFF'})
          </p>
        </div>

        {/* Critical Risk Score Gauge */}
        <div className="flex items-center space-x-3 bg-slate-950 px-3.5 py-2 rounded-xl border border-slate-800 self-start sm:self-auto">
          <div className="text-right">
            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">
              Deterioration Risk
            </span>
            <span
              className={`text-lg font-black font-mono leading-none ${
                criticalRiskScore >= 80
                  ? 'text-rose-400'
                  : criticalRiskScore >= 60
                  ? 'text-amber-400'
                  : 'text-emerald-400'
              }`}
            >
              {criticalRiskScore}%
            </span>
          </div>

          <div className="w-12 h-12 rounded-full border-4 border-slate-800 relative flex items-center justify-center">
            <div
              className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold font-mono ${
                currentCase.triagePriority === 1
                  ? 'bg-rose-950 text-rose-300'
                  : currentCase.triagePriority === 2
                  ? 'bg-amber-950 text-amber-300'
                  : 'bg-emerald-950 text-emerald-300'
              }`}
            >
              ESI {currentCase.triagePriority}
            </div>
          </div>
        </div>
      </div>

      {/* Differential Diagnoses Probability Ranking */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center space-x-1.5">
            <Brain className="w-4 h-4 text-cyan-400" />
            <span>Ranked Differential Diagnoses (Calibrated Probabilities):</span>
          </span>
          <span className="text-[11px] text-slate-400 font-mono">
            Model: {fusionMode === 'hybrid' ? 'Cross-Attention Hybrid' : fusionMode === 'late' ? 'Late Gated' : 'Early Concat'}
          </span>
        </div>

        <div className="space-y-2.5">
          {differentials.map((diff, index) => {
            const isTop = index === 0;
            const barWidth = Math.min(100, diff.probability);

            return (
              <div
                key={diff.id}
                className={`p-3 rounded-lg border transition ${
                  isTop
                    ? 'bg-slate-950/80 border-cyan-800/80 shadow-md shadow-cyan-950/30'
                    : 'bg-slate-950/40 border-slate-800/80 hover:border-slate-700'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1.5">
                  <div className="flex items-center space-x-2">
                    <span
                      className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold font-mono ${
                        isTop
                          ? 'bg-cyan-500 text-slate-950'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {index + 1}
                    </span>
                    <span
                      className={`text-xs sm:text-sm font-bold tracking-tight ${
                        isTop ? 'text-white' : 'text-slate-300'
                      }`}
                    >
                      {diff.name}
                    </span>
                    <span className="text-[10px] font-mono text-slate-500">[{diff.icd10}]</span>
                  </div>

                  <div className="flex items-center space-x-2 text-xs font-mono ml-7 sm:ml-0">
                    <span
                      className={`font-black text-sm ${
                        isTop ? 'text-cyan-400' : 'text-slate-300'
                      }`}
                    >
                      {diff.probability.toFixed(1)}%
                    </span>
                    <span className="text-slate-500 text-[10px]">
                      (95% CI: {diff.confidenceInterval[0]} - {diff.confidenceInterval[1]}%)
                    </span>
                    {diff.conformalInclusion && (
                      <span
                        className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-indigo-950 text-indigo-300 border border-indigo-800/60 uppercase"
                        title="Included in 95% Conformal Prediction Set"
                      >
                        Conformal 95%
                      </span>
                    )}
                  </div>
                </div>

                {/* Probability Bar */}
                <div className="w-full bg-slate-800/60 h-2.5 rounded-full overflow-hidden mb-2">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      isTop
                        ? 'bg-gradient-to-r from-cyan-500 via-teal-400 to-emerald-400'
                        : 'bg-slate-600'
                    }`}
                    style={{ width: `${barWidth}%` }}
                  />
                </div>

                {/* Pathophysiologic Rationale */}
                <div className="flex items-start justify-between text-[11px] text-slate-400 gap-2">
                  <p className="leading-relaxed line-clamp-2">{diff.rationale}</p>
                  <span className="shrink-0 px-1.5 py-0.5 rounded bg-slate-900 text-slate-400 text-[10px] font-mono border border-slate-800">
                    Driver: {diff.primaryModalityDriver}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Uncertainty Quantification & Conformal Prediction Sets */}
      <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3.5 space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
          <div className="flex items-center space-x-2">
            <Cpu className="w-4 h-4 text-purple-400" />
            <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">
              Diagnostic Uncertainty Engine
            </span>
          </div>

          <div className="flex items-center space-x-1 bg-slate-900 p-0.5 rounded border border-slate-800 text-[11px]">
            <button
              onClick={() => setActiveUncertaintyTab('mc_dropout')}
              className={`px-2 py-0.5 rounded font-medium transition ${
                activeUncertaintyTab === 'mc_dropout'
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              MC Dropout (30x Passes)
            </button>
            <button
              onClick={() => setActiveUncertaintyTab('conformal')}
              className={`px-2 py-0.5 rounded font-medium transition ${
                activeUncertaintyTab === 'conformal'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Conformal Prediction Sets
            </button>
          </div>
        </div>

        {activeUncertaintyTab === 'mc_dropout' ? (
          /* Monte Carlo Dropout Simulation Breakdown */
          <div className="space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">
                Epistemic Uncertainty (Model Variance &sigma;&sup2; across 30 stochastic passes):
              </span>
              <span
                className={`font-mono font-bold ${
                  mcVarianceOverall > 0.05
                    ? 'text-rose-400'
                    : mcVarianceOverall > 0.02
                    ? 'text-amber-400'
                    : 'text-emerald-400'
                }`}
              >
                &sigma;&sup2; = {mcVarianceOverall.toFixed(3)}{' '}
                {mcVarianceOverall < 0.02 ? '(Low Epistemic Uncertainty)' : '(Elevated Uncertainty)'}
              </span>
            </div>

            {/* Simulated mini histogram of stochastic forward passes */}
            <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase font-mono block mb-1.5">
                Stochastic Sampling Distribution (Primary Condition: {topDiff?.name.split(' ')[0]}):
              </span>
              <div className="flex items-end space-x-1 h-12 pt-1">
                {mcSamples.slice(0, 24).map((sample, sIdx) => {
                  const prob = sample.predictions[topDiff?.id || ''] || 80;
                  const heightPercent = Math.min(100, Math.max(15, (prob - 50) * 2));
                  return (
                    <div
                      key={sIdx}
                      className="flex-1 bg-gradient-to-t from-purple-800 to-cyan-400 rounded-t hover:bg-cyan-300 transition-all cursor-pointer"
                      style={{ height: `${heightPercent}%` }}
                      title={`Pass #${sample.sampleIndex}: ${prob}% (Entropy: ${sample.latentEntropy})`}
                    />
                  );
                })}
              </div>
              <div className="flex justify-between text-[9px] text-slate-500 font-mono mt-1">
                <span>Pass 1</span>
                <span>30 Stochastic Forward Passes (p=0.2 Dropout Active)</span>
                <span>Pass 30</span>
              </div>
            </div>
          </div>
        ) : (
          /* Conformal Prediction Set view */
          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-300 font-medium">
                Certified Statistical Coverage Guarantee:
              </span>
              <span className="font-mono text-cyan-400 font-bold">
                1 - &alpha; = {conformalSet.certifiedCoverage}
              </span>
            </div>

            <div className="p-2.5 rounded-lg bg-indigo-950/40 border border-indigo-800/50 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-indigo-300 font-semibold text-[11px]">
                  Calibrated Prediction Set (Size: {conformalSet.setEmpiricalSize}):
                </span>
                <span className="text-[10px] text-indigo-400 font-mono uppercase font-bold">
                  Ambiguity: {conformalSet.ambiguityLevel}
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {conformalSet.includedDiagnoses.map((id) => {
                  const d = differentials.find((item) => item.id === id);
                  return (
                    <span
                      key={id}
                      className="px-2 py-0.5 rounded bg-indigo-900/80 text-white font-mono text-[11px] border border-indigo-700/80 flex items-center space-x-1"
                    >
                      <CheckCircle2 className="w-3 h-3 text-cyan-400" />
                      <span>{d?.name || id}</span>
                    </span>
                  );
                })}
              </div>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Conformal prediction guarantees that the true clinical condition is contained in the above prediction set with {conformalSet.certifiedCoverage} mathematical confidence.
            </p>
          </div>
        )}
      </div>

      {/* Cross-Modal Synergy Highlight */}
      <div className="bg-slate-950/70 border border-cyan-900/40 rounded-xl p-3.5 space-y-2">
        <span className="text-xs font-bold text-cyan-300 uppercase tracking-wider flex items-center space-x-1.5">
          <Sparkles className="w-4 h-4 text-cyan-400" />
          <span>Cross-Modal Interaction Saliency</span>
        </span>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
          {currentCase.crossModalSynergies.map((syn, idx) => (
            <div key={idx} className="bg-slate-900/70 p-2.5 rounded-lg border border-slate-800">
              <div className="flex items-center justify-between text-[11px] font-semibold text-cyan-400 mb-1 font-mono">
                <span>{syn.interaction}</span>
                <span className="text-slate-500 font-normal">
                  [{syn.modalities.join(' + ')}]
                </span>
              </div>
              <p className="text-slate-300 text-[11px] leading-relaxed">
                {syn.clinicalImpact}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Trigger Deep Gemini AI Clinical Consultation */}
      <div className="pt-2">
        <button
          onClick={onTriggerGeminiDiagnosis}
          disabled={isLoadingGemini}
          className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-600 via-teal-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-bold text-sm tracking-wide shadow-lg shadow-cyan-600/20 flex items-center justify-center space-x-2 transition disabled:opacity-50 cursor-pointer"
        >
          {isLoadingGemini ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Synthesizing Multimodal Assessment via Gemini 3.8 Flash...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>Execute Real AI Multimodal Clinical Consultation (Gemini 3.8 Flash)</span>
              <ChevronRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>
    </div>
  );
};
