/**
 * js/ui.js
 * Capa de Interacción DOM (Presentación).
 * Totalmente ajena a las fórmulas matemáticas; su única preocupación es recolectar entradas
 * y despachar notificaciones (Observer Pattern minimalista) garantizando alta separación de responsabilidad.
 */

export class UIController {
    constructor() {
        // Objeto de diccionarios referenciales. Evita llamadas redundantes por el sistema render.
        this.inputs = {
            m1: document.getElementById('m1'),
            m2: document.getElementById('m2'),
            l1: document.getElementById('l1'),
            l2: document.getElementById('l2'),
            g: document.getElementById('g'),
            speed: document.getElementById('speed')
        };
        
        this.controls = {
            theme: document.getElementById('theme-select'),
            pauseBtn: document.getElementById('btn-pause'),
            resetBtn: document.getElementById('btn-reset'),
            butterflyBtn: document.getElementById('btn-butterfly'),
            energyT: document.getElementById('energy-t'),
            energyV: document.getElementById('energy-v'),
            energyTot: document.getElementById('energy-total'),
            trail1Toggle: document.getElementById('trail1-toggle'),
            trail2Toggle: document.getElementById('trail2-toggle')
        };
        
        // Punteros de callbacks inyectables ("Event emitters" caseros).
        this.onParamsChangeCb = null;
        this.onThemeChangeCb = null;
        this.onActionCb = null;
        this.onSpeedChangeCb = null;
        this.onCanvasInteractionCb = null;
        this.onConfigChangeCb = null;

        this._bindEvents(); // Autoinvocado protegido de setup.
    }

    /**
     * Getters puros orientados a la recolección "Zero-day". Útiles durante la instanciación principal.
     */
    getInitialParams() {
        return {
            m1: parseFloat(this.inputs.m1.value),
            m2: parseFloat(this.inputs.m2.value),
            L1: parseFloat(this.inputs.l1.value),
            L2: parseFloat(this.inputs.l2.value),
            g: parseFloat(this.inputs.g.value) * 9.8 // Transfiriendo "unidad base" G a métricas correctas (m/s2)
        };
    }
    
    getInitialSpeed() {
        return parseFloat(this.inputs.speed.value);
    }

    getInitialTheme() {
        return this.controls.theme.value;
    }

    // Encapsulación de Setters para subscripción a variables (Suscripción Publisher/Subscriber).
    onParamsChange(callback) { this.onParamsChangeCb = callback; }
    onThemeChange(callback) { this.onThemeChangeCb = callback; }
    onActionClick(callback) { this.onActionCb = callback; }
    onSpeedChange(callback) { this.onSpeedChangeCb = callback; }
    onCanvasInteraction(callback) { this.onCanvasInteractionCb = callback; }
    onConfigChange(callback) { this.onConfigChangeCb = callback; }

    getInitialRenderConfig() {
        return {
            showTrail1: this.controls.trail1Toggle ? this.controls.trail1Toggle.checked : false,
            showTrail2: this.controls.trail2Toggle ? this.controls.trail2Toggle.checked : true
        };
    }

    /**
     * Ocultamiento intencional de la aglomeración fea de EventListeners clásica de JS en el DOM.
     * Solo las mutaciones abstractas consiguen "escapar" esta clase en los despachadores delegados.
     */
    _bindEvents() {
        const paramKeys = ['m1', 'm2', 'l1', 'l2', 'g'];
        paramKeys.forEach(inputKey => {
            this.inputs[inputKey].addEventListener('input', (e) => {
                const val = parseFloat(e.target.value);
                this._updateValText(inputKey, val); // Alteración cosmética intra-bloque UI
                
                // Disparo de estado limpio hacia receptores externos.
                if (this.onParamsChangeCb) {
                    // Mapeo adaptativo desde string plano del ID hasta variable canónica en el Motor Core.
                    const engineKey = inputKey.toUpperCase() === 'L1' || inputKey.toUpperCase() === 'L2' ? inputKey.toUpperCase() : inputKey;
                    this.onParamsChangeCb({
                        [engineKey]: inputKey === 'g' ? val * 9.8 : val
                    });
                }
            });
        });

        // Eventos únicos independientes
        this.inputs.speed.addEventListener('input', (e) => {
            const val = parseFloat(e.target.value);
            this._updateValText('speed', val.toFixed(1));
            if (this.onSpeedChangeCb) this.onSpeedChangeCb(val);
        });

        this.controls.theme.addEventListener('change', (e) => {
            if (this.onThemeChangeCb) this.onThemeChangeCb(e.target.value);
        });

        // Acople ciego sobre enrutadores String hacia la macro-máquina.
        this.controls.pauseBtn.addEventListener('click', () => {
            if (this.onActionCb) this.onActionCb('pause');
        });

        this.controls.resetBtn.addEventListener('click', () => {
            if (this.onActionCb) this.onActionCb('reset');
        });

        this.controls.butterflyBtn.addEventListener('click', () => {
            if (this.onActionCb) this.onActionCb('butterfly');
        });

        const dispatchRenderConfigChange = () => {
             if (this.onConfigChangeCb) {
                 this.onConfigChangeCb({
                     showTrail1: this.controls.trail1Toggle.checked,
                     showTrail2: this.controls.trail2Toggle.checked
                 });
             }
        };
        
        if(this.controls.trail1Toggle) this.controls.trail1Toggle.addEventListener('change', dispatchRenderConfigChange);
        if(this.controls.trail2Toggle) this.controls.trail2Toggle.addEventListener('change', dispatchRenderConfigChange);

        // Eventos del Canvas para Drag & Drop (Mouse)
        const canvas = document.getElementById('simulationCanvas');
        let isDragging = false;
        
        canvas.addEventListener('mousedown', (e) => {
            isDragging = true;
            if (this.onCanvasInteractionCb) this.onCanvasInteractionCb('down', e.clientX, e.clientY);
        });
        
        canvas.addEventListener('mousemove', (e) => {
            if (isDragging && this.onCanvasInteractionCb) {
                this.onCanvasInteractionCb('drag', e.clientX, e.clientY);
            }
        });
        
        window.addEventListener('mouseup', () => {
            if(isDragging) {
                isDragging = false;
                if (this.onCanvasInteractionCb) this.onCanvasInteractionCb('up', 0, 0);
            }
        });
    }

    /** Helper privado */
    _updateValText(id, val) {
        document.getElementById(`${id}-val`).innerText = val;
    }
    
    /** Expone modificación segura de aspecto exterior sin exponer IDs */
    togglePauseBtn(isPaused) {
        this.controls.pauseBtn.innerText = isPaused ? 'Resume' : 'Pause';
        this.controls.pauseBtn.classList.toggle('active', isPaused);
    }

    /**
     * Actualiza el widget de Métrica de Energía.
     * Renderiza en porcentajes relativos dinámicos en base a "Energía Absoluta".
     */
    updateEnergyDashboard(energy) {
        const total = Math.abs(energy.T) + Math.abs(energy.V);
        let pt = 50, pv = 50;
        
        // Prevención division-by-zero
        if(total > 0) {
            pt = (Math.abs(energy.T) / total) * 100;
            pv = (Math.abs(energy.V) / total) * 100;
        }
        
        if (this.controls.energyT && this.controls.energyV) {
            this.controls.energyT.style.width = `${pt}%`;
            this.controls.energyV.style.width = `${pv}%`;
            // Muestra J o aproximación abstracta base del sistema físico
            this.controls.energyTot.innerText = energy.E.toFixed(1);
        }
    }
}
