'use client';

import React, { useState, useEffect } from 'react';
import { useAudio } from '../../context/AudioContext';
import { TrackInfo } from './TrackInfo';
import { PlayerControls } from './PlayerControls';
import { ProgressBar } from './ProgressBar';
import { VolumeSlider } from './VolumeSlider';

export function AudioPlayer() {
  const { state, togglePlay, favorites, toggleFavorite } = useAudio();
  const [isMobileModalOpen, setIsMobileModalOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(true);

  // Detección de ancho de pantalla responsivo
  useEffect(() => {
    const checkWidth = () => {
      setIsDesktop(window.innerWidth >= 1024);
    };
    checkWidth();
    window.addEventListener('resize', checkWidth);
    return () => window.removeEventListener('resize', checkWidth);
  }, []);

  const track = state.currentTrack;
  if (!track) return null;

  const isFavorite = favorites.includes(track.id);

  return (
    <>
      {/* VISTA DESKTOP (>= 1024px) - Persistent Bottom Player */}
      {isDesktop ? (
        <aside
          aria-label="Reproductor de audio principal"
          className="glass-panel"
          style={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            height: '84px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 28px',
            zIndex: 50,
            borderTop: '1px solid var(--border-glass)'
          }}
        >
          {/* Lado Izquierdo: Info de pista */}
          <div style={{ flex: '1 1 260px', display: 'flex', alignItems: 'center' }}>
            <TrackInfo size="medium" />
          </div>

          {/* Centro: Controles + Seekbar */}
          <div
            style={{
              flex: '2 1 540px',
              maxWidth: '620px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <PlayerControls size="normal" />
            <ProgressBar showTimestamps={true} />
          </div>

          {/* Lado Derecho: Volumen y contador de cola */}
          <div
            style={{
              flex: '1 1 260px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              gap: '20px'
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '12px',
                color: 'var(--text-secondary)'
              }}
              title="Pistas en cola"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="8" y1="6" x2="21" y2="6" />
                <line x1="8" y1="12" x2="21" y2="12" />
                <line x1="8" y1="18" x2="21" y2="18" />
                <line x1="3" y1="6" x2="3.01" y2="6" />
                <line x1="3" y1="12" x2="3.01" y2="12" />
                <line x1="3" y1="18" x2="3.01" y2="18" />
              </svg>
              <span>{state.currentIndex + 1} / {state.queue.length}</span>
            </div>

            <VolumeSlider />
          </div>
        </aside>
      ) : (
        /* VISTA MÓVIL (< 1024px) - Mini Player Flotante */
        <aside
          aria-label="Reproductor móvil minimizado"
          className="glass-panel"
          onClick={() => setIsMobileModalOpen(true)}
          style={{
            position: 'fixed',
            bottom: '68px',
            left: '12px',
            right: '12px',
            height: '62px',
            borderRadius: '14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 12px',
            zIndex: 45,
            cursor: 'pointer',
            overflow: 'hidden',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.5)'
          }}
        >
          {/* Barra de progreso de 2px en el borde superior */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '2px',
              backgroundColor: 'var(--slider-track)'
            }}
          >
            <div
              style={{
                width: `${Math.min(100, Math.max(0, (state.currentTime / (state.duration || 1)) * 100))}%`,
                height: '100%',
                backgroundColor: 'var(--accent-apple-red)'
              }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: 0 }}>
            <img
              src={track.coverUrl}
              alt={track.title}
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '8px',
                objectFit: 'cover'
              }}
            />
            <div style={{ minWidth: 0, flex: 1 }}>
              <p
                style={{
                  fontSize: '14px',
                  fontWeight: 600,
                  color: 'var(--text-primary)',
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

          {/* Botones rápidos Play/Pause y Like */}
          <div
            style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => toggleFavorite(track.id)}
              aria-label={isFavorite ? 'Quitar de favoritos' : 'Añadir a favoritos'}
              style={{
                background: 'none',
                border: 'none',
                color: isFavorite ? 'var(--accent-apple-red)' : 'var(--text-muted)',
                padding: '8px',
                cursor: 'pointer'
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill={isFavorite ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
            </button>

            <button
              type="button"
              onClick={togglePlay}
              aria-label={state.isPlaying ? 'Pausar' : 'Reproducir'}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--text-primary)',
                padding: '8px',
                cursor: 'pointer'
              }}
            >
              {state.isPlaying ? (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <rect x="6" y="4" width="4" height="16" rx="1" />
                  <rect x="14" y="4" width="4" height="16" rx="1" />
                </svg>
              ) : (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <polygon points="5 3 19 12 5 21 5 3" />
                </svg>
              )}
            </button>
          </div>
        </aside>
      )}

      {/* MODAL FULLSCREEN MÓVIL (Now Playing Screen) */}
      {!isDesktop && isMobileModalOpen && (
        <section
          aria-label="Reproductor móvil en pantalla completa"
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 100,
            backgroundColor: 'rgba(10, 10, 12, 0.95)',
            backdropFilter: 'blur(35px)',
            WebkitBackdropFilter: 'blur(35px)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            padding: '24px 24px 40px 24px',
            animation: 'fadeIn 0.25s ease'
          }}
        >
          {/* Cabecera del Modal */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <button
              type="button"
              onClick={() => setIsMobileModalOpen(false)}
              aria-label="Minimizar reproductor"
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--text-secondary)',
                padding: '8px',
                cursor: 'pointer'
              }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>

            <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px' }}>
              Reproduciendo
            </span>

            <button
              type="button"
              onClick={() => toggleFavorite(track.id)}
              aria-label={isFavorite ? 'Quitar de favoritos' : 'Añadir a favoritos'}
              style={{
                background: 'none',
                border: 'none',
                color: isFavorite ? 'var(--accent-apple-red)' : 'var(--text-secondary)',
                padding: '8px',
                cursor: 'pointer'
              }}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill={isFavorite ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
            </button>
          </div>

          {/* Carátula Expandida Central */}
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', margin: '20px 0' }}>
            <div
              style={{
                width: 'min(75vw, 300px)',
                height: 'min(75vw, 300px)',
                borderRadius: '18px',
                overflow: 'hidden',
                boxShadow: '0 20px 48px -10px rgba(0, 0, 0, 0.7)',
                transform: state.isPlaying ? 'scale(1)' : 'scale(0.92)',
                transition: 'transform 0.4s cubic-bezier(0.2, 0.8, 0.2, 1)'
              }}
            >
              <img
                src={track.coverUrl}
                alt={track.title}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>
          </div>

          {/* Título y Artista */}
          <div style={{ textAlign: 'center', marginBottom: '16px' }}>
            <h2 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>
              {track.title}
            </h2>
            <p style={{ fontSize: '16px', color: 'var(--text-secondary)' }}>
              {track.artist} {track.album ? `— ${track.album}` : ''}
            </p>
          </div>

          {/* Barra Seek interactiva */}
          <div style={{ width: '100%', marginBottom: '16px' }}>
            <ProgressBar showTimestamps={true} />
          </div>

          {/* Controles Principales Táctiles Grandes */}
          <div style={{ marginBottom: '16px' }}>
            <PlayerControls size="large" />
          </div>

          {/* Control de Volumen Móvil */}
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <VolumeSlider />
          </div>
        </section>
      )}
    </>
  );
}
