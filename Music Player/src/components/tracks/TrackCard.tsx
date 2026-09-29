'use client';

import React from 'react';
import { Track } from '../../types/audio';
import { useAudio } from '../../context/AudioContext';

interface TrackCardProps {
  track: Track;
  queue?: Track[];
}

export function TrackCard({ track, queue }: TrackCardProps) {
  const { state, playTrack, togglePlay } = useAudio();
  const isCurrent = state.currentTrack?.id === track.id;
  const isPlayingCurrent = isCurrent && state.isPlaying;

  const handleClick = () => {
    if (isCurrent) {
      togglePlay();
    } else {
      playTrack(track, queue);
    }
  };

  return (
    <div
      onClick={handleClick}
      style={{
        position: 'relative',
        backgroundColor: 'var(--bg-card)',
        borderRadius: '12px',
        padding: '14px',
        cursor: 'pointer',
        transition: 'background-color 0.2s ease, transform 0.2s ease',
        border: '1px solid var(--border-subtle)'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = 'var(--bg-card-hover)';
        e.currentTarget.style.transform = 'translateY(-2px)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = 'var(--bg-card)';
        e.currentTarget.style.transform = 'translateY(0)';
      }}
    >
      <div
        style={{
          position: 'relative',
          width: '100%',
          aspectRatio: '1/1',
          borderRadius: '8px',
          overflow: 'hidden',
          marginBottom: '12px',
          backgroundColor: '#1a1a1f'
        }}
      >
        <img
          src={track.coverUrl}
          alt={track.title}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />

        {/* Botón flotante Play */}
        <div
          style={{
            position: 'absolute',
            bottom: '8px',
            right: '8px',
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            backgroundColor: 'var(--accent-apple-red)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#FFFFFF',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.4)',
            opacity: isCurrent ? 1 : 0.9
          }}
        >
          {isPlayingCurrent ? (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <rect x="6" y="4" width="4" height="16" rx="1" />
              <rect x="14" y="4" width="4" height="16" rx="1" />
            </svg>
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" style={{ transform: 'translateX(1px)' }}>
              <polygon points="5 3 19 12 5 21 5 3" />
            </svg>
          )}
        </div>
      </div>

      <h3
        style={{
          fontSize: '15px',
          fontWeight: 600,
          color: isCurrent ? 'var(--accent-apple-red)' : 'var(--text-primary)',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          marginBottom: '4px'
        }}
      >
        {track.title}
      </h3>
      <p
        style={{
          fontSize: '13px',
          color: 'var(--text-secondary)',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis'
        }}
      >
        {track.artist}
      </p>
    </div>
  );
}
