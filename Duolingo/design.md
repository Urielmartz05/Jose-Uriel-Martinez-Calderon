# Especificación de Diseño Visual: MathLingo (Duolingo Matemático)

## 1. Filosofía Visual y Estilo

* **Estética:** *Gamified Playful UI* inspirada directamente en Duolingo.
* **Componentes Táctiles (3D Push-down Buttons):** Botones y nodos con bordes inferiores biselados (`border-b-4` o sombras duras) que simulan profundidad física y se presionan al hacer click (`active:translate-y-1 active:border-b-0`).
* **Colorimetría Emocional:** Tonos vivos y saturados para estimular la concentración y el aprendizaje en nivel primaria. Feedback inmediato con contrastes claros (verde brillante para éxito, rojo coral para fallo).

---

## 2. Sistema de Tokens de Diseño (CSS / Tailwind)

### 2.1. Paleta de Colores

```css
:root {
  /* Fondos y Neutros */
  --bg-page: #FFFFFF;
  --bg-card: #FFFFFF;
  --text-main: #4B4B4B;
  --text-muted: #AFAFAF;
  --border-subtle: #E5E5E5;

  /* Colores Duolingo Core */
  --duo-green: #58CC02;         /* Botones principales y acierto */
  --duo-green-border: #46A302;  /* Bisel de botón verde */
  --duo-green-bg: #D7FFB8;      /* Banner de éxito */

  --duo-red: #FF4B4B;           /* Vidas/corazones y error */
  --duo-red-border: #EA2B2B;    /* Bisel de botón rojo */
  --duo-red-bg: #FFDFE0;        /* Banner de error */

  --duo-yellow: #FFC800;        /* Puntos XP, coronas y medallas */
  --duo-yellow-border: #E5A500;
  
  --duo-blue: #1CB0F6;          /* Nodos activos / selección */
  --duo-blue-border: #1899D6;
  --duo-blue-bg: #DDF4FF;

  --duo-gray-disabled: #E5E5E5;
  --duo-gray-border: #CECECE;
}
```

### 2.2. Tipografía y Micro-tipos

* **Familia Tipográfica:** `'Nunito', 'DIN Round Pro', system-ui, sans-serif` (formas redondeadas y amigables).
* **Jerarquías:**
  * **Titulares de Pregunta:** `text-xl` a `text-2xl`, peso `800 (Extra Bold)`.
  * **Opciones de Respuesta:** `text-lg`, peso `700 (Bold)`.
  * **Contador de Vidas / Avance:** `text-sm` a `text-base`, peso `800 (Bold)`.

---

## 3. Arquitectura de Pantallas

### 3.1. Mapa de Rutas (Dashboard de 5 Círculos)

Distribución centralizada con trayectoria sinuosa (zig-zag sutil):

```text
┌────────────────────────────────────────────────────────┐
│  [MathLingo]                [❤️ 3]  [⭐ 120 XP] [👤 Perfil] │
├────────────────────────────────────────────────────────┤
│                                                        │
│                    ╭───────────╮                       │
│                    │   ( + )   │   1. Sumas            │
│                    ╰─────┬─────╯   [100% ★★★]          │
│                          │                             │
│               ╭──────────┴╮                            │
│               │   ( - )   │        2. Restas           │
│               ╰─────┬─────╯        [75%  ★★☆]          │
│                     │                                  │
│                     ╰──────────╮                       │
│                                │   3. Multiplicaciones │
│                          ╭─────┴─────╮ [ACTUAL ▶]      │
│                          │   ( × )   │                 │
│                          ╰─────┬─────╯                 │
│                                │                       │
│               ╭────────────────╯                       │
│         ╭─────┴─────╮              4. Divisiones       │
│         │   ( ÷ )   │              [🔒 Bloqueado]      │
│         ╰─────┬─────╯                                  │
│               │                                        │
│               ╰──────────╮                             │
│                    ╭─────┴─────╮   5. Problemas Cortos │
│                    │   ( ? )   │   [🔒 Bloqueado]      │
│                    ╰───────────╯                       │
└────────────────────────────────────────────────────────┘
```

#### Especificación del Nodo Circular (`PathNode.tsx`):
- **Dimensiones:** `w-24 h-24` (desktop) o `w-20 h-20` (mobile). Forma circular `rounded-full`.
- **Efecto 3D:** Borde inferior `border-b-[6px] border-duo-green-border`.
- **Anillo de Progreso:** SVG circular concéntrico que dibuja el porcentaje de las 20 preguntas (`stroke-dasharray`).

---

### 3.2. Pantalla de Juego / Preguntas (`learn/[category]`)

Estructura fija en 3 secciones:

1. **Header Superior Persistente:**
   - Botón `✕` para salir.
   - Barra de progreso gris con barra interior verde fluida (`h-4 rounded-full transition-all duration-300`).
   - Contador de vidas con icono de corazón animado que palpita (`❤️ 3`).

2. **Área Central de Pregunta y Opciones:**
   - Enunciado claro centrado en caja elevada.
   - Rejilla responsiva de 4 tarjetas de opción (`grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-xl mx-auto`).
   - Cada tarjeta tiene borde de `2px`, esquinas redondeadas (`rounded-2xl`), efecto 3D inferior y número de tecla atajo (`1`, `2`, `3`, `4`).

3. **Footer Fijo de Comprobación y Feedback:**
   - En reposo: Fondo blanco con botón verde "COMPROBAR" (`w-full sm:w-48 py-3 rounded-2xl font-black shadow-duo-green`).
   - Al responder correcto: Banner inferior verde manzana (`bg-[#D7FFB8]`), mensaje "¡Excelente trabajo!" y botón verde "CONTINUAR".
   - Al responder incorrecto: Banner inferior rojo claro (`bg-[#FFDFE0]`), mensaje "Solución correcta: [X]" y botón rojo "ENTENDIDO".

---

### 3.3. Modal de Resumen y Fin de Sesión (`GameOverModal.tsx`)

Aparece al terminar las 20 preguntas o al agotar las 3 vidas:

- **Tarjeta Flotante Centrada:**
  - Título emocional: *"¡Lección Completada!"* (o *"¡Te has quedado sin vidas!"*).
  - **Métricas Clave (3 Tarjetas Grid):**
    1. **Precisión:** Círculo porcentual (ej. $90\%$).
    2. **Aciertos:** `18/20` correctas en verde.
    3. **XP Ganado:** `+50 XP` en tarjeta amarilla.
  - **Acciones:**
    - Botón primario: *"REINICIAR LECCIÓN"* (recarga la temática a la pregunta 1 y restaura las 3 vidas).
    - Botón secundario: *"VOLVER A LA RUTA"* (regresa al dashboard principal).

---

## 4. Microinteracciones Clave

| Evento | Elemento | Animación / Transición |
| :--- | :--- | :--- |
| **Hover en Opción** | Tarjeta de opción | Eleva `border-blue-400 bg-blue-50/40`. |
| **Selección** | Tarjeta activa | Fondo azul suave, borde azul intenso con bisel pulsado. |
| **Pérdida de Vida** | Corazón (`❤️`) | Animación `shake` + `scale-125` hacia opacidad reducida (`💔`). |
| **Avance de Barra** | `ProgressBar` | `width` se interpola suavemente con curva `ease-out` de 300ms. |
| **Feedback Popup** | Footer banner | Deslizamiento vertical desde abajo (`translate-y-0 ease-out`). |