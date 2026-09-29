'use client';

import React from 'react';
import { GameState } from '@/types/tamagotchi';

interface SummaryModalProps {
  state: GameState;
  onRestart: () => void;
}

export const SummaryModal: React.FC<SummaryModalProps> = ({ state, onRestart }) => {
  const { status, pet, clock, summary } = state;
  const isVictory = status === 'game_over_completed';
  const isGhost = status === 'game_over_ghost';

  if (!isVictory && !isGhost) return null;

  // Compute final grade as per design.md (S, A, B, C, F)
  let finalGrade: 'S' | 'A' | 'B' | 'C' | 'F' = 'C';
  let gradeText = '';

  if (isGhost) {
    finalGrade = 'F';
    gradeText = pet.ghostReason === 'starvation'
      ? 'FALLECIMIENTO POR INANICIÓN'
      : 'FALLECIMIENTO POR SOBREALIMENTACIÓN';
  } else if (isVictory) {
    if (pet.happiness >= 85 && summary.penaltiesIncurred === 0) {
      finalGrade = 'S';
      gradeText = '¡CUIDADOR LEGENDARIO! Puntuación Impecable';
    } else if (pet.happiness >= 75 && summary.penaltiesIncurred <= 1) {
      finalGrade = 'A';
      gradeText = '¡EXCELENTE CUIDADOR! Mascota Sana y Feliz';
    } else if (pet.happiness >= 60 && summary.penaltiesIncurred <= 3) {
      finalGrade = 'B';
      gradeText = 'BUEN CUIDADOR. Cumplió con el ciclo de vida';
    } else {
      finalGrade = 'C';
      gradeText = 'APROBADO CON DIFICULTAD. Requiere más atención';
    }
  }

  return (
    <div className="summary-modal-overlay">
      <div
        className={`summary-modal-card diploma-card ${isVictory ? 'card-victory' : 'card-defeat'}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="summary-title"
      >
        <div className="diploma-border-corner top-left" />
        <div className="diploma-border-corner top-right" />
        <div className="diploma-border-corner bottom-left" />
        <div className="diploma-border-corner bottom-right" />

        <div className="summary-badge">
          {isVictory ? '★ DIPLOMA DE SUPERVIVENCIA 24H ★' : '☠ INFORME POST-MORTEM ☠'}
        </div>

        <h2 id="summary-title" className="summary-title">
          {isVictory ? `¡${pet.name} ha sobrevivido 24h!` : `${pet.name} no logró resistir`}
        </h2>

        {/* Grade Badge */}
        <div className="summary-grade-container">
          <div className="grade-circle" data-grade={finalGrade}>
            <span className="grade-letter">{finalGrade}</span>
            <span className="grade-sub">CALIFICACIÓN</span>
          </div>
          <div className="grade-details">
            <span className="grade-title">{gradeText}</span>
            <span className="grade-time">
              Horas completadas: {clock.simulatedHour}:00 / 24:00 (144s reales)
            </span>
          </div>
        </div>

        <p className="summary-description">
          {isVictory
            ? `Has cuidado con éxito de ${pet.name} a lo largo de un ciclo completo de 24 horas simuladas. Este es tu registro oficial de atención:`
            : pet.ghostReason === 'starvation'
            ? `${pet.name} se convirtió en fantasma debido a inanición tras ignorar solicitudes críticas de alimentación.`
            : `${pet.name} se convirtió en fantasma por sobrealimentación compulsiva al recibir 3 comidas consecutivas sin pausa.`}
        </p>

        {/* Numerical breakdown as per design.md: Comidas servidas, juegos completados, baños realizados */}
        <div className="summary-stats-grid">
          <div className="summary-stat-box">
            <span className="summary-stat-icon">🍔</span>
            <span className="summary-stat-num">{summary.timesFed}</span>
            <span className="summary-stat-label">Comidas Servidas</span>
          </div>

          <div className="summary-stat-box">
            <span className="summary-stat-icon">⚽</span>
            <span className="summary-stat-num">{summary.timesPlayed}</span>
            <span className="summary-stat-label">Juegos Realizados</span>
          </div>

          <div className="summary-stat-box">
            <span className="summary-stat-icon">🛁</span>
            <span className="summary-stat-num">{summary.timesCleaned}</span>
            <span className="summary-stat-label">Baños Completados</span>
          </div>

          <div className="summary-stat-box">
            <span className="summary-stat-icon">⚠️</span>
            <span className="summary-stat-num">{summary.penaltiesIncurred}</span>
            <span className="summary-stat-label">Penalizaciones</span>
          </div>

          <div className="summary-stat-box">
            <span className="summary-stat-icon">⏱</span>
            <span className="summary-stat-num">{clock.simulatedHour}h</span>
            <span className="summary-stat-label">Tiempo de Vida</span>
          </div>

          <div className="summary-stat-box highlight-box">
            <span className="summary-stat-icon">💖</span>
            <span className="summary-stat-num">{pet.happiness}%</span>
            <span className="summary-stat-label">Felicidad Final</span>
          </div>
        </div>

        <button
          type="button"
          onClick={onRestart}
          className="summary-restart-btn"
          autoFocus
        >
          [ REINICIAR SIMULACIÓN ]
        </button>
      </div>
    </div>
  );
};
