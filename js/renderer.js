/**
 * js/renderer.js
 * Capa de Presentación Visual (Canvas).
 * Exclusivamente dedicada a trasladar data numérica matemática pura hacia píxeles en pantalla.
 * No debe poseer nunca lógica de física ni modificar el estado interno.
 */
export class PendulumRenderer {
    /**
     * @param {HTMLCanvasElement} canvas - Referencia al elemento DOM canvas donde se pintará.
     * @param {Object} config - Configuración base con colores y ajustes estéticos.
     */
    constructor(canvas, config) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.config = {
            scale: 1, 
            trailLength: 300, 
            colors: {
                rod1: 'rgba(255, 255, 255, 0.15)',
                rod2: 'rgba(255, 255, 255, 0.15)',
                mass1: '#06b6d4', 
                mass2: '#e879f9', 
                trail: '#e879f9'
            },
            ...config
        };
        
        // El resize inicializa dinámicamente el canvas al tamaño real de pantalla
        this.resize();
        window.addEventListener('resize', this.resize.bind(this));
    }

    /**
     * Ajusta la matriz del canvas si el usuario cambia el tamaño de la ventana.
     * El origen de coordenadas X e Y se calcula para centrar siempre la gravedad teórica.
     */
    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.originX = this.canvas.width / 2;
        
        // En móviles/tablets (ancho <= 768), subimos el origen para dejar espacio al panel inferior.
        if (window.innerWidth <= 768) {
            this.originY = this.canvas.height / 5;
        } else {
            this.originY = this.canvas.height / 3;
        }
    }

    clear() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    /**
     * Pinta el rastro histórico acumulado.
     * Implementa una Optimización Crítica: Dibuja todo utilizando un único trazo (stroke) 
     * continuo, previniendo cuellos de botella en la Tarjeta de Video.
     * 
     * @param {Array<{x, y}>} trail - Array de posiciones pasadas.
     * @param {number|undefined} hueShift - Desfase de color usado en modo Mariposa para diferenciar clones.
     */
    drawTrail(trail, hueShift) {
        if (trail.length < 2) return;

        // Tolerancia geométrica inter-versiones (Previene crash si quedó basura antigua temporal tras refactor)
        if (trail[0].x !== undefined) return;

        if (this.config.showTrail1) {
            this._drawPath(trail, p => p.m1, hueShift, true);
        }
        
        // Masa 2 por default es visible a menos que expícitamente se apague
        if (this.config.showTrail2 !== false) { 
            this._drawPath(trail, p => p.m2, hueShift, false);
        }
    }

    _drawPath(trail, getPointFn, hueShift, isMass1) {
        const ctx = this.ctx;
        const x0 = this.originX;
        const y0 = this.originY;
        
        ctx.beginPath();
        const start = getPointFn(trail[0]);
        if (!start) return;
        ctx.moveTo(x0 + start.x * this.config.scale, y0 + start.y * this.config.scale);
        
        ctx.lineJoin = 'round';
        ctx.lineCap = 'round';
        
        const baseHue = this.config.hueBase !== undefined ? this.config.hueBase : 290;
        
        if (isMass1) {
            ctx.shadowBlur = 8;
            ctx.lineWidth = 1.0;
            const hue = hueShift !== undefined ? (baseHue - 40 + hueShift * 5) : baseHue - 40;
            // Genera la refracción del trazo de Masa 1 extrapolada del Color 1 Original
            const color = hueShift !== undefined ? `hsla(${hue}, 80%, 70%, 0.15)` : this.config.colors.mass1; 
            ctx.shadowColor = color;
            ctx.strokeStyle = color;
            ctx.globalAlpha = 0.3; // Mucho más tenue que el principal
        } else {
            ctx.shadowBlur = 12;
            ctx.lineWidth = 2.0;
            const colorBase = hueShift !== undefined ? `hsl(${baseHue + hueShift * 5}, 80%, 70%)` : this.config.colors.trail;
            ctx.shadowColor = colorBase;
            ctx.strokeStyle = hueShift !== undefined ? `hsla(${baseHue + hueShift * 5}, 80%, 70%, 0.4)` : (this.config.colors.trail || `rgba(232, 121, 249, 0.4)`);
            ctx.globalAlpha = 1.0;
        }

        for (let i = 1; i < trail.length; i++) {
            const point = getPointFn(trail[i]);
            if (!point) continue; 
            ctx.lineTo(x0 + point.x * this.config.scale, y0 + point.y * this.config.scale);
        }
        ctx.stroke(); 
        
        // Reset effects vitales para no contaminar otras capas
        ctx.shadowBlur = 0;
        ctx.globalAlpha = 1.0;
    }

    /**
     * Dibuja los cuerpos sólidos físicos, cuerdas (rods) y masas.
     */
    drawPendulum(positions, params) {
        const ctx = this.ctx;
        const { m1, m2 } = params;

        // Limita visualmente el tamaño para que una masa inmensa no ciegue la pantalla completa
        const r1 = Math.max(5, Math.min(25, m1 * 0.6));
        const r2 = Math.max(5, Math.min(25, m2 * 0.6));

        // Proyección de espacio canónico abstracto a espacio local real (+ offset del centro superior)
        const x0 = this.originX;
        const y0 = this.originY;
        const cx1 = x0 + positions.x1 * this.config.scale;
        const cy1 = y0 + positions.y1 * this.config.scale;
        const cx2 = x0 + positions.x2 * this.config.scale;
        const cy2 = y0 + positions.y2 * this.config.scale;

        // Cuerda 1 (Origen -> Masa 1)
        ctx.beginPath();
        ctx.moveTo(x0, y0);
        ctx.lineTo(cx1, cy1);
        ctx.strokeStyle = this.config.colors.rod1;
        ctx.lineWidth = 2;
        ctx.stroke();

        // Cuerda 2 (Masa 1 -> Masa 2)
        ctx.beginPath();
        ctx.moveTo(cx1, cy1);
        ctx.lineTo(cx2, cy2);
        ctx.strokeStyle = this.config.colors.rod2;
        ctx.lineWidth = 2;
        ctx.stroke();

        // Masa 1
        ctx.beginPath();
        ctx.arc(cx1, cy1, r1, 0, Math.PI * 2);
        ctx.fillStyle = this.config.colors.mass1;
        ctx.fill();

        // Masa 2
        ctx.beginPath();
        ctx.arc(cx2, cy2, r2, 0, Math.PI * 2);
        ctx.fillStyle = this.config.colors.mass2;
        ctx.fill();
    }

    /**
     * Método público central orquestador llamado 60 veces por segundo.
     */
    render(simulators, trails, paramsBase) {
        this.clear();
        
        // EFECTO TÉCNICO DE MEZCLA (Blend Mode):
        // 'screen' hace que donde convergen varias líneas semi-transparentes de varios clones,
        // sus colores de luz se subcrean superponiéndose casi blanco (simulando luz aditiva fuerte).
        this.ctx.globalCompositeOperation = 'screen';
        for (let i = 0; i < trails.length; i++) {
            // El operador ternario (?) asume `i` solo como shift cromático si hay más de 1 rastro gráfico.
            this.drawTrail(trails[i], simulators.length > 1 ? i : undefined);
        }
        
        // Se revierte a 'source-over' (Pintura tradicional sobre base) para dibujar sólidos.
        this.ctx.globalCompositeOperation = 'source-over';
        for (let i = 0; i < simulators.length; i++) {
            this.drawPendulum(simulators[i].getPositions(), paramsBase);
        }

        // Detalle cosmético central rígido inamovible (punto anclaje)
        this.ctx.beginPath();
        this.ctx.arc(this.originX, this.originY, 5, 0, Math.PI * 2);
        this.ctx.fillStyle = '#fff';
        this.ctx.fill();
    }
}
