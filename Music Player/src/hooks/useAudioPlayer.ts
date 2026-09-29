'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Track, PlaybackState, RepeatMode } from '../types/audio';
import { INITIAL_TRACKS, DEFAULT_PLAYER_CONFIG } from '../lib/audio-constants';

export function shuffleTracks(tracks: Track[], currentTrack: Track | null): Track[] {
  if (!currentTrack) {
    const shuffled = [...tracks];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  const remainder = tracks.filter((t) => t.id !== currentTrack.id);
  for (let i = remainder.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [remainder[i], remainder[j]] = [remainder[j], remainder[i]];
  }
  return [currentTrack, ...remainder];
}

export function useAudioPlayer(initialTracks: Track[] = INITIAL_TRACKS) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const isSeekingRef = useRef<boolean>(false);

  const [state, setState] = useState<PlaybackState>({
    currentTrack: initialTracks[0] || null,
    isPlaying: false,
    currentTime: 0,
    duration: initialTracks[0]?.duration || 0,
    volume: DEFAULT_PLAYER_CONFIG.initialVolume,
    isMuted: false,
    isShuffle: DEFAULT_PLAYER_CONFIG.defaultShuffle,
    repeatMode: DEFAULT_PLAYER_CONFIG.defaultRepeatMode,
    queue: [...initialTracks],
    originalQueue: [...initialTracks],
    currentIndex: 0
  });

  // Inicializar elemento de audio HTML5
  useEffect(() => {
    const audio = new Audio();
    audio.preload = 'metadata';
    audio.volume = state.volume;
    audioRef.current = audio;

    const handleLoadedMetadata = () => {
      setState((prev: PlaybackState) => ({
        ...prev,
        duration: isFinite(audio.duration) && audio.duration > 0 ? audio.duration : prev.currentTrack?.duration || 0
      }));
    };

    const handleTimeUpdate = () => {
      if (!isSeekingRef.current) {
        setState((prev: PlaybackState) => ({
          ...prev,
          currentTime: audio.currentTime
        }));
      }
    };

    const handleEnded = () => {
      handleNextTrackAuto();
    };

    const handlePlay = () => {
      setState((prev: PlaybackState) => ({ ...prev, isPlaying: true }));
    };

    const handlePause = () => {
      setState((prev: PlaybackState) => ({ ...prev, isPlaying: false }));
    };

    const handleError = () => {
      setState((prev: PlaybackState) => ({ ...prev, isPlaying: false }));
    };

    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('error', handleError);

    if (state.currentTrack) {
      audio.src = state.currentTrack.audioUrl;
    }

    return () => {
      audio.pause();
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('error', handleError);
      audioRef.current = null;
    };
  }, []);

  // Transición automática de pista al finalizar
  const handleNextTrackAuto = useCallback(() => {
    setState((prev: PlaybackState) => {
      const audio = audioRef.current;
      if (!audio || prev.queue.length === 0) return prev;

      if (prev.repeatMode === 'one') {
        audio.currentTime = 0;
        audio.play().catch(() => {});
        return { ...prev, currentTime: 0, isPlaying: true };
      }

      const isLastTrack = prev.currentIndex >= prev.queue.length - 1;

      if (isLastTrack && prev.repeatMode === 'off') {
        audio.currentTime = 0;
        return { ...prev, currentTime: 0, isPlaying: false };
      }

      const nextIndex = (prev.currentIndex + 1) % prev.queue.length;
      const nextTrack = prev.queue[nextIndex];

      audio.src = nextTrack.audioUrl;
      audio.currentTime = 0;
      audio.play().catch(() => {});

      return {
        ...prev,
        currentIndex: nextIndex,
        currentTrack: nextTrack,
        currentTime: 0,
        duration: nextTrack.duration,
        isPlaying: true
      };
    });
  }, []);

  // Reproducir pista específica
  const playTrack = useCallback((track: Track, newQueue?: Track[]) => {
    const audio = audioRef.current;
    if (!audio) return;

    setState((prev: PlaybackState) => {
      const queueToUse = newQueue || prev.queue;
      const originalQueueToUse = newQueue || prev.originalQueue;
      let targetIndex = queueToUse.findIndex((t: Track) => t.id === track.id);

      let finalQueue = queueToUse;
      if (targetIndex === -1) {
        finalQueue = [track, ...queueToUse];
        targetIndex = 0;
      }

      if (audio.src !== track.audioUrl) {
        audio.src = track.audioUrl;
      }
      audio.currentTime = 0;
      audio.play().catch(() => {});

      return {
        ...prev,
        currentTrack: track,
        currentIndex: targetIndex,
        queue: finalQueue,
        originalQueue: originalQueueToUse,
        currentTime: 0,
        duration: track.duration,
        isPlaying: true
      };
    });
  }, []);

  // Alternar Play / Pause
  const togglePlay = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (state.isPlaying) {
      audio.pause();
    } else {
      if (!audio.src && state.currentTrack) {
        audio.src = state.currentTrack.audioUrl;
      }
      audio.play().catch(() => {});
    }
  }, [state.isPlaying, state.currentTrack]);

  // Siguiente pista manual
  const nextTrack = useCallback(() => {
    setState((prev: PlaybackState) => {
      const audio = audioRef.current;
      if (!audio || prev.queue.length === 0) return prev;

      const nextIndex = (prev.currentIndex + 1) % prev.queue.length;
      const nextTrack = prev.queue[nextIndex];

      audio.src = nextTrack.audioUrl;
      audio.currentTime = 0;
      if (prev.isPlaying) {
        audio.play().catch(() => {});
      }

      return {
        ...prev,
        currentIndex: nextIndex,
        currentTrack: nextTrack,
        currentTime: 0,
        duration: nextTrack.duration
      };
    });
  }, []);

  // Pista anterior
  const prevTrack = useCallback(() => {
    setState((prev: PlaybackState) => {
      const audio = audioRef.current;
      if (!audio || prev.queue.length === 0) return prev;

      // Si ha transcurrido más de 3 segundos, reiniciar la pista actual
      if (audio.currentTime > 3) {
        audio.currentTime = 0;
        return { ...prev, currentTime: 0 };
      }

      const prevIndex = (prev.currentIndex - 1 + prev.queue.length) % prev.queue.length;
      const prevTrack = prev.queue[prevIndex];

      audio.src = prevTrack.audioUrl;
      audio.currentTime = 0;
      if (prev.isPlaying) {
        audio.play().catch(() => {});
      }

      return {
        ...prev,
        currentIndex: prevIndex,
        currentTrack: prevTrack,
        currentTime: 0,
        duration: prevTrack.duration
      };
    });
  }, []);

  // Control de seek / scrubbing
  const startSeeking = useCallback(() => {
    isSeekingRef.current = true;
  }, []);

  const seek = useCallback((timeInSeconds: number) => {
    const audio = audioRef.current;
    const clampedTime = Math.max(0, Math.min(timeInSeconds, state.duration));

    setState((prev: PlaybackState) => ({ ...prev, currentTime: clampedTime }));

    if (audio) {
      audio.currentTime = clampedTime;
    }
  }, [state.duration]);

  const endSeeking = useCallback((finalTime?: number) => {
    isSeekingRef.current = false;
    if (typeof finalTime === 'number') {
      seek(finalTime);
    }
  }, [seek]);

  // Control de volumen
  const setVolume = useCallback((volume: number) => {
    const clamped = Math.max(0, Math.min(1, volume));
    const audio = audioRef.current;
    if (audio) {
      audio.volume = clamped;
      audio.muted = clamped === 0;
    }
    setState((prev: PlaybackState) => ({
      ...prev,
      volume: clamped,
      isMuted: clamped === 0
    }));
  }, []);

  // Alternar Mute
  const toggleMute = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;

    setState((prev: PlaybackState) => {
      const nextMuted = !prev.isMuted;
      audio.muted = nextMuted;
      return {
        ...prev,
        isMuted: nextMuted
      };
    });
  }, []);

  // Alternar Shuffle
  const toggleShuffle = useCallback(() => {
    setState((prev: PlaybackState) => {
      const nextShuffle = !prev.isShuffle;

      if (nextShuffle) {
        const shuffledQueue = shuffleTracks(prev.originalQueue, prev.currentTrack);
        return {
          ...prev,
          isShuffle: true,
          queue: shuffledQueue,
          currentIndex: 0
        };
      } else {
        const restoredIndex = prev.originalQueue.findIndex((t: Track) => t.id === prev.currentTrack?.id);
        return {
          ...prev,
          isShuffle: false,
          queue: [...prev.originalQueue],
          currentIndex: restoredIndex >= 0 ? restoredIndex : 0
        };
      }
    });
  }, []);

  // Alternar Repeat ('off' -> 'all' -> 'one' -> 'off')
  const toggleRepeat = useCallback(() => {
    setState((prev: PlaybackState) => {
      let nextMode: RepeatMode = 'off';
      if (prev.repeatMode === 'off') nextMode = 'all';
      else if (prev.repeatMode === 'all') nextMode = 'one';
      else nextMode = 'off';

      return {
        ...prev,
        repeatMode: nextMode
      };
    });
  }, []);

  // Actualizar cola dinámicamente (p.ej. al añadir pistas)
  const setQueue = useCallback((tracks: Track[]) => {
    setState((prev: PlaybackState) => {
      const currentId = prev.currentTrack?.id;
      const newIndex = tracks.findIndex((t: Track) => t.id === currentId);

      return {
        ...prev,
        queue: tracks,
        originalQueue: tracks,
        currentIndex: newIndex >= 0 ? newIndex : 0
      };
    });
  }, []);

  return {
    state,
    playTrack,
    togglePlay,
    nextTrack,
    prevTrack,
    seek,
    startSeeking,
    endSeeking,
    setVolume,
    toggleMute,
    toggleShuffle,
    toggleRepeat,
    setQueue
  };
}
