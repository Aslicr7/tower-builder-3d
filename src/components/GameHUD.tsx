import React, { useEffect, useState } from 'react';
import { Pause, Play, Volume2, VolumeX, Building2 } from 'lucide-react';
import { FeedbackEvent, GameStats } from '../types';
import { sounds } from '../audio/sound';

interface GameHUDProps {
  stats: GameStats;
  feedback: FeedbackEvent | null;
  isPaused: boolean;
  onPauseToggle: () => void;
  onDropFloor?: () => void;
  onRotateCameraLeft: () => void;
  onRotateCameraRight: () => void;
}

/**
 * OrbitArrow:
 * Custom lightweight SVG rendering an elliptical 3D camera orbit trajectory based on the concept sketch.
 * - Long, shallow perspective curve sweeping from the inner central area outward around the tower.
 * - Multi-line depth treatment:
 *   - Primary orbit path (opacity ~0.60, stroke 4px) terminating in a clean outward-facing arrowhead.
 *   - Secondary trail 1 (opacity ~0.30, stroke 2.5px) concentric depth line.
 *   - Secondary trail 2 (opacity ~0.16, stroke 1.8px) inner depth line.
 * - Gradient fade: Inner/rear end fades into depth, outward arrowhead end is crisp and clear.
 * - LEFT control points OUTWARD LEFT.
 * - RIGHT control is the exact horizontal mirror (via transform: scaleX(-1)) pointing OUTWARD RIGHT.
 */
