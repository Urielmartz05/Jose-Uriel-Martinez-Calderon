# Plan de Especificación y Arquitectura: Mascota Virtual (Tamagotchi Web)

## 1. Visión General del Proyecto
Desarrollar una aplicación web interactiva que simule una mascota virtual tipo Tamagotchi, priorizando una arquitectura modular y un bucle de simulación temporal reactivo y desacoplado de la interfaz.

---

## 2. Requerimientos Funcionales

| ID | Requerimiento | Descripción | Criterio de Aceptación |
|---|---|---|---|
| **RF-01** | Inicialización / Nombre | Solicitar y persistir el nombre de la mascota antes de iniciar la simulación. | Pantalla inicial o modal para ingresar el nombre; una vez enviado, se muestra en pantalla. |
| **RF-02** | Bucle de Tiempo (Tick) | 6 segundos en tiempo real equivalen a 1 hora simulada. Ciclo total de 24 horas simuladas (144 segundos reales). | Reloj visible en pantalla en formato `HH:00` (de `00:00` a `24:00`). |
| **RF-03** | Indicadores de Estado | Métricas de Hambre, Diversión, Higiene y Felicidad (rango 0 - 100%). | Barras de progreso / medidores numéricos actualizados en cada tick. |
| **RF-04** | Demanda de Comida | Cada 6 horas simuladas (horas 6, 12, 18, 24) se activa una alerta obligatoria de alimentación. | La mascota emite una solicitud explícita de comida con temporizador de respuesta. |
| **RF-05** | Condición Fantasma: Inanición | Si se ignoran 2 solicitudes de comida consecutivas o acumuladas sin alimentar, la mascota se convierte en fantasma. | Estado `FANTASMA`, congelamiento de acciones, fin de simulación por muerte. |
| **RF-06** | Condición Fantasma: Sobrealimentación | Si el usuario alimenta a la mascota 3 veces seguidas sin necesidad o de manera consecutiva compulsiva, se convierte en fantasma por sobrealimentación. | Contador de sobrealimentación; transición a estado `FANTASMA`. |
| **RF-07** | Eventos Aleatorios | Generación no determinista de eventos como "quiere ir al baño" o "quiere jugar". | En intervalos entre ticks se evalúa probabilidad ($p \approx 0.35$ por hora simulada) activando un estado de necesidad temporal. |
| **RF-08** | Interacciones del Usuario | Botones funcionales: `Alimentar`, `Jugar`, `Llevar al Baño`. | Modifican los contadores, restauran niveles de necesidad y limpian las alertas activas. |
| **RF-09** | Feedback y Mensajes de Estado | Mensajes dinámicos contextuales según estado actual (feliz, hambriento, sucio, aburrido, fantasma). | Consola de mensajes / cuadro de diálogo debajo o sobre el avatar de la mascota. |
| **RF-10** | Fin de Ciclo y Resumen | Al llegar a las 24 horas simuladas, si sobrevive, se congela el reloj y se genera un reporte del cuidado. | Modal o vista con estadísticas: veces alimentado, incidentes atendidos, promedio de felicidad y estado final. |

---

## 3. Modelo de Dominio y Máquina de Estados

### 3.1. Estados Principales de la Mascota
```text
[CONFIGURACIÓN] 
      │ (Guardar nombre)
      ▼
   [VIVO] ──────(2 alertas de comida ignoradas)─────► [FANTASMA (Inanición)]
      │
      ├──────(3 alimentaciones consecutivas)────────► [FANTASMA (Sobrealimentación)]
      │
      └──────(Alcanza 24:00 horas simuladas)────────► [RESUMEN FINAL]
```

### 3.2. Estructura del Estado (`GameState`)
```typescript
interface PetState {
  name: string;
  isAlive: boolean;
  isGhost: boolean;
  ghostReason: 'starvation' | 'overfeeding' | null;
  hunger: number;     // 0 (sin hambre / lleno) a 100 (muerto de hambre)
  fun: number;        // 0 a 100
  hygiene: number;    // 0 a 100
  happiness: number;  // 0 a 100 (calculado a partir de diversión + higiene - hambre)
}

interface ClockState {
  simulatedHour: number; // 0 a 24
  realSecondsElapsed: number;
  isRunning: boolean;
  intervalMs: number;    // 6000 ms por hora simulada
}

interface FeedingTracker {
  isRequestingFood: boolean;
  missedFoodCount: number;
  consecutiveFeedings: number;
  lastFeedingHour: number | null;
}

interface RandomEvent {
  type: 'potty' | 'play_request' | null;
  active: boolean;
  ticksLeftToResolve: number;
}

interface CareSummary {
  timesFed: number;
  timesPlayed: number;
  timesCleaned: number;
  penaltiesIncurred: number;
}
```

