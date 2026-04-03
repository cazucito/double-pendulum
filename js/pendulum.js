/**
 * js/pendulum.js
 * Entidad Principal y Reglas Físicas Duras.
 * Almacena el formalismo matemático riguroso derivado de la Mecánica Lagrangiana.
 */

export class PendulumSimulator {
    /**
     * Instancia un estado mecánico independiente.
     * @param {Object} params - Diccionario de variables del mundo físico (g, masas, longitudes).
     * @param {Object} initialState - Posiciones angulares puras (Theta y Omega) expresadas en Radianes.
     */
    constructor(params, initialState) {
        this.params = { ...params };
        this.initialState = { ...initialState };
        this.reset();
    }

    /**
     * Resetea forzosamente la máquina de estados.
     */
    reset() {
        this.theta1 = this.initialState.theta1 || Math.PI / 2; // Horizontal por default
        this.theta2 = this.initialState.theta2 || Math.PI / 2;
        this.omega1 = this.initialState.omega1 || 0; // Se suelta desde el reposo absoluto
        this.omega2 = this.initialState.omega2 || 0;
    }

    /**
     * Permite hot-swapping de constantes paramétricas sin romper el estado del bucle.
     */
    setParams(newParams) {
        this.params = { ...this.params, ...newParams };
    }

    /**
     * Algoritmo Específico de Física Caótica - Las grandes Ecuaciones Lagrangianas.
     * Retorna las derivadas instantáneas basadas en el estado puro del péndulo sin necesidad de interactuar.
     */
    getDerivatives(state) {
        const [th1, th2, om1, om2] = state;
        const { m1, m2, L1, L2, g } = this.params;

        const delta = th1 - th2;
        const massSum = 2 * m1 + m2;
        const den = 2 * m1 + m2 - m2 * Math.cos(2 * th1 - 2 * th2);
        
        // Las aceleraciones posicionales son simplemente las inercias angulares actuales
        const d_th1 = om1;
        const d_th2 = om2;

        // Tensión y gravedad afectando al pivot del primer brazo
        let num1 = -g * massSum * Math.sin(th1);
        num1 -= m2 * g * Math.sin(th1 - 2 * th2);
        num1 -= 2 * Math.sin(delta) * m2 * (om2 * om2 * L2 + om1 * om1 * L1 * Math.cos(delta));
        const d_om1 = num1 / (L1 * den);

        // Fuerza centrífuga transferida al segundo tramo en base al momento del tramo primario
        let num2 = 2 * Math.sin(delta);
        num2 *= (om1 * om1 * L1 * (m1 + m2) + g * (m1 + m2) * Math.cos(th1) + om2 * om2 * L2 * m2 * Math.cos(delta));
        const d_om2 = num2 / (L2 * den);

        return [d_th1, d_th2, d_om1, d_om2];
    }
    
    /**
     * Mutador de estado principal. 
     * Recibe 'Inyección de Dependencias' del propio algoritmo Runge-Kutta para abstraer responsabilidades.
     */
    step(dt, rk4StepFn) {
        const state = [this.theta1, this.theta2, this.omega1, this.omega2];
        const nextState = rk4StepFn(state, dt, this.getDerivatives.bind(this));
        
        [this.theta1, this.theta2, this.omega1, this.omega2] = nextState;
        
        return {
            theta1: this.theta1,
            theta2: this.theta2,
            omega1: this.omega1,
            omega2: this.omega2
        };
    }

    /**
     * Sistema de traducción polar (Ángulos) a Espacio Euclidiano Cartesiano (x, y) 
     * útil para que la capa gráfica (`ui.js` / renderers) lo procese geométricamente exacto.
     */
    getPositions() {
        const { L1, L2 } = this.params;
        
        // Péndulo Base anclado a origen imaginario {0,0}
        const x1 = L1 * Math.sin(this.theta1);
        const y1 = L1 * Math.cos(this.theta1);
        
        // Péndulo Extremo atachado a coordenadas satélite del péndulo uno
        const x2 = x1 + L2 * Math.sin(this.theta2);
        const y2 = y1 + L2 * Math.cos(this.theta2);

        return {
            x1, y1, x2, y2,
            mass1: { x: x1, y: y1 },
            mass2: { x: x2, y: y2 }
        };
    }

    /**
     * Termodinámica de Sistemas Conservativos:
     * Retorna la Energía Cinética (Movimiento) y Potencial (Altura Gravedad).
     * En un contexto ideal de RK4, "E" (la suma total Energética del cosmos local) permanece inviolable.
     */
    getEnergy() {
        const { m1, m2, L1, L2, g } = this.params;
        const th1 = this.theta1, th2 = this.theta2;
        const om1 = this.omega1, om2 = this.omega2;

        // V: Altura invertida cartesiana multiplicada por gravedad y masa
        const V = -(m1 + m2) * g * L1 * Math.cos(th1) - m2 * g * L2 * Math.cos(th2);
        
        // T: Fórmulas de Inercia Rotacional (1/2 m * v^2) desglosada radialmente
        const T = 0.5 * m1 * Math.pow(L1 * om1, 2) + 0.5 * m2 * (
            Math.pow(L1 * om1, 2) + Math.pow(L2 * om2, 2) + 2 * L1 * L2 * om1 * om2 * Math.cos(th1 - th2)
        );
        
        return { T, V, E: T + V };
    }
}
