// TEMP DEV: Environment region testing
import React, { useState } from 'react';
import { Compass, ChevronDown, ChevronUp } from 'lucide-react';

interface DevEnvTestPanelProps {
  currentFloor: number;
  regionName?: string;
  onJumpToFloor: (floor: number) => void;
}

// TEMP DEV: Environment region testing - Specific requested test points across retimed progression
const TEST_FLOORS = [5, 15, 25, 34, 41, 48, 55, 62, 69, 76, 85] as const;

export const DevEnvTestPanel: React.FC<DevEnvTestPanelProps> = ({
  currentFloor,
  regionName,
  onJumpToFloor,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div
      id="dev-env-test-panel"
      className="absolute top-20 left-3 sm:top-24 sm:left-4 z-30 pointer-events-auto select-none"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Collapsible Toggle Button */}
      <button
        id="dev-env-test-toggle-btn"
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        className="bg-slate-900/85 hover:bg-slate-800 text-sky-400 hover:text-sky-300 border border-sky-500/40 rounded-xl px-2.5 py-1.5 text-xs font-mono font-bold tracking-wider shadow-lg flex items-center gap-1.5 backdrop-blur-md cursor-pointer transition-all active:scale-95"
        title="Toggle Environment Region Test Controls"
        aria-label="Toggle Environment Region Test Controls"
      >
        <Compass className="w-3.5 h-3.5 text-sky-400" />
        <span>ENV TEST</span>
        {isOpen ? (
          <ChevronUp className="w-3.5 h-3.5 text-slate-400" />
        ) : (
          <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
        )}
      </button>

      {/* Expanded Controls Card */}
      {isOpen && (
        <div
          id="dev-env-test-menu"
          className="mt-2 bg-slate-950/90 border border-sky-500/30 rounded-2xl p-3 shadow-2xl backdrop-blur-md w-64 text-left animate-in fade-in zoom-in-95 duration-150"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Optional Current Test Info */}
          <div className="text-[11px] font-mono border-b border-slate-800/80 pb-2 mb-2 flex flex-col gap-1">
            <div className="flex justify-between items-center">
              <span className="text-slate-400 uppercase tracking-wider text-[10px]">TEST FLOOR:</span>
              <span className="font-bold text-amber-300 bg-amber-950/50 px-1.5 py-0.5 rounded border border-amber-500/30 text-xs">
                {currentFloor}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400 uppercase tracking-wider text-[10px]">REGION:</span>
              <span className="font-bold text-sky-300 bg-sky-950/50 px-1.5 py-0.5 rounded border border-sky-500/30 truncate max-w-[140px] text-right text-[10px]">
                {regionName || 'CITY / GROUND'}
              </span>
            </div>
          </div>

          {/* Test Floor Buttons */}
          <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-1.5">
            Select Altitude:
          </div>
          <div className="grid grid-cols-5 gap-1.5">
            {TEST_FLOORS.map((floor) => {
              const isActive = currentFloor === floor;
              return (
                <button
                  key={floor}
                  id={`dev-test-floor-${floor}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    onJumpToFloor(floor);
                  }}
                  className={`py-1.5 px-1 rounded-lg font-mono text-xs font-bold transition-all cursor-pointer text-center active:scale-95 ${
                    isActive
                      ? 'bg-sky-500 text-slate-950 ring-2 ring-sky-300 font-extrabold shadow-md shadow-sky-500/40'
                      : 'bg-slate-800/90 hover:bg-sky-700 text-slate-200 border border-slate-700 hover:text-white'
                  }`}
                  title={`Jump to Floor ${floor}`}
                >
                  {floor}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
