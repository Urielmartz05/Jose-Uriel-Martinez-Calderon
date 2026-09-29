# Protocolo de Ejecución de Agentes (Agents.md) - MathLingo

## 1. Directivas Primarias de Optimización de Tokens

Para asegurar la menor huella de tokens en modelos rápidos y entornos conversacionales (Gemini Flash):

1. **Cero Saludos o Cortesías:** Salidas puramente técnicas y ejecutables. Sin prólogos ni conclusiones.
2. **Entrega de Archivos Completos y Aislados:** Cada archivo debe incluir su ruta exacta (`src/...`) y todo el código funcional necesario, sin omitir partes ni dejar comentarios como `// TODO`.
3. **Cero Explicaciones Teóricas:** No justificar decisiones de diseño ni explicar sintaxis de React/Sequelize.
4. **Respuestas Sintéticas:** Todo estatus o reporte debe ser un checklist booleano.

---

## 2. Roles y Matriz de Responsabilidad

| Rol del Agente | Tarea Exclusiva | Entregable Directo | Restricción de Contexto |
| :--- | :--- | :--- | :--- |
| **`@db-auth`** | Conexión Sequelize, modelos (`User`, `UserProgress`, `GameSession`), hash bcrypt y endpoints de auth (`/api/auth/*`). | Modelos, sincronización DB y rutas de API. | No genera componentes visuales ni maneja lógica de preguntas. |
| **`@game-engine`** | Estado de juego (`GameContext`), banco de 100 preguntas (20 por tema para 6.º de primaria) y lógica de vidas/puntuación. | `src/data/questions.ts`, `GameContext.tsx`, lógica de evaluación. | Cero estilos CSS/Tailwind complejos; solo reglas de negocio y cálculo de estadísticas. |
| **`@ui-duo`** | Componentes visuales estilo Duolingo (nodos 3D, mapa de 5 círculos, tarjeta de 4 opciones, header de vidas y footer de feedback). | Componentes TSX + Tailwind CSS. | Consume el `GameContext` y la API existente sin alterar los modelos de datos. |

---

## 3. Protocolo Estricto de Pruebas (Solo lo Crítico)

Queda **prohibido** redactar suites de pruebas exhaustivas para renderizado trivial o testing estático. La verificación se limita a **3 vectores críticos de falla**:

### Test 1: Deducción de Vidas y Condición de Game Over
* **Objetivo:** Verificar que una respuesta incorrecta reste exactamente 1 corazón (`hearts - 1`). Si `hearts === 0`, el estado cambia inmediatamente a `isGameOver: true`, bloqueando nuevas respuestas y desplegando el modal de resumen.

### Test 2: Cálculo de Precisión y Transición de Nivel
* **Objetivo:** Al responder la pregunta 20, verificar la fórmula de precisión:
  $$\text{accuracy} = \left(\frac{\text{correctAnswers}}{20}\right) \times 100$$
  Comprobar que el resultado se envíe a `/api/session/finish` y que, si se alcanza el umbral de aprobación, se marque `completed: true` en `UserProgress` para desbloquear el siguiente nodo.

### Test 3: Integridad del Banco de Preguntas
* **Objetivo:** Validar que cada una de las 5 categorías contenga exactamente 20 preguntas, que cada pregunta tenga 4 opciones distintas y que el índice `correctIndex` esté dentro del rango $[0, 3]$.

---

## 4. Estándar de Salida de Código

* **Tipado Estricto:** TypeScript puro, interfaces exhaustivas para preguntas y respuestas. Prohibido el uso de `any`.
* **Persistencia Lista:** Sequelize configurado con SQLite (`sqlite3`) por defecto para ejecución inmediata sin configuración externa previa, con soporte modular para migrar a PostgreSQL/MySQL.
* **Auto-sincronización:** Hook o inicializador que ejecute `sequelize.sync()` automáticamente en entornos de desarrollo.