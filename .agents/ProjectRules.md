---
description: Reglas e integraciones estables sobre el Refactoring arquitectónico del Caos.
---
# Directrices para la IA y Agentes

Al editar este repositorio, por favor cumple estrictamente la siguiente convención:

1. **Vainilla First:** El software es educativo y de máxima performance. Abstente completamente de importar librerías ajenas (React, P5.js, Three.js) a no ser que el perfil de requerimiento se altere explícitamente. Las API deben ser siempre `HTML5 Canvas 2D` y `ES6 Modules`.
2. **Separación de Responsabilidad (Clean Code):**
   - Lógica trigonométrica / RK4 -> `js/utils.js` o `js/pendulum.js`. Nunca en UI.
   - Peticiones del DOM / Listeners -> Siempre encapsuladas en `js/ui.js` mediante Event Emitters ciegos.
   - Modificaciones Visuales Canvas -> Exclusivamente en `js/renderer.js`. No mutar objetos aquí.
3. **Flujo Numérico:** Si el usuario solicita incrementos de velocidad abruptos, recuerda usar la técnica de _Sub-stepping_ localizada en `js/engine.js` para fraccionar `dt` y no corromper la estabilidad del RK4.
4. **Mantenimiento de Contexto IA:** Este repositorio utiliza `.agents/CONTEXT.md` y `.agents/SESSION.md` para coordinar el trabajo entre diferentes IAs. Es OBLIGATORIO seguir el flujo de trabajo definido al iniciar y finalizar cualquier tarea en `.agents/workflows/ai-context-sync.md`.
   - **Regla de Auto-Check:** Si se han editado más de 3 archivos durante una ráfaga de trabajo, el Agente DEBE sincronizar `SESSION.md` antes de entregar su respuesta final al usuario.
