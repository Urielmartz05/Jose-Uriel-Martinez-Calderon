# Especificación de Diseño: Mascota Virtual (Tamagotchi Web)

## 1. Dirección Visual y Concepto

* **Estilo:** Retro LCD / Consola de bolsillo de los 90s fusionada con estética moderna tipo "Neo-brutalist Pixel Toy".
* **Enfoque UX:** Controles tácticos claros, feedback inmediato, jerarquía basada en urgencia de necesidades y cero distracciones.
* **Layout:** Consola centralizada con carcasa curva simulada ("Egg-shaped / Retro Shell") rodeada por controles físicos o pantalla LCD limpia adaptable a dispositivos móviles y de escritorio.

---

## 2. Sistema de Diseño (Design Tokens)

### 2.1. Paleta de Colores

```css
:root {
  /* Fondo general / Chasis */
  --color-shell-bg: #E2E8F0;          /* Gris slate suave para marco general */
  --color-shell-primary: #F59E0B;     /* Amarillo/ámbar de juguete retro */
  --color-shell-accent: #D97706;

  /* Pantalla LCD / Matriz */
  --color-screen-bg: #A3B18A;         /* Verde olivo claro tipo pantalla Game Boy/Tamagotchi */
  --color-screen-pixel: #344E41;      /* Verde oscuro profundo para píxeles y texto */
  --color-screen-border: #588157;     /* Borde interior del bisel */

  /* Semántica de Métricas (Barras de Estado) */
  --color-stat-hunger: #EF4444;       /* Rojo alerta */
  --color-stat-fun: #3B82F6;          /* Azul energía */
  --color-stat-hygiene: #10B981;      /* Verde menta */
  --color-stat-happiness: #F59E0B;    /* Dorado/Ámbar */

  /* Estados Críticos */
  --color-ghost-primary: #94A3B8;     /* Gris pálido etéreo */
  --color-alert-urgent: #DC2626;      /* Rojo parpadeo de alerta */
}
```

### 2.2. Tipografía

* **Tipografía Display / Reloj / Métricas:** Fuentes pixeladas monospace (ej. `'Press Start 2P'`, `'Silkscreen'`, o fallback estándar `Courier New, monospace`).
* **Tipografía de Diálogo / Sistema:** Monospace legible con espaciado compacto para simular impresiones de terminal de baja resolución.

### 2.3. Espaciado y Bordes

* **Radio de Chasis:** `32px` a `48px` para emular forma de huevo/consola portátil.
* **Bisel de Pantalla:** `border: 4px solid var(--color-screen-pixel)`, radio `8px`, sombra interior `inset 2px 2px 6px rgba(0,0,0,0.2)`.
* **Elevación e Interacción:** Botones con sombra sólida (ej. `box-shadow: 0 4px 0 #000`), transición en `:active` desplazando el elemento `translateY(4px)`.

---

## 3. Arquitectura Visual y Layout

### 3.1. Esquema Estructural (Wireframe)

```
┌──────────────────────────────────────────────┐
│                  TAMAGOTCHI                  │
│  ┌────────────────────────────────────────┐  │
│  │ [HH:00] Reloj           [Estado: VIVO] │  │
│  ├────────────────────────────────────────┤  │
│  │              ( ^ . ^ )                 │  │
│  │           [Sprite Mascota]             │  │
│  │                                        │  │
│  │ "¡Tengo hambre! Dame de comer (1/2)"   │  │
│  ├────────────────────────────────────────┤  │
│  │ Hambre:   [████████░░] 80%             │  │
│  │ Diversión:[██████░░░░] 60%             │  │
│  │ Higiene:  [█████████░] 90%             │  │
│  │ Felicidad:[███████░░░] 70%             │  │
│  └────────────────────────────────────────┘  │
│                                              │
│      [🍔 Alimentar]  [⚽ Jugar]  [🛁 Baño]    │
└──────────────────────────────────────────────┘
```

---

## 4. Estados Visuales de la Mascota

Los estados se representarán mediante arte ASCII / Pixel SVG escalable para garantizar independencia de recursos externos:

