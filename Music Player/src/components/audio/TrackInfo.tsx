'use client';

import React from 'react';
import { useAudio } from '../../context/AudioContext';

interface TrackInfoProps {
  size?: 'small' | 'medium' | 'large';
  showLikeButton?: boolean;
  className?: string;
}

export function TrackInfo({ size = 'medium', showLikeButton = true, className = '' }: TrackInfoProps) {
  const { state, favorites, toggleFavorite } = useAudio();
  const track = state.currentTrack;

  if (!track) {
    return (
      <div className={className} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div
          style={{
            width: size === 'large' ? '280px' : size === 'small' ? '40px' : '48px',
            height: size === 'large' ? '280px' : size === 'small' ? '40px' : '48px',
            borderRadius: size === 'large' ? '16px' : '8px',
            backgroundColor: 'var(--bg-card)'
          }}
        />
        <div>
          <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Sin reproducción activa</p>
        </div>
      </div>
    );
  }

  const isFavorite = favorites.includes(track.id);
  const imageSize = size === 'large' ? '280px' : size === 'small' ? '42px' : '52px';
  const borderRadius = size === 'large' ? '16px' : '8px';

  return (
    <div
      className={className}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: size === 'large' ? '20px' : '12px',
        maxWidth: size === 'large' ? '100%' : '260px'
      }}
    >
      {/* Carátula */}
      <div
        style={{
          position: 'relative',
          width: imageSize,
          height: imageSize,
          minWidth: imageSize,
          borderRadius,
          overflow: 'hidden',
          boxShadow: size === 'large' ? '0 16px 40px rgba(0, 0, 0, 0.6)' : '0 4px 12px rgba(0, 0, 0, 0.4)',
          transform: size === 'large' ? (state.isPlaying ? 'scale(1)' : 'scale(0.92)') : 'none',
          transition: 'transform 0.4s cubic-bezier(0.2, 0.8, 0.2, 1), box-shadow 0.4s ease'
        }}
      >
        <img
          src={track.coverUrl}
          alt={track.title}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover'
          }}
        />
      </div>

      {/* Metadatos */}
      <div style={{ flex: 1, minWidth: 0, textAlign: size === 'large' ? 'center' : 'left' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: size === 'large' ? 'center' : 'flex-start' }}>
          <h4
            style={{
              fontSize: size === 'large' ? '24px' : '14px',
              fontWeight: 600,
              color: 'var(--text-primary)',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              lineHeight: 1.2
            }}
          >
            {track.title}
          </h4>

          {/* Ecualizador activo */}
          {state.isPlaying && size !== 'large' && (
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '2px', height: '14px' }}>
              <span className="equalizer-bar" />
              <span className="equalizer-bar" />
              <span className="equalizer-bar" />
            </div>
          )}
        </div>

        <p
          style={{
            fontSize: size === 'large' ? '16px' : '12px',
            color: 'var(--text-secondary)',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            marginTop: '3px'
          }}
        >
          {track.artist} {size === 'large' && track.album ? `• ${track.album}` : ''}
        </p>
      </div>

      {/* Botón Like interactivo */}
      {showLikeButton && size !== 'large' && (
        <button
          type="button"
          onClick={() => toggleFavorite(track.id)}
          title={isFavorite ? 'Quitar de favoritos' : 'Añadir a favoritos'}
          aria-label={isFavorite ? 'Quitar de favoritos' : 'Añadir a favoritos'}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '6px',
            color: isFavorite ? 'var(--accent-apple-red)' : 'var(--text-muted)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'color 0.2s ease, transform 0.15s ease'
          }}
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill={isFavorite ? 'currentColor' : 'none'}
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
        </button>
      )}
    </div>
  );
}
