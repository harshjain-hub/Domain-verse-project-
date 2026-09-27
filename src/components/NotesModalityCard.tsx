import React, { useState } from 'react';
import { PatientCase, TokenSaliency } from '../types/clinical';
import { FileText, Sparkles, Highlighter, Eye, Layers, Info } from 'lucide-react';

interface NotesModalityCardProps {
  currentCase: PatientCase;
  isActive: boolean;
}

export const NotesModalityCard: React.FC<NotesModalityCardProps> = ({
  currentCase,
  isActive,
}) => {
  const [viewMode, setViewMode] = useState<'saliency' | 'raw'>('saliency');
  const [hoveredToken, setHoveredToken] = useState<TokenSaliency | null>(null);

  // Helper to render text with token saliency highlights
  const renderHighlightedNotes = () => {
    let rawText = currentCase.clinicalNotes;
    const tokens = currentCase.tokenSaliencies;

    if (viewMode === 'raw' || !tokens || tokens.length === 0) {
      return (
        <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-line font-mono">
          {rawText}
        </p>
      );
    }

    // Sort tokens by length descending so longer phrases match first
    const sortedTokens = [...tokens].sort((a, b) => b.token.length - a.token.length);

    // Build regex pattern
    const escaped = sortedTokens
      .map((t) => t.token.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
      .join('|');
    const regex = new RegExp(`(${escaped})`, 'gi');

    const parts = rawText.split(regex);

    return (
      <div className="text-xs text-slate-300 leading-relaxed font-mono space-y-2">
        {parts.map((part, idx) => {
          const matchedToken = sortedTokens.find(
            (t) => t.token.toLowerCase() === part.toLowerCase(),
          );

          if (!matchedToken) {
            return <span key={idx}>{part}</span>;
          }

          // Positive score increases diagnostic risk (Red/Orange)
          // Negative score is protective/pertinent negative (Cyan/Blue)
          const isNegative = matchedToken.score < 0;
          const absScore = Math.abs(matchedToken.score);

          let styleClass = '';
          if (isNegative) {
            styleClass =
              'bg-cyan-950/80 text-cyan-200 border-b-2 border-cyan-400 font-semibold px-1 py-0.5 rounded cursor-pointer hover:bg-cyan-900';
          } else if (absScore > 0.8) {
            styleClass =
              'bg-rose-950/90 text-rose-100 border-b-2 border-rose-500 font-bold px-1 py-0.5 rounded cursor-pointer hover:bg-rose-900';
          } else if (absScore > 0.5) {
            styleClass =
              'bg-amber-950/80 text-amber-200 border-b-2 border-amber-500 font-semibold px-1 py-0.5 rounded cursor-pointer hover:bg-amber-900';
          } else {
            styleClass =
              'bg-slate-800 text-slate-200 border-b-2 border-slate-600 px-1 py-0.5 rounded cursor-pointer hover:bg-slate-700';
          }

          return (
            <span
              key={idx}
              className={styleClass}
              onMouseEnter={() => setHoveredToken(matchedToken)}
              onMouseLeave={() => setHoveredToken(null)}
              title={`Attribution Score: ${matchedToken.score > 0 ? '+' : ''}${matchedToken.score} [${
                matchedToken.category || 'feature'
              }]`}
            >
              {part}
            </span>
          );
        })}
      </div>
    );
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
          <div className="w-6 h-6 rounded-md bg-emerald-950/70 border border-emerald-800/60 flex items-center justify-center text-emerald-400">
            <FileText className="w-3.5 h-3.5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              Modality 1: Clinical Notes (NLP)
            </h4>
            <span className="text-[10px] text-slate-400 font-mono">
              BioClinical-BERT &bull; Integrated Gradient Saliency
            </span>
          </div>
        </div>

        {/* View Switcher */}
        <div className="flex items-center space-x-1 bg-slate-900 p-0.5 rounded-lg border border-slate-800">
          <button
            onClick={() => setViewMode('saliency')}
            className={`px-2 py-1 rounded text-[11px] font-medium transition flex items-center space-x-1 ${
              viewMode === 'saliency'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Highlighter className="w-3 h-3" />
            <span>Saliency</span>
          </button>
          <button
            onClick={() => setViewMode('raw')}
            className={`px-2 py-1 rounded text-[11px] font-medium transition flex items-center space-x-1 ${
              viewMode === 'raw'
                ? 'bg-slate-800 text-white'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Eye className="w-3 h-3" />
            <span>Raw</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="p-4 flex-1 overflow-y-auto max-h-[360px] space-y-3 scrollbar-thin scrollbar-thumb-slate-800">
        {renderHighlightedNotes()}
      </div>

      {/* Footer / Attribution Legend */}
      <div className="bg-slate-950/60 px-4 py-2.5 border-t border-slate-800/80 text-[11px] flex flex-wrap items-center justify-between gap-2">
        {hoveredToken ? (
          <div className="flex items-center space-x-2 text-cyan-300 font-mono">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <span className="font-semibold truncate max-w-[200px]">"{hoveredToken.token}"</span>
            <span className="text-slate-400">&bull;</span>
            <span
              className={
                hoveredToken.score > 0 ? 'text-rose-400 font-bold' : 'text-cyan-400 font-bold'
              }
            >
              Attribution: {hoveredToken.score > 0 ? '+' : ''}
              {hoveredToken.score.toFixed(2)}
            </span>
          </div>
        ) : (
          <div className="flex items-center space-x-3 text-slate-400">
            <span className="flex items-center space-x-1">
              <span className="w-2.5 h-2.5 rounded bg-rose-500 inline-block" />
              <span>Critical Saliency</span>
            </span>
            <span className="flex items-center space-x-1">
              <span className="w-2.5 h-2.5 rounded bg-amber-500 inline-block" />
              <span>Moderate</span>
            </span>
            <span className="flex items-center space-x-1">
              <span className="w-2.5 h-2.5 rounded bg-cyan-400 inline-block" />
              <span>Pertinent Negative</span>
            </span>
          </div>
        )}

        <span className="text-[10px] text-slate-500 font-mono hidden sm:inline">
          Dim: 768d &rarr; 64d Latent
        </span>
      </div>
    </div>
  );
};
