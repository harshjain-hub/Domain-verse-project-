import React from 'react';
import { PatientCase } from '../types/clinical';
import { CLINICAL_CASES } from '../data/clinicalCases';
import { AlertTriangle, Clock, User, ShieldAlert, HeartPulse, Stethoscope, Plus } from 'lucide-react';

interface CaseSelectorProps {
  currentCase: PatientCase;
  onSelectCase: (patientCase: PatientCase) => void;
  onOpenCustomCase: () => void;
}

export const CaseSelector: React.FC<CaseSelectorProps> = ({
  currentCase,
  onSelectCase,
  onOpenCustomCase,
}) => {
  const getEsiBadge = (level: number) => {
    switch (level) {
      case 1:
        return 'bg-rose-950 text-rose-300 border-rose-600/70 animate-pulse';
      case 2:
        return 'bg-amber-950 text-amber-300 border-amber-600/70';
      case 3:
        return 'bg-yellow-950 text-yellow-300 border-yellow-600/70';
      default:
        return 'bg-blue-950 text-blue-300 border-blue-600/70';
    }
  };

  return (
    <div className="bg-slate-900/90 border-b border-slate-800 px-4 sm:px-6 lg:px-8 py-3.5">
      <div className="max-w-7xl mx-auto space-y-3">
        {/* Case Selector Pills */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-1 scrollbar-thin scrollbar-thumb-slate-700">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 mr-1 flex items-center space-x-1 shrink-0">
            <HeartPulse className="w-3.5 h-3.5 text-cyan-400" />
            <span>Active Cases:</span>
          </span>

          {CLINICAL_CASES.map((c) => {
            const isSelected = currentCase.id === c.id;
            return (
              <button
                key={c.id}
                onClick={() => onSelectCase(c)}
                className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-medium transition whitespace-nowrap shrink-0 border ${
                  isSelected
                    ? 'bg-cyan-950/80 text-cyan-200 border-cyan-500 shadow-sm shadow-cyan-500/20'
                    : 'bg-slate-800/60 text-slate-300 border-slate-700/60 hover:bg-slate-700/60 hover:text-white'
                }`}
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    c.triagePriority === 1
                      ? 'bg-rose-500'
                      : c.triagePriority === 2
                      ? 'bg-amber-400'
                      : 'bg-emerald-400'
                  }`}
                />
                <span className="font-semibold">{c.name}</span>
                <span className="text-slate-400">({c.differentials[0]?.name.split(' ')[0]})</span>
              </button>
            );
          })}

          <button
            onClick={onOpenCustomCase}
            className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-slate-800/40 text-slate-400 border border-dashed border-slate-700 hover:text-slate-200 hover:border-slate-500 transition whitespace-nowrap shrink-0"
          >
            <Plus className="w-3 h-3" />
            <span>Custom Case</span>
          </button>
        </div>

        {/* Patient Case Banner */}
        <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-3.5 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-inner">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-300 font-bold text-xs border border-slate-700">
                <User className="w-4 h-4 text-cyan-400" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h2 className="text-sm sm:text-base font-bold text-white tracking-tight">
                    {currentCase.name}
                  </h2>
                  <span className="text-xs text-slate-400 font-mono">
                    [{currentCase.age}y &bull; {currentCase.sex}]
                  </span>
                </div>
                <div className="flex items-center space-x-1 text-xs text-slate-400">
                  <Clock className="w-3 h-3 text-slate-500" />
                  <span>Admitted: {currentCase.admissionTime}</span>
                  <span className="text-slate-600">&bull;</span>
                  <span className="font-mono text-slate-400">{currentCase.id}</span>
                </div>
              </div>
            </div>

            <div className="h-6 w-px bg-slate-800 hidden md:block" />

            <div className="max-w-xl">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                Chief Complaint:
              </span>
              <p className="text-xs text-slate-200 font-medium line-clamp-1">
                {currentCase.chiefComplaint}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3 shrink-0">
            <div
              className={`px-3 py-1.5 rounded-lg border text-xs font-bold flex items-center space-x-1.5 shadow-sm ${getEsiBadge(
                currentCase.triagePriority,
              )}`}
            >
              <ShieldAlert className="w-4 h-4" />
              <span>{currentCase.esiLabel}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
