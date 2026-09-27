import React, { useRef, useEffect, useState } from 'react';
import {
  PatientCase,
  ColormapType,
  WindowingPreset,
} from '../types/clinical';
import {
  drawChestRadiograph,
  drawGradCamHeatmap,
} from '../utils/canvasRenderer';
import {
  Image as ImageIcon,
  Flame,
  Maximize2,
  Sliders,
  Crosshair,
  Contrast,
  CheckCircle,
  Eye,
  Info,
} from 'lucide-react';

interface ImagingModalityCardProps {
  currentCase: PatientCase;
  isActive: boolean;
}

export const ImagingModalityCard: React.FC<ImagingModalityCardProps> = ({
  currentCase,
  isActive,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Grad-CAM Controls
  const [showHeatmap, setShowHeatmap] = useState<boolean>(true);
  const [colormap, setColormap] = useState<ColormapType>('jet');
  const [heatmapOpacity, setHeatmapOpacity] = useState<number>(0.75);
  const [threshold, setThreshold] = useState<number>(0.2);

  // Radiological DICOM Viewport Controls
  const [windowing, setWindowing] = useState<WindowingPreset>('default');
  const [inverted, setInverted] = useState<boolean>(false);
  const [zoomLevel, setZoomLevel] = useState<number>(1.0);

  // Crosshair coordinate inspection
  const [crosshairPos, setCrosshairPos] = useState<{
    x: number;
    y: number;
    normX: number;
    normY: number;
    active: boolean;
    regionText?: string;
  }>({
    x: 0,
    y: 0,
    normX: 0,
    normY: 0,
    active: false,
  });

  // Re-draw canvas whenever case data or visual controls change
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // 1. Draw base chest radiograph
    drawChestRadiograph(ctx, width, height, currentCase, windowing, inverted);

    // 2. Draw Grad-CAM overlay if enabled
    if (showHeatmap && isActive) {
      drawGradCamHeatmap(
        ctx,
        width,
        height,
        currentCase,
        colormap,
        heatmapOpacity,
        threshold,
      );
    }
  }, [
    currentCase,
    showHeatmap,
    colormap,
    heatmapOpacity,
    threshold,
    windowing,
    inverted,
    isActive,
  ]);

  // Handle canvas mouse move for crosshair inspection
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const normX = x / rect.width;
    const normY = y / rect.height;

    // Check if near any Grad-CAM hot regions
    let matchedRegion: string | undefined;
    for (const r of currentCase.gradCamRegion) {
      const dx = (normX - r.cx) / r.rx;
      const dy = (normY - r.cy) / r.ry;
      if (dx * dx + dy * dy <= 1.2) {
        matchedRegion = r.description;
        break;
      }
    }

    setCrosshairPos({
      x,
      y,
      normX: Math.round(normX * 100) / 100,
      normY: Math.round(normY * 100) / 100,
      active: true,
      regionText: matchedRegion,
    });
  };

  const handleMouseLeave = () => {
    setCrosshairPos((prev) => ({ ...prev, active: false }));
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
          <div className="w-6 h-6 rounded-md bg-blue-950/70 border border-blue-800/60 flex items-center justify-center text-blue-400">
            <ImageIcon className="w-3.5 h-3.5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              Modality 2: Medical Imaging (Vision ViT)
            </h4>
            <span className="text-[10px] text-slate-400 font-mono">
              ChestViT-16 &bull; Grad-CAM Class Activation Maps
            </span>
          </div>
        </div>

        {/* Heatmap Toggle */}
        <button
          onClick={() => setShowHeatmap(!showHeatmap)}
          className={`flex items-center space-x-1.5 px-2.5 py-1 rounded text-[11px] font-semibold transition border ${
            showHeatmap
              ? 'bg-rose-950/80 text-rose-300 border-rose-700/80 shadow-sm shadow-rose-900/30'
              : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-200'
          }`}
        >
          <Flame className="w-3 h-3 text-rose-400" />
          <span>Grad-CAM {showHeatmap ? 'ON' : 'OFF'}</span>
        </button>
      </div>

      {/* Main Radiograph Canvas Viewport */}
      <div className="p-3 bg-black flex flex-col items-center justify-center relative overflow-hidden group">
        <div
          className="relative transition-transform duration-200 ease-out"
          style={{ transform: `scale(${zoomLevel})` }}
        >
          <canvas
            ref={canvasRef}
            width={480}
            height={380}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            className="w-full max-w-[440px] h-[280px] sm:h-[300px] rounded-lg cursor-crosshair object-contain border border-slate-800/60 shadow-2xl"
          />

          {/* Crosshair indicator overlay */}
          {crosshairPos.active && (
            <div
              className="absolute pointer-events-none transform -translate-x-1/2 -translate-y-1/2 z-10"
              style={{ left: `${crosshairPos.normX * 100}%`, top: `${crosshairPos.normY * 100}%` }}
            >
              <div className="w-6 h-6 border border-cyan-400 rounded-full flex items-center justify-center">
                <div className="w-1 h-1 bg-cyan-300 rounded-full" />
              </div>
            </div>
          )}
        </div>

        {/* Crosshair coordinate badge */}
        {crosshairPos.active && (
          <div className="absolute top-2 left-2 bg-slate-950/90 text-cyan-300 text-[10px] font-mono px-2 py-1 rounded border border-cyan-800/60 flex items-center space-x-2 z-20 backdrop-blur-sm">
            <Crosshair className="w-3 h-3 text-cyan-400" />
            <span>
              X: {crosshairPos.normX} | Y: {crosshairPos.normY}
            </span>
            {crosshairPos.regionText && (
              <>
                <span className="text-slate-500">&bull;</span>
                <span className="text-amber-300 font-semibold">{crosshairPos.regionText}</span>
              </>
            )}
          </div>
        )}

        {/* Quick Zoom and LUT Toolbar in bottom right of image */}
        <div className="absolute bottom-2 right-2 flex items-center space-x-1 bg-slate-950/80 p-1 rounded-lg border border-slate-800 backdrop-blur-sm z-20">
          <button
            onClick={() => setInverted(!inverted)}
            className={`p-1 rounded text-[10px] font-mono ${
              inverted ? 'bg-cyan-900 text-cyan-200' : 'text-slate-400 hover:text-white'
            }`}
            title="Invert LUT (Black bones vs White bones)"
          >
            <Contrast className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setZoomLevel(zoomLevel === 1.0 ? 1.25 : zoomLevel === 1.25 ? 1.5 : 1.0)}
            className="px-1.5 py-0.5 rounded text-[10px] font-mono text-slate-300 hover:text-white"
            title="Cycle Zoom Level"
          >
            {zoomLevel}x
          </button>
        </div>
      </div>

      {/* Grad-CAM & Radiologist Controls Bar */}
      <div className="px-4 py-2 bg-slate-950/70 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-xs">
        {/* Colormap Selector */}
        <div className="flex items-center space-x-1.5">
          <span className="text-[11px] text-slate-400 font-medium">Colormap:</span>
          <div className="flex items-center space-x-1 bg-slate-900 p-0.5 rounded border border-slate-800">
            {(['jet', 'turbo', 'inferno', 'viridis'] as ColormapType[]).map((cmap) => (
              <button
                key={cmap}
                onClick={() => setColormap(cmap)}
                className={`px-1.5 py-0.5 rounded text-[10px] uppercase font-mono font-semibold transition ${
                  colormap === cmap
                    ? 'bg-cyan-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {cmap}
              </button>
            ))}
          </div>
        </div>

        {/* Opacity Slider */}
        <div className="flex items-center space-x-2">
          <span className="text-[11px] text-slate-400 font-medium">Alpha:</span>
          <input
            type="range"
            min="0.1"
            max="1.0"
            step="0.05"
            value={heatmapOpacity}
            onChange={(e) => setHeatmapOpacity(parseFloat(e.target.value))}
            className="w-16 sm:w-20 accent-cyan-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
          />
          <span className="font-mono text-[10px] text-slate-300 w-7">
            {Math.round(heatmapOpacity * 100)}%
          </span>
        </div>

        {/* Windowing Preset Selector */}
        <div className="flex items-center space-x-1.5">
          <span className="text-[11px] text-slate-400 font-medium">Window:</span>
          <select
            value={windowing}
            onChange={(e) => setWindowing(e.target.value as WindowingPreset)}
            className="bg-slate-900 border border-slate-800 text-slate-300 rounded text-[10px] px-1.5 py-0.5 font-mono cursor-pointer"
          >
            <option value="default">Standard</option>
            <option value="lung">Lung (Parenchymal)</option>
            <option value="mediastinum">Mediastinum</option>
            <option value="bone">Bone Edge</option>
          </select>
        </div>
      </div>

      {/* Radiologist Structured Findings */}
      <div className="p-3 bg-slate-900/60 border-t border-slate-800/80 flex-1 overflow-y-auto max-h-[140px] text-xs space-y-1.5 scrollbar-thin scrollbar-thumb-slate-800">
        <div className="flex items-center space-x-1.5 text-slate-400 text-[11px] font-bold uppercase tracking-wider mb-1">
          <CheckCircle className="w-3.5 h-3.5 text-cyan-400" />
          <span>Radiological Findings ({currentCase.imagingType}):</span>
        </div>
        {currentCase.imagingFindings.map((finding, idx) => (
          <div key={idx} className="flex items-start space-x-1.5 text-slate-300 text-[11px]">
            <span className="text-cyan-400 mt-0.5">&bull;</span>
            <span className="leading-tight">{finding}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
