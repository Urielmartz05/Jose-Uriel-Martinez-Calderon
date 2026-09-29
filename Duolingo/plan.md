# Plan de Especificación y Arquitectura: MathLingo (Duolingo Matemático)

## 1. Visión General del Proyecto
Aplicación web interactiva de aprendizaje gamificado de matemáticas nivel 6.º de primaria inspirada en la dinámica visual y de progreso de Duolingo. Desarrollada con **Next.js (App Router)**, **React**, **HTML5**, **CSS/Tailwind CSS**, y persistencia relacional administrada mediante **Sequelize ORM** (compatible con SQLite para desarrollo rápido y PostgreSQL/MySQL para producción).

---

## 2. Requerimientos Funcionales

| ID | Requerimiento | Descripción | Criterio de Aceptación |
| :--- | :--- | :--- | :--- |
| **RF-01** | Mapa de Rutas (Círculos) | Pantalla principal con ruta de aprendizaje visual dividida en 5 nodos circulares principales: Sumas, Restas, Multiplicaciones, Divisiones y Problemas Razonados Cortos. | Cada círculo muestra icono, título temático, estado (bloqueado/desbloqueado/completado) y porcentaje de avance. |
| **RF-02** | Banco de Preguntas | 20 preguntas matemáticas calibradas para sexto de primaria por cada temática (100 preguntas en total). | Cada ítem contiene enunciado, 4 opciones mutuamente excluyentes, índice de respuesta correcta y retroalimentación breve. |
| **RF-03** | Motor de Trivia y Feedback | Selección de respuesta única con confirmación inmediata. | Botón "Comprobar". Cambio reactivo de estado visual (verde para acierto con sonido/animación, rojo para error con respuesta correcta revelada). |
| **RF-04** | Indicador de Avance | Barra superior persistente con indicador ordinal: pregunta actual vs total (`X/20`) y barra de progreso porcentual. | La barra avanza de forma proporcional tras responder cada pregunta. |
| **RF-05** | Sistema de Vidas (Corazones) | Contador de 3 vidas. Cada fallo descuenta 1 corazón. | Si las vidas llegan a 0, se congela la sesión actual y se activa la pantalla de "Sin Vidas / Game Over" con opción de reiniciar. |
| **RF-06** | Pantalla de Resumen Final | Al completar las 20 preguntas o perder las vidas: cálculo de estadísticas. | Muestra: Puntuación total (XP), respuestas correctas/incorrectas, precisión porcentual ($\% = \frac{\text{Aciertos}}{20} \times 100$) y botón de reintento. |
| **RF-07** | Autenticación de Usuarios | Sistema de Login y Registro (email/usuario + contraseña hasheada). | Gestión de sesión protegida mediante JWT/cookies para persistir progreso individual. |
| **RF-08** | Persistencia con Sequelize | Almacenamiento en base de datos de usuarios, sesiones completadas, vidas restantes, precisión y estado de cada círculo. | Endpoints REST en Next.js para sincronizar estado entre cliente y servidor. |

---

## 3. Modelo de Datos y Esquema Sequelize

### 3.1. Definición de Entidades

```text
┌─────────────────┐       1:N       ┌─────────────────────┐
│      User       ├────────────────►│    UserProgress     │
│─────────────────│                 │─────────────────────│
│ id (UUID, PK)   │                 │ id (UUID, PK)       │
│ username        │                 │ userId (FK)         │
│ email           │                 │ categoryId (FK)     │
│ password        │                 │ completed (Boolean) │
│ totalXp         │                 │ highscore           │
│ createdAt       │                 │ bestAccuracy        │
└────────┬────────┘                 └─────────────────────┘
         │ 1:N
         ▼
┌─────────────────────────┐
│       GameSession       │
│─────────────────────────│
│ id (UUID, PK)           │
│ userId (FK)             │
│ categoryId              │
│ score                   │
│ correctCount            │
│ incorrectCount          │
│ percentage              │
│ heartsLeft              │
│ finishedAt              │
└─────────────────────────┘
```

### 3.2. Definición de Modelos Sequelize (`src/db/models/`)

```typescript
// src/db/models/User.ts
import { DataTypes, Model } from 'sequelize';
import sequelize from '../connection';

export class User extends Model {
  public id!: string;
  public username!: string;
  public email!: string;
  public password!: string;
  public totalXp!: number;
}

User.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  username: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
  },
  email: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true,
    validate: { isEmail: true },
  },
  password: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  totalXp: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  }
}, { sequelize, modelName: 'User' });

// src/db/models/UserProgress.ts
export class UserProgress extends Model {
  public id!: string;
  public userId!: string;
  public categoryId!: string; // 'addition' | 'subtraction' | 'multiplication' | 'division' | 'word_problems'
  public completed!: boolean;
  public highscore!: number;
  public bestAccuracy!: number;
}

UserProgress.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  categoryId: {
    type: DataTypes.ENUM('addition', 'subtraction', 'multiplication', 'division', 'word_problems'),
    allowNull: false,
  },
  completed: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  highscore: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  bestAccuracy: {
    type: DataTypes.FLOAT,
    defaultValue: 0.0,
  }
}, { sequelize, modelName: 'UserProgress' });
```

---

## 4. Estructura de Directorios del Proyecto

