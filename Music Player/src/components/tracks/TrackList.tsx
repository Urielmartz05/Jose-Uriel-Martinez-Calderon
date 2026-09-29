'use client';

import React, { useState } from 'react';
import { Track } from '../../types/audio';
import { useAudio } from '../../context/AudioContext';
import { formatTime } from '../audio/ProgressBar';

interface TrackListProps {
  tracks: Track[];
  title?: string;
}

export function TrackList({ tracks, title = 'Catálogo de Canciones' }: TrackListProps) {
  const { state, playTrack, togglePlay, favorites, toggleFavorite } = useAudio();
  const [hoveredTrackId, setHoveredTrackId] = useState<string | null>(null);

  const handleRowClick = (track: Track) => {
    if (state.currentTrack?.id === track.id) {
      togglePlay();
    } else {
      playTrack(track, tracks);
    }
  };

  return (
    <div style={{ width: '100%' }}>
      {title && (
        <h2 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '16px' }}>
          {title}
        </h2>
      )}

      {/* Encabezado de columnas */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '40px 3fr 2fr 80px 50px',
          alignItems: 'center',
          padding: '8px 16px',
          borderBottom: '1px solid var(--border-subtle)',
          fontSize: '12px',
          fontWeight: 600,
          color: 'var(--text-muted)',
          textTransform: 'uppercase',
          letterSpacing: '0.5px'
        }}
      >
        <span>#</span>
        <span>Título</span>
        <span className="hidden-mobile">Álbum</span>
        <span style={{ textAlign: 'right' }}>Duración</span>
        <span style={{ textAlign: 'center' }}>Like</span>
      </div>

      {/* Filas de canciones */}
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {tracks.map((track, index) => {
          const isCurrent = state.currentTrack?.id === track.id;
          const isPlaying = isCurrent && state.isPlaying;
          const isFav = favorites.includes(track.id);
          const isHovered = hoveredTrackId === track.id;

          return (
            <div
              key={track.id}
              onClick={() => handleRowClick(track)}
              onMouseEnter={() => setHoveredTrackId(track.id)}
              onMouseLeave={() => setHoveredTrackId(null)}
              style={{
                display: 'grid',
                gridTemplateColumns: '40px 3fr 2fr 80px 50px',
                alignItems: 'center',
                padding: '10px 16px',
                borderRadius: '8px',
                backgroundColor: isHovered ? 'var(--bg-card-hover)' : isCurrent ? 'rgba(250, 45, 72, 0.08)' : 'transparent',
                cursor: 'pointer',
                transition: 'background-color 0.15s ease'
              }}
            >
              {/* Columna #: Número, Play en hover o ecualizador si está sonando */}
              <div style={{ display: 'flex', alignItems: 'center', width: '24px' }}>
                {isPlaying ? (
                  <div style={{ display: 'flex', alignItems: 'flex-end', gap: '2px', height: '14px' }}>
                    <span className="equalizer-bar" />
                    <span className="equalizer-bar" />
                    <span className="equalizer-bar" />
                  </div>
                ) : isHovered ? (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" color="var(--text-primary)">
                    <polygon points="5 3 19 12 5 21 5 3" />
                  </svg>
                ) : (
                  <span
                    className="tabular-nums"
                    style={{
                      fontSize: '13px',
                      color: isCurrent ? 'var(--accent-apple-red)' : 'var(--text-muted)',
                      fontWeight: isCurrent ? 700 : 500
                    }}
                  >
                    {index + 1}
                  </span>
                )}
              </div>

              {/* Columna Título + Portada miniatura */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0, paddingRight: '12px' }}>
                <img
                  src={track.coverUrl}
                  alt={track.title}
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '6px',
                    objectFit: 'cover'
                  }}
                />
                <div style={{ minWidth: 0 }}>
                  <p
                    style={{
                      fontSize: '14px',
                      fontWeight: 600,
                      color: isCurrent ? 'var(--accent-apple-red)' : 'var(--text-primary)',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}
                  >
                    {track.title}
                  </p>
                  <p
                    style={{
                      fontSize: '12px',
                      color: 'var(--text-secondary)',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}
                  >
                    {track.artist}
                  </p>
                </div>
              </div>

              {/* Columna Álbum */}
              <div
                style={{
                  fontSize: '13px',
                  color: 'var(--text-secondary)',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  paddingRight: '12px'
                }}
              >
                {track.album}
              </div>

              {/* Columna Duración */}
              <div
                className="tabular-nums"
                style={{
                  fontSize: '13px',
                  color: 'var(--text-secondary)',
                  textAlign: 'right',
                  paddingRight: '8px'
                }}
              >
                {formatTime(track.duration)}
              </div>

              {/* Columna Favorito / Like */}
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFavorite(track.id);
                  }}
                  title={isFav ? 'Quitar de favoritos' : 'Añadir a favoritos'}
                  aria-label={isFav ? 'Quitar de favoritos' : 'Añadir a favoritos'}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '4px',
                    color: isFav ? 'var(--accent-apple-red)' : 'var(--text-muted)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'transform 0.15s ease'
                  }}
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill={isFav ? 'currentColor' : 'none'}
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                  </svg>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
