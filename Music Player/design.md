# Especificación de Diseño: Reproductor de Música Web (Estilo Apple Music)

## 1. Concepto Visual y Filosofía de Diseño

* **Estética:** *Apple Music Aesthetic* — Minimalismo contemporáneo, fondos limpios con efecto de desenfoque de cristal (*glassmorphism* reactivo), alto contraste tipográfico y microinteracciones sutiles.
* **Jerarquía:** La carátula del álbum y los controles de reproducción son los protagonistas visuales. La interfaz evita elementos superfluos o bordes pesados.
* **Sensación Táctil:** Botones con superficies suaves, transiciones fluidas de opacidad y sombras proyectadas suaves (*ambient glow*) calculadas a partir del arte del disco.

---

## 2. Sistema de Diseño (Design Tokens)

### 2.1. Paleta de Colores

```css
:root {
  /* Fondos Base */
  --bg-primary: #000000;              /* Fondo oscuro puro (OLED friendly) */
  --bg-secondary: #121216;            /* Fondo de paneles y tarjetas */
  --bg-surface-glass: rgba(28, 28, 30, 0.72); /* Cristal translúcido con backdrop-blur */
  
  /* Acentos y Marca */
  --accent-apple-red: #FA2D48;         /* Rojo característico Apple Music */
  --accent-hover: #FB5C70;
  
  /* Textos y Jerarquía */
  --text-primary: #FFFFFF;            /* 100% blanco para títulos y artistas clave */
  --text-secondary: #A1A1A6;          /* Gris neutro para álbumes, tiempos y subtítulos */
  --text-muted: #6E6E73;              /* Metadatos secundarios e iconos inactivos */

  /* Bordes y Divisores */
  --border-subtle: rgba(255, 255, 255, 0.08);
  --border-glass: rgba(255, 255, 255, 0.12);

  /* Barra de Progreso y Sliders */
  --slider-track: rgba(255, 255, 255, 0.18);
  --slider-fill: #FFFFFF;
}
```

### 2.2. Tipografía

* **Familia Primaria:** `-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Helvetica Neue", sans-serif`.
* **Escala Tipográfica:**
  * **Título Hero / Reproductor Fullscreen:** `24px` a `32px`, peso `700 (Bold)`.
  * **Título de Pista en Lista:** `15px`, peso `600 (Semibold)`.
  * **Artista / Álbum:** `13px` a `14px`, peso `400 (Regular)`, color `--text-secondary`.
  * **Timestamps / Badges:** `11px` a `12px`, peso `500 (Medium)`, espaciado monoespaciado en dígitos (`font-variant-numeric: tabular-nums`).

### 2.3. Efectos y Elevación

* **Backdrop Blur:** `backdrop-filter: blur(20px) saturate(180%);` para barras fijas y reproductor flotante.
* **Radio de Curvatura:**
  * Carátulas de canciones: `8px` en listas, `16px` en modal expandido.
  * Controles y paneles: `12px` a `24px`.
  * Botones de acción circular: `9999px` (completamente redondeados).
* **Cover Glow:** `box-shadow: 0 12px 32px -4px rgba(0, 0, 0, 0.5)`.

---

## 3. Arquitectura de Pantallas y Layout

### 3.1. Vista de Escritorio (Desktop: $\ge 1024\text{px}$)

Estructura de vista limpia en 2 columnas principales con barra de control inferior persistente:

```text
┌────────────────────────────────────────────────────────────────────────┐
│  [Apple Icon]  Buscar...                 [+ Añadir]  [Usuario: Perfil] │
├──────────────┬─────────────────────────────────────────────────────────┤
│ BIBLIOTECA   │  ALBUM DESTACADO / RECIENTES                            │
│ ♫ Canciones  │  ┌──────────────┐                                        │
│ ♡ Favoritos  │  │ [Cover Art]  │  Canción Destacada                     │
│ ⊞ Subir      │  │   (240x240)  │  Artista Principal • Álbum (2026)      │
│              │  └──────────────┘  [▶ Reproducir]  [♡ Me gusta]          │
│              │                                                         │
│              │  CATÁLOGO DE CANCIONES (Mínimo 6)                       │
│              │  #   Título             Álbum        Duración   Like    │
│              │  1   Track Name 01      Album A      3:45       ♡       │
│              │  2   Track Name 02      Album B      4:12       ♥       │
│              │  3   Track Name 03      Album C      2:58       ♡       │
├──────────────┴─────────────────────────────────────────────────────────┤
│ [Cover 48x48]  ⏮   ▶ / ⏸   ⏭   🔀  🔁   01:15 ━━━━●──────── 03:45   🔊 ──●── │
│ Título - Artista                                                       │
└────────────────────────────────────────────────────────────────────────┘
```

