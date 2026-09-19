/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { GameEngine } from './game/gameEngine';
import { FeedbackEvent, GameState, GameStats } from './types';
import { GameHUD } from './components/GameHUD';
import { GameOverModal } from './components/GameOverModal';
import { PauseModal } from './components/PauseModal';
// TEMP DEV: Environment region testing
import { DevEnvTestPanel } from './components/DevEnvTestPanel';

export default function App() {
  const containerRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<GameEngine | null>(null);

  const [gameState, setGameState] = useState<GameState>('PLAYING');
  const [stats, setStats] = useState<GameStats>({
    score: 0,
    bestScore: 0,
    currentHeight: 0,
    bestHeight: 0,
    currentFloor: 0,
    perfectStreak: 0,
    isNewBest: false,
  });
  const [feedback, setFeedback] = useState<FeedbackEvent | null>(null);

  // Initialize 3D game engine
  useEffect(() => {
    if (!containerRef.current) return;

    const engine = new GameEngine(containerRef.current, {
      onStatsUpdate: (newStats) => setStats(newStats),
      onStateChange: (state) => setGameState(state),
      onFeedback: (fb) => {
        setFeedback(fb);
        // Feedback disappears quickly as requested
        setTimeout(() => {
          setFeedback((current) => (current?.id === fb.id ? null : current));
        }, 1200);
      },
    });

    engineRef.current = engine;

    return () => {
      engine.destroy();
      engineRef.current = null;
    };
  }, []);

  // Drop action
  const handleDrop = useCallback(() => {
    if (gameState === 'PLAYING' && engineRef.current) {
      engineRef.current.releaseCurrentFloor();
    }
  }, [gameState]);

  // Camera rotation (visual 45° orbit)
  const handleRotateCamera = useCallback((direction: number = 1) => {
    if (engineRef.current) {
      engineRef.current.rotateCamera(direction);
    }
  }, []);

  // Keyboard controls (Spacebar to drop, Q/E to rotate camera, Escape/P to pause)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        handleDrop();
      } else if (e.code === 'KeyQ') {
        e.preventDefault();
        handleRotateCamera(-1);
      } else if (e.code === 'KeyE') {
        e.preventDefault();
        handleRotateCamera(1);
      } else if (e.code === 'Escape' || e.key === 'p' || e.key === 'P') {
        e.preventDefault();
        if (gameState === 'PLAYING') {
          engineRef.current?.pause();
        } else if (gameState === 'PAUSED') {
          engineRef.current?.resume();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleDrop, handleRotateCamera, gameState]);

  // Restart game
  const handleRestart = () => {
    if (engineRef.current) {
      engineRef.current.startNewGame();
    }
  };

  // Pause / Resume toggle
  const handlePauseToggle = () => {
    if (gameState === 'PLAYING') {
      engineRef.current?.pause();
    } else if (gameState === 'PAUSED') {
      engineRef.current?.resume();
    }
  };

  return (
    <div
      id="game-viewport"
      className="relative w-screen h-screen overflow-hidden bg-slate-900 select-none"
      onClick={handleDrop}
    >
      {/* 3D WebGL Canvas Container */}
      <div
        id="canvas-container"
        ref={containerRef}
        className="w-full h-full cursor-pointer"
      />

      {/* Minimalistic In-Game HUD (~10% screen space used) */}
      <GameHUD
        stats={stats}
        feedback={feedback}
        isPaused={gameState === 'PAUSED'}
        onPauseToggle={handlePauseToggle}
        onDropFloor={handleDrop}
        onRotateCameraLeft={() => handleRotateCamera(-1)}
        onRotateCameraRight={() => handleRotateCamera(1)}
      />

      {/* TEMP DEV: Environment region testing */}
      <DevEnvTestPanel
        currentFloor={stats.currentFloor}
        regionName={stats.regionName}
        onJumpToFloor={(floor) => {
          engineRef.current?.jumpToFloorForTesting(floor);
          if (gameState === 'PAUSED') {
            engineRef.current?.resume();
          }
        }}
      />

      {/* Pause Modal */}
      {gameState === 'PAUSED' && (
        <PauseModal
          onResume={() => engineRef.current?.resume()}
          onRestart={handleRestart}
          onJumpToFloor={(floor) => {
            engineRef.current?.jumpToFloorForTesting(floor);
            engineRef.current?.resume();
          }}
        />
      )}

      {/* Game Over Modal (appears after collapse observation) */}
      {gameState === 'GAMEOVER' && (
        <GameOverModal
          stats={stats}
          onRestart={handleRestart}
        />
      )}
    </div>
  );
}
