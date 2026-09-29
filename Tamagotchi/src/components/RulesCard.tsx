'use client';

import React from 'react';

export const RulesCard: React.FC = () => {
  return (
    <div className="rules-card-container">
      <div className="rules-card-header">
        <span className="rules-header-title">Manual de Instrucciones</span>
        <span className="rules-header-badge">T-96</span>
      </div>

      <div className="rules-list">
        <div className="rule-box">
          <span className="rule-bullet">⏱</span>
          <div className="rule-content">
            <strong>Escala Temporal:</strong> 6s reales = 1h simulada. Ciclo total de 24 horas (144s en total).
          </div>
        </div>

        <div className="rule-box">
          <span className="rule-bullet">🍖</span>
          <div className="rule-content">
            <strong>Demanda de Comida:</strong> Cada 6h (06:00, 12:00, 18:00, 24:00) exige comida obligatoria.
          </div>
        </div>

        <div className="rule-box rule-danger">
          <span className="rule-bullet">👻</span>
          <div className="rule-content">
            <strong>Inanición:</strong> 2 solicitudes de comida desatendidas convierten a tu mascota en fantasma.
          </div>
        </div>

        <div className="rule-box rule-danger">
          <span className="rule-bullet">⚠️</span>
          <div className="rule-content">
            <strong>Sobrealimentación:</strong> Dar 3 comidas consecutivas seguidas causará muerte. ¡Juega o asea para romper la racha!
          </div>
        </div>

        <div className="rule-box">
          <span className="rule-bullet">🎲</span>
          <div className="rule-content">
            <strong>Eventos Aleatorios (35%):</strong> Puede pedir ir al baño o jugar. Resuélvelos a tiempo.
          </div>
        </div>

        <div className="rule-box rule-controls-hint">
          <span className="rule-bullet">⌨️</span>
          <div className="rule-content">
            <strong>Atajos de Teclado:</strong> [1] Alimentar • [2] Jugar • [3] Baño. También puedes usar la tecla Tab y Espacio.
          </div>
        </div>
      </div>
    </div>
  );
};
