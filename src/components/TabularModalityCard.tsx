import React, { useState } from 'react';
import { PatientCase, ShapFeature } from '../types/clinical';
import { calculateQSOFA, calculateShockIndex } from '../utils/fusionEngine';
import {
  Table as TableIcon,
  Heart,
  Activity,
  Droplets,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  BarChart2,
  CheckCircle,
} from 'lucide-react';

interface TabularModalityCardProps {
  currentCase: PatientCase;
  isActive: boolean;
}

export const TabularModalityCard: React.FC<TabularModalityCardProps> = ({
  currentCase,
  isActive,
}) => {
  const [tabView, setTabView] = useState<'vitals_labs' | 'shap'>('vitals_labs');

  const vitals = currentCase.vitals;
  const qsofa = calculateQSOFA(vitals);
  const shock = calculateShockIndex(vitals);

  // Calculate Mean Arterial Pressure (MAP) = (2 * DBP + SBP) / 3
  const map = Math.round((2 * vitals.diastolicBp + vitals.systolicBp) / 3);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'critical':
        return 'bg-rose-950/80 text-rose-300 border-rose-800 font-bold';
      case 'high':
        return 'bg-amber-950/80 text-amber-300 border-amber-800';
      case 'low':
        return 'bg-blue-950/80 text-blue-300 border-blue-800';
      default:
        return 'bg-slate-800/80 text-slate-300 border-slate-700';
    }
  };

  return (
    <div
      className={`bg-slate-900/90 border rounded-xl overflow-hidden shadow-sm flex flex-col h-full transition ${
        isActive ? 'border-slate-800' : 'border-slate-800/40 opacity-40 grayscale'
      }`}
    >
      {/* Card Header */}
      <div className="bg-slate-950/80 px-4 py-3 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 rounded-md bg-amber-950/70 border border-amber-800/60 flex items-center justify-center text-amber-400">
            <TableIcon className="w-3.5 h-3.5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              Modality 3: Tabular EHR & Labs
            </h4>
            <span className="text-[10px] text-slate-400 font-mono">
              TabNet / LightGBM &bull; SHAP Waterfall Attributions
            </span>
          </div>
        </div>

        {/* Tab switch between Raw Vitals/Labs and SHAP Waterfall */}
        <div className="flex items-center space-x-1 bg-slate-900 p-0.5 rounded-lg border border-slate-800">
          <button
            onClick={() => setTabView('vitals_labs')}
            className={`px-2 py-1 rounded text-[11px] font-medium transition flex items-center space-x-1 ${
              tabView === 'vitals_labs'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Activity className="w-3 h-3" />
            <span>Vitals & Labs</span>
          </button>
          <button
            onClick={() => setTabView('shap')}
            className={`px-2 py-1 rounded text-[11px] font-medium transition flex items-center space-x-1 ${
              tabView === 'shap'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <BarChart2 className="w-3 h-3" />
            <span>SHAP Plot</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="p-4 flex-1 overflow-y-auto max-h-[360px] space-y-3.5 scrollbar-thin scrollbar-thumb-slate-800">
        {tabView === 'vitals_labs' ? (
          <>
            {/* Vitals Telemetry Grid */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Bedside Vitals & Indices:
                </span>
                <div className="flex items-center space-x-2 text-[10px] font-mono">
                  <span
                    className={`px-1.5 py-0.5 rounded border ${
                      shock.status === 'critical'
                        ? 'bg-rose-950 text-rose-300 border-rose-700 font-bold'
                        : shock.status === 'elevated'
                        ? 'bg-amber-950 text-amber-300 border-amber-700'
                        : 'bg-emerald-950 text-emerald-300 border-emerald-800'
                    }`}
                  >
                    Shock Idx: {shock.index}
                  </span>
                  <span
                    className={`px-1.5 py-0.5 rounded border ${
                      qsofa.highRisk
                        ? 'bg-rose-950 text-rose-300 border-rose-700 font-bold animate-pulse'
                        : 'bg-slate-800 text-slate-300 border-slate-700'
                    }`}
                  >
                    qSOFA: {qsofa.score}/3
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                {/* Heart Rate */}
                <div className="bg-slate-950/70 p-2 rounded-lg border border-slate-800/80 text-center">
                  <span className="text-[10px] text-slate-400 block font-medium">HR</span>
                  <span
                    className={`text-sm font-bold font-mono ${
                      vitals.heartRate > 100 || vitals.heartRate < 50
                        ? 'text-rose-400'
                        : 'text-slate-100'
                    }`}
                  >
                    {vitals.heartRate}
                  </span>
                  <span className="text-[9px] text-slate-500 block">bpm</span>
                </div>

                {/* Blood Pressure */}
                <div className="bg-slate-950/70 p-2 rounded-lg border border-slate-800/80 text-center">
                  <span className="text-[10px] text-slate-400 block font-medium">BP</span>
                  <span
                    className={`text-sm font-bold font-mono ${
                      vitals.systolicBp < 90 || vitals.systolicBp > 160
                        ? 'text-rose-400'
                        : 'text-slate-100'
                    }`}
                  >
                    {vitals.systolicBp}/{vitals.diastolicBp}
                  </span>
                  <span className="text-[9px] text-slate-500 block">mmHg</span>
                </div>

                {/* MAP */}
                <div className="bg-slate-950/70 p-2 rounded-lg border border-slate-800/80 text-center">
                  <span className="text-[10px] text-slate-400 block font-medium">MAP</span>
                  <span
                    className={`text-sm font-bold font-mono ${
                      map < 65 ? 'text-rose-400' : 'text-slate-100'
                    }`}
                  >
                    {map}
                  </span>
                  <span className="text-[9px] text-slate-500 block">mmHg</span>
                </div>

                {/* Respiratory Rate */}
                <div className="bg-slate-950/70 p-2 rounded-lg border border-slate-800/80 text-center">
                  <span className="text-[10px] text-slate-400 block font-medium">RR</span>
                  <span
                    className={`text-sm font-bold font-mono ${
                      vitals.respiratoryRate > 22 ? 'text-amber-400' : 'text-slate-100'
                    }`}
                  >
                    {vitals.respiratoryRate}
                  </span>
                  <span className="text-[9px] text-slate-500 block">/min</span>
                </div>

                {/* SpO2 */}
                <div className="bg-slate-950/70 p-2 rounded-lg border border-slate-800/80 text-center">
                  <span className="text-[10px] text-slate-400 block font-medium">SpO2</span>
                  <span
                    className={`text-sm font-bold font-mono ${
                      vitals.spO2 < 92 ? 'text-rose-400' : 'text-slate-100'
                    }`}
                  >
                    {vitals.spO2}%
                  </span>
                  <span className="text-[9px] text-slate-500 block">Room Air</span>
                </div>

                {/* Temp */}
                <div className="bg-slate-950/70 p-2 rounded-lg border border-slate-800/80 text-center">
                  <span className="text-[10px] text-slate-400 block font-medium">Temp</span>
                  <span
                    className={`text-sm font-bold font-mono ${
                      vitals.temperature > 38.0 || vitals.temperature < 36.0
                        ? 'text-amber-400'
                        : 'text-slate-100'
                    }`}
                  >
                    {vitals.temperature}°C
                  </span>
                  <span className="text-[9px] text-slate-500 block">Core</span>
                </div>
              </div>
            </div>

            {/* Laboratory Biomarkers Table */}
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                Laboratory Assays & Biomarkers:
              </span>

              <div className="border border-slate-800 rounded-lg overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950/90 text-slate-400 text-[10px] uppercase font-mono border-b border-slate-800">
                    <tr>
                      <th className="py-1.5 px-3">Biomarker</th>
                      <th className="py-1.5 px-2">Result</th>
                      <th className="py-1.5 px-2">Ref Range</th>
                      <th className="py-1.5 px-2 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-mono">
                    {currentCase.labs.map((lab, i) => (
                      <tr key={i} className="hover:bg-slate-800/30 transition">
                        <td className="py-1.5 px-3 font-semibold text-slate-200">
                          {lab.name}
                        </td>
                        <td className="py-1.5 px-2 font-bold text-slate-100">
                          {lab.value}{' '}
                          <span className="text-[10px] text-slate-400 font-normal">
                            {lab.unit}
                          </span>
                        </td>
                        <td className="py-1.5 px-2 text-slate-400 text-[11px]">
                          {lab.normalRange}
                        </td>
                        <td className="py-1.5 px-2 text-right">
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] border uppercase ${getStatusBadge(
                              lab.status,
                            )}`}
                          >
                            {lab.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        ) : (
          /* SHAP Waterfall Feature Attribution Plot */
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                SHAP Feature Attribution Waterfall:
              </span>
              <span className="text-[10px] text-slate-400 font-mono">
                Target: {currentCase.differentials[0]?.name.split(' ')[0]}
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Shapley values reflect each EHR biomarker's marginal contribution pushing the diagnostic probability up (+) or down (-).
            </p>

            <div className="space-y-2 pt-1">
              {currentCase.shapFeatures.map((feat, idx) => {
                const isPositive = feat.shapValue > 0;
                const widthPercent = Math.min(100, Math.round(Math.abs(feat.shapValue) * 220));

                return (
                  <div key={idx} className="space-y-1 text-xs">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-semibold text-slate-200">{feat.featureName}</span>
                      <span
                        className={`font-mono font-bold ${
                          isPositive ? 'text-rose-400' : 'text-cyan-400'
                        }`}
                      >
                        {isPositive ? '+' : ''}
                        {(feat.shapValue * 100).toFixed(1)}%
                      </span>
                    </div>

                    <div className="w-full bg-slate-950 h-3 rounded-full overflow-hidden flex relative border border-slate-800">
                      {/* Midline at center */}
                      <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-slate-700 z-10" />

                      {isPositive ? (
                        <div
                          className="h-full bg-gradient-to-r from-amber-500 to-rose-500 ml-[50%] rounded-r"
                          style={{ width: `${Math.min(50, widthPercent / 2)}%` }}
                        />
                      ) : (
                        <div
                          className="h-full bg-gradient-to-l from-teal-400 to-cyan-500 rounded-l ml-auto"
                          style={{
                            width: `${Math.min(50, widthPercent / 2)}%`,
                            marginRight: '50%',
                          }}
                        />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="bg-slate-950/60 px-4 py-2.5 border-t border-slate-800/80 text-[11px] flex items-center justify-between text-slate-400">
        <span className="flex items-center space-x-1.5">
          <Droplets className="w-3.5 h-3.5 text-amber-400" />
          <span>Biomarker Panels &bull; Real-time Telemetry</span>
        </span>
        <span className="font-mono text-slate-500 text-[10px]">
          {currentCase.labs.length} Lab Assays Fused
        </span>
      </div>
    </div>
  );
};
