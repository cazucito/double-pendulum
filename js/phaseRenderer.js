/**
 * js/phaseRenderer.js
 * Visualizador Topológico (Phase Space).
 * Gráfica el entrelazamiento fractal infinito en el que recaen las coordenadas abstractas Theta1 y Theta2.
 */
export class PhaseSpaceRenderer {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        if(!this.canvas) return;
        this.ctx = this.canvas.getContext('2d');
        this.width = this.canvas.width;
        this.height = this.canvas.height;
        this.history = []; // Registra el vector direccional para dibujar contínuo
    }

    render(theta1, theta2, themeHueBase = 140) {
        if(!this.ctx) return;
        
        // Modulación Trigonométrica Segura:
        // Evita que un péndulo que dé millones de vueltas rompa la matriz; encierra todo siempre entre [-Pi, Pi]
        const normTheta1 = ((theta1 + Math.PI) % (2 * Math.PI)) - Math.PI;
        const normTheta2 = ((theta2 + Math.PI) % (2 * Math.PI)) - Math.PI;

        const x = ((normTheta1 + Math.PI) / (2 * Math.PI)) * this.width;
        const y = ((normTheta2 + Math.PI) / (2 * Math.PI)) * this.height;

        this.history.push({x, y});
        if(this.history.length > 500) this.history.shift(); // Precisión gráfica fractal

        // Filtro de degradado tipo "Osciloscopio Viejo": Pinta semitransparente cada frame
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
        this.ctx.fillRect(0, 0, this.width, this.height);

        // Renderizado del trazado de atractor
        this.ctx.beginPath();
        for(let i=0; i<this.history.length; i++) {
            const p = this.history[i];
            
            // Si el péndulo cruzó de un lado al otro del eje (wraparound), se interrumpe la linea
            if(i === 0) {
                this.ctx.moveTo(p.x, p.y);
            } else {
                 const prev = this.history[i-1];
                 const dist = Math.hypot(p.x - prev.x, p.y - prev.y);
                 // 50px es un heurístico. Si salta lejos de golpe en 1 frame significa que dio 1 vuelta 360
                 if (dist > 50) this.ctx.moveTo(p.x, p.y); 
                 else this.ctx.lineTo(p.x, p.y);
            }
        }
        
        this.ctx.strokeStyle = `hsl(${themeHueBase}, 100%, 60%)`; 
        this.ctx.lineWidth = 1.0;
        this.ctx.stroke();

        // Cursor del pulso presente
        this.ctx.beginPath();
        this.ctx.arc(x, y, 3, 0, Math.PI*2);
        this.ctx.fillStyle = '#fff';
        this.ctx.fill();
    }
    
    clear() {
        this.history = [];
        if(this.ctx) this.ctx.clearRect(0,0,this.width,this.height);
    }
}
