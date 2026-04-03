/**
 * js/themes.js
 * Configurador Visual (Data Warehouse).
 * Almacena de lado estático grandes diccionarios y métodos de mutación CSS puros ("Glassmorphism Themes").
 */

// Diccionario Base Estructurado en Memoria "Hardcoded" para mayor velocidad de lectura sin fetches AJAX.
export const THEMES = {
    cyberpunk: {
        bg1: '#060913', bg2: '#16123a',
        mass1: '#06b6d4', mass2: '#e879f9',
        trail: 'rgba(232, 121, 249, 0.4)',
        hueBase: 290
    },
    matrix: {
        bg1: '#010e06', bg2: '#000000',
        mass1: '#4ade80', mass2: '#22c55e',
        trail: 'rgba(34, 197, 94, 0.4)',
        hueBase: 140
    },
    solar: {
        bg1: '#1a0500', bg2: '#0a0000',
        mass1: '#fbbf24', mass2: '#ef4444',
        trail: 'rgba(239, 68, 68, 0.4)',
        hueBase: 15
    },
    synthwave: {
        bg1: '#17002e', bg2: '#0d0f26',
        mass1: '#00f5ff', mass2: '#ff00a0',
        trail: 'rgba(255, 0, 160, 0.4)',
        hueBase: 320
    }
};

/**
 * Función purificadora. Evalua el requerimiento, clava anclajes en las variables de estilo global `:root` CSS, 
 * y ensambla un objeto renderizador compatible destilado.
 * 
 * @param {string} themeId - ID String correlacionable
 * @param {Object} rendererConfigBase - Objeto primitivo destilado para inyección segura.
 * @returns {Object} Configuración nueva clonada preconfigurada para el Canvas 2D.
 */
export function applyThemeConfig(themeId, rendererConfigBase) {
    const t = THEMES[themeId];
    if (!t) return rendererConfigBase;
    
    // Mutación CSS Virtual (Runtime Dynamic Updates) para esquivar recargas del layout completo.
    document.documentElement.style.setProperty('--bg-color-1', t.bg1);
    document.documentElement.style.setProperty('--bg-color-2', t.bg2);
    
    // Spread operator robusto, reconstruye de arriba abajo conservando referencias profundas viejas innecesarias
    return {
        ...rendererConfigBase,
        colors: {
            ...rendererConfigBase.colors,
            mass1: t.mass1,
            mass2: t.mass2,
            trail: t.trail
        },
        hueBase: t.hueBase
    };
}
