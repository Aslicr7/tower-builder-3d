import React, { useState } from 'react';
import { Play, RotateCcw, Compass, ChevronDown, ChevronUp } from 'lucide-react';

interface PauseModalProps {
  onResume: () => void;
  onRestart: () => void;
  onJumpToFloor?: (floor: number) => void;
}

const TEST_FLOORS = [
  { floor: 5, label: 'Floor 5: City / Ground' },
  { floor: 15, label: 'Floor 15: High Mountains' },
  { floor: 25, label: 'Floor 25: Cloud World' },
  { floor: 34, label: 'Floor 34: Above the Clouds' },
  { floor: 41, label: 'Floor 41: High Atmosphere' },
  { floor: 48, label: 'Floor 48: Edge of Space' },
  { floor: 55, label: 'Floor 55: Space / Earth Below' },
  { floor: 62, label: 'Floor 62: Orbital Region' },
  { floor: 69, label: 'Floor 69: Moon Approach' },
  { floor: 76, label: 'Floor 76: Moon Region' },
  { floor: 85, label: 'Floor 85: Endless Space' },
];

export const PauseModal: React.FC<PauseModalProps> = ({ onResume, onRestart, onJumpToFloor }) => {
  const [showWarp, setShowWarp] = useState(false);

  return (
    <div
      id="pause-overlay"
      className="absolute inset-0 bg-slate-950/60 backdrop-blur-md flex items-center justify-center p-4 z-40"
    >
      <div
        id="pause-card"
        className="bg-slate-900/95 border border-white/20 rounded-3xl p-6 sm:p-7 max-w-sm w-full text-center shadow-2xl flex flex-col items-center gap-3.5 max-h-[90vh] overflow-y-auto"
      >
        <h2 className="text-2xl font-black text-white tracking-wide font-display">
          GAME PAUSED
        </h2>
        <p className="text-slate-400 text-xs">
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
          className="w-full py-2.5 px-6 rounded-2xl bg-slate-800 hover:bg-slate-700 active:scale-[0.98] text-slate-200 font-semibold text-xs flex items-center justify-center gap-2 border border-slate-700 transition-all cursor-pointer"
        >
          <RotateCcw className="w-4 h-4" />
          RESTART TOWER
        </button>

        {/* Warp to Environment Milestone (Acceptance Testing & Verification) */}
        {onJumpToFloor && (
          <div className="w-full mt-2 pt-2 border-t border-slate-800 text-left">
            <button
              onClick={() => setShowWarp(!showWarp)}
              className="w-full flex items-center justify-between text-xs text-sky-400 hover:text-sky-300 font-semibold py-1.5 px-1 cursor-pointer"
            >
              <span className="flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5" />
                <span>Test Environment Regions</span>
              </span>
              {showWarp ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>

            {showWarp && (
              <div className="grid grid-cols-2 gap-1.5 mt-2 max-h-48 overflow-y-auto p-1 bg-slate-950/50 rounded-xl border border-slate-800">
                {TEST_FLOORS.map((tf) => (
                  <button
                    key={tf.floor}
                    onClick={() => onJumpToFloor(tf.floor)}
                    className="px-2 py-1.5 text-[11px] font-medium text-slate-300 hover:text-white bg-slate-800/70 hover:bg-sky-600 rounded-lg text-left transition-colors cursor-pointer truncate"
                    title={tf.label}
                  >
                    {tf.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
