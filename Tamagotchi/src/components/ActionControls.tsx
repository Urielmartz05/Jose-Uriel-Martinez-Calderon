'use client';

import React from 'react';
import { PetState, FeedingTracker, RandomEvent } from '@/types/tamagotchi';

interface ActionControlsProps {
  pet: PetState;
  feeding: FeedingTracker;
  randomEvent: RandomEvent;
  isPaused: boolean;
  onFeed: () => void;
  onPlay: () => void;
  onClean: () => void;
}

export const ActionControls: React.FC<ActionControlsProps> = ({
  pet,
  feeding,
  randomEvent,
  isPaused,
  onFeed,
  onPlay,
  onClean,
}) => {
  const isGhost = !pet.isAlive || pet.isGhost;
  const isPottyActive = randomEvent.active && randomEvent.type === 'potty';
  const isPlayActive = randomEvent.active && randomEvent.type === 'play_request';
  const isFoodRequested = feeding.isRequestingFood;

  // Global hotkeys (1: Feed, 2: Play, 3: Clean)
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }
      if (isGhost || isPaused) return;

      if (e.key === '1' || e.key.toLowerCase() === 'f' || e.key.toLowerCase() === 'a') {
        onFeed();
      } else if (e.key === '2' || e.key.toLowerCase() === 'j' || e.key.toLowerCase() === 'p') {
        onPlay();
      } else if (e.key === '3' || e.key.toLowerCase() === 'b' || e.key.toLowerCase() === 'c') {
        onClean();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isGhost, isPaused, onFeed, onPlay, onClean]);

  return (
    <nav className="action-controls-nav" aria-label="Controles táctiles de la consola">
      <div className="action-buttons-row">
        {/* BOTÓN ALIMENTAR */}
        <button
          type="button"
          onClick={onFeed}
          disabled={isGhost || isPaused}
          className={`tactile-hardware-btn btn-feed ${isFoodRequested ? 'btn-highlight-alert' : ''}`}
          title="Alimentar reduce el hambre (-30%). 3 consecutivas provocan muerte por sobrealimentación."
          aria-label="Alimentar mascota: reduce el hambre 30%"
        >
          <div className="btn-convex-cap">
            <span className="btn-tactile-icon">🍔</span>
            <span className="btn-tactile-label">Alimentar</span>
            <span className="btn-key-badge">[1]</span>
          </div>
          {isFoodRequested && (
            <span className="btn-urgent-pill">¡Comida!</span>
          )}
          {feeding.consecutiveFeedings === 2 && !isGhost && (
            <span className="btn-warning-pill">¡Peligro 2/3!</span>
          )}
        </button>

        {/* BOTÓN JUGAR */}
        <button
          type="button"
          onClick={onPlay}
          disabled={isGhost || isPaused}
          className={`tactile-hardware-btn btn-play ${isPlayActive ? 'btn-highlight-alert' : ''}`}
          title="Jugar aumenta la diversión (+25%) y reinicia la racha de alimentación."
          aria-label="Jugar con la mascota: aumenta diversión 25%"
        >
          <div className="btn-convex-cap">
            <span className="btn-tactile-icon">⚽</span>
            <span className="btn-tactile-label">Jugar</span>
            <span className="btn-key-badge">[2]</span>
          </div>
          {isPlayActive && (
            <span className="btn-urgent-pill">¡Jugar!</span>
          )}
        </button>

        {/* BOTÓN BAÑO */}
        <button
          type="button"
          onClick={onClean}
          disabled={isGhost || isPaused}
          className={`tactile-hardware-btn btn-clean ${isPottyActive || pet.hygiene <= 30 ? 'btn-highlight-clean' : ''}`}
          title="Llevar al baño aumenta la higiene (+35%) y reinicia la racha de alimentación."
          aria-label="Llevar al baño: aumenta higiene 35%"
        >
          <div className="btn-convex-cap">
            <span className="btn-tactile-icon">🛁</span>
            <span className="btn-tactile-label">Baño</span>
            <span className="btn-key-badge">[3]</span>
          </div>
          {isPottyActive && (
            <span className="btn-urgent-pill">¡Aseo!</span>
          )}
        </button>
      </div>

      {isPaused && !isGhost && (
        <div className="controls-paused-hint">
          <span>⏸ SIMULACIÓN EN PAUSA • Presiona REANUDAR en el reloj</span>
        </div>
      )}
    </nav>
  );
};
