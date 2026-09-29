import { GameState, GameAction, GameLogEntry } from '@/types/tamagotchi';
import { SIMULATION_CONFIG, INITIAL_PET_STATE } from '@/constants/simulation';

function clamp(value: number, min = 0, max = 100): number {
  return Math.max(min, Math.min(max, Math.round(value)));
}

export function calculateHappiness(fun: number, hygiene: number, hunger: number): number {
  // (fun + hygiene + (100 - hunger)) / 3
  const raw = (fun + hygiene + (100 - hunger)) / 3;
  return clamp(raw);
}

export function createInitialState(): GameState {
  return {
    status: 'setup',
    pet: {
      name: '',
      ...INITIAL_PET_STATE,
    },
    clock: {
      simulatedHour: 0,
      realSecondsElapsed: 0,
      isRunning: false,
      intervalMs: SIMULATION_CONFIG.INTERVAL_MS,
    },
    feeding: {
      isRequestingFood: false,
      missedFoodCount: 0,
      consecutiveFeedings: 0,
      lastFeedingHour: null,
    },
    randomEvent: {
      type: null,
      active: false,
      ticksLeftToResolve: 0,
    },
    summary: {
      timesFed: 0,
      timesPlayed: 0,
      timesCleaned: 0,
      penaltiesIncurred: 0,
    },
    logs: [
      {
        id: 'init',
        simulatedHour: 0,
        message: 'Bienvenido. Asigna un nombre a tu mascota para comenzar la simulación.',
        type: 'info',
        timestamp: Date.now(),
      },
    ],
    currentMessage: '¡Hola! Por favor escribe mi nombre para comenzar.',
  };
}

