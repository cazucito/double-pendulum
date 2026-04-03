/**
 * js/engine.js
 * Orquestador Lógico de Estados Internos.
 * Maneja abstracciones del tiempo matemático y opera arreglos (arrays) masivos de péndulos clonados sin bloquearse.
 */
import { rk4Step } from './utils.js';
import { PendulumSimulator } from './pendulum.js';

export class SimulationEngine {
    constructor() {
        this.simulators = []; // Array posibilitador del "Efecto Mariposa" si decidimos agregar N instancias.
        this.trails = [];     // Base de datos temporal geométrica
        this.params = {};
        
        // Mecanismo "Capping": Define un límite al diferencial de tiempo crudo, así 
        // evadimos la infinidad si un usuario minimiza la pestaña del navegador obligándolo a congelar JS.
        this.MAX_DT = 0.05;
        this.trailLength = 200; 
        
        this.draggedMass = undefined; // Identificador de ancla espacial (Cual masa estamos arrastrando)
    }

    /**
     * Reinicializador masivo.
     * Instancia ya sea un péndulo único, o multiplica y dispersa microscópicamente el espectro (Mariposa).
     */
    reset(params, butterflyMode = false) {
        this.simulators = [];
        this.trails = [];
        this.params = { ...params };
        this.draggedMass = undefined;
        
        const count = butterflyMode ? 10 : 1; 
        
        for(let i = 0; i < count; i++) {
            // Se le suma 0.0001 radianes microscópicos de desviación si estamos en modo Mariposa.
            this.simulators.push(new PendulumSimulator(this.params, {
                theta1: Math.PI / 2 + (butterflyMode ? i * 0.0001 : 0),
                theta2: Math.PI / 2,
                omega1: 0,
                omega2: 0
            }));
            this.trails.push([]);
        }
    }

    /**
     * Transmitir los cambios de inputs globales iterativamente hacia los objetos encapsulados.
     */
    updateParams(newParams) {
        this.params = { ...this.params, ...newParams };
        for (let sim of this.simulators) {
            sim.setParams(this.params);
        }
        this.clearTrails();
    }
    
    /**
     * Altera referencias de persistencia visual obligando al renderer a limpiar su estado de cache local.
     */
    clearTrails() {
        for(let i=0; i<this.trails.length; i++) {
            this.trails[i] = [];
        }
    }

    /**
     * Cinemática Inversa (Inverse Kinematics):
     * Fuerza la modificación de los ángulos internos obligando a las coordenadas polares a tratar
     * de "alcanzar" el ratón del usuario en base a coordenadas cartesianas X,Y abstractas.
     */
    interactiveDrag(x, y) {
        const sim = this.simulators[0];
        const { m1, L1, L2 } = this.params;
        const pos = sim.getPositions();
        
        // Define al objetivo más cercano al ratón para evitar tirones erráticos (Snap targeting)
        if (this.draggedMass === undefined) {
             const dist1 = Math.hypot(x - pos.mass1.x, y - pos.mass1.y);
             const dist2 = Math.hypot(x - pos.mass2.x, y - pos.mass2.y);
             this.draggedMass = dist1 < dist2 ? 1 : 2;
        }

        if (this.draggedMass === 1) {
            // Arrstrando la Masa 1 (Directo: Apuntala theta1 hacia el vector unitario del cursor).
            sim.theta1 = Math.atan2(x, y);
            sim.omega1 = 0;
            sim.omega2 = 0; 
        } else {
            // Arrastrando la Masa 2 (IK Compleja de brazo robótico articulado).
            let dist = Math.hypot(x, y);
            dist = Math.min(dist, L1 + L2 - 0.001); // Previene la explosión matemática si el usuario saca el mouse de la pantalla
            
            // Reconstrucción del triángulo asimétrico mediante Teorema del Coseno
            const cosAngle2 = (dist*dist - L1*L1 - L2*L2) / (2 * L1 * L2);
            const internalAngle2 = Math.acos(Math.max(-1, Math.min(1, cosAngle2)));
            
            const baseAngle = Math.atan2(x, y);
            const sinAngle1 = (L2 * Math.sin(internalAngle2)) / dist;
            const alpha = Math.asin(Math.max(-1, Math.min(1, sinAngle1)));
            
            // Fusión final hacia los registros de estado del simulador líder
            sim.theta1 = baseAngle - alpha;
            sim.theta2 = sim.theta1 + internalAngle2;
            
            sim.omega1 = 0;
            sim.omega2 = 0;
        }

        // Si estamos en modo "Mariposa", arrastrar a uno arrastra a todos, replicando el desfase inicial sutil.
        const baseTheta1 = sim.theta1;
        const baseTheta2 = sim.theta2;
        for(let i=0; i<this.simulators.length; i++) {
            this.simulators[i].theta1 = baseTheta1 + (this.simulators.length > 1 ? i * 0.0001 : 0);
            this.simulators[i].theta2 = baseTheta2;
            this.simulators[i].omega1 = 0;
            this.simulators[i].omega2 = 0;
        }
    }

    releaseDrag() {
        this.draggedMass = undefined;
    }

    /**
     * TICK CYCLE: El puente donde el tiempo de reloj del motor V8 (JavaScript) interactúa con la lógica de caos.
     */
    tick(realDt, timeScale) {
        if (realDt > this.MAX_DT) realDt = this.MAX_DT; 
        let dt = realDt * timeScale;

        // OPTIMIZACIÓN CRÍTICA (Substeps Dinámicos):
        // Con altas aceleraciones (Speed 10x), RK4 reventaría al perder precisión entre fotogramas gigantes.
        // Aquí convertimos los Dt amplios en microticks imperceptibles limitados bajo el umbral "0.005 segundos" p/r.
        const desiredSubDt = 0.005; 
        const numSteps = Math.max(1, Math.ceil(dt / desiredSubDt));
        const subDt = dt / numSteps;
        
        for (let simIndex = 0; simIndex < this.simulators.length; simIndex++) {
            const sim = this.simulators[simIndex];
            const trailArr = this.trails[simIndex];
            
            // Loop micro-temporal. Ocurre 100% en backend simulado entre refrescos del monitor
            for (let i = 0; i < numSteps; i++) {
                sim.step(subDt, rk4Step);
            }

            // Una vez asentado el fotograma, reportamos las coordenadas completas hacia la cache geométrica
            const pos = sim.getPositions();
            trailArr.push({ m1: pos.mass1, m2: pos.mass2 });
            
            // Colas acotadas asíncronas
            if (trailArr.length > this.trailLength) {
                trailArr.shift();
            }
        }
    }
}
