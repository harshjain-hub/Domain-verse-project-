import React from 'react';
import { GeminiDiagnosisResponse, PatientCase } from '../types/clinical';
import {
  X,
  Sparkles,
  ShieldAlert,
  AlertTriangle,
  Clock,
  Printer,
  CheckCircle,
  FileCheck,
  Stethoscope,
  BookOpen,
} from 'lucide-react';

interface GeminiReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  report: GeminiDiagnosisResponse | null;
  patientCase: PatientCase;
}

export const GeminiReportModal: React.FC<GeminiReportModalProps> = ({
  isOpen,
  onClose,
  report,
  patientCase,
}) => {
  if (!isOpen || !report) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-4xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-cyan-500/30">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base font-bold text-white tracking-tight">
                  Gemini Multimodal Clinical Diagnostic Synthesis
                </h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
                  gemini-3.8-flash
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Patient: {patientCase.name} ({patientCase.id}) &bull; {patientCase.age}y &bull;{' '}
                {patientCase.sex}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrint}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
              title="Print Clinical Summary"
            >
              <Printer className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6 scrollbar-thin scrollbar-thumb-slate-800 text-xs text-slate-300">
          {/* Executive Triage Assessment Banner */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1 max-w-xl">
              <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider block">
                Executive ER Triage Assessment:
              </span>
              <p className="text-sm font-medium text-slate-100 leading-relaxed">
                {report.triageSummary}
              </p>
            </div>

            <div className="flex items-center space-x-3 shrink-0">
              <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800 text-center">
                <span className="text-[10px] text-slate-400 uppercase font-mono block">
                  ESI Category
                </span>
                <span className="text-sm font-bold text-rose-400 font-mono">
                  Level {report.esiTriageLevel}
                </span>
              </div>
              <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800 text-center">
                <span className="text-[10px] text-slate-400 uppercase font-mono block">
                  Critical Score
                </span>
                <span className="text-sm font-bold text-amber-400 font-mono">
                  {report.criticalRiskScore}/100
                </span>
              </div>
            </div>
          </div>

          {/* Differential Diagnoses & Confidence Bounds */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center space-x-1.5">
              <Stethoscope className="w-4 h-4 text-cyan-400" />
              <span>Differential Diagnoses & 95% Confidence Bounds:</span>
            </h4>

            <div className="space-y-2.5">
              {report.differentialDiagnoses.map((diff, idx) => (
                <div
                  key={idx}
                  className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800 space-y-2"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <div className="flex items-center space-x-2">
                      <span className="w-5 h-5 rounded-full bg-cyan-950 text-cyan-400 flex items-center justify-center font-bold font-mono text-[10px] border border-cyan-800">
                        {idx + 1}
                      </span>
                      <span className="font-bold text-slate-100 text-sm">{diff.condition}</span>
                    </div>

                    <div className="flex items-center space-x-2 font-mono">
                      <span className="text-cyan-400 font-black text-sm">
                        {diff.probability}%
                      </span>
                      <span className="text-slate-500 text-[11px]">
                        (CI: {diff.confidenceInterval})
                      </span>
                      {diff.primarySupportingModality && (
                        <span className="px-1.5 py-0.5 rounded bg-slate-900 text-slate-400 text-[9px] uppercase border border-slate-800">
                          {diff.primarySupportingModality}
                        </span>
                      )}
                    </div>
                  </div>

                  <p className="text-slate-300 leading-relaxed">{diff.clinicalRationale}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Cross-Modal Interactions & Discordance */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center space-x-1.5">
              <Sparkles className="w-4 h-4 text-purple-400" />
              <span>Cross-Modal Interaction Saliency:</span>
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {report.crossModalInteractions.map((inter, i) => (
                <div key={i} className="bg-slate-950/70 p-3 rounded-xl border border-slate-800 space-y-1">
                  <div className="flex items-center space-x-1.5 text-purple-300 font-semibold font-mono text-[11px]">
                    <span>[{inter.modalitiesInvolved.join(' & ')}]</span>
                    <span className="text-slate-400">&bull;</span>
                    <span className="text-slate-200">{inter.finding}</span>
                  </div>
                  <p className="text-slate-400 leading-relaxed text-[11px]">
                    {inter.clinicalSignificance}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Red Flag Warnings & Contraindications */}
          {report.redFlags && report.redFlags.length > 0 && (
            <div className="bg-rose-950/40 border border-rose-800/60 p-4 rounded-xl space-y-2">
              <h4 className="text-xs font-bold text-rose-300 uppercase tracking-wider flex items-center space-x-1.5">
                <AlertTriangle className="w-4 h-4 text-rose-400" />
                <span>Clinical Red Flags & Immediate Contraindications:</span>
              </h4>
              <ul className="space-y-1 text-rose-200">
                {report.redFlags.map((flag, fIdx) => (
                  <li key={fIdx} className="flex items-start space-x-2">
                    <span className="text-rose-400 mt-0.5">&bull;</span>
                    <span className="leading-relaxed">{flag}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Prioritized Acute Interventions */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center space-x-1.5">
              <Clock className="w-4 h-4 text-emerald-400" />
              <span>Prioritized Acute Management & Resuscitation Steps:</span>
            </h4>

            <div className="space-y-2">
              {report.acuteInterventions.map((action, aIdx) => (
                <div
                  key={aIdx}
                  className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex items-start justify-between gap-3"
                >
                  <div className="flex items-start space-x-2.5">
                    <CheckCircle className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                    <div>
                      <span className="font-semibold text-slate-100">{action.action}</span>
                      {action.guidelineReference && (
                        <div className="flex items-center space-x-1 text-[10px] text-slate-400 mt-1 font-mono">
                          <BookOpen className="w-3 h-3 text-cyan-400" />
                          <span>{action.guidelineReference}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <span className="shrink-0 px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-300 font-mono text-[10px] border border-emerald-800">
                    {action.timeframe}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-950 px-6 py-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span>AI Assisted Clinical Support &bull; Physician Discretion Required</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium transition"
          >
            Close Consultation
          </button>
        </div>
      </div>
    </div>
  );
};
