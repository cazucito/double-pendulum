---
description: Mantener CONTEXT.md y SESSION.md sincronizados para futuros Agentes AI.
---

Este flujo de trabajo garantiza que cualquier agente (Claude, Gemini, ChatGPT, etc.) que abra este repositorio pueda entender rápidamente el estado del proyecto y qué tareas están pendientes.

## 📋 Pasos sugeridos al iniciar sesión
1. **Leer contexto inicial:** El Agente DEBE leer `.agents/CONTEXT.md` y `.agents/SESSION.md` para asimilar la arquitectura y los objetivos actuales.
2. **Identificar la Tarea:** Consultar la sección `Pending Tasks` de `SESSION.md`.

## 🔄 Pasos durante la sesión
- **Bitácora de Sesión:** Cada vez que se completa una tarea significativa o se realiza un cambio arquitectónico, el Agente DEBE actualizar `SESSION.md`.
- **Evolución del Contexto:** Si se añaden nuevas tecnologías, patrones o decisiones de diseño permanentes, el Agente DEBE actualizar `CONTEXT.md`.

## 🏁 Pasos al finalizar sesión
1. **Resumen Final:** Actualizar la sección `Recent Changes` de `SESSION.md` con todo lo logrado.
2. **Próximos Pasos:** Limpiar y priorizar la sección `Pending Tasks` para el siguiente agente.
3. **Commit:** Se recomienda realizar un commit que incluya la actualización de estos archivos (e.g., `docs: update context and session docs`).

## 🚨 Reglas de Oro
- **No duplicar:** Si la información ya está en un `README.md` o `SDD.md` público, referénciala en `CONTEXT.md` en lugar de copiarla toda.
- **Ser conciso:** `SESSION.md` es para velocidad, `CONTEXT.md` es para entendimiento profundo.
- **Mantenerlo vivo:** Una documentación de sesión desactualizada es más peligrosa que ninguna.
