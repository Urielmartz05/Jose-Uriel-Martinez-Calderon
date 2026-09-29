export const SIMULATION_CONFIG = {
  REAL_SECONDS_PER_SIMULATED_HOUR: 6,
  TOTAL_SIMULATED_HOURS: 24,
  TOTAL_REAL_SECONDS: 24 * 6, // 144 seconds
  INTERVAL_MS: 6000,
  TICK_SECOND_MS: 1000,
  
  // Metric changes per simulated hour
  HUNGER_PER_HOUR: 10,
  FUN_PER_HOUR: -8,
  HYGIENE_PER_HOUR: -5,
  
  // Action benefits
  FEED_HUNGER_REDUCTION: 30,
  PLAY_FUN_BOOST: 25,
  CLEAN_HYGIENE_BOOST: 35,
  
  // Feeding demand checkpoints (hours 6, 12, 18, 24)
  FOOD_DEMAND_INTERVAL: 6,
  
  // Ghost death triggers
  MAX_MISSED_FOOD_REQUESTS: 2,
  MAX_CONSECUTIVE_FEEDINGS: 3,
  
  // Random events
  RANDOM_EVENT_CHANCE: 0.35, // 35% chance per simulated hour
  RANDOM_EVENT_TIMEOUT_TICKS: 2, // 2 simulated hours to resolve before penalty
} as const;

export const INITIAL_PET_STATE = {
  hunger: 10,
  fun: 90,
  hygiene: 95,
  happiness: 90,
  isAlive: true,
  isGhost: false,
  ghostReason: null,
};
