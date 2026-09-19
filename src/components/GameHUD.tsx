import React, { useEffect, useState } from 'react';
import { Pause, Play, Volume2, VolumeX, Building2, RotateCw } from 'lucide-react';
import { FeedbackEvent, GameStats } from '../types';
import { sounds } from '../audio/sound';

interface GameHUDProps {
  stats: GameStats;
  feedback: FeedbackEvent | null;
  isPaused: boolean;
  onPauseToggle: () => void;
  onDropFloor: () => void;
  onRotateCamera: () => void;
}

export const GameHUD: React.FC<GameHUDProps> = ({
  stats,
  feedback,
  isPaused,
  onPauseToggle,
  onDropFloor,
  onRotateCamera,
}) => {
  const [soundEnabled, setSoundEnabled] = useState(true);

  useEffect(() => {
    setSoundEnabled(sounds.isEnabled());
  }, []);

  const handleToggleSound = (e: React.MouseEvent) => {
    e.stopPropagation();
    const nextState = sounds.toggleMute();
    setSoundEnabled(nextState);
  };

  return (
    <div
      id="game-hud"
      className="absolute inset-0 pointer-events-none select-none flex flex-col justify-between p-4 sm:p-6"
    >
      {/* Top Header Controls & Stats matching reference image */}
      <div className="flex items-start justify-between w-full">
        {/* Left Card: Pause + Height + Best */}
        <div className="flex items-center gap-2 pointer-events-auto">
          <button
            id="pause-btn"
            onClick={(e) => {
              e.stopPropagation();
              onPauseToggle();
            }}
            onPointerDown={(e) => {
              e.stopPropagation();
            }}
            className="w-10 h-10 rounded-xl bg-slate-900/60 backdrop-blur-md border border-white/20 text-white flex items-center justify-center hover:bg-slate-800/80 active:scale-95 transition-all shadow-md cursor-pointer"
            aria-label={isPaused ? 'Resume' : 'Pause'}
          >
            {isPaused ? <Play className="w-4 h-4 fill-white" /> : <Pause className="w-4 h-4 fill-white" />}
          </button>

          {/* Height card matching reference image styling */}
          <div
            id="height-card"
            className="bg-slate-900/65 backdrop-blur-md border border-white/20 rounded-xl px-3.5 py-1.5 shadow-md text-white min-w-[105px]"
          >
            <div className="text-[10px] font-medium text-slate-300 tracking-wide uppercase">
              Height
            </div>
            <div className="text-xl sm:text-2xl font-extrabold tracking-tight font-display text-white leading-none mt-0.5">
              {stats.currentHeight.toLocaleString()} <span className="text-sm font-semibold text-sky-400">m</span>
            </div>
            <div className="text-[10px] font-medium text-slate-400 mt-0.5">
              Best: <span className="text-amber-300 font-semibold">{stats.bestHeight.toLocaleString()} m</span>
            </div>
          </div>
        </div>

        {/* Right Card: Camera Rotate + Sound + Floor Count */}
        <div className="flex items-center gap-1.5 sm:gap-2 pointer-events-auto">
          {/* Camera Rotate Button (Visual 45° orbit) */}
          <button
            id="camera-rotate-btn"
            onClick={(e) => {
              e.stopPropagation();
              onRotateCamera();
            }}
            onPointerDown={(e) => {
              e.stopPropagation();
            }}
            className="w-9 h-9 rounded-xl bg-slate-900/60 backdrop-blur-md border border-white/20 text-white flex items-center justify-center hover:bg-slate-800/80 active:scale-95 transition-all shadow-md cursor-pointer"
            aria-label="Rotate camera view 45 degrees"
            title="Rotate camera view (45° / Q,E)"
          >
            <RotateCw className="w-4 h-4 text-slate-200" />
          </button>

          <button
            id="sound-toggle-btn"
            onClick={handleToggleSound}
            onPointerDown={(e) => {
              e.stopPropagation();
            }}
            className="w-9 h-9 rounded-xl bg-slate-900/60 backdrop-blur-md border border-white/20 text-white flex items-center justify-center hover:bg-slate-800/80 active:scale-95 transition-all shadow-md cursor-pointer"
            aria-label={soundEnabled ? 'Mute sound' : 'Enable sound'}
          >
            {soundEnabled ? (
              <Volume2 className="w-4 h-4 text-slate-200" />
            ) : (
              <VolumeX className="w-4 h-4 text-rose-400" />
            )}
          </button>

          <div
            id="floor-card"
            className="bg-slate-900/65 backdrop-blur-md border border-white/20 rounded-xl px-2.5 sm:px-3 py-1.5 shadow-md text-white flex items-center gap-2"
          >
            <div className="w-7 h-7 rounded-lg bg-amber-500/20 border border-amber-400/30 flex items-center justify-center text-amber-400">
              <Building2 className="w-3.5 h-3.5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-medium text-slate-300 tracking-wide uppercase">
                  Floor
                </span>
                {stats.regionName && (
                  <span className="text-[9px] font-bold text-sky-300 uppercase tracking-tight px-1.5 py-0.5 rounded bg-sky-950/70 border border-sky-400/30">
                    {stats.regionName}
                  </span>
                )}
              </div>
              <div className="text-lg sm:text-xl font-extrabold tracking-tight font-display text-white leading-none mt-0.5">
                {stats.currentFloor}{' '}
                <span className="text-slate-400 text-xs font-normal">/ ∞</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Perfect / Feedback Badge */}
      <div className="self-center mb-auto pt-10 sm:pt-14">
        {feedback && (
          <div
            key={feedback.id}
            className={`px-5 py-2 rounded-full font-display font-extrabold text-sm sm:text-lg tracking-wider shadow-xl animate-bounce backdrop-blur-md border ${
              feedback.type === 'PERFECT'
                ? 'bg-amber-500/90 text-amber-50 border-amber-300 shadow-amber-500/50'
                : feedback.type === 'GREAT'
                ? 'bg-emerald-500/90 text-white border-emerald-300 shadow-emerald-500/40'
                : 'bg-rose-500/90 text-white border-rose-300 shadow-rose-500/40'
            }`}
          >
            {feedback.message}
          </div>
        )}
      </div>

      {/* Bottom Drop Pill matching reference image */}
      <div className="w-full flex flex-col items-center justify-end pb-4 sm:pb-6 pointer-events-none">
        <div className="bg-slate-900/70 backdrop-blur-md border border-white/20 px-6 py-2.5 rounded-full text-white text-xs sm:text-sm font-semibold tracking-wide shadow-lg flex items-center gap-2">
          <span>👆</span>
          <span>TAP SCREEN / SPACE TO DROP</span>
        </div>
      </div>
    </div>
  );
};