| Estado | Expresión Visual | Indicador de Animación |
| :--- | :--- | :--- |
| **Normal / Contento** | `(^ ‿ ^)` o `(• ‿ •)` | Rebote suave vertical cada 2s (`bounce`). |
| **Hambriento (Alerta 6h)**| `( > ﹏ < )` + Ícono 🍖 parpadeante | Parpadeo rápido de contorno rojo en la pantalla. |
| **Aburrido (Diversión < 30%)**| `( - _ - )` | Movimiento lateral lento. |
| **Sucio (Higiene < 30%)** | `( • ⌂ • )~💩` | Partículas o mosquitas rotando alrededor. |
| **Fantasma (Inanición)** | `(x _ x) ☁` con halo/sábana | Flotación suave y opacidad al 70%. |
| **Fantasma (Sobrealimentado)**| `(x ω x) 💥` con barriga hinchada | Escala aumentada con flotación errática. |
| **Resumen 24h** | `\(^o^)/ 🏆` | Efecto de destellos o estrellas de celebración. |

---

## 5. Componentes de UI

### 5.1. `SetupModal` (Bienvenida y Nombre)
* Modal centrado con fondo atenuado (`backdrop-blur`).
* Input de texto con estilo LCD retro con límite de 12 caracteres.
* Botón de confirmación `[ INICIAR SIMULACIÓN ]` con feedback sonoro/visual al clic.

### 5.2. `DigitalClock` & Cabecera
* Indicador digital en esquina superior izquierda (`00:00` a `24:00`).
* Indicador de tiempo transcurrido en segundos reales.
* Luz LED indicadora de alerta activa (parpadeo en rojo cuando hay comida requerida o evento crítico).

### 5.3. `StatsPanel`
* Cuatro barras horizontales divididas en bloques estilo LCD (10 bloques por barra).
* Cambios dinámicos de color:
  * Verde: $> 60\%$
  * Amarillo: $30\% - 60\%$
  * Rojo: $< 30\%$ (o $> 70\%$ en hambre).

### 5.4. `ActionControls`
* Tres botones retro convexos y responsivos:
  * **Alimentar:** Icono de manzana/hamburguesa. Deshabilitado si la mascota está en estado fantasma.
  * **Jugar:** Icono de pelota o consola. Deshabilitado en estado fantasma o si está dormida/bloqueada.
  * **Baño:** Icono de esponja/bañera. Resalta con brillo si hay evento de suciedad.

### 5.5. `EventBadge` y Diálogo Dinámico
* Caja de texto tipo subtítulo en el marco inferior de la pantalla LCD.
* Efecto máquina de escribir (opcional o aparición instantánea para no retrasar ticks).
* Resalta peticiones urgentes: *"¡Atención: hora de comer requerida! Ignorado: 1/2"*.

### 5.6. `SummaryModal` (Pantalla de Reporte 24h)
* Tarjeta de evaluación con formato de diploma o boleta de calificaciones retro:
  * Grado final (`S`, `A`, `B`, `C`, `F` según promedio de felicidad y penalizaciones).
  * Desglose numérico: Comidas servidas, juegos completados, baños realizados.
  * Botón `[ Reiniciar Simulación ]`.

---

## 6. Microinteracciones y Animaciones

* **Tick Pulsing:** Cada tick de 6 segundos genera una ligera pulsación del reloj LCD.
* **Action Reaction:** Al presionar "Alimentar" o "Jugar", la mascota reproduce una breve animación de satisfacción de 800ms antes de volver a su estado normal.
* **Alerta de Muerte:** Al convertirse en fantasma, se reproduce un destello de pantalla ("flash blanco") y la paleta LCD muta a escala de grises fríos.

---

## 7. Responsividad y Accesibilidad

* **Contenedor adaptativo:** Máximo de 460px de ancho en pantallas de escritorio; escala al 95vw en móviles.
* **Accesibilidad (a11y):**
  * Soporte completo de teclado (`Tab` para navegar entre los 3 botones, `Enter` / `Espacio` para accionar).
  * Atributos `aria-live="polite"` en el contenedor de mensajes para lectores de pantalla.
  * Contraste mínimo de 4.5:1 verificado en todos los textos sobre el fondo LCD.