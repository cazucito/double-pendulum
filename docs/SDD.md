# Software Design Document (SDD)
## Double-Pendulum Simulation

**Versión:** 1.0.0  
**Fecha:** 2026-03-21  
**Autor:** kaelaxiom  
**Estado:** Draft

---

## 1. Resumen Ejecutivo

### 1.1 Propósito
Este documento describe el diseño técnico de una simulación interactiva del sistema físico del doble péndulo, implementada como aplicación web cliente únicamente con tecnologías nativas del navegador.

### 1.2 Alcance
- Simulación 2D en tiempo real del doble péndulo
- Interfaz de usuario para control de parámetros físicos
- Visualización de trayectoria caótica

### 1.3 Definiciones
- **Doble péndulo:** Sistema mecánico con dos péndulos acoplados, exhibiendo comportamiento caótico
- **RK4:** Método de Runge-Kutta de 4to orden para integración numérica
- **Canvas API:** API de HTML5 para gráficos 2D rasterizados

---

## 2. Arquitectura del Sistema

### 2.1 Diagrama de Componentes

```
┌─────────────────────────────────────────┐
│              index.html                 │
│  ┌─────────────────────────────────┐    │
│  │           UI Layer              │    │
│  │  ┌─────────┐    ┌────────────┐  │    │
│  │  │Controls │    │  Canvas    │  │    │
│  │  │(HTML)   │    │  Display   │  │    │
│  │  └────┬────┘    └─────┬──────┘  │    │
│  └───────┼───────────────┼─────────┘    │
│          │               │              │
│  ┌───────┴───────────────┴─────────┐    │
│  │      Application Layer          │    │
│  │         (main.js)               │    │
│  │  - Event handling               │    │
│  │  - Animation loop               │    │
│  │  - State management             │    │
│  └───────────┬─────────────────────┘    │
│              │                          │
│  ┌───────────┴─────────────────────┐    │
│  │       Simulation Layer          │    │
│  │      (pendulum.js)              │    │
│  │  - Physics equations            │    │
│  │  - RK4 integration              │    │
│  │  - State vectors (θ, ω)         │    │
│  └───────────┬─────────────────────┘    │
│              │                          │
│  ┌───────────┴─────────────────────┐    │
│  │        Rendering Layer          │    │
│  │      (renderer.js)              │    │
│  │  - Canvas 2D context            │    │
│  │  - Drawing primitives           │    │
│  │  - Trail visualization          │    │
│  └─────────────────────────────────┘    │
└─────────────────────────────────────────┘
```

### 2.2 Stack Tecnológico

| Capa | Tecnología | Justificación |
|------|-----------|---------------|
| UI | HTML5 + CSS3 | Nativo, sin dependencias |
| Gráficos | Canvas 2D API | Performance adecuada para 2D, sin overhead de WebGL |
| Lógica | ES6+ JavaScript | Módulos nativos, sin bundler necesario |
| Física | RK4 (implementación propia) | Precisión vs. complejidad óptima |

---

## 3. Diseño de Datos

### 3.1 Modelo de Estado del Sistema

```javascript
// Estado del doble péndulo
interface PendulumState {
  // Ángulos (radianes)
  theta1: number;  // Primer péndulo
  theta2: number;  // Segundo péndulo
  
  // Velocidades angulares (rad/s)
  omega1: number;
  omega2: number;
}

// Parámetros físicos (constantes durante simulación)
interface PhysicsParams {
  m1: number;      // Masa primer péndulo (kg)
  m2: number;      // Masa segundo péndulo (kg)
  L1: number;      // Longitud primer péndulo (m)
  L2: number;      // Longitud segundo péndulo (m)
  g: number;       // Gravedad (m/s²)
}

// Configuración de visualización
interface RenderConfig {
  scale: number;        // Pixels por metro
  originX: number;      // Origen en canvas (px)
  originY: number;      // Origen en canvas (px)
  trailLength: number;  // Longitud de estela (puntos)
  colors: {
    rod1: string;
    rod2: string;
    mass1: string;
    mass2: string;
    trail: string;
  };
}
```

### 3.2 Ecuaciones de Movimiento

Las ecuaciones diferenciales del doble péndulo derivadas de Lagrangiana:

```
θ₁' = ω₁
θ₂' = ω₂

ω₁' = [ -g(2m₁ + m₂)sin(θ₁) - m₂gsin(θ₁ - 2θ₂) - 2sin(θ₁ - θ₂)m₂(ω₂²L₂ + ω₁²L₁cos(θ₁ - θ₂)) ]
      / [ L₁(2m₁ + m₂ - m₂cos(2θ₁ - 2θ₂)) ]

ω₂' = [ 2sin(θ₁ - θ₂)(ω₁²L₁(m₁ + m₂) + g(m₁ + m₂)cos(θ₁) + ω₂²L₂m₂cos(θ₁ - θ₂)) ]
      / [ L₂(2m₁ + m₂ - m₂cos(2θ₁ - 2θ₂)) ]
```

