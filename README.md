# 🦋 Simulador de Doble Péndulo y Teoría del Caos

Bienvenido al proyecto interactivo de **Doble Péndulo Físico**. Este repositorio contiene una simulación matemática avanzada construida estrictamente con **Vanilla JavaScript (ES6)** puro (sin frameworks de interfaz ni librerías gráficas), pensada explícitamente para su estudio en cursos de programación e ingeniería de software.

## 🚀 Características Principales

*   **Física Realista (Mecánica Lagrangiana):** Simulación precisa sustentada en métodos avanzados de aproximación diferencial.
*   **Modo "Efecto Mariposa":** Instancia múltiples simuladores divergentes con diferencias angulares microscópicas (`0.0001` radianes) para ilustrar visualmente la **Teoría del Caos**.
*   **Motor Gráfico HTML5 Canvas:** Renderizador ultra-optimizado usando _compositing_ (`screen`) de 60fps constantes incluso con 10 o más clones graficando estelas caóticas intensas en simultáneo.
*   **Temas Visuales (Glassmorphism):** Arquitectura visual generativa equipada con temas (`Cyberpunk`, `Synthwave`, `The Matrix` y `Solar Flare`).
*   **Patrones de Arquitectura Limpia:** Construido mediante _Separación de Responsabilidades (SoC)_ con Módulos ES6 en distintas capas lógicas (Orquestador, UI, Físicas, Render).

---

## 📦 Cómo Ejecutar el Proyecto

Este proyecto no requiere ser compilado (no usa Webpack ni Babel), dado que utiliza módulos ES nativos y CSS crudo. Solo necesitas servir la carpeta estáticamente.

1. Instala [Node.js](https://nodejs.org/).
2. Levanta un servidor directo en la raíz usando `npx`:
   ```bash
   npx serve ./
   ```
3. Abre el enlace brindado, frecuentemente `http://localhost:3000`.

---

## 📚 Documentación Técnica (Guías de Estudio)

Este repositorio actúa como un banco de estudios y recursos educativos para Programadores. Adéntrate en su estructura para aprender cómo se diseñó bajo el capó:

1. [**Arquitectura de Software (`docs/ARCHITECTURE.md`)**](./docs/ARCHITECTURE.md): Conoce cómo pasamos de un script masivo (monolito) a un diseño orientado a componentes separados y altamente testeables (Clean Code).
2. [**Física y Caos (`docs/PHYSICS_MATH.md`)**](./docs/PHYSICS_MATH.md): Descubre la matemática real empleada. Analiza por qué usamos la integración predictiva RK4 sobre "Euler" básico para mantener estables sistemas no-lineales.
3. [**Documento de Diseño del Software (SDD)**](./docs/SDD.md): Especificación técnica exhaustiva de cada API y componente del repositorio.

---

> _"El aleteo de una mariposa en Brasil puede desatar un tornado en Texas."_ - **Edward Lorenz** (Pionero de la Teoría del Caos).
