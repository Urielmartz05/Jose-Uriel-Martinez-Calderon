'use client';

import React from 'react';
import { useAudio } from '../../context/AudioContext';

interface PlayerControlsProps {
  size?: 'normal' | 'large';
  className?: string;
}

export function PlayerControls({ size = 'normal', className = '' }: PlayerControlsProps) {
  const { state, togglePlay, nextTrack, prevTrack, toggleShuffle, toggleRepeat } = useAudio();

  const isLarge = size === 'large';
  const playButtonSize = isLarge ? '64px' : '44px';
  const iconSize = isLarge ? 26 : 18;

  return (
    <div
      className={className}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: isLarge ? '28px' : '16px'
      }}
    >
      {/* Botón Shuffle */}
      <button
        type="button"
        onClick={toggleShuffle}
        title="Modo aleatorio"
        aria-label="Modo aleatorio"
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          color: state.isShuffle ? 'var(--accent-apple-red)' : 'var(--text-muted)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '6px',
          borderRadius: '50%',
          transition: 'color 0.15s ease, transform 0.15s ease'
        }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="16 3 21 3 21 8" />
          <line x1="4" y1="20" x2="21" y2="3" />
          <polyline points="21 16 21 21 16 21" />
          <line x1="15" y1="15" x2="21" y2="21" />
          <line x1="4" y1="4" x2="9" y2="9" />
        </svg>
      </button>

      {/* Botón Previous */}
      <button
        type="button"
        onClick={prevTrack}
        title="Pista anterior"
        aria-label="Pista anterior"
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          color: 'var(--text-primary)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '8px',
          borderRadius: '50%',
          transition: 'transform 0.1s ease'
        }}
      >
        <svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="currentColor">
          <polygon points="19 20 9 12 19 4 19 20" />
          <line x1="5" y1="19" x2="5" y2="5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
      </button>

      {/* Botón Play / Pause Circular Destacado */}
      <button
        type="button"
        onClick={togglePlay}
        title={state.isPlaying ? 'Pausar' : 'Reproducir'}
        aria-label={state.isPlaying ? 'Pausar' : 'Reproducir'}
        style={{
          width: playButtonSize,
          height: playButtonSize,
          borderRadius: '50%',
          backgroundColor: '#FFFFFF',
          color: '#000000',
          border: 'none',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 14px rgba(255, 255, 255, 0.25)',
          transition: 'transform 0.15s ease, box-shadow 0.15s ease'
        }}
      >
        {state.isPlaying ? (
          <svg width={isLarge ? 28 : 20} height={isLarge ? 28 : 20} viewBox="0 0 24 24" fill="currentColor">
            <rect x="6" y="4" width="4" height="16" rx="1.5" />
            <rect x="14" y="4" width="4" height="16" rx="1.5" />
          </svg>
        ) : (
          <svg
            width={isLarge ? 28 : 20}
            height={isLarge ? 28 : 20}
            viewBox="0 0 24 24"
            fill="currentColor"
            style={{ transform: 'translateX(2px)' }}
          >
            <polygon points="5 3 19 12 5 21 5 3" />
          </svg>
        )}
      </button>

      {/* Botón Next */}
      <button
        type="button"
        onClick={nextTrack}
        title="Siguiente pista"
        aria-label="Siguiente pista"
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          color: 'var(--text-primary)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '8px',
          borderRadius: '50%',
          transition: 'transform 0.1s ease'
        }}
      >
        <svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="currentColor">
          <polygon points="5 4 15 12 5 20 5 4" />
          <line x1="19" y1="5" x2="19" y2="19" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
      </button>

      {/* Botón Repeat */}
      <button
        type="button"
        onClick={toggleRepeat}
        title={`Modo repetición: ${state.repeatMode}`}
        aria-label={`Modo repetición: ${state.repeatMode}`}
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          color: state.repeatMode !== 'off' ? 'var(--accent-apple-red)' : 'var(--text-muted)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          padding: '6px',
          borderRadius: '50%',
          transition: 'color 0.15s ease'
        }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="17 1 21 5 17 9" />
          <path d="M3 11V9a4 4 0 0 1 4-4h14" />
          <polyline points="7 23 3 19 7 15" />
          <path d="M21 13v2a4 4 0 0 1-4 4H3" />
        </svg>
        {state.repeatMode === 'one' && (
          <span
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              fontSize: '8px',
              fontWeight: 800,
              color: 'var(--accent-apple-red)'
            }}
          >
            1
          </span>
        )}
      </button>
    </div>
  );
}
