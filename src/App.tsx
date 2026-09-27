import React, { useState, useMemo } from 'react';
import { CLINICAL_CASES } from './data/clinicalCases';
import {
  PatientCase,
  FusionMode,
  ModalityType,
  GeminiDiagnosisResponse,
} from './types/clinical';
import {
  computeFusedDifferentials,
  runMonteCarloDropoutSimulation,
  evaluateConformalPrediction,
} from './utils/fusionEngine';
import { Header } from './components/Header';
import { CaseSelector } from './components/CaseSelector';
import { FusionArchitectureSelector } from './components/FusionArchitectureSelector';
import { NotesModalityCard } from './components/NotesModalityCard';
import { ImagingModalityCard } from './components/ImagingModalityCard';
import { TabularModalityCard } from './components/TabularModalityCard';
import { DiagnosticPredictionPanel } from './components/DiagnosticPredictionPanel';
import { BenchmarkModal } from './components/BenchmarkModal';
import { CustomCaseModal } from './components/CustomCaseModal';
import { ArchitectureInfoModal } from './components/ArchitectureInfoModal';
import { GeminiReportModal } from './components/GeminiReportModal';
import { AlertCircle } from 'lucide-react';

export default function App() {
  // Current patient case
  const [currentCase, setCurrentCase] = useState<PatientCase>(CLINICAL_CASES[0]);

  // Fusion & Ablation Controls
  const [fusionMode, setFusionMode] = useState<FusionMode>('hybrid');
  const [activeModalities, setActiveModalities] = useState<Record<ModalityType, boolean>>({
    text: true,
    vision: true,
    tabular: true,
  });

  // Modal States
  const [isBenchmarkOpen, setIsBenchmarkOpen] = useState(false);
  const [isCustomCaseOpen, setIsCustomCaseOpen] = useState(false);
  const [isArchitectureInfoOpen, setIsArchitectureInfoOpen] = useState(false);
  const [isGeminiReportOpen, setIsGeminiReportOpen] = useState(false);

  // Gemini AI Consultation State
  const [isLoadingGemini, setIsLoadingGemini] = useState(false);
  const [geminiReport, setGeminiReport] = useState<GeminiDiagnosisResponse | null>(null);
  const [geminiError, setGeminiError] = useState<string | null>(null);

  // Computed Multimodal Fusion & Uncertainty States
  const fusedDifferentials = useMemo(() => {
    return computeFusedDifferentials(currentCase, fusionMode, activeModalities);
  }, [currentCase, fusionMode, activeModalities]);

  const mcResults = useMemo(() => {
    return runMonteCarloDropoutSimulation(fusedDifferentials, 30);
  }, [fusedDifferentials]);

  const conformalSet = useMemo(() => {
    return evaluateConformalPrediction(fusedDifferentials, 0.05);
  }, [fusedDifferentials]);

  // Toggle active modality for ablation study
  const handleToggleModality = (modality: ModalityType) => {
    setActiveModalities((prev) => ({
      ...prev,
      [modality]: !prev[modality],
    }));
  };

  // Reset case to defaults
  const handleResetCase = () => {
    const original = CLINICAL_CASES.find((c) => c.id === currentCase.id) || CLINICAL_CASES[0];
    setCurrentCase({ ...original });
    setFusionMode('hybrid');
    setActiveModalities({ text: true, vision: true, tabular: true });
    setGeminiReport(null);
    setGeminiError(null);
  };

  // Execute Gemini AI Multimodal Consultation
  const handleTriggerGeminiDiagnosis = async () => {
    setIsLoadingGemini(true);
    setGeminiError(null);

    try {
      const activeList = Object.entries(activeModalities)
        .filter(([_, active]) => active)
        .map(([mod]) => mod);

      const response = await fetch('/api/diagnose', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientId: currentCase.id,
          patientName: currentCase.name,
          age: currentCase.age,
          sex: currentCase.sex,
          chiefComplaint: currentCase.chiefComplaint,
          clinicalNotes: activeModalities.text ? currentCase.clinicalNotes : 'Note modality omitted in ablation.',
          ehrData: activeModalities.tabular
            ? {
                vitals: currentCase.vitals,
                labs: currentCase.labs,
              }
            : 'Tabular EHR omitted in ablation.',
          imagingFindings: activeModalities.vision ? currentCase.imagingFindings.join('; ') : 'Radiology omitted in ablation.',
          fusionArchitecture: fusionMode,
          activeModalities: activeList,
        }),
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to synthesize diagnosis from Gemini API');
      }

      setGeminiReport(data.data);
      setIsGeminiReportOpen(true);
    } catch (err: any) {
      console.error('Error invoking Gemini diagnostic copilot:', err);
      setGeminiError(err.message || 'Consultation failed. Check server connection.');
    } finally {
      setIsLoadingGemini(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-black">
      {/* Top Header */}
      <Header
        onOpenBenchmark={() => setIsBenchmarkOpen(true)}
        onOpenCustomCase={() => setIsCustomCaseOpen(true)}
        onOpenArchitectureInfo={() => setIsArchitectureInfoOpen(true)}
        onResetCase={handleResetCase}
      />

      {/* Patient Case Selector & Status Banner */}
      <CaseSelector
        currentCase={currentCase}
        onSelectCase={(c) => {
          setCurrentCase(c);
          setGeminiReport(null);
          setGeminiError(null);
        }}
        onOpenCustomCase={() => setIsCustomCaseOpen(true)}
      />

      {/* Main Workspace Layout */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-5 space-y-5">
        {/* Error notification banner if Gemini call failed */}
        {geminiError && (
          <div className="bg-rose-950/80 border border-rose-800 text-rose-200 px-4 py-3 rounded-xl flex items-center justify-between text-xs animate-shake">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{geminiError}</span>
            </div>
            <button
              onClick={() => setGeminiError(null)}
              className="text-rose-400 hover:text-white font-bold ml-4"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Fusion Architecture Selector & Ablation Controls */}
        <FusionArchitectureSelector
          fusionMode={fusionMode}
          onSelectFusionMode={setFusionMode}
          activeModalities={activeModalities}
          onToggleModality={handleToggleModality}
        />

        {/* 3-Column Multimodal Workstation Grid: NLP Notes | Radiography ViT | Tabular EHR */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-stretch">
          {/* Modality 1: Unstructured Notes (Clinical NLP) */}
          <div className="h-full">
            <NotesModalityCard
              currentCase={currentCase}
              isActive={activeModalities.text}
            />
          </div>

          {/* Modality 2: Medical Imaging (Vision ViT & Grad-CAM) */}
          <div className="h-full">
            <ImagingModalityCard
              currentCase={currentCase}
              isActive={activeModalities.vision}
            />
          </div>

          {/* Modality 3: Tabular Electronic Health Records (Vitals, Labs, SHAP) */}
          <div className="h-full">
            <TabularModalityCard
              currentCase={currentCase}
              isActive={activeModalities.tabular}
            />
          </div>
        </div>

        {/* Fused Differential Diagnoses, Triage Risk, and Uncertainty Quantification Panel */}
        <DiagnosticPredictionPanel
          currentCase={currentCase}
          differentials={fusedDifferentials}
          conformalSet={conformalSet}
          mcVarianceOverall={mcResults.epistemicUncertainty}
          mcSamples={mcResults.samples}
          fusionMode={fusionMode}
          activeModalities={activeModalities}
          onTriggerGeminiDiagnosis={handleTriggerGeminiDiagnosis}
          isLoadingGemini={isLoadingGemini}
        />
      </main>

      {/* Footer */}
      <footer className="bg-slate-950 border-t border-slate-900 py-4 text-center text-xs text-slate-500 font-mono">
        <p>
          SynapseMD Multimodal Clinical Diagnostic & Triage Agent &bull; PS-01 Engineering Reference &bull; BioClinical-BERT + ChestViT-16 + TabNet
        </p>
      </footer>

      {/* Modals */}
      <BenchmarkModal
        isOpen={isBenchmarkOpen}
        onClose={() => setIsBenchmarkOpen(false)}
      />

      <CustomCaseModal
        isOpen={isCustomCaseOpen}
        onClose={() => setIsCustomCaseOpen(false)}
        onSaveCase={(newCase) => {
          setCurrentCase(newCase);
          setGeminiReport(null);
          setGeminiError(null);
        }}
      />

      <ArchitectureInfoModal
        isOpen={isArchitectureInfoOpen}
        onClose={() => setIsArchitectureInfoOpen(false)}
      />

      <GeminiReportModal
        isOpen={isGeminiReportOpen}
        onClose={() => setIsGeminiReportOpen(false)}
        report={geminiReport}
        patientCase={currentCase}
      />
    </div>
  );
}
