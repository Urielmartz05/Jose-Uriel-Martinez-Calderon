'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useAudio } from '../context/AudioContext';
import { Sidebar } from '../components/layout/Sidebar';
import { Header } from '../components/layout/Header';
import { BottomNav } from '../components/layout/BottomNav';
import { TrackList } from '../components/tracks/TrackList';
import { AudioPlayer } from '../components/audio/AudioPlayer';
import { AddTrackModal } from '../components/tracks/AddTrackModal';
import { AuthModal } from '../components/auth/AuthModal';
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts';

export default function HomePage() {
  const { catalog, favorites, playTrack, togglePlay, state, toggleFavorite } = useAudio();
  useKeyboardShortcuts();

  const [currentTab, setCurrentTab] = useState<string>('songs');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [isDesktop, setIsDesktop] = useState<boolean>(true);

  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 1024);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Pista destacada (Hero Banner)
  const featuredTrack = catalog[0] || null;
  const isFeaturedPlaying = state.currentTrack?.id === featuredTrack?.id && state.isPlaying;
  const isFeaturedFavorite = featuredTrack ? favorites.includes(featuredTrack.id) : false;

  // Filtrado reactivo por pestaña y por término de búsqueda
  const filteredTracks = useMemo(() => {
    let list = catalog;
    if (currentTab === 'favorites') {
      list = list.filter((t) => favorites.includes(t.id));
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          t.artist.toLowerCase().includes(q) ||
          t.album.toLowerCase().includes(q)
      );
    }
    return list;
  }, [catalog, favorites, currentTab, searchQuery]);

  const handlePlayFeatured = () => {
    if (!featuredTrack) return;
    if (state.currentTrack?.id === featuredTrack.id) {
      togglePlay();
    } else {
      playTrack(featuredTrack, catalog);
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--bg-primary)' }}>
      {/* Barra lateral solo en Desktop */}
      {isDesktop && (
        <Sidebar
          currentTab={currentTab}
          onSelectTab={setCurrentTab}
          onOpenAddModal={() => setIsAddModalOpen(true)}
        />
      )}

      {/* Contenedor Principal */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, paddingBottom: isDesktop ? '94px' : '140px' }}>
        {/* Header */}
        <Header
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onOpenAddModal={() => setIsAddModalOpen(true)}
          onOpenAuthModal={() => setIsAuthModalOpen(true)}
        />

        {/* Área de Contenido Principal */}
        <main style={{ flex: 1, padding: isDesktop ? '32px 40px' : '20px 16px', maxWidth: '1280px', margin: '0 auto', width: '100%' }}>
          {/* Banner de Pista Destacada (Hero) - Solo visible en vista general sin búsqueda */}
          {featuredTrack && currentTab === 'songs' && !searchQuery && (
            <section
              aria-label="Pista destacada"
              style={{
                position: 'relative',
                display: 'flex',
                flexDirection: isDesktop ? 'row' : 'column',
                alignItems: isDesktop ? 'center' : 'flex-start',
                gap: '28px',
                padding: isDesktop ? '32px' : '20px',
                borderRadius: '20px',
                backgroundColor: 'var(--bg-secondary)',
                border: '1px solid var(--border-subtle)',
                marginBottom: '36px',
                overflow: 'hidden'
              }}
            >
              {/* Carátula Destacada */}
              <div
                style={{
                  width: isDesktop ? '220px' : '160px',
                  height: isDesktop ? '220px' : '160px',
                  minWidth: isDesktop ? '220px' : '160px',
                  borderRadius: '14px',
                  overflow: 'hidden',
                  boxShadow: '0 16px 36px rgba(0, 0, 0, 0.6)'
                }}
              >
                <img
                  src={featuredTrack.coverUrl}
                  alt={featuredTrack.title}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>

              {/* Información y Acciones del Banner */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                    color: 'var(--accent-apple-red)'
                  }}
                >
                  Pista Destacada
                </span>
                <h1 style={{ fontSize: isDesktop ? '32px' : '24px', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                  {featuredTrack.title}
                </h1>
                <p style={{ fontSize: '15px', color: 'var(--text-secondary)', margin: 0 }}>
                  {featuredTrack.artist} • {featuredTrack.album} ({featuredTrack.releaseYear || 2026})
                </p>

                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginTop: '14px' }}>
                  <button
                    type="button"
                    onClick={handlePlayFeatured}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      backgroundColor: 'var(--accent-apple-red)',
                      color: '#FFFFFF',
                      border: 'none',
                      padding: '10px 22px',
                      borderRadius: '9999px',
                      fontSize: '14px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      boxShadow: '0 4px 16px var(--accent-glow)',
                      transition: 'transform 0.15s ease'
                    }}
                  >
                    {isFeaturedPlaying ? (
                      <>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                          <rect x="6" y="4" width="4" height="16" rx="1" />
                          <rect x="14" y="4" width="4" height="16" rx="1" />
                        </svg>
                        <span>Pausar</span>
                      </>
                    ) : (
                      <>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                          <polygon points="5 3 19 12 5 21 5 3" />
                        </svg>
                        <span>Reproducir</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => toggleFavorite(featuredTrack.id)}
                    aria-label={isFeaturedFavorite ? 'Quitar de favoritos' : 'Añadir a favoritos'}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      backgroundColor: 'var(--bg-card)',
                      color: isFeaturedFavorite ? 'var(--accent-apple-red)' : 'var(--text-primary)',
                      border: '1px solid var(--border-subtle)',
                      padding: '10px 18px',
                      borderRadius: '9999px',
                      fontSize: '14px',
                      fontWeight: 500,
                      cursor: 'pointer'
                    }}
                  >
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill={isFeaturedFavorite ? 'currentColor' : 'none'}
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                    </svg>
                    <span>{isFeaturedFavorite ? 'Favorito' : 'Me gusta'}</span>
                  </button>
                </div>
              </div>
            </section>
          )}

          {/* Listado de canciones */}
          <TrackList
            tracks={filteredTracks}
            title={
              currentTab === 'favorites'
                ? 'Canciones Favoritas'
                : searchQuery
                ? `Resultados de "${searchQuery}" (${filteredTracks.length})`
                : 'Catálogo de Canciones'
            }
          />
        </main>
      </div>

      {/* Navegación móvil inferior solo en Mobile */}
      {!isDesktop && (
        <BottomNav
          currentTab={currentTab}
          onSelectTab={setCurrentTab}
          onOpenAddModal={() => setIsAddModalOpen(true)}
        />
      )}

      {/* Reproductor Persistente Global (Desktop & Mobile) */}
      <AudioPlayer />

      {/* Modal para añadir canción */}
      <AddTrackModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />

      {/* Modal de autenticación y preferencias */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </div>
  );
}
