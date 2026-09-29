'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Track, PlaybackState, RepeatMode } from '../types/audio';
import { useAudioPlayer } from '../hooks/useAudioPlayer';
import { dbAdapter } from '../lib/db/mock-adapter';
import { INITIAL_TRACKS } from '../lib/audio-constants';

interface AudioContextType {
  state: PlaybackState;
  favorites: string[];
  playTrack: (track: Track, newQueue?: Track[]) => void;
  togglePlay: () => void;
  nextTrack: () => void;
  prevTrack: () => void;
  seek: (seconds: number) => void;
  startSeeking: () => void;
  endSeeking: (finalTime?: number) => void;
  setVolume: (volume: number) => void;
  toggleMute: () => void;
  toggleShuffle: () => void;
  toggleRepeat: () => void;
  toggleFavorite: (trackId: string) => Promise<void>;
  addTrackToCatalog: (trackData: Omit<Track, 'id' | 'createdAt'>) => Promise<Track>;
  catalog: Track[];
}

const AudioContext = createContext<AudioContextType | null>(null);

export function AudioProvider({ children }: { children: ReactNode }) {
  const [catalog, setCatalog] = useState<Track[]>(INITIAL_TRACKS);
  const [favorites, setFavorites] = useState<string[]>([]);
  const player = useAudioPlayer(catalog);

  // Cargar catálogo y preferencias iniciales desde el adaptador de datos
  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      const tracks = await dbAdapter.getAllTracks();
      const prefs = await dbAdapter.getUserPreferences('default-user');
      if (isMounted) {
        setCatalog(tracks);
        setFavorites(prefs.favoriteTrackIds);
        if (prefs.volume !== undefined) {
          player.setVolume(prefs.volume);
        }
      }
    }
    loadData();
    return () => {
      isMounted = false;
    };
  }, []);

  // Alternar favorito y persistir
  const toggleFavorite = async (trackId: string) => {
    const isFav = await dbAdapter.toggleFavorite('default-user', trackId);
    setFavorites((prev: string[]) =>
      isFav ? [...prev, trackId] : prev.filter((id: string) => id !== trackId)
    );
  };

  // Añadir pista y actualizar catálogo y cola en memoria
  const addTrackToCatalog = async (trackData: Omit<Track, 'id' | 'createdAt'>) => {
    const newTrack = await dbAdapter.createTrack(trackData);
    const updated = [...catalog, newTrack];
    setCatalog(updated);
    player.setQueue(updated);
    return newTrack;
  };

  const value: AudioContextType = {
    state: player.state,
    favorites,
    playTrack: player.playTrack,
    togglePlay: player.togglePlay,
    nextTrack: player.nextTrack,
    prevTrack: player.prevTrack,
    seek: player.seek,
    startSeeking: player.startSeeking,
    endSeeking: player.endSeeking,
    setVolume: player.setVolume,
    toggleMute: player.toggleMute,
    toggleShuffle: player.toggleShuffle,
    toggleRepeat: player.toggleRepeat,
    toggleFavorite,
    addTrackToCatalog,
    catalog
  };

  return <AudioContext.Provider value={value}>{children}</AudioContext.Provider>;
}

export function useAudio() {
  const context = useContext(AudioContext);
  if (!context) {
    throw new Error('useAudio debe ser utilizado dentro de un AudioProvider');
  }
  return context;
}
