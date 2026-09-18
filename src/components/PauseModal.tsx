import React from 'react';
import { Play, RotateCcw } from 'lucide-react';

interface PauseModalProps {
  onResume: () => void;
  onRestart: () => void;
}

export const PauseModal: React.FC<PauseModalProps> = ({ onResume, onRestart }) => {
  return (
    <div
      id="pause-overlay"
      className="absolute inset-0 bg-slate-950/60 backdrop-blur-md flex items-center justify-center p-4 z-40"
    >
      <div
        id="pause-card"
        className="bg-slate-900/95 border border-white/20 rounded-3xl p-6 sm:p-8 max-w-xs w-full text-center shadow-2xl flex flex-col items-center gap-4"
      >
        <h2 className="text-2xl font-black text-white tracking-wide font-display">
          GAME PAUSED
        </h2>
        <p className="text-slate-400 text-sm mb-2">
          Tower construction is currently on hold.
        </p>

        <button
          id="resume-btn"
          onClick={onResume}
          className="w-full py-3.5 px-6 rounded-2xl bg-amber-500 hover:bg-amber-400 active:scale-[0.98] text-slate-950 font-black text-base font-display flex items-center justify-center gap-2.5 shadow-lg transition-all cursor-pointer"
        >
          <Play className="w-5 h-5 fill-slate-950 stroke-none" />
          RESUME
        </button>

        <button
          id="pause-restart-btn"
          onClick={onRestart}
          className="w-full py-3 px-6 rounded-2xl bg-slate-800 hover:bg-slate-700 active:scale-[0.98] text-slate-200 font-semibold text-sm flex items-center justify-center gap-2 border border-slate-700 transition-all cursor-pointer"
        >
          <RotateCcw className="w-4 h-4" />
          RESTART TOWER
        </button>
      </div>
    </div>
  );
};
