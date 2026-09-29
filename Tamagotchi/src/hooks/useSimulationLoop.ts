'use client';

import { useReducer, useEffect, useRef, useCallback } from 'react';
import { tamagotchiReducer, createInitialState } from '@/state/tamagotchiReducer';
import { SIMULATION_CONFIG } from '@/constants/simulation';
import { GameState } from '@/types/tamagotchi';

export function useSimulationLoop() {
  const [state, dispatch] = useReducer(tamagotchiReducer, undefined, createInitialState);
  const stateRef = useRef<GameState>(state);
  stateRef.current = state;

  // Real-time tick timer: 1 tick = 1000 ms real time
  useEffect(() => {
    if (state.status !== 'playing' || !state.clock.isRunning) {
      return;
    }

    const timer = setInterval(() => {
      const currentState = stateRef.current;
      if (currentState.status !== 'playing' || !currentState.clock.isRunning) {
        return;
      }

      // 1 real second has elapsed
      dispatch({ type: 'TICK_SECOND' });

      // Check if a full simulated hour (6 real seconds) has completed
      const updatedSeconds = currentState.clock.realSecondsElapsed + 1;
      if (updatedSeconds % SIMULATION_CONFIG.REAL_SECONDS_PER_SIMULATED_HOUR === 0) {
        dispatch({ type: 'TICK_HOUR' });
      }
    }, SIMULATION_CONFIG.TICK_SECOND_MS);

    return () => clearInterval(timer);
  }, [state.status, state.clock.isRunning]);

  // Action dispatchers
  const startGame = useCallback((name: string) => {
    dispatch({ type: 'START_GAME', payload: { name } });
  }, []);

  const feedPet = useCallback(() => {
    dispatch({ type: 'FEED' });
  }, []);

  const playWithPet = useCallback(() => {
    dispatch({ type: 'PLAY' });
  }, []);

  const cleanPet = useCallback(() => {
    dispatch({ type: 'CLEAN' });
  }, []);

  const resolveRandomEvent = useCallback(() => {
    dispatch({ type: 'RESOLVE_RANDOM_EVENT' });
  }, []);

  const togglePause = useCallback(() => {
    dispatch({ type: 'PAUSE_RESUME' });
  }, []);

  const resetGame = useCallback(() => {
    dispatch({ type: 'RESET_GAME' });
  }, []);

  return {
    state,
    startGame,
    feedPet,
    playWithPet,
    cleanPet,
    resolveRandomEvent,
    togglePause,
    resetGame,
  };
}
