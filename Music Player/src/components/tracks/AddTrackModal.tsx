'use client';

import React, { useState } from 'react';
import { useAudio } from '../../context/AudioContext';

interface AddTrackModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AddTrackModal({ isOpen, onClose }: AddTrackModalProps) {
  const { addTrackToCatalog } = useAudio();

  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [album, setAlbum] = useState('');
  const [audioUrl, setAudioUrl] = useState('');
  const [coverUrl, setCoverUrl] = useState('');
  const [duration, setDuration] = useState('240');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !artist || !audioUrl) return;

    setIsSubmitting(true);
    try {
      await addTrackToCatalog({
        title,
        artist,
        album: album || 'Single',
        audioUrl,
        coverUrl: coverUrl || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80',
        duration: parseInt(duration, 10) || 240
      });
      setTitle('');
      setArtist('');
      setAlbum('');
      setAudioUrl('');
      setCoverUrl('');
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        zIndex: 110,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: 'min(100%, 460px)',
          backgroundColor: '#16161a',
          border: '1px solid var(--border-glass)',
          borderRadius: '18px',
          padding: '28px',
          boxShadow: '0 24px 48px rgba(0, 0, 0, 0.6)'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
            Añadir Nueva Canción
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar modal"
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              padding: '4px'
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {/* Vista previa de carátula si existe */}
          {coverUrl && (
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '4px' }}>
              <img
                src={coverUrl}
                alt="Vista previa"
                onError={(e) => (e.currentTarget.style.display = 'none')}
                style={{
                  width: '90px',
                  height: '90px',
                  borderRadius: '10px',
                  objectFit: 'cover',
                  border: '1px solid var(--border-subtle)'
                }}
              />
            </div>
          )}

          <div>
            <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}>
              Título de la Canción *
            </label>
            <input
              type="text"
              required
              placeholder="Ej. Solar Echoes"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              style={inputStyle}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                Artista *
              </label>
              <input
                type="text"
                required
                placeholder="Ej. Nova"
                value={artist}
                onChange={(e) => setArtist(e.target.value)}
                style={inputStyle}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                Álbum
              </label>
              <input
                type="text"
                placeholder="Ej. Horizons"
                value={album}
                onChange={(e) => setAlbum(e.target.value)}
                style={inputStyle}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}>
              URL de Archivo de Audio (.mp3, .ogg) *
            </label>
            <input
              type="url"
              required
              placeholder="https://.../cancion.mp3"
              value={audioUrl}
              onChange={(e) => setAudioUrl(e.target.value)}
              style={inputStyle}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}>
              URL de Carátula (Imagen)
            </label>
            <input
              type="url"
              placeholder="https://images.unsplash.com/..."
              value={coverUrl}
              onChange={(e) => setCoverUrl(e.target.value)}
              style={inputStyle}
            />
          </div>

          <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                flex: 1,
                padding: '12px',
                borderRadius: '10px',
                backgroundColor: 'rgba(255, 255, 255, 0.08)',
                color: 'var(--text-primary)',
                border: 'none',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                flex: 1,
                padding: '12px',
                borderRadius: '10px',
                backgroundColor: 'var(--accent-apple-red)',
                color: '#FFFFFF',
                border: 'none',
                fontWeight: 600,
                cursor: 'pointer',
                opacity: isSubmitting ? 0.7 : 1
              }}
            >
              {isSubmitting ? 'Guardando...' : 'Añadir Pista'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  height: '38px',
  borderRadius: '8px',
  backgroundColor: 'rgba(255, 255, 255, 0.06)',
  border: '1px solid var(--border-subtle)',
  padding: '0 12px',
  color: 'var(--text-primary)',
  fontSize: '13px',
  outline: 'none'
};