**Implementación:** Método RK4 con paso de tiempo variable para estabilidad.

---

## 4. Diseño de Interfaces

### 4.1 API de la clase PendulumSimulator

```javascript
class PendulumSimulator {
  constructor(params: PhysicsParams, initialState: PendulumState);
  
  // Avanza la simulación un paso de tiempo dt
  step(dt: number): PendulumState;
  
  // Obtiene posiciones cartesianas de las masas
  getPositions(): { x1, y1, x2, y2 };
  
  // Resetea al estado inicial
  reset(): void;
  
  // Modifica parámetros en caliente
  setParams(newParams: Partial<PhysicsParams>): void;
}
```

### 4.2 API del Renderer

```javascript
class PendulumRenderer {
  constructor(canvas: HTMLCanvasElement, config: RenderConfig);
  
  // Dibuja un frame completo
  render(state: PendulumState, trail: Array<{x, y}>): void;
  
  // Limpia el canvas
  clear(): void;
  
  // Actualiza configuración
  updateConfig(newConfig: Partial<RenderConfig>): void;
}
```

### 4.3 Eventos de UI

| Evento | Origen | Handler |
|--------|--------|---------|
| `input` | Slider masa 1 | `simulator.setParams({ m1: value })` |
| `input` | Slider masa 2 | `simulator.setParams({ m2: value })` |
| `input` | Slider longitud 1 | `simulator.setParams({ L1: value })` |
| `input` | Slider longitud 2 | `simulator.setParams({ L2: value })` |
| `click` | Botón reset | `simulator.reset()` |
| `click` | Botón pause/play | Toggle animation loop |

---

## 5. Diseño de Algoritmos

### 5.1 Loop de Animación

```
function animationLoop(timestamp):
    dt = (timestamp - lastTimestamp) / 1000  // segundos
    dt = min(dt, MAX_DT)                      // clamp para estabilidad
    
    // Actualizar física
    state = simulator.step(dt)
    positions = simulator.getPositions()
    
    // Actualizar trail
    trail.push(positions.mass2)
    if trail.length > config.trailLength:
        trail.shift()
    
    // Renderizar
    renderer.render(state, trail)
    
    lastTimestamp = timestamp
    requestAnimationFrame(animationLoop)
```

### 5.2 Integración RK4

```
function rk4Step(state, dt, derivatives):
    k1 = derivatives(state)
    k2 = derivatives(state + k1 * dt/2)
    k3 = derivatives(state + k2 * dt/2)
    k4 = derivatives(state + k3 * dt)
    
    return state + (k1 + 2*k2 + 2*k3 + k4) * dt/6
```

---

## 6. Estructura de Archivos

```
double-pendulum/
├── index.html              # Entry point y estructura UI
├── css/
│   └── style.css          # Estilos y layout responsivo
├── js/
│   ├── main.js            # Inicialización y event loop
│   ├── pendulum.js        # Clase PendulumSimulator
│   ├── renderer.js        # Clase PendulumRenderer
│   └── utils.js           # Helper functions (RK4, etc.)
├── docs/
│   ├── SDD.md             # Este documento
│   └── README.md          # Guía de usuario
└── assets/                # (vacío por ahora)
```

---

## 7. Consideraciones de Performance

### 7.1 Optimizaciones
- **Trail limitado:** Array circular de longitud fija
- **requestAnimationFrame:** Sincronizado con refresh rate del monitor
- **Math precalculado:** Sin/sin de ángulos calculados una vez por frame
- **No allocations en hot path:** Reutilizar objetos de estado

### 7.2 Targets
- **FPS:** 60 fps consistentes
- **Trail:** Hasta 1000 puntos sin drop de frames
- **Resolución:** Responsive hasta 4K

---

## 8. Testing Strategy

### 8.1 Unit Tests (futuro)
- Conservación de energía en simulación corta
- Precisión de RK4 vs. solución analítica simple
- Conversión coordenadas polares/cartesianas

### 8.2 Manual Tests
- Estabilidad con ángulos iniciales extremos
- Performance con trail largo
- Responsive en diferentes viewports

---

## 9. Riesgos y Mitigaciones

| Riesgo | Impacto | Mitigación |
|--------|---------|------------|
| Drift numérico a largo plazo | Medio | RK4 + paso de tiempo adaptativo |
| Performance en dispositivos móviles | Alto | Canvas optimizado, reducir trail si es necesario |
| Complejidad de ecuaciones | Bajo | Implementación gradual, verificar con referencias |

---

## 10. Referencias

1. Wikipedia - Double Pendulum: https://en.wikipedia.org/wiki/Double_pendulum
2. MyPhysicsLab - Double Pendulum: https://www.myphysicslab.com/pendulum/double-pendulum-en.html
3. RK4 Method: https://en.wikipedia.org/wiki/Runge%E2%80%93Kutta_methods

---

## 11. Historial de Cambios

| Versión | Fecha | Autor | Cambios |
|---------|-------|-------|---------|
| 1.0.0 | 2026-03-21 | kaelaxiom | Especificación inicial |
