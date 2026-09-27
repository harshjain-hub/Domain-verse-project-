import React, { useState } from 'react';
import { PatientCase, TokenSaliency, LabBiomarker } from '../types/clinical';
import { X, UserPlus, FileText, Activity, Droplets, Image, Save, Check } from 'lucide-react';

interface CustomCaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveCase: (newCase: PatientCase) => void;
}

export const CustomCaseModal: React.FC<CustomCaseModalProps> = ({
  isOpen,
  onClose,
  onSaveCase,
}) => {
  const [name, setName] = useState('Samuel R. Vance');
  const [age, setAge] = useState<number>(63);
  const [sex, setSex] = useState<'Male' | 'Female' | 'Other'>('Male');
  const [chiefComplaint, setChiefComplaint] = useState(
    'Acute dyspnea, pleuritic chest discomfort, and tachycardia on minimal exertion',
  );
  const [clinicalNotes, setClinicalNotes] = useState(
    `Patient presents with acute shortness of breath and right-sided pleuritic chest pain that began 3 hours ago. Noticed mild swelling in right lower extremity over the past 24 hours following a 9-hour transatlantic flight. Denies fevers or productive cough. Triage vitals show resting sinus tachycardia at 116 bpm and SpO2 90% on ambient air.`,
  );

  // Vitals
  const [hr, setHr] = useState(116);
  const [sbp, setSbp] = useState(98);
  const [dbp, setDbp] = useState(64);
  const [rr, setRr] = useState(26);
  const [spo2, setSpo2] = useState(90);
  const [temp, setTemp] = useState(37.2);
  const [gcs, setGcs] = useState(15);

  // Key Labs
  const [ddimer, setDdimer] = useState(3850);
  const [trop, setTrop] = useState(0.12);
  const [bnp, setBnp] = useState(420);
  const [lactate, setLactate] = useState(2.1);
  const [wbc, setWbc] = useState(9.4);
  const [cr, setCr] = useState(1.1);

  // Imaging Preset
  const [imagingPreset, setImagingPreset] = useState<'pe' | 'edema' | 'pneumonia' | 'ptx' | 'clear'>('pe');

  if (!isOpen) return null;

  const handleSave = () => {
    // Generate token saliencies from notes
    const tokens: TokenSaliency[] = [
      { token: 'acute shortness of breath', score: 0.76, category: 'symptom' },
      { token: 'right-sided pleuritic chest pain', score: 0.84, category: 'symptom' },
      { token: 'transatlantic flight', score: 0.72, category: 'history' },
      { token: 'swelling in right lower extremity', score: 0.89, category: 'exam' },
      { token: 'Denies fevers', score: -0.35, category: 'pertinent_negative' },
      { token: 'sinus tachycardia at 116 bpm', score: 0.75, category: 'exam' },
      { token: 'SpO2 90%', score: 0.78, category: 'exam' },
    ];

    const labs: LabBiomarker[] = [
      { name: 'D-Dimer', value: ddimer, unit: 'ng/mL', normalRange: '< 500', status: ddimer > 500 ? 'critical' : 'normal', clinicalCategory: 'hematology' },
      { name: 'hs-Troponin I', value: trop, unit: 'ng/mL', normalRange: '< 0.04', status: trop > 0.04 ? 'high' : 'normal', clinicalCategory: 'cardiac' },
      { name: 'NT-proBNP', value: bnp, unit: 'pg/mL', normalRange: '< 125', status: bnp > 125 ? 'high' : 'normal', clinicalCategory: 'cardiac' },
      { name: 'Serum Lactate', value: lactate, unit: 'mmol/L', normalRange: '0.5 - 2.0', status: lactate > 2.0 ? 'high' : 'normal', clinicalCategory: 'metabolic' },
      { name: 'WBC Count', value: wbc, unit: '10³/µL', normalRange: '4.5 - 11.0', status: wbc > 11.0 ? 'high' : 'normal', clinicalCategory: 'inflammatory' },
      { name: 'Serum Creatinine', value: cr, unit: 'mg/dL', normalRange: '0.6 - 1.2', status: cr > 1.2 ? 'high' : 'normal', clinicalCategory: 'renal' },
    ];

    let radiographSvgPath = 'pe_wedge';
    let imagingDesc = "Wedge-shaped pleural-based triangular opacity in right lower periphery (Hampton's Hump).";
    let findings = ["Hampton's hump wedge opacity in right lower lung", 'Regional oligemia (Westermark sign)', 'No gross pneumothorax'];
    let gradCamRegion = [
      { cx: 0.72, cy: 0.68, rx: 0.18, ry: 0.14, intensity: 0.92, description: 'Wedge-shaped pulmonary infarction zone' },
    ];

    if (imagingPreset === 'edema') {
      radiographSvgPath = 'adhf_edema';
      imagingDesc = 'Marked cardiomegaly with perihilar bat-wing alveolar infiltrates and blunted costophrenic angles.';
      findings = ['Perihilar alveolar butterfly pulmonary edema', 'Marked cardiomegaly', 'Bilateral pleural effusions'];
      gradCamRegion = [{ cx: 0.50, cy: 0.52, rx: 0.28, ry: 0.24, intensity: 0.94, description: 'Perihilar butterfly pulmonary edema' }];
    } else if (imagingPreset === 'pneumonia') {
      radiographSvgPath = 'sepsis_consolidation';
      imagingDesc = 'Dense confluent alveolar lobar consolidation with air bronchograms in right lower/middle lobe.';
      findings = ['Dense right middle and lower lobe consolidation', 'Prominent air bronchograms', 'Silhouette sign positive'];
      gradCamRegion = [{ cx: 0.68, cy: 0.62, rx: 0.22, ry: 0.20, intensity: 0.96, description: 'Dense right lobar consolidation' }];
    } else if (imagingPreset === 'ptx') {
      radiographSvgPath = 'pneumo_tension';
      imagingDesc = 'Left visceral pleural collapse line with complete radiolucency and mediastinal shift to the right.';
      findings = ['Visceral pleural collapse line on left', 'Absence of left lung vascular markings', 'Mediastinal shift to contralateral side'];
      gradCamRegion = [{ cx: 0.28, cy: 0.48, rx: 0.22, ry: 0.32, intensity: 0.98, description: 'Left lung visceral pleural collapse line' }];
    } else if (imagingPreset === 'clear') {
      radiographSvgPath = 'nstemi_clear';
      imagingDesc = 'Clear lung fields without focal consolidation, pneumothorax, or overt vascular congestion.';
      findings = ['Clear bilateral lung fields', 'Normal cardiac silhouette', 'No pleural effusion'];
      gradCamRegion = [{ cx: 0.50, cy: 0.56, rx: 0.20, ry: 0.18, intensity: 0.60, description: 'Cardiac silhouette and aortic root' }];
    }

    const customPatient: PatientCase = {
      id: `CUSTOM-${Date.now().toString().slice(-4)}`,
      name,
      age,
      sex,
      admissionTime: 'Current Intake',
      chiefComplaint,
      triagePriority: spo2 < 85 || sbp < 80 ? 1 : spo2 < 92 || sbp < 100 ? 2 : 3,
      esiLabel: spo2 < 85 || sbp < 80 ? 'ESI Level 1 - Resuscitation' : spo2 < 92 || sbp < 100 ? 'ESI Level 2 - High Risk' : 'ESI Level 3 - Urgent',
      clinicalNotes,
      tokenSaliencies: tokens,
      vitals: {
        heartRate: hr,
        systolicBp: sbp,
        diastolicBp: dbp,
        respiratoryRate: rr,
        spO2: spo2,
        temperature: temp,
        gcs,
      },
      labs,
      imagingType: 'Chest Radiograph (CXR)',
      imagingDescription: imagingDesc,
      imagingFindings: findings,
      radiographSvgPath,
      gradCamRegion,
      shapFeatures: [
        { featureName: `D-Dimer (${ddimer} ng/mL)`, modality: 'tabular', valueDisplay: `${ddimer} ng/mL`, shapValue: ddimer > 2000 ? 0.28 : 0.05, category: 'lab' },
        { featureName: `SpO2 (${spo2}%)`, modality: 'tabular', valueDisplay: `${spo2}%`, shapValue: spo2 < 92 ? 0.24 : -0.10, category: 'vital' },
        { featureName: `Heart Rate (${hr} bpm)`, modality: 'tabular', valueDisplay: `${hr} bpm`, shapValue: hr > 100 ? 0.18 : -0.05, category: 'vital' },
        { featureName: `Troponin I (${trop} ng/mL)`, modality: 'tabular', valueDisplay: `${trop} ng/mL`, shapValue: trop > 0.04 ? 0.14 : -0.08, category: 'lab' },
      ],
      differentials: [
        {
          id: 'custom-diff-1',
          name: imagingPreset === 'pe' ? 'Acute Pulmonary Embolism' : imagingPreset === 'edema' ? 'Acute Decompensated Heart Failure' : imagingPreset === 'pneumonia' ? 'Lobar Pneumonia with Sepsis' : imagingPreset === 'ptx' ? 'Tension Pneumothorax' : 'Acute Coronary Syndrome',
          icd10: 'Z03.89',
          probability: 88.5,
          confidenceInterval: [83.0, 93.0],
          mcVariance: 0.014,
          conformalInclusion: true,
          primaryModalityDriver: 'Cross-Modal Synergy',
          rationale: 'Integrated clinical presentation matching the entered multimodal triad.',
        },
        {
          id: 'custom-diff-2',
          name: 'Alternative Acute Cardiopulmonary Condition',
          icd10: 'R07.9',
          probability: 8.5,
          confidenceInterval: [4.0, 13.0],
          mcVariance: 0.022,
          conformalInclusion: false,
          primaryModalityDriver: 'Clinical Notes',
          rationale: 'Secondary consideration requiring diagnostic rule-out.',
        },
        {
          id: 'custom-diff-3',
          name: 'Mild Lower Respiratory Tract Syndrome',
          icd10: 'J22',
          probability: 3.0,
          confidenceInterval: [1.0, 6.0],
          mcVariance: 0.018,
          conformalInclusion: false,
          primaryModalityDriver: 'Biomarkers',
          rationale: 'Lower likelihood based on severe hemodynamic and biomarker markers.',
        },
      ],
      crossModalSynergies: [
        {
          modalities: ['Text', 'Tabular'],
          interaction: 'Risk Factor Concordance',
          clinicalImpact: 'Triage history and lab biomarker elevations strongly amplify diagnostic specificity.',
        },
      ],
    };

    onSaveCase(customPatient);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-4xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-slate-950 px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-950/80 border border-cyan-700/80 flex items-center justify-center text-cyan-400">
              <UserPlus className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">
                Custom Patient Intake & Multimodal Simulator
              </h2>
              <p className="text-xs text-slate-400">
                Configure patient notes, vitals, labs, and imaging to run the fusion diagnostic pipeline
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

        {/* Form Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5 scrollbar-thin scrollbar-thumb-slate-800">
          {/* Patient Demographics */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
            <div className="sm:col-span-2 space-y-1">
              <label className="text-slate-300 font-semibold">Patient Name:</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-slate-100 font-medium focus:border-cyan-500 focus:outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="text-slate-300 font-semibold">Age (years):</label>
              <input
                type="number"
                value={age}
                onChange={(e) => setAge(parseInt(e.target.value) || 50)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-slate-100 font-medium focus:border-cyan-500 focus:outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="text-slate-300 font-semibold">Sex:</label>
              <select
                value={sex}
                onChange={(e) => setSex(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-slate-100 font-medium focus:border-cyan-500 focus:outline-none"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          {/* Chief Complaint */}
          <div className="space-y-1 text-xs">
            <label className="text-slate-300 font-semibold">Chief Complaint:</label>
            <input
              type="text"
              value={chiefComplaint}
              onChange={(e) => setChiefComplaint(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-slate-100 font-medium focus:border-cyan-500 focus:outline-none"
            />
          </div>

          {/* Unstructured Doctor Notes */}
          <div className="space-y-1 text-xs">
            <label className="text-slate-300 font-semibold flex items-center justify-between">
              <span>Unstructured Doctor / Triage Notes (NLP input):</span>
              <span className="text-[10px] text-slate-500 font-mono">Token attribution will automatically analyze</span>
            </label>
            <textarea
              rows={4}
              value={clinicalNotes}
              onChange={(e) => setClinicalNotes(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-slate-200 font-mono text-xs leading-relaxed focus:border-cyan-500 focus:outline-none"
            />
          </div>

          {/* Vitals Telemetry */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
              Bedside Vitals:
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 text-xs font-mono">
              <div className="bg-slate-950 p-2 rounded-lg border border-slate-800">
                <span className="text-[10px] text-slate-400 block">Heart Rate (bpm)</span>
                <input
                  type="number"
                  value={hr}
                  onChange={(e) => setHr(parseInt(e.target.value) || 80)}
                  className="w-full bg-transparent text-white font-bold py-1 focus:outline-none"
                />
              </div>
              <div className="bg-slate-950 p-2 rounded-lg border border-slate-800">
                <span className="text-[10px] text-slate-400 block">Systolic BP</span>
                <input
                  type="number"
                  value={sbp}
                  onChange={(e) => setSbp(parseInt(e.target.value) || 120)}
                  className="w-full bg-transparent text-white font-bold py-1 focus:outline-none"
                />
              </div>
              <div className="bg-slate-950 p-2 rounded-lg border border-slate-800">
                <span className="text-[10px] text-slate-400 block">Diastolic BP</span>
                <input
                  type="number"
                  value={dbp}
                  onChange={(e) => setDbp(parseInt(e.target.value) || 80)}
                  className="w-full bg-transparent text-white font-bold py-1 focus:outline-none"
                />
              </div>
              <div className="bg-slate-950 p-2 rounded-lg border border-slate-800">
                <span className="text-[10px] text-slate-400 block">Resp Rate (/min)</span>
                <input
                  type="number"
                  value={rr}
                  onChange={(e) => setRr(parseInt(e.target.value) || 16)}
                  className="w-full bg-transparent text-white font-bold py-1 focus:outline-none"
                />
              </div>
              <div className="bg-slate-950 p-2 rounded-lg border border-slate-800">
                <span className="text-[10px] text-slate-400 block">SpO2 (%)</span>
                <input
                  type="number"
                  value={spo2}
                  onChange={(e) => setSpo2(parseInt(e.target.value) || 98)}
                  className="w-full bg-transparent text-white font-bold py-1 focus:outline-none"
                />
              </div>
              <div className="bg-slate-950 p-2 rounded-lg border border-slate-800">
                <span className="text-[10px] text-slate-400 block">Temp (°C)</span>
                <input
                  type="number"
                  step="0.1"
                  value={temp}
                  onChange={(e) => setTemp(parseFloat(e.target.value) || 37.0)}
                  className="w-full bg-transparent text-white font-bold py-1 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Key Lab Biomarkers */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
              Key Biomarkers:
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 text-xs font-mono">
              <div className="bg-slate-950 p-2 rounded-lg border border-slate-800">
                <span className="text-[10px] text-slate-400 block">D-Dimer (ng/mL)</span>
                <input
                  type="number"
                  value={ddimer}
                  onChange={(e) => setDdimer(parseInt(e.target.value) || 300)}
                  className="w-full bg-transparent text-white font-bold py-1 focus:outline-none"
                />
              </div>
              <div className="bg-slate-950 p-2 rounded-lg border border-slate-800">
                <span className="text-[10px] text-slate-400 block">hs-Troponin I</span>
                <input
                  type="number"
                  step="0.01"
                  value={trop}
                  onChange={(e) => setTrop(parseFloat(e.target.value) || 0.02)}
                  className="w-full bg-transparent text-white font-bold py-1 focus:outline-none"
                />
              </div>
              <div className="bg-slate-950 p-2 rounded-lg border border-slate-800">
                <span className="text-[10px] text-slate-400 block">BNP (pg/mL)</span>
                <input
                  type="number"
                  value={bnp}
                  onChange={(e) => setBnp(parseInt(e.target.value) || 80)}
                  className="w-full bg-transparent text-white font-bold py-1 focus:outline-none"
                />
              </div>
              <div className="bg-slate-950 p-2 rounded-lg border border-slate-800">
                <span className="text-[10px] text-slate-400 block">Lactate (mmol/L)</span>
                <input
                  type="number"
                  step="0.1"
                  value={lactate}
                  onChange={(e) => setLactate(parseFloat(e.target.value) || 1.2)}
                  className="w-full bg-transparent text-white font-bold py-1 focus:outline-none"
                />
              </div>
              <div className="bg-slate-950 p-2 rounded-lg border border-slate-800">
                <span className="text-[10px] text-slate-400 block">WBC (10³/µL)</span>
                <input
                  type="number"
                  step="0.1"
                  value={wbc}
                  onChange={(e) => setWbc(parseFloat(e.target.value) || 7.5)}
                  className="w-full bg-transparent text-white font-bold py-1 focus:outline-none"
                />
              </div>
              <div className="bg-slate-950 p-2 rounded-lg border border-slate-800">
                <span className="text-[10px] text-slate-400 block">Creatinine</span>
                <input
                  type="number"
                  step="0.1"
                  value={cr}
                  onChange={(e) => setCr(parseFloat(e.target.value) || 1.0)}
                  className="w-full bg-transparent text-white font-bold py-1 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Radiology Saliency Template */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
              Chest Radiograph Feature Template:
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs">
              {[
                { id: 'pe', label: "Hampton's Hump (PE)" },
                { id: 'edema', label: 'Bat-Wing Edema (CHF)' },
                { id: 'pneumonia', label: 'Lobar Consolidation' },
                { id: 'ptx', label: 'Visceral Pleural Line (PTX)' },
                { id: 'clear', label: 'Clear Lung Fields' },
              ].map((tmpl) => (
                <button
                  key={tmpl.id}
                  onClick={() => setImagingPreset(tmpl.id as any)}
                  className={`p-2 rounded-lg border text-left font-medium transition ${
                    imagingPreset === tmpl.id
                      ? 'bg-cyan-950/80 text-cyan-200 border-cyan-500 shadow-sm'
                      : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <span className="block font-semibold">{tmpl.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-950 px-6 py-3.5 border-t border-slate-800 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-xs transition"
          >
            Cancel
          </button>

          <button
            onClick={handleSave}
            className="px-5 py-2 rounded-lg bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-500 hover:to-teal-500 text-white font-bold text-xs shadow-md shadow-cyan-600/20 flex items-center space-x-1.5 transition cursor-pointer"
          >
            <Check className="w-4 h-4" />
            <span>Load Custom Case into Workstation</span>
          </button>
        </div>
      </div>
    </div>
  );
};
