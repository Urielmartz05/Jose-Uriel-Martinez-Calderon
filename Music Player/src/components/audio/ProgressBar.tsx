'use client';

import React, { useState } from 'react';
import { useAudio } from '../../context/AudioContext';

interface ProgressBarProps {
  showTimestamps?: boolean;
  className?: string;
  slim?: boolean;
}

export function formatTime(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

export function ProgressBar({ showTimestamps = true, className = '', slim = false }: ProgressBarProps) {
  const { state, seek, startSeeking, endSeeking } = useAudio();
  const [isHovered, setIsHovered] = useState(false);
  const [draggingValue, setDraggingValue] = useState<number | null>(null);

  const duration = state.duration || 1;
  const displayTime = draggingValue !== null ? draggingValue : state.currentTime;
  const progressPercent = Math.min(100, Math.max(0, (displayTime / duration) * 100));

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setDraggingValue(val);
  };

  const handleMouseDown = () => {
    startSeeking();
    setDraggingValue(state.currentTime);
  };

  const handleMouseUp = () => {
    if (draggingValue !== null) {
      seek(draggingValue);
      endSeeking(draggingValue);
      setDraggingValue(null);
    } else {
      endSeeking();
    }
  };

  return (
    <div
      className={`flex items-center gap-3 w-full ${className}`}
      style={{ display: 'flex', alignItems: 'center', width: '100%', gap: '10px' }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {showTimestamps && (
        <span
          className="tabular-nums"
          style={{
            fontSize: '11px',
            color: 'var(--text-secondary)',
            minWidth: '34px',
            textAlign: 'right',
            userSelect: 'none'
          }}
        >
          {formatTime(displayTime)}
        </span>
      )}

      <div
        style={{
          position: 'relative',
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          height: slim ? '2px' : isHovered ? '6px' : '4px',
          backgroundColor: 'var(--slider-track)',
          borderRadius: '9999px',
          cursor: 'pointer',
          transition: 'height 0.15s ease'
        }}
      >
        {/* Barra de progreso rellena */}
        <div
          style={{
            width: `${progressPercent}%`,
            height: '100%',
            backgroundColor: isHovered ? 'var(--accent-apple-red)' : 'var(--slider-fill)',
            borderRadius: '9999px',
            transition: draggingValue !== null ? 'none' : 'background-color 0.2s ease'
          }}
        />

        {/* Input invisible para interacción precisa */}
        <input
          type="range"
          min="0"
          max={duration}
          step="0.1"
          value={displayTime}
          onChange={handleChange}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onTouchStart={handleMouseDown}
          onTouchEnd={handleMouseUp}
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
          aria-label="Posición de reproducción"
        />

        {/* Thumb visible en hover o arrastre */}
        {!slim && (isHovered || draggingValue !== null) && (
          <div
            style={{
              position: 'absolute',
              left: `calc(${progressPercent}% - 6px)`,
              width: '12px',
              height: '12px',
              borderRadius: '50%',
              backgroundColor: '#FFFFFF',
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.4)',
              pointerEvents: 'none',
              transform: 'scale(1)',
              transition: 'transform 0.1s ease'
            }}
          />
        )}
      </div>

      {showTimestamps && (
        <span
          className="tabular-nums"
          style={{
            fontSize: '11px',
            color: 'var(--text-secondary)',
            minWidth: '34px',
            textAlign: 'left',
            userSelect: 'none'
          }}
        >
          {formatTime(duration)}
        </span>
      )}
    </div>
  );
}
