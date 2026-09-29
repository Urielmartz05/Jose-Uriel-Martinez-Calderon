'use client';

import React, { useEffect, useState } from 'react';
import { ClockState, GameStatus } from '@/types/tamagotchi';
import { SIMULATION_CONFIG } from '@/constants/simulation';

interface DigitalClockProps {
  clock: ClockState;
  gameStatus: GameStatus;
  hasAlert?: boolean;
  onTogglePause?: () => void;
  canPause?: boolean;
}

export const DigitalClock: React.FC<DigitalClockProps> = ({
  clock,
  gameStatus,
  hasAlert = false,
  onTogglePause,
  canPause = true,
}) => {
  const { simulatedHour, realSecondsElapsed, isRunning } = clock;
  const [isTickPulse, setIsTickPulse] = useState(false);

  // Trigger subtle tick pulsing animation on each real second or hour tick
  useEffect(() => {
    setIsTickPulse(true);
    const timer = setTimeout(() => setIsTickPulse(false), 300);
    return () => clearTimeout(timer);
  }, [realSecondsElapsed]);

  const formattedHour = String(simulatedHour).padStart(2, '0');
  const timeDisplay = `[${formattedHour}:00]`;

  const secondsInCurrentHour =
    realSecondsElapsed % SIMULATION_CONFIG.REAL_SECONDS_PER_SIMULATED_HOUR;
  const hourProgressPct =
    (secondsInCurrentHour / SIMULATION_CONFIG.REAL_SECONDS_PER_SIMULATED_HOUR) * 100;
  const totalProgressPct = Math.min(
    100,
    (realSecondsElapsed / SIMULATION_CONFIG.TOTAL_REAL_SECONDS) * 100
  );

  let statusBadgeText = 'VIVO';
  let statusBadgeClass = 'status-alive';
  if (gameStatus === 'game_over_ghost') {
    statusBadgeText = 'FANTASMA';
    statusBadgeClass = 'status-ghost';
  } else if (gameStatus === 'game_over_completed') {
    statusBadgeText = 'VICTORIA';
    statusBadgeClass = 'status-completed';
  } else if (hasAlert) {
    statusBadgeText = '¡ALERTA!';
    statusBadgeClass = 'status-alert';
  }

  return (
    <div className={`digital-clock-lcd ${isTickPulse ? 'tick-pulse' : ''}`}>
      {/* Top row with Digital time and LED alert */}
      <div className="clock-lcd-top">
        <div className="clock-time-group">
          <span className="lcd-time-label" aria-label={`Hora simulada ${formattedHour}:00`}>
            {timeDisplay}
          </span>
          <span className="lcd-time-sub">Reloj Simulado</span>
        </div>

        {/* LED Alert indicator and status badge */}
        <div className="clock-status-group">
          <div
            className={`hardware-led-indicator ${hasAlert ? 'led-alert-blinking' : isRunning ? 'led-online' : 'led-standby'}`}
            title={hasAlert ? '¡Alerta de cuidado activa!' : isRunning ? 'Simulador en línea' : 'Pausado'}
          />
          <span className={`lcd-status-badge ${statusBadgeClass}`}>
            [Estado: {statusBadgeText}]
          </span>
        </div>
      </div>

      {/* Progress & Control Bar */}
      <div className="clock-lcd-bottom">
        <div className="clock-progress-info">
          <span className="lcd-progress-text">
            {secondsInCurrentHour}s / 6s ({realSecondsElapsed}s / 144s reales)
          </span>
          <div className="lcd-tiny-track">
            <div
              className="lcd-tiny-fill"
              style={{ width: `${hourProgressPct}%` }}
            />
          </div>
        </div>

        {canPause && (
          <button
            type="button"
            className={`lcd-pause-control ${isRunning ? 'btn-active-run' : 'btn-active-pause'}`}
            onClick={onTogglePause}
            aria-label={isRunning ? 'Pausar simulación' : 'Reanudar simulación'}
            title={isRunning ? 'Pausar simulación' : 'Reanudar simulación'}
          >
            {isRunning ? '⏸ PAUSA' : '▶ REANUDAR'}
          </button>
        )}
      </div>
    </div>
  );
};