const OrbitArrow: React.FC<{ direction: 'left' | 'right' }> = ({ direction }) => {
  const gradId = `orbit-fade-${direction}`;
  return (
    <svg
      viewBox="0 0 84 46"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-[80px] h-[46px] sm:w-[86px] sm:h-[50px] text-white/60 group-hover:text-white/85 group-active:text-white transition-colors duration-150 drop-shadow-[0_2px_6px_rgba(0,0,0,0.35)]"
      style={{
        transform: direction === 'right' ? 'scaleX(-1)' : 'none',
        transformOrigin: 'center center',
      }}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={gradId} x1="90%" y1="15%" x2="10%" y2="85%">
          <stop offset="0%" stopColor="currentColor" stopOpacity="0.25" />
          <stop offset="45%" stopColor="currentColor" stopOpacity="0.70" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="1" />
        </linearGradient>
      </defs>

      {/* Secondary depth trail 2 (innermost, lightest) */}
      <path
        d="M 64 2.5 C 44 7 28 16 22 19.5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        opacity="0.16"
      />

      {/* Secondary depth trail 1 (middle concentric orbit trail) */}
      <path
        d="M 70 6 C 48 11 26 22 16 26"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        opacity="0.30"
      />

      {/* Main elliptical camera orbit path */}
      <path
        d="M 76 11 C 52 16 26 29 8 34.5"
        stroke={`url(#${gradId})`}
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Crisp outward-facing arrowhead (points OUTWARD LEFT on left, OUTWARD RIGHT when mirrored) */}
      <path
        d="M 17.5 23.5 L 8 34.5 L 20.5 39.5"
        stroke={`url(#${gradId})`}
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export const GameHUD: React.FC<GameHUDProps> = ({
  stats,
  feedback,
  isPaused,
  onPauseToggle,
  onRotateCameraLeft,
  onRotateCameraRight,
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
      {/* Top Header: TOP LEFT (Pause + SCORE + BEST) and TOP RIGHT (Sound + FLOOR) */}
      <div className="flex items-start justify-between w-full">
        {/* TOP LEFT: Pause + SCORE + BEST */}
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
            className="w-10 h-10 rounded-xl bg-slate-900/60 backdrop-blur-md border border-white/20 text-white flex items-center justify-center hover:bg-slate-800/80 active:scale-95 transition-all shadow-md cursor-pointer select-none"
            aria-label={isPaused ? 'Resume' : 'Pause'}
          >
            {isPaused ? <Play className="w-4 h-4 fill-white" /> : <Pause className="w-4 h-4 fill-white" />}
          </button>

          {/* SCORE card */}
          <div
            id="score-card"
            className="bg-slate-900/65 backdrop-blur-md border border-white/20 rounded-xl px-3.5 py-1.5 shadow-md text-white min-w-[105px] select-none"
          >
            <div className="text-[10px] font-semibold text-slate-300 tracking-wider uppercase">
              SCORE
            </div>
            <div className="text-2xl sm:text-3xl font-black tracking-tight font-display text-white leading-none mt-0.5">
              {stats.score}
            </div>
            <div className="text-[10px] font-semibold text-slate-400 mt-0.5">
              BEST: <span className="text-amber-300 font-bold">{stats.bestScore}</span>
            </div>
          </div>
        </div>

        {/* TOP RIGHT: Sound + FLOOR only (No Region, No CAM panel) */}
        <div className="flex items-center gap-1.5 sm:gap-2 pointer-events-auto">
          <button
            id="sound-toggle-btn"
            onClick={handleToggleSound}
            onPointerDown={(e) => {
              e.stopPropagation();
            }}
            className="w-9 h-9 rounded-xl bg-slate-900/60 backdrop-blur-md border border-white/20 text-white flex items-center justify-center hover:bg-slate-800/80 active:scale-95 transition-all shadow-md cursor-pointer select-none"
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
            className="bg-slate-900/65 backdrop-blur-md border border-white/20 rounded-xl px-2.5 sm:px-3.5 py-1.5 shadow-md text-white flex items-center gap-2 select-none"
          >
            <div className="w-7 h-7 rounded-lg bg-amber-500/20 border border-amber-400/30 flex items-center justify-center text-amber-400">
              <Building2 className="w-3.5 h-3.5" />
            </div>
            <div>
              <div className="text-[10px] font-semibold text-slate-300 tracking-wider uppercase">
                FLOOR
              </div>
              <div className="text-lg sm:text-xl font-extrabold tracking-tight font-display text-white leading-none mt-0.5">
                {stats.currentFloor}{' '}
                <span className="text-slate-400 text-xs font-normal">/ ∞</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Placement & Score Feedback Badge */}
      <div className="self-center mb-auto pt-10 sm:pt-14 pointer-events-none">
        {feedback && (
          <div
            key={feedback.id}
            className={`px-5 py-2 rounded-full font-display font-extrabold text-sm sm:text-lg tracking-wider shadow-xl animate-bounce backdrop-blur-md border ${
              feedback.type === 'PERFECT'
                ? 'bg-amber-500/90 text-amber-50 border-amber-300 shadow-amber-500/50'
                : feedback.type === 'GREAT'
                ? 'bg-emerald-500/90 text-white border-emerald-300 shadow-emerald-500/40'
                : feedback.type === 'RISKY'
                ? 'bg-red-600 text-white border-red-400 shadow-[0_4px_20px_rgba(220,38,38,0.55)]'
                : 'bg-slate-900/85 text-white border-white/20 shadow-slate-950/40'
            }`}
          >
            {feedback.message}
          </div>
        )}
      </div>

      {/* 
        BOTTOM AREA:
        - Center area remains completely clear and unobstructed for tower and falling modules.
        - NO visible button box/container: the custom 3D orbit arrow itself is the control.
        - Invisible touch target (~84x72px) consumes input safely without dropping floors.
        - BOTTOM LEFT: Left camera orbit arrow (-45°), points OUTWARD LEFT.
        - BOTTOM RIGHT: Right camera orbit arrow (+45°), points OUTWARD RIGHT (exact mirror).
      */}
      <div className="w-full flex items-end justify-between pointer-events-none px-0.5 sm:px-1 pb-2 sm:pb-3 pb-[max(0.6rem,env(safe-area-inset-bottom,0px))]">
        {/* BOTTOM LEFT: Left Camera Orbit Arrow (-45°, points OUTWARD LEFT) */}
        <div className="pointer-events-auto">
          <button
            id="camera-rotate-left-btn"
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              onRotateCameraLeft();
            }}
            onPointerDown={(e) => {
              e.stopPropagation();
            }}
            onTouchStart={(e) => {
              e.stopPropagation();
            }}
            onMouseDown={(e) => {
              e.stopPropagation();
            }}
            className="w-[84px] h-[72px] sm:w-[92px] sm:h-[76px] flex items-center justify-center bg-transparent border-0 outline-none cursor-pointer select-none group transition-transform duration-150 active:scale-[0.96]"
            aria-label="Orbit camera left 45 degrees"
            title="Rotate camera view left 45° (Q)"
          >
            <OrbitArrow direction="left" />
          </button>
        </div>

        {/* BOTTOM RIGHT: Right Camera Orbit Arrow (+45°, points OUTWARD RIGHT) */}
        <div className="pointer-events-auto">
          <button
            id="camera-rotate-right-btn"
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              onRotateCameraRight();
            }}
            onPointerDown={(e) => {
              e.stopPropagation();
            }}
            onTouchStart={(e) => {
              e.stopPropagation();
            }}
            onMouseDown={(e) => {
              e.stopPropagation();
            }}
            className="w-[84px] h-[72px] sm:w-[92px] sm:h-[76px] flex items-center justify-center bg-transparent border-0 outline-none cursor-pointer select-none group transition-transform duration-150 active:scale-[0.96]"
            aria-label="Orbit camera right 45 degrees"
            title="Rotate camera view right 45° (E)"
          >
            <OrbitArrow direction="right" />
          </button>
        </div>
      </div>
    </div>
  );
};
