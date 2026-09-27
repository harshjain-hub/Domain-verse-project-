import React from 'react';
import {
  Activity,
  Layers,
  BarChart3,
  Stethoscope,
  Sparkles,
  RefreshCw,
  PlusCircle,
  HelpCircle,
} from 'lucide-react';

interface HeaderProps {
  onOpenBenchmark: () => void;
  onOpenCustomCase: () => void;
  onOpenArchitectureInfo: () => void;
  onResetCase: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenBenchmark,
  onOpenCustomCase,
  onOpenArchitectureInfo,
  onResetCase,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-slate-800 text-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo and System Title */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 via-teal-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 ring-1 ring-cyan-400/30">
            <Activity className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xl font-bold tracking-tight text-white font-mono">
                Synapse<span className="text-cyan-400">MD</span>
              </span>
              <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-cyan-950/80 text-cyan-300 border border-cyan-800/60">
                Multimodal AI Triage
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">
              Clinical Diagnostics &bull; Vision ViT + NLP BERT + Tabular EHR Fusion
            </p>
          </div>
        </div>

        {/* Action Controls & Modal Triggers */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          <button
            onClick={onOpenCustomCase}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 text-xs font-medium text-slate-200 border border-slate-700 transition"
            title="Create or customize a patient intake case"
          >
            <PlusCircle className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden md:inline">Custom Patient Intake</span>
            <span className="md:hidden">New Case</span>
          </button>

          <button
            onClick={onOpenBenchmark}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-indigo-950/60 hover:bg-indigo-900/60 text-xs font-medium text-indigo-300 border border-indigo-800/50 transition shadow-sm"
            title="View unimodal vs multimodal benchmark evaluation metrics"
          >
            <BarChart3 className="w-3.5 h-3.5 text-indigo-400" />
            <span className="hidden sm:inline">Baseline Benchmark (ROC/F1)</span>
            <span className="sm:hidden">Benchmark</span>
          </button>

          <button
            onClick={onOpenArchitectureInfo}
            className="p-2 rounded-lg bg-slate-800/60 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
            title="Fusion Architecture & Guidelines"
          >
            <HelpCircle className="w-4 h-4" />
          </button>

          <button
            onClick={onResetCase}
            className="p-2 rounded-lg bg-slate-800/60 hover:bg-slate-700 text-slate-400 hover:text-slate-200 border border-slate-700 transition"
            title="Reset current case to defaults"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