```text
src/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   └── register/page.tsx
│   ├── (dashboard)/
│   │   ├── page.tsx                      # Vista de nodos circulares (Ruta de aprendizaje)
│   │   └── learn/[category]/page.tsx     # Vista de juego interactivo (20 preguntas)
│   ├── api/
│   │   ├── auth/
│   │   │   ├── login/route.ts
│   │   │   └── register/route.ts
│   │   ├── progress/route.ts             # Obtener y actualizar avance
│   │   └── session/finish/route.ts       # Registrar resultado de sesión
│   ├── layout.tsx
│   └── globals.css
├── components/
│   ├── game/
│   │   ├── HeartCounter.tsx              # Render de vidas (corazones SVG)
│   │   ├── ProgressBar.tsx               # Avance 1 a 20 con barra fluida
│   │   ├── QuestionCard.tsx              # Pregunta y 4 botones de opciones
│   │   ├── ActionFooter.tsx              # Botón "Comprobar", feedback verde/rojo
│   │   └── GameOverModal.tsx             # Resumen de aciertos, %, XP y reintento
│   ├── path/
│   │   ├── PathNode.tsx                  # Botón circular temático estilo Duolingo
│   │   └── LearningPath.tsx              # Conexión vertical de los 5 círculos
│   └── ui/
│       └── Button.tsx
├── context/
│   ├── AuthContext.tsx                   # Sesión y usuario activo
│   └── GameContext.tsx                   # Estado del juego en tiempo real
├── db/
│   ├── connection.ts                     # Instancia Singleton de Sequelize
│   ├── index.ts                          # Asociaciones y sync
│   └── models/                           # User, UserProgress, GameSession
├── data/
│   └── questions.ts                      # 100 preguntas de 6to de primaria tipadas
└── types/
    ├── game.ts                           # Question, Category, SessionStats
    └── user.ts                           # AuthUser, Progress
```

---

## 5. Diseño del Banco de Preguntas (Nivel 6.º Primaria)

Se generan 20 preguntas por cada nodo temático con complejidad acorde al currículo escolar:
1. **Sumas:** Operaciones con enteros de 4 a 5 cifras, suma de números con decimales (ej. $145.85 + 23.45$) y suma de fracciones de distinto denominador (ej. $\frac{2}{3} + \frac{1}{4}$).
2. **Restas:** Restas con transformación, restas de números decimales y resta de fracciones mixtas.
3. **Multiplicaciones:** Multiplicación de 3 cifras por 2 cifras, multiplicaciones con punto decimal (ej. $24.5 \times 3.2$) y multiplicación fraccionaria.
4. **Divisiones:** Divisiones con divisor de 2 cifras, divisiones con cociente decimal y divisiones con dividendo fraccionario.
5. **Problemas Cortos:** Situaciones contextuales de cálculo de proporciones, porcentajes de descuento ($15\%$, $25\%$), perímetros/áreas y regla de tres simple.

---

## 6. Máquina de Estados del Bucle de Pregunta

```text
[ESTADO: INICIAL / PREGUNTA CARGADA]
       │
       ▼ (Usuario selecciona 1 de las 4 opciones)
[OPCIÓN SELECCIONADA] ──► Habilita botón "COMPROBAR"
       │
       ▼ (Clic en "COMPROBAR")
[EVALUANDO RESPUESTA]
       ├─► ¿Es Correcta?
       │     └─► Audio de éxito + Banner Verde + Aumenta Correctas + Suma XP
       │
       └─► ¿Es Incorrecta?
             └─► Audio de error + Banner Rojo (Muestra respuesta correcta)
                 └─► Pierde 1 Corazón (vidas = vidas - 1)
       │
       ▼ (Clic en "CONTINUAR")
¿Quedan vidas (vidas > 0) y hay más preguntas (index < 19)?
       ├─► SÍ: Siguiente pregunta (index = index + 1)
       └─► NO:
             ├─ Si vidas == 0 ──► Modal GAME OVER (Resumen prematuro + Reintentar)
             └─ Si index == 19 ──► Modal VICTORIA / COMPLETADO (Resumen final + XP a BD)
```

---

## 7. Fases de Implementación Técnica

- **Fase 1: Capa de Base de Datos y Autenticación**
  - Conexión de Sequelize con sincronización automática (`sequelize.sync()`).
  - Modelos de `User`, `UserProgress` y `GameSession`.
  - Rutas de API `/api/auth/register` y `/api/auth/login` con bcryptjs.
- **Fase 2: Catálogo de Preguntas y Estado de Juego**
  - Archivo `src/data/questions.ts` con 20 preguntas completas por temática.
  - Implementación de `GameContext` (manejo de vidas, índice actual, puntaje, respuestas seleccionadas).
- **Fase 3: Componentes de Juego y Feedback Interactivo**
  - Componentes de vidas (`HeartCounter`), barra de progreso (`ProgressBar`) y selección de 4 opciones (`QuestionCard`).
  - Animaciones de retroalimentación inmediata (estilo Duolingo con banner inferior y botón continuar).
- **Fase 4: Ruta de Aprendizaje (5 Círculos)**
  - Componente de ruta escalonada con los 5 nodos circulares interactivos con indicadores de porcentaje y candado si está bloqueado.
- **Fase 5: Métricas Finales y Persistencia**
  - Cálculo de precisión ($\%$), resumen detallado de aciertos/errores y persistencia del progreso hacia la base de datos vía Sequelize.