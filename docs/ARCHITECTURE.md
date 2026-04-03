# Arquitectura de Software y Clean Code

Este proyecto está construido con un enfoque pedagógico orientado a evitar uno de los problemas clásicos de los programadores principiantes en la web: **El "Main" Dios (God Object)** (un único archivo script que modifica el HTML, calcula matemáticas, pinta píxeles y maneja variables compartidas).

Para resolver esto, aplicamos dos principios vitales de la Ingeniería de Software: **Alta Cohesión** e **Inversión de Control**.

## 🏗️ Mapa de Capas (Módulos ES6)

El frontend está dividido en 5 actores encapsulados:

### 1. El Input: `ui.js` (Capa de Presentación)
Contiene la clase `UIController`.
- **Misión Clave:** Su única preocupación es interactuar con el DOM (Objetivos: selectores CSS, el objeto `document` y los `Event Listeners`). 
- **Patrón Aplicado:** Envuelve (oculta) los identificadores HTML. Usa un patrón de *Publisher* primitivo a través de llamadas de retorno (`callbacks`), enviando mensajes ciegos para que "alguien más" los atienda.
  
### 2. El Cerebro: `engine.js` + `pendulum.js` (Capa de Negocio)
Contiene las clases `SimulationEngine` y `PendulumSimulator`.
- **Misión Clave:** Guardar el estado real de la simulación. El Motor orquesta los arreglos (`arrays`) de Péndulos y se encarga de trocear los grandes intervalos de tiempo del procesador (`dt`) en intervalos enanos estables (sub-ticks de `0.005` segundos matemáticos). Si un clon Mariposa nace, este es el lugar. La clase Péndulo guarda las fórmulas trigonométricas inmutables. Nada aquí "conoce" la existencia de navegadores ni pantallas gráficas.

### 3. El Pintor: `renderer.js` (Capa Gráfica Abstracta)
Contiene la clase `PendulumRenderer`.
- **Misión Clave:** Asimilar datos brutos abstractos (Coordenadas XY puras y Array de rastros) para dibujar primitivas (Líneas y Círculos) muy eficientemente utilizando la Tarjeta de Video vía `HTML5 Canvas 2D`.
- **Optimización:** Transforma cientos de bucles generadores del neón brillante de la estela en **un solo trazado (Stroke)** dinámico, previniendo cuellos de botella severos.

### 4. La Llave: `themes.js` (Almacenamiento Estático)
- **Misión Clave:** Retirar los enormes diccionarios con datos "quemados en código" (hardcoded colors) sacándolos de en medio de las estructuras de lógica, creando APIs puros e inmutables que alteran el entorno CSS (`:root`) variables instantáneamente.

### 5. El Director: `main.js` (Entry Point / Orquestador)
- **Misión Clave:** Amarra los cables expuestos de todos los módulos anteriores. No contiene inteligencia propia, sino que: 
  - 1. Pregunta a la UI los valores por defecto. 
  - 2. Inserta la respuesta de la UI en el Engine.
  - 3. Comanda las reconfiguraciones de la UI al motor por Callback.
  - 4. Detona infinitamente el bucle maestro llamando a `requestAnimationFrame()` pasándole el testigo al `Engine` y luego al `Renderer`.

---

## 🧠 ¿Por qué diseñar así? Beneficios para los estudiantes

* **Testeabilidad (Testing):** Podemos crear Péndulos Matemáticos falsos que simulen correr durante 10,000 años para revisar inestabilidad, completamente en la Terminal, sin requerir un Explorador Gráfico (porque la matemática se liberó del Canvas en JavaScript).
* **Intercambiabilidad:** Si el día de mañana deseamos saltar a Gráficos 3D con `Three.js` o `WebGL`, simplemente destruimos y rehacemos la capa inferior del `renderer.js` sin tocar una sola coma de las ecuaciones físicas elaboradas.
* **Manejo Cognitivo:** Un alumno o colaborador entra al código, abre un archivo de 100 líneas dedicado enteramente al color (themes) y logra trabajar de inmediato sin miedo a romper un bucle `while` en cascada.
