'use client';

import { useEffect } from 'react';
import { useAudio } from '../context/AudioContext';

export function useKeyboardShortcuts() {
  const { state, togglePlay, nextTrack, prevTrack, seek, setVolume, toggleMute, toggleShuffle, toggleRepeat } = useAudio();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignorar si el usuario está enfocado en un campo de texto
      const activeElement = document.activeElement;
      const isInput =
        activeElement instanceof HTMLInputElement ||
        activeElement instanceof HTMLTextAreaElement ||
        (activeElement as HTMLElement)?.isContentEditable;

      if (isInput) return;

      switch (e.code) {
        case 'Space':
          e.preventDefault();
          togglePlay();
          break;

        case 'ArrowRight':
          e.preventDefault();
          seek(state.currentTime + 5);
          break;

        case 'ArrowLeft':
          e.preventDefault();
          seek(state.currentTime - 5);
          break;

        case 'ArrowUp':
          e.preventDefault();
          setVolume(state.volume + 0.05);
          break;

        case 'ArrowDown':
          e.preventDefault();
          setVolume(state.volume - 0.05);
          break;

        case 'KeyM':
          e.preventDefault();
          toggleMute();
          break;

        case 'KeyS':
          e.preventDefault();
          toggleShuffle();
          break;

        case 'KeyR':
          e.preventDefault();
          toggleRepeat();
          break;

        case 'KeyN':
          e.preventDefault();
          nextTrack();
          break;

        case 'KeyP':
          e.preventDefault();
          prevTrack();
          break;

        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    state.currentTime,
    state.volume,
    togglePlay,
    seek,
    setVolume,
    toggleMute,
    toggleShuffle,
    toggleRepeat,
    nextTrack,
    prevTrack
  ]);
}
