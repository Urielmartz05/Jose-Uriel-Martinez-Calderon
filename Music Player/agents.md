# Protocolo de Ejecución de Agentes (Agents.md)

## 1. Directivas Primarias de Optimización de Tokens

Para garantizar la mínima huella de tokens en contextos conversacionales y llamadas a APIs:

1. **Cero Saludos o Cortesías:** Entregar respuestas puramente ejecutables. Omitir introducciones ("¡Hola!", "Con gusto te ayudo") y conclusiones ("Espero que esto te sirva").
2. **Modificaciones Quirúrgicas (Diffs / Archivos Aislados):**
   * No reescribir archivos enteros que ya existen a menos que sea un archivo nuevo o un refactor del >70%.
   * Especificar siempre la ruta exacta: `src/path/to/file.tsx`.
3. **Omisión de Explicaciones Teóricas:** No detallar cómo funciona un hook de React o por qué se utiliza un patrón. Proporcionar directamente el código o el comando.
4. **Respuestas Sintéticas:** Cuando se solicite estatus o reporte, responder en formato telegráfico o lista de verificación (checklist).

---

## 2. Roles y Matriz de Responsabilidad

| Rol del Agente | Tarea Exclusiva | Entregable Directo | Restricción de Contexto |
| :--- | :--- | :--- | :--- |
| **`@core-audio`** | Manejo de `<audio>`, cola y estado de reproducción (`useAudioPlayer`, `AudioContext`). | Código de lógica y hooks. | Cero estilos visuales (CSS/Tailwind). Solo lógica funcional. |
| **`@ui-layout`** | Vistas y componentes (reproductor móvil, desktop, barra lateral, listas). | Componentes TSX + Tailwind. | No modifica la lógica interna de reproducción; consume el contexto existente. |
| **`@auth-adapter`**| Autenticación simulada/real y puente desacoplado a BD (`IDatabaseAdapter`). | Rutas API y contratos de datos. | No interactúa con los controles de audio. |

---

## 3. Protocolo Estricto de Pruebas (Solo lo Crítico)

Queda **prohibido** redactar suites de pruebas exhaustivas para casos triviales (ej. verificar si un botón se renderiza). Las pruebas se limitan a los siguientes **3 vectores críticos de falla**:

### Test 1: Bucle de Avance Automático (`onEnded`)
* **Objetivo:** Verificar que al terminar la pista actual (`currentTime === duration`), el índice avance a `(index + 1) % queue.length` sin lanzar excepciones de reproducción nula.

### Test 2: Algoritmo de Shuffle sin Mutación
* **Objetivo:** Validar que al activar `Shuffle`, la pista en curso se mantenga en reproducción activa y la cola original permanezca íntegra para poder restaurarla.

### Test 3: Contrato de Adaptador de Base de Datos
* **Objetivo:** Confirmar que `lib/db/mock-adapter.ts` resuelva las 6 pistas obligatorias con todos los metadatos requeridos (`id`, `title`, `artist`, `audioUrl`, `coverUrl`, `duration`).

---

## 4. Estándar de Salida de Código

Todo fragmento de código debe entregarse listo para pegar y compilar:
* **Imports completos:** Sin omitir dependencias.
* **Tipado estricto:** TypeScript sin `any` innecesarios para prevenir bucles de corrección de errores (los cuales consumen tokens dobles).
* **Sin placeholders:** Prohibido dejar comentarios tipo `// TODO: agregar lógica aquí`. Escribir la implementación completa del bloque solicitado.