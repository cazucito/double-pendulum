/**
 * js/main.js
 * Orquestador Global (Application Entry Point).
 * Utilizando patrones propios de la buena arquitectura, el Main simplemente ata las implementaciones.
 * No genera lógica propia, asume el rol de distribuidor del Tiempo y director de banda de los Componentes.
 */
import { UIController } from './ui.js';
import { SimulationEngine } from './engine.js';
import { PendulumRenderer } from './renderer.js';
import { applyThemeConfig } from './themes.js';
import { PhaseSpaceRenderer } from './phaseRenderer.js';

// Estado basal del controlador principal
let isPaused = false;
let timeScale = 1.0;
let lastTime = 0;

// ==========================================
// 1. INICIALIZACIONES DE ARQUITECTURA
// ==========================================
// Instanciamos el conjunto de forma aislada. Sus internals son fuertemente confidenciales.
const canvas = document.getElementById('simulationCanvas');
const ui = new UIController();
const engine = new SimulationEngine();
const renderer = new PendulumRenderer(canvas, { scale: 1, trailLength: 200 });
const phaseRenderer = new PhaseSpaceRenderer('phaseCanvas');

// Empuje primigenio para precargar las variables UI base de HTML5 en la máquina matemática.
timeScale = ui.getInitialSpeed();
engine.reset(ui.getInitialParams(), false);
renderer.config = applyThemeConfig(ui.getInitialTheme(), renderer.config);
Object.assign(renderer.config, ui.getInitialRenderConfig());

// ==========================================
// 2. ENLACE DE DATOS DE LA UI A LOS SISTEMAS
// ==========================================
// Funciona como ruters abstractos pasivos (Callback listeners de Inyección)
ui.onConfigChange((newOpts) => {
    Object.assign(renderer.config, newOpts);
    if(isPaused) renderFrame();
});

ui.onParamsChange((newParams) => {
    engine.updateParams(newParams);
});

ui.onSpeedChange((newSpeed) => {
    timeScale = newSpeed;
});

ui.onThemeChange((themeId) => {
    renderer.config = applyThemeConfig(themeId, renderer.config);
    if(isPaused) renderFrame(); // Forzar "Volver a Repintar" el estático canvas
});

ui.onActionClick((action) => {
    switch(action) {
        case 'pause':
            isPaused = !isPaused;
            ui.togglePauseBtn(isPaused);
            if (!isPaused) {
                // Recuperar desfases temporales evitando "saltos en el espacio" por culpa del Pausado.
                lastTime = performance.now();
                requestAnimationFrame(loop);
            }
            break;
        case 'reset':
            engine.reset(ui.getInitialParams(), false);
            phaseRenderer.clear();
            if (isPaused) renderFrame();
            break;
        case 'butterfly':
            engine.reset(ui.getInitialParams(), true);
            phaseRenderer.clear();
            if (isPaused) renderFrame();
            break;
    }
});

ui.onCanvasInteraction((type, clientX, clientY) => {
    if (type === 'down' || type === 'drag') {
        // Autopausa inteligente: Detener el estrés caótico para arrastrar plácidamente.
        if (!isPaused && type === 'down') {
            isPaused = true;
            ui.togglePauseBtn(isPaused);
        }

        // Traducción de Coordenadas Hardware(Screen) a Software(Canvas Matrix) a Math(Space)
        const rect = canvas.getBoundingClientRect();
        const x = (clientX - rect.left - renderer.originX) / renderer.config.scale;
        const y = (clientY - rect.top - renderer.originY) / renderer.config.scale;

        // Inyección imperativa (Inverse Kinematics)
        engine.interactiveDrag(x, y);
        
        // Destrucción temporal de gráficos obsoletos
        engine.clearTrails();
        phaseRenderer.clear();
        
        // Refresh Inmediato
        renderFrame();
    } else if (type === 'up') {
        engine.releaseDrag();
    }
});


// ==========================================
// 3. EXECUCIÓN Y CICLO DE VIDA (GAME LOOP)
// ==========================================

/** Acople seguro de la gráfica (Llama de modo transparente al componente rendering). */
function renderFrame() {
    renderer.render(engine.simulators, engine.trails, engine.params);
    
    // Extracción analítica segura pidiendo la lectura al objeto líder
    const primarySim = engine.simulators[0];
    const energy = primarySim.getEnergy();
    
    // Broadcast del estado hacia widgets especializados
    ui.updateEnergyDashboard(energy);
    phaseRenderer.render(primarySim.theta1, primarySim.theta2, renderer.config.hueBase);
}

/** 
 * Iteración constante encadenada de navegador para 60FPS. 
 * Reajusta y manda las actualizaciones temporales para luego redibujar. 
 */
function loop(timestamp) {
    if (isPaused) return;

    if (!lastTime) lastTime = timestamp; // Seguro contra frame inaugural nulo en carga DOM
    let realDt = (timestamp - lastTime) / 1000;
    lastTime = timestamp;

    engine.tick(realDt, timeScale);
    renderFrame();

    // Invoca recursión asíncrona delegando control al monitor de render web (vsync seguro)
    requestAnimationFrame(loop);
}

// ARRANQUE: "Pintura base 0" para que no parta sobre lienzo en blanco y kick off ciclo vital.
renderFrame();
lastTime = performance.now();
requestAnimationFrame(loop);
