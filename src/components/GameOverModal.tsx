import React from 'react';
import { RotateCcw, Trophy, Award } from 'lucide-react';
import { GameStats } from '../types';

interface GameOverModalProps {
  stats: GameStats;
  onRestart: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({ stats, onRestart }) => {
  return (
    <div
      id="game-over-overlay"
      className="absolute inset-0 bg-slate-950/60 backdrop-blur-md flex items-center justify-center p-4 z-40 animate-fade-in"
    >
      <div
        id="game-over-card"
        className="bg-slate-900/90 border border-white/20 rounded-3xl p-6 sm:p-8 max-w-sm w-full text-center shadow-2xl flex flex-col items-center"
      >
        {stats.isNewBest ? (
          <div className="w-16 h-16 rounded-2xl bg-amber-500/20 border border-amber-400/40 text-amber-400 flex items-center justify-center mb-4">
            <Trophy className="w-8 h-8 animate-pulse" />
          </div>
        ) : (
          <div className="w-16 h-16 rounded-2xl bg-slate-800 border border-slate-700 text-sky-400 flex items-center justify-center mb-4">
            <Award className="w-8 h-8" />
          </div>
        )}

        {stats.isNewBest && (
          <div className="inline-block bg-gradient-to-r from-amber-500 to-amber-600 text-amber-950 text-xs font-black tracking-widest px-3 py-1 rounded-full uppercase mb-2 shadow-sm">
            NEW BEST!
          </div>
        )}

        <h2 className="text-xl sm:text-2xl font-black text-slate-300 tracking-wide uppercase font-display">
          {stats.gameOverReason === 'MISSED_FLOOR' ? 'MISSED FLOOR' : 'TOWER COLLAPSED'}
        </h2>

        {/* Score Display */}
        <div className="my-6">
          <div className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-1">
            SCORE
          </div>
          <div className="text-4xl sm:text-5xl font-black text-white font-display tracking-tight">
            {stats.score.toLocaleString()}
          </div>
          <div className="text-sm font-medium text-slate-400 mt-2">
            {stats.currentFloor} {stats.currentFloor === 1 ? 'Floor Placed' : 'Floors Placed'}
          </div>
        </div>

        <div className="w-full bg-slate-800/60 rounded-2xl p-3 mb-6 border border-white/10 flex justify-between items-center px-5">
          <span className="text-sm text-slate-400 font-medium">Best Score</span>
          <span className="text-lg font-bold text-amber-300 font-display">
            {stats.bestScore.toLocaleString()}
          </span>
        </div>

        {/* Restart button */}
        <button
          id="restart-btn"
          onClick={onRestart}
          className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 active:scale-[0.98] text-slate-950 font-black text-lg font-display tracking-wide flex items-center justify-center gap-3 shadow-xl transition-all cursor-pointer"
        >
          <RotateCcw className="w-5 h-5 stroke-[2.5]" />
          RESTART
        </button>
      </div>
    </div>
  );
};