### 3.2. Vista Móvil (Mobile: $\le 768\text{px}$)

Diseñado para ergonomía a una sola mano:

1. **Catálogo Compacto:** Lista vertical con carátula cuadrada de `48x48px`, título truncado limpiamente y botón contextual de tres puntos o corazón.
2. **Mini Player Persistente:** Barra flotante a `8px` sobre la navegación inferior con borde translúcido:
   * Carátula miniatura (`40x40px`).
   * Título y artista deslizables.
   * Botón `Play/Pause` táctil directo.
   * Barra de progreso de 2px de altura integrada en el borde superior del componente.
3. **Now Playing Modal (Pantalla Completa):**
   * Se abre con un gesto de deslizamiento hacia arriba (*swipe up*) o tap sobre el mini player.
   * Fondo dinámico: Desenfoque ultra-profundo con gradiente de color extraído de la carátula.
   * Carátula central grande (`280x280px` a `320x320px`) con escala reactiva: reduce al 92% cuando se pausa, expande con sutil animación elástica al dar play.
   * Timestamps izquierdo/derecho bajo la seekbar interactiva.

---

## 4. Especificación de Componentes Clave

### 4.1. Barra de Progreso y Scrubbing (`ProgressBar.tsx`)

* **Línea de tiempo no intrusiva:** Altura pasiva de `4px` que se expande a `6px` en hover/touch.
* **Buffer y Pogreso:**
  * Fondo: `var(--slider-track)`.
  * Relleno activo: `var(--slider-fill)` o acento `--accent-apple-red`.
  * Cabezal (*Thumb*): Diámetro de `12px` que aparece al interactuar y desaparece tras soltar para mantener la limpieza visual.
* **Tiempo numérico:** Formato `m:ss` estricto con espaciado tabular para evitar vibración del texto durante la reproducción.

### 4.2. Controles de Reproducción (`PlayerControls.tsx`)

* Iconografía basada en *Apple SF Symbols* o SVGs simplificados de trazo fino (`stroke-width: 2`):
  * **Play/Pause:** Botón circular destacado con fondo blanco y glifo negro en modo oscuro (`48x48px` en desktop, `64x64px` en modal móvil).
  * **Next / Previous:** Salto suave de canción, color `--text-primary`.
  * **Shuffle / Repeat:** Iconos secundarios que muestran un punto luminoso o cambian a `--accent-apple-red` cuando están activos (`Repeat One` muestra un pequeño "1" dentro del glifo).

### 4.3. Tarjeta de Carátula y Metadatos (`TrackInfo.tsx`)

* **Efecto de Reproducción Activa:** Pequeño ecualizador animado de 3 barras (*Waveform GIF/CSS*) junto al número de pista cuando está sonando.
* **Corazón / Favorito:** Transición suave con escala elástica al dar like (`scale(1.2) -> scale(1)`), cambiando de contorno gris a relleno `--accent-apple-red`.

### 4.4. Modal de Autenticación y Preferencias (`AuthModal.tsx`)

* Ventana emergente con estética de diálogo nativo de macOS/iOS:
  * Inputs con fondo `rgba(255, 255, 255, 0.06)`, bordes redondeados `10px` y etiquetas flotantes limpias.
  * Botón primario de ancho completo con color `--accent-apple-red` y texto en negrita.

### 4.5. Modal "Añadir Canción" (`AddTrackModal.tsx`)

* Formulario minimalista para registrar nuevas canciones:
  * Campos: `Título`, `Artista`, `Álbum`, `URL de Audio (.mp3)` y `URL de Carátula`.
  * Vista previa inmediata de la carátula al pegar el enlace.
  * Inserción sin recarga que agrega la canción directamente al catálogo y a la cola.

---

## 5. Microinteracciones y Estados

| Elemento | Acción | Respuesta Visual |
| :--- | :--- | :--- |
| **Pista en lista** | Hover (Desktop) | Fondo cambia sutilmente a `rgba(255, 255, 255, 0.05)`; el número se sustituye por icono `▶`. |
| **Play / Pause** | Clic / Tap | Transición de transformación morph entre triángulo de play y dos barras verticales de pausa (200ms). |
| **Carátula en reproducción** | Play $\to$ Pause | La carátula en pantalla completa se encoge suavemente al 90% y la sombra disminuye. |
| **Fin de canción (Autoplay)** | Automático | Desplazamiento horizontal fluido del título y carátula hacia la nueva pista sin parpadeo. |
| **Seekbar** | Dragging | El indicador de tiempo actual refleja instantáneamente la posición arrastrada antes de enviar el comando al `<audio>`. |