'use client';

import React from 'react';
import { useAudio } from '../../context/AudioContext';

interface VolumeSliderProps {
  className?: string;
}

export function VolumeSlider({ className = '' }: VolumeSliderProps) {
  const { state, setVolume, toggleMute } = useAudio();

  const currentVolume = state.isMuted ? 0 : state.volume;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
  };

  return (
    <div
      className={className}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        minWidth: '130px'
      }}
    >
      <button
        type="button"
        onClick={toggleMute}
        title={state.isMuted ? 'Activar sonido' : 'Silenciar'}
        aria-label={state.isMuted ? 'Activar sonido' : 'Silenciar'}
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          color: 'var(--text-secondary)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '4px'
        }}
      >
        {state.isMuted || currentVolume === 0 ? (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="1" y1="1" x2="23" y2="23" />
            <path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6" />
            <path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0a7 7 0 0 1-.11 1.23" />
            <line x1="12" y1="19" x2="12" y2="23" />
            <line x1="8" y1="23" x2="16" y2="23" />
          </svg>
        ) : currentVolume < 0.5 ? (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
            <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
          </svg>
        ) : (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
            <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" />
          </svg>
        )}
      </button>

      <div
        style={{
          position: 'relative',
          width: '84px',
          height: '4px',
          backgroundColor: 'var(--slider-track)',
          borderRadius: '9999px',
          display: 'flex',
          alignItems: 'center'
        }}
      >
        <div
          style={{
            width: `${currentVolume * 100}%`,
            height: '100%',
            backgroundColor: 'var(--slider-fill)',
            borderRadius: '9999px'
          }}
        />
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={currentVolume}
          onChange={handleChange}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            opacity: 0,
            cursor: 'pointer',
            margin: 0
          }}
          aria-label="Control de volumen"
        />
      </div>
    </div>
  );
}
