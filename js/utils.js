/**
 * js/utils.js
 * Capa de Utilidades Matemáticas.
 * Contiene funciones de pura teoría matemática que no dependen del contexto de la aplicación web.
 */

/**
 * Método de Integración de Runge-Kutta de Cuarto Orden (RK4).
 * Este algoritmo es el predeterminado en la simulación física ya que predice con altísima
 * exactitud cambios en sistemas no lineales (como el caos) sin la degradación rápida que sufre
 * un método básico como "Euler step". Evalúa la trayectoria 4 veces por intervalo y la promedia.
 * 
 * @param {Array<number>} state - Vector actual del sistema. En este caso: [theta1, theta2, omega1, omega2].
 * @param {number} dt - "Delta Time". El fraccionamiento del lapso temporal simulado en segundos.
 * @param {Function} derivatives - Patrón "Callback / Funciones puras". Función capaz de asimilar "state" y retornar ratios.
 * @returns {Array<number>} - Vector de estado resultando en tiempo T = Actual + dt.
 */
export function rk4Step(state, dt, derivatives) {
    const k1 = derivatives(state); // Pendiente inicial
    
    // Predicción de estado evaluado hacia el punto medio basal usando la primera derivada
    const state_k2 = state.map((val, i) => val + k1[i] * dt / 2);
    const k2 = derivatives(state_k2); // Pendiente secundaria en el punto medio
    
    // Predicción de estado iterativa en punto medio apoyado en pendiente k2
    const state_k3 = state.map((val, i) => val + k2[i] * dt / 2);
    const k3 = derivatives(state_k3); // Pendiente terciaria estabilizada
    
    // Predicción finalista intentando estimar el límite de cierre en tiempo íntegro (base k3)
    const state_k4 = state.map((val, i) => val + k3[i] * dt);
    const k4 = derivatives(state_k4); // Curva calculada hacia colapsar subintervalo 
    
    // Fórmula oficial ponderada del core funcional RK4
    return state.map((val, i) => val + (k1[i] + 2 * k2[i] + 2 * k3[i] + k4[i]) * dt / 6);
}