function addLog(logs: GameLogEntry[], simulatedHour: number, message: string, type: GameLogEntry['type']): GameLogEntry[] {
  const newEntry: GameLogEntry = {
    id: `${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    simulatedHour,
    message,
    type,
    timestamp: Date.now(),
  };
  return [newEntry, ...logs.slice(0, 19)]; // Keep latest 20 logs
}

export function tamagotchiReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'START_GAME': {
      const petName = action.payload.name.trim() || 'Tama';
      return {
        ...state,
        status: 'playing',
        pet: {
          ...state.pet,
          name: petName,
          isAlive: true,
          isGhost: false,
          ghostReason: null,
          happiness: calculateHappiness(state.pet.fun, state.pet.hygiene, state.pet.hunger),
        },
        clock: {
          ...state.clock,
          simulatedHour: 0,
          realSecondsElapsed: 0,
          isRunning: true,
        },
        currentMessage: `¡Hola! Soy ${petName}. ¡Cuídame bien durante las próximas 24 horas!`,
        logs: addLog(state.logs, 0, `Nació ${petName}. ¡Comienza la simulación de 24 horas!`, 'success'),
      };
    }

    case 'PAUSE_RESUME': {
      if (state.status !== 'playing') return state;
      const willRun = !state.clock.isRunning;
      return {
        ...state,
        clock: {
          ...state.clock,
          isRunning: willRun,
        },
        currentMessage: willRun ? '¡Simulación reanudada!' : 'Simulación en pausa.',
      };
    }

    case 'TICK_SECOND': {
      if (state.status !== 'playing' || !state.clock.isRunning) return state;

      const nextRealSeconds = state.clock.realSecondsElapsed + 1;
      const shouldTickHour = nextRealSeconds % SIMULATION_CONFIG.REAL_SECONDS_PER_SIMULATED_HOUR === 0;

      // If tick hour will trigger, we can let TICK_HOUR handle hour transitions
      return {
        ...state,
        clock: {
          ...state.clock,
          realSecondsElapsed: nextRealSeconds,
        },
      };
    }

    case 'TICK_HOUR': {
      if (state.status !== 'playing' || !state.clock.isRunning) return state;

      const nextHour = state.clock.simulatedHour + 1;
      let logs = state.logs;
      let penalties = state.summary.penaltiesIncurred;

      // 1. Check food demand / missed food from previous alert
      let isRequestingFood = state.feeding.isRequestingFood;
      let missedFoodCount = state.feeding.missedFoodCount;

      // Check if food demand interval reached (every 6 hours: 6, 12, 18, 24)
      const isDemandHour = nextHour % SIMULATION_CONFIG.FOOD_DEMAND_INTERVAL === 0;

      if (isDemandHour) {
        if (isRequestingFood) {
          // The previous alert was not answered in time!
          missedFoodCount += 1;
          penalties += 1;
          logs = addLog(
            logs,
            nextHour,
            `¡Alerta de comida ignorada! Acumulas ${missedFoodCount} falta(s) de alimentación.`,
            'alert'
          );
        }
        // Activate new food demand
        isRequestingFood = true;
        logs = addLog(
          logs,
          nextHour,
          `¡Hora ${nextHour}:00! ${state.pet.name} tiene hambre obligatoria y exige comida.`,
          'warning'
        );
      }

      // Check starvation ghost condition (2 missed food requests)
      if (missedFoodCount >= SIMULATION_CONFIG.MAX_MISSED_FOOD_REQUESTS) {
        return {
          ...state,
          status: 'game_over_ghost',
          pet: {
            ...state.pet,
            isAlive: false,
            isGhost: true,
            ghostReason: 'starvation',
            happiness: 0,
          },
          clock: {
            ...state.clock,
            simulatedHour: nextHour,
            isRunning: false,
          },
          feeding: {
            ...state.feeding,
            missedFoodCount,
            isRequestingFood: false,
          },
          summary: {
            ...state.summary,
            penaltiesIncurred: penalties,
          },
          currentMessage: `💀 ${state.pet.name} se ha convertido en un fantasma por inanición tras ignorar sus pedidos de comida.`,
          logs: addLog(
            logs,
            nextHour,
            `FATAL: ${state.pet.name} pereció por inanición (${missedFoodCount} solicitudes de alimento desatendidas).`,
            'death'
          ),
        };
      }

      // 2. Adjust base metrics
      const newHunger = clamp(state.pet.hunger + SIMULATION_CONFIG.HUNGER_PER_HOUR);
      const newFun = clamp(state.pet.fun + SIMULATION_CONFIG.FUN_PER_HOUR);
      let newHygiene = clamp(state.pet.hygiene + SIMULATION_CONFIG.HYGIENE_PER_HOUR);

      // 3. Random event management
      let currentEvent = { ...state.randomEvent };
      if (currentEvent.active) {
        currentEvent.ticksLeftToResolve -= 1;
        if (currentEvent.ticksLeftToResolve <= 0) {
          // Event timed out -> penalty
          penalties += 1;
          if (currentEvent.type === 'potty') {
            newHygiene = clamp(newHygiene - 20);
            logs = addLog(
              logs,
              nextHour,
              `¡${state.pet.name} no llegó al baño a tiempo y se ensució! (-20 Higiene)`,
              'alert'
            );
          } else if (currentEvent.type === 'play_request') {
            logs = addLog(
              logs,
              nextHour,
              `¡${state.pet.name} se aburrió esperando para jugar!`,
              'alert'
            );
          }
          currentEvent = { type: null, active: false, ticksLeftToResolve: 0 };
        }
      } else {
        // Roll for new random event (35% probability)
        const roll = Math.random();
        if (roll < SIMULATION_CONFIG.RANDOM_EVENT_CHANCE) {
          const eventType = Math.random() < 0.5 ? 'potty' : 'play_request';
          currentEvent = {
            type: eventType,
            active: true,
            ticksLeftToResolve: SIMULATION_CONFIG.RANDOM_EVENT_TIMEOUT_TICKS,
          };
          const msg =
            eventType === 'potty'
              ? `¡${state.pet.name} necesita ir al baño urgentemente! 🚽`
              : `¡${state.pet.name} quiere jugar contigo ahora mismo! 🎾`;
          logs = addLog(logs, nextHour, msg, 'warning');
        }
      }

      // Recalculate happiness
      const newHappiness = calculateHappiness(newFun, newHygiene, newHunger);

      // Determine contextual message
      let contextualMessage = `Hora ${nextHour}:00. ${state.pet.name} está `;
      if (isRequestingFood) {
        contextualMessage = `¡${state.pet.name} está esperando su comida obligatoria!`;
      } else if (currentEvent.active && currentEvent.type === 'potty') {
        contextualMessage = `¡Rápido! ${state.pet.name} necesita ir al baño.`;
      } else if (currentEvent.active && currentEvent.type === 'play_request') {
        contextualMessage = `¡${state.pet.name} salta de aburrimiento y quiere jugar!`;
      } else if (newHunger >= 70) {
        contextualMessage = `¡${state.pet.name} tiene mucha hambre!`;
      } else if (newHygiene <= 30) {
        contextualMessage = `${state.pet.name} necesita un buen baño.`;
      } else if (newFun <= 30) {
        contextualMessage = `${state.pet.name} está muy aburrido.`;
      } else if (newHappiness >= 80) {
        contextualMessage = `¡${state.pet.name} está de excelente humor! ✨`;
      } else {
        contextualMessage = `${state.pet.name} se encuentra tranquilo.`;
      }

      // 4. Check cycle completion (24 hours reached)
      if (nextHour >= SIMULATION_CONFIG.TOTAL_SIMULATED_HOURS) {
        return {
          ...state,
          status: 'game_over_completed',
          pet: {
            ...state.pet,
            hunger: newHunger,
            fun: newFun,
            hygiene: newHygiene,
            happiness: newHappiness,
          },
          clock: {
            ...state.clock,
            simulatedHour: 24,
            isRunning: false,
          },
          feeding: {
            ...state.feeding,
            isRequestingFood: false,
            missedFoodCount,
          },
          randomEvent: currentEvent,
          summary: {
            ...state.summary,
            penaltiesIncurred: penalties,
          },
          currentMessage: `🎉 ¡Felicitaciones! Has completado el ciclo de 24 horas y ${state.pet.name} sobrevivió exitosamente.`,
          logs: addLog(
            logs,
            24,
            `¡Simulación finalizada con éxito! ${state.pet.name} ha vivido las 24 horas completas.`,
            'success'
          ),
        };
      }

      return {
        ...state,
        pet: {
          ...state.pet,
          hunger: newHunger,
          fun: newFun,
          hygiene: newHygiene,
          happiness: newHappiness,
        },
        clock: {
          ...state.clock,
          simulatedHour: nextHour,
        },
        feeding: {
          ...state.feeding,
          isRequestingFood,
          missedFoodCount,
        },
        randomEvent: currentEvent,
        summary: {
          ...state.summary,
          penaltiesIncurred: penalties,
        },
        currentMessage: contextualMessage,
        logs,
      };
    }

    case 'FEED': {
      if (state.status !== 'playing' || !state.pet.isAlive) return state;

      const consecutive = state.feeding.consecutiveFeedings + 1;
      let logs = state.logs;

      // Check overfeeding death condition (3 consecutive feedings)
      if (consecutive >= SIMULATION_CONFIG.MAX_CONSECUTIVE_FEEDINGS) {
        return {
          ...state,
          status: 'game_over_ghost',
          pet: {
            ...state.pet,
            isAlive: false,
            isGhost: true,
            ghostReason: 'overfeeding',
            hunger: 0,
            happiness: 0,
          },
          clock: {
            ...state.clock,
            isRunning: false,
          },
          feeding: {
            ...state.feeding,
            consecutiveFeedings: consecutive,
            isRequestingFood: false,
          },
          summary: {
            ...state.summary,
            timesFed: state.summary.timesFed + 1,
            penaltiesIncurred: state.summary.penaltiesIncurred + 1,
          },
          currentMessage: `💀 ${state.pet.name} se ha convertido en fantasma por sobrealimentación compulsiva (3 comidas seguidas).`,
          logs: addLog(
            logs,
            state.clock.simulatedHour,
            `FATAL: ${state.pet.name} colapsó por sobrealimentación tras recibir 3 comidas consecutivas.`,
            'death'
          ),
        };
      }

      const newHunger = clamp(state.pet.hunger - SIMULATION_CONFIG.FEED_HUNGER_REDUCTION);
      const newHappiness = calculateHappiness(state.pet.fun, state.pet.hygiene, newHunger);
      const wasRequested = state.feeding.isRequestingFood;

      const feedMsg = wasRequested
        ? `Alimentaste a ${state.pet.name} a tiempo. ¡Solicitud de comida resuelta!`
        : `Le diste de comer a ${state.pet.name} (Racha consecutiva: ${consecutive}/3).`;

      logs = addLog(
        logs,
        state.clock.simulatedHour,
        `${feedMsg} Hambre: ${newHunger}%`,
        consecutive >= 2 ? 'warning' : 'info'
      );

      return {
        ...state,
        pet: {
          ...state.pet,
          hunger: newHunger,
          happiness: newHappiness,
        },
        feeding: {
          ...state.feeding,
          isRequestingFood: false,
          consecutiveFeedings: consecutive,
          lastFeedingHour: state.clock.simulatedHour,
        },
        summary: {
          ...state.summary,
          timesFed: state.summary.timesFed + 1,
        },
        currentMessage: consecutive === 2
          ? `⚠️ ¡Cuidado! Alimentaste a ${state.pet.name} 2 veces seguidas. ¡Una más y explotará!`
          : `¡Ñam ñam! ${state.pet.name} disfrutó la comida.`,
        logs,
      };
    }

    case 'PLAY': {
      if (state.status !== 'playing' || !state.pet.isAlive) return state;

      const newFun = clamp(state.pet.fun + SIMULATION_CONFIG.PLAY_FUN_BOOST);
      const newHappiness = calculateHappiness(newFun, state.pet.hygiene, state.pet.hunger);

      // Reset consecutive feedings streak
      let currentEvent = { ...state.randomEvent };
      let eventResolved = false;
      if (currentEvent.active && currentEvent.type === 'play_request') {
        currentEvent = { type: null, active: false, ticksLeftToResolve: 0 };
        eventResolved = true;
      }

      const logMsg = eventResolved
        ? `Jugaste con ${state.pet.name}. ¡Deseo de juego cumplido! Diversión: ${newFun}%`
        : `Jugaste con ${state.pet.name}. Diversión: ${newFun}%`;

      return {
        ...state,
        pet: {
          ...state.pet,
          fun: newFun,
          happiness: newHappiness,
        },
        feeding: {
          ...state.feeding,
          consecutiveFeedings: 0, // Reset streak!
        },
        randomEvent: currentEvent,
        summary: {
          ...state.summary,
          timesPlayed: state.summary.timesPlayed + 1,
        },
        currentMessage: `🎾 ¡${state.pet.name} se divirtió un montón jugando!`,
        logs: addLog(state.logs, state.clock.simulatedHour, logMsg, 'info'),
      };
    }

    case 'CLEAN': {
      if (state.status !== 'playing' || !state.pet.isAlive) return state;

      const newHygiene = clamp(state.pet.hygiene + SIMULATION_CONFIG.CLEAN_HYGIENE_BOOST);
      const newHappiness = calculateHappiness(state.pet.fun, newHygiene, state.pet.hunger);

      // Reset consecutive feedings streak
      let currentEvent = { ...state.randomEvent };
      let eventResolved = false;
      if (currentEvent.active && currentEvent.type === 'potty') {
        currentEvent = { type: null, active: false, ticksLeftToResolve: 0 };
        eventResolved = true;
      }

      const logMsg = eventResolved
        ? `Llevaste a ${state.pet.name} al baño a tiempo. ¡Higiene al ${newHygiene}%!`
        : `Bañaste y aseaste a ${state.pet.name}. Higiene: ${newHygiene}%`;

      return {
        ...state,
        pet: {
          ...state.pet,
          hygiene: newHygiene,
          happiness: newHappiness,
        },
        feeding: {
          ...state.feeding,
          consecutiveFeedings: 0, // Reset streak!
        },
        randomEvent: currentEvent,
        summary: {
          ...state.summary,
          timesCleaned: state.summary.timesCleaned + 1,
        },
        currentMessage: `✨ ¡${state.pet.name} quedó fresco, limpio y reluciente!`,
        logs: addLog(state.logs, state.clock.simulatedHour, logMsg, 'info'),
      };
    }

    case 'RESOLVE_RANDOM_EVENT': {
      if (!state.randomEvent.active) return state;
      if (state.randomEvent.type === 'potty') {
        return tamagotchiReducer(state, { type: 'CLEAN' });
      } else {
        return tamagotchiReducer(state, { type: 'PLAY' });
      }
    }

    case 'RESET_GAME': {
      return createInitialState();
    }

    default:
      return state;
  }
}
