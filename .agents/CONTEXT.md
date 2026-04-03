# Project Context: Double Pendulum Simulation

## 📌 Overview
Este proyecto es una simulación física interactiva de un **doble péndulo**, un sistema mecánico clásico conocido por su comportamiento caótico. Está diseñado con un enfoque pedagógico, priorizando el "Clean Code", el alto rendimiento y el uso de tecnologías web nativas.

## 🛠 Tech Stack
- **Core:** HTML5, CSS3 (Vanilla), ES6+ JavaScript.
- **Gráficos:** HTML5 Canvas 2D API (Optimizado).
- **Física:** Integración numérica Runge-Kutta 4 (RK4) con sub-stepping para estabilidad.
- **Diseño:** Glassmorphism moderno, temas visuales dinámicos.

## 🏗 Architecture
El sistema sigue una estricta separación de responsabilidades:
- **`ui.js` (Presentación):** Manejo del DOM y Event Listeners. Envía mensajes vía callbacks.
- **`engine.js` / `pendulum.js` (Negocio/Física):** Lógica matemática y estado del sistema. Independiente del navegador.
- **`renderer.js` (Gráfica):** Traducción de coordenadas abstractas a píxeles en Canvas.
- **`themes.js` (Estética):** Definición de paletas de colores y variables CSS `:root`.
- **`main.js` (Orquestador):** Punto de entrada que conecta todos los módulos y maneja el `requestAnimationFrame`.

## 📏 Core Principles
1. **Vanilla First:** Evitar librerías externas para mantener el proyecto ligero y educativo.
2. **Separación de Responsabilidad:** La física no sabe de Canvas, el Canvas no sabe de botones.
3. **Estabilidad Numérica:** Uso de `dt` controlado y sub-stepping local en el motor.
4. **Responsividad:** Soporte completo para escritorio y móviles (v1.1.0+).

## 🚀 Key Features
- **Efecto Mariposa:** Simulación de múltiples péndulos con variaciones mínimas.
- **Interacción Drag & Drop:** Manipulación directa de las masas.
- **Phase Space Graph:** Visualización de atractores del caos (Theta1 vs Theta2).
- **Temas Visuales:** Cyberpunk, Matrix, Solar Flare, Synthwave.
- **Métrica de Energía:** Monitor en tiempo real de energía cinética vs potencial.
