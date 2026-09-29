'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { useSimulationLoop } from '@/hooks/useSimulationLoop';
import { SetupModal } from '@/components/SetupModal';
import { DigitalClock } from '@/components/DigitalClock';
import { PetDisplay, ActionReactionType } from '@/components/PetDisplay';
import { StatsPanel } from '@/components/StatsPanel';
import { ActionControls } from '@/components/ActionControls';
import { ActivityLog } from '@/components/ActivityLog';
import { RulesCard } from '@/components/RulesCard';
import { SummaryModal } from '@/components/SummaryModal';

export const GameContainer: React.FC = () => {
  const {
    state,
    startGame,
    feedPet,
    playWithPet,
    cleanPet,
    togglePause,
    resetGame,
  } = useSimulationLoop();

  // Action reaction state for 800ms satisfaction feedback (design.md Section 6)
  const [actionReaction, setActionReaction] = useState<ActionReactionType>(null);

  const handleFeed = useCallback(() => {
    feedPet();
    setActionReaction('feeding');
    setTimeout(() => setActionReaction(null), 800);
  }, [feedPet]);

  const handlePlay = useCallback(() => {
    playWithPet();
    setActionReaction('playing');
    setTimeout(() => setActionReaction(null), 800);
  }, [playWithPet]);

  const handleClean = useCallback(() => {
    cleanPet();
    setActionReaction('cleaning');
    setTimeout(() => setActionReaction(null), 800);
  }, [cleanPet]);

  // Keyboard navigation shortcuts: 1 = Alimentar, 2 = Jugar, 3 = Baño
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }
      if (state.status !== 'playing' || !state.clock.isRunning) return;

      if (e.key === '1') {
        handleFeed();
      } else if (e.key === '2') {
        handlePlay();
      } else if (e.key === '3') {
        handleClean();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [state.status, state.clock.isRunning, handleFeed, handlePlay, handleClean]);

  const isSetup = state.status === 'setup';
  const isGameOver =
    state.status === 'game_over_ghost' || state.status === 'game_over_completed';
  const isGhost = state.pet.isGhost;
  const hasAlert = state.feeding.isRequestingFood || state.randomEvent.active;

  return (
    <div className={`tamagotchi-app-root ${isGhost ? 'is-ghost-mode' : ''}`}>
      {/* Ambient background decoration */}
      <div className="ambient-background-glow" />
      <div className="ambient-grid-overlay" />

      {/* Main retro cyber header */}
      <header className="app-header">
        <div className="header-brand">
          <span className="brand-icon" aria-hidden="true">🐣</span>
          <div className="brand-text">
            <h1 className="brand-title">TAMAGOTCHI 1996</h1>
            <span className="brand-subtitle">Simulador de Mascota Virtual • 24 Horas LCD</span>
          </div>
        </div>

        <div className="header-actions">
          {state.status === 'playing' && (
            <button
              type="button"
              className="btn-header-secondary"
              onClick={resetGame}
              title="Reiniciar y comenzar de nuevo"
            >
              🔄 Reiniciar
            </button>
          )}
        </div>
      </header>

      {/* Main Content Layout */}
      <main className="app-main-layout">
        {/* Left Side: Game rules and quick info */}
        <aside className="layout-sidebar sidebar-left">
          <RulesCard />
        </aside>

        {/* Center: The Virtual Tamagotchi Handheld Device Shell */}
        <section className="layout-device-center" aria-label="Consola Tamagotchi">
          <div className="tamagotchi-egg-chassis">
            {/* Top keychain chain loop */}
            <div className="chassis-keychain-loop" aria-hidden="true">
              <div className="chassis-keychain-hole" />
            </div>

            {/* Screws and Chassis Header */}
            <div className="chassis-hardware-top">
              <span className="chassis-screw screw-top-left" />
              <div className="chassis-brand-badge">
                <span className="brand-stars">★ ★</span>
                <span className="brand-name">TAMAGOTCHI</span>
                <span className="brand-stars">★ ★</span>
              </div>
              <span className="chassis-screw screw-top-right" />
            </div>

            {/* Inner Screen Bezel as defined in design.md Section 2.3 & 3 */}
            <div className={`chassis-screen-bezel ${isGhost ? 'bezel-ghost-mode' : ''}`}>
              {/* Bezel inner glare highlight */}
              <div className="bezel-glare-effect" aria-hidden="true" />

              {/* Digital Clock on top of screen (00:00 to 24:00) */}
              <DigitalClock
                clock={state.clock}
                gameStatus={state.status}
                hasAlert={hasAlert}
                onTogglePause={togglePause}
                canPause={state.status === 'playing'}
              />

              {/* LCD Pet Display Area */}
              <PetDisplay
                pet={state.pet}
                feeding={state.feeding}
                randomEvent={state.randomEvent}
                currentMessage={state.currentMessage}
                isGameOverCompleted={state.status === 'game_over_completed'}
                actionReaction={actionReaction}
              />

              {/* 10-Block Segmented LCD Stats Panel */}
              <StatsPanel pet={state.pet} feeding={state.feeding} />
            </div>

            {/* Bottom speaker grill dots */}
            <div className="chassis-speaker-grill" aria-hidden="true">
              <span className="grill-dot" />
              <span className="grill-dot" />
              <span className="grill-dot" />
              <span className="grill-dot" />
              <span className="grill-dot" />
            </div>

            {/* Tactile Physical Hardware Controls (Alimentar, Jugar, Baño) */}
            <div className="chassis-controls-area">
              <ActionControls
                pet={state.pet}
                feeding={state.feeding}
                randomEvent={state.randomEvent}
                isPaused={!state.clock.isRunning && state.status === 'playing'}
                onFeed={handleFeed}
                onPlay={handlePlay}
                onClean={handleClean}
              />
            </div>

            {/* Bottom chassis screws */}
            <div className="chassis-hardware-bottom">
              <span className="chassis-screw screw-bottom-left" />
              <span className="chassis-model-label">MODEL T-96 LCD</span>
              <span className="chassis-screw screw-bottom-right" />
            </div>
          </div>
        </section>

        {/* Right Side: Live Chronological Activity Log */}
        <aside className="layout-sidebar sidebar-right">
          <ActivityLog logs={state.logs} />
        </aside>
      </main>

      {/* Initial Pet Name Setup Modal (RF-01, Section 5.1) */}
      {isSetup && <SetupModal onStart={startGame} />}

      {/* End of Game / 24 Hours / Ghost Death Summary Modal (RF-10, Section 5.6) */}
      {isGameOver && <SummaryModal state={state} onRestart={resetGame} />}
    </div>
  );
};
