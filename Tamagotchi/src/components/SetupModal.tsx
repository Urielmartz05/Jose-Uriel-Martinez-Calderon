'use client';

import React, { useState } from 'react';

interface SetupModalProps {
  onStart: (name: string) => void;
}

export const SetupModal: React.FC<SetupModalProps> = ({ onStart }) => {
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = name.trim();
    if (!cleanName) {
      setError('Por favor escribe un nombre para tu mascota.');
      return;
    }
    if (cleanName.length > 12) {
      setError('El nombre no debe superar los 12 caracteres.');
      return;
    }
    onStart(cleanName);
  };

  return (
    <div className="setup-modal-overlay">
      <div className="setup-modal-card" role="dialog" aria-modal="true" aria-labelledby="setup-title">
        <div className="setup-device-badge">TAMAGOTCHI 1996 • RETRO LCD</div>
        <h1 id="setup-title" className="setup-modal-title">
          Adopta tu Mascota
        </h1>
        <p className="setup-modal-subtitle">
          Cuida de tu mascota durante un ciclo completo de 24 horas simuladas (144 segundos en tiempo real).
        </p>

        <div className="setup-rules-preview">
          <div className="rule-item">
            <span className="rule-icon">⏱</span>
            <span>6 segundos reales equivalen a 1 hora simulada (144s total).</span>
          </div>
          <div className="rule-item">
            <span className="rule-icon">🍖</span>
            <span>Comida obligatoria cada 6h (06:00, 12:00, 18:00, 24:00).</span>
          </div>
          <div className="rule-item">
            <span className="rule-icon">👻</span>
            <span>2 alertas ignoradas = Inanición. 3 comidas seguidas = Sobrealimentación.</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="setup-form">
          <label htmlFor="pet-name-input" className="setup-label">
            Nombre de la mascota (máx. 12 car.):
          </label>
          <div className="setup-input-wrapper">
            <input
              id="pet-name-input"
              type="text"
              placeholder="Ej. Kiko, Mochi..."
              value={name}
              maxLength={12}
              autoFocus
              onChange={(e) => {
                setName(e.target.value);
                if (error) setError('');
              }}
              className="setup-input"
              aria-required="true"
            />
            <span className="setup-char-count">{name.length}/12</span>
          </div>

          {error && <p className="setup-error-msg">{error}</p>}

          <button type="submit" className="setup-start-button">
            [ INICIAR SIMULACIÓN ]
          </button>
        </form>
      </div>
    </div>
  );
};