---

## 4. Arquitectura de Componentes y Lógica Funcional

### 4.1. Componentes Frontend
1. **`GameContainer`**: Contenedor principal que orquesta el bucle temporal y el estado global.
2. **`SetupModal`**: Formulario inicial para asignar nombre a la mascota.
3. **`DigitalClock`**: Display visual del reloj simulado (`00:00` - `24:00`).
4. **`PetDisplay`**:
   - Renderizador visual (Sprite/CSS/SVG según estado: Normal, Hambriento, Triste, Sucio, Fantasma).
   - Bocadillo de diálogo con mensaje contextual.
5. **`StatsPanel`**: Barras de progreso de Hambre, Diversión, Higiene y Felicidad.
6. **`ActionControls`**: Botones de acción (`Alimentar`, `Jugar`, `Limpiar/Baño`) con control de estado deshabilitado en caso de muerte o pausa.
7. **`SummaryModal`**: Panel final con el reporte de desempeño al cumplir las 24 horas simuladas.

### 4.2. Bucle de Simulación (`useSimulationLoop`)
- Implementado mediante `setInterval` de 6000 ms (o ticks fraccionados de 1000 ms para animaciones fluidas).
- En cada hora simulada ($T = T + 1$):
  1. Incrementar hora simulada.
  2. Ajustar métricas base: `hunger += 10`, `fun -= 8`, `hygiene -= 5`.
  3. Evaluar regla de alimentación periódica (si $T \pmod 6 == 0$): activar alerta de comida. Si la alerta previa no fue atendida, `missedFoodCount++`.
  4. Evaluar condiciones de muerte (`missedFoodCount >= 2` o `consecutiveFeedings >= 3`).
  5. Tirada de evento aleatorio (ej. $35\%$ de probabilidad para solicitud de baño o juego).
  6. Recalcular `happiness = clamp((fun + hygiene + (100 - hunger)) / 3, 0, 100)`.
  7. Si $T \ge 24$: detener simulación y desplegar resumen.

---

## 5. Matriz de Acciones y Efectos

| Acción | Efecto en Estadísticas | Efecto en Reglas Especiales |
|---|---|---|
| **Alimentar** | `hunger = max(0, hunger - 30)` | Si había solicitud activa: se resuelve (`isRequestingFood = false`). `consecutiveFeedings++`. Si `consecutiveFeedings >= 3` $\to$ Fantasma. |
| **Jugar** | `fun = min(100, fun + 25)`, `consecutiveFeedings = 0` | Resuelve evento aleatorio de juego. Rompe la racha de alimentación consecutiva. |
| **Llevar al Baño** | `hygiene = min(100, hygiene + 35)`, `consecutiveFeedings = 0` | Resuelve evento de baño. Rompe la racha de alimentación consecutiva. |

---

## 6. Fases de Implementación

1. **Fase 1: Motor y Estado Central**
   - Configuración del reductor/estado global y el timer con factor de escala ($6\,\text{s} = 1\,\text{h}$).
2. **Fase 2: Lógica de Reglas Críticas (Fantasma y Comida)**
   - Algoritmo de cada 6 horas simuladas, penalizaciones por omisión y contador consecutivo de sobrealimentación.
3. **Fase 3: Motor de Eventos Aleatorios**
   - Generación pseudoaleatoria por hora para baño y entretenimiento con temporizador de resolución.
4. **Fase 4: Interfaz de Usuario y Feedback**
   - Visualización del personaje, paleta retro/Tamagotchi, barras de estado y notificaciones en tiempo real.
5. **Fase 5: Módulo de Cierre (24 Horas)**
   - Congelación de bucle al cumplir ciclo, cálculo de métricas acumuladas y pantalla de resumen final.