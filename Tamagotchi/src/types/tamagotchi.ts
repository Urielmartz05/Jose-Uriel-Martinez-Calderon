export interface PetState {
  name: string;
  isAlive: boolean;
  isGhost: boolean;
  ghostReason: 'starvation' | 'overfeeding' | null;
  hunger: number;     // 0 (sin hambre / lleno) a 100 (muerto de hambre)
  fun: number;        // 0 a 100
  hygiene: number;    // 0 a 100
  happiness: number;  // 0 a 100 (calculado a partir de diversión + higiene - hambre)
}

export interface ClockState {
  simulatedHour: number; // 0 a 24
  realSecondsElapsed: number;
  isRunning: boolean;
  intervalMs: number;    // 6000 ms por hora simulada
}

export interface FeedingTracker {
  isRequestingFood: boolean;
  missedFoodCount: number;
  consecutiveFeedings: number;
  lastFeedingHour: number | null;
}

export interface RandomEvent {
  type: 'potty' | 'play_request' | null;
  active: boolean;
  ticksLeftToResolve: number;
}

export interface CareSummary {
  timesFed: number;
  timesPlayed: number;
  timesCleaned: number;
  penaltiesIncurred: number;
}

export type GameStatus = 'setup' | 'playing' | 'game_over_ghost' | 'game_over_completed';

export interface GameLogEntry {
  id: string;
  simulatedHour: number;
  message: string;
  type: 'info' | 'alert' | 'warning' | 'death' | 'success';
  timestamp: number;
}

export interface GameState {
  status: GameStatus;
  pet: PetState;
  clock: ClockState;
  feeding: FeedingTracker;
  randomEvent: RandomEvent;
  summary: CareSummary;
  logs: GameLogEntry[];
  currentMessage: string;
}

export type GameAction =
  | { type: 'START_GAME'; payload: { name: string } }
  | { type: 'TICK_SECOND' }
  | { type: 'TICK_HOUR' }
  | { type: 'FEED' }
  | { type: 'PLAY' }
  | { type: 'CLEAN' }
  | { type: 'RESOLVE_RANDOM_EVENT' }
  | { type: 'RESET_GAME' }
  | { type: 'PAUSE_RESUME' };
