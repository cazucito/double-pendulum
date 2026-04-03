# Matemáticas, Física y Teoría del Caos

Para construir interacciones vivas realistas no basta simplemente asomar al péndulo con trigonometría estática. Esta sección resume los bloques científicos que sostienen el comportamiento gráfico asombroso del programa.

## 1. El Doble Péndulo y la No-Linealidad

Un doble péndulo es un péndulo estático enganchado al propio extremo vivo de un péndulo hermano inicial. Parecería que su modelado requiere simplemente "sumar dos gravedades", pero la mecánica fundamental nos advierte un problema: su patrón de movimiento no crea un sistema cerrado lineal, sino **sistemas altamente no lineales acoplados (Ecuaciones Lagrangianas)**.

Cada brazo afecta al brazo vecino de infinitas maneras conforme fluctúa su peso (gravedad contra tensión de la cuerda) y su momento centrífugo (rotación contra inercia natural).

```math
L = T - V
```
Es la función que define al sistema donde `T` es la Energía Cinética y `V` la Potencial. Esta aproximación arroja al simulador, a su vez, derivadas críticas de aceleración (`d_om1` y `d_om2`).

## 2. El Efecto Mariposa 🦋

En 1961, Edward Lorenz dedujo en un ensayo estrepitosamente denso el sello fundacional sobre la incipiente "Teoría del Caos": *Sensibilidad extrema ligada a condiciones iniciales*.

Nuestra característica `Efecto Mariposa (Clones)` expone esto puramente. Al lanzarse este modo:
- Evaluamos 10 péndulos simultáneamente.
- Alteramos su ángulo original microscópicamente contra otro clon (apenas separándolos por un factor de `0.0001` radianes).
- En matemáticas puras o lineales clásicas, un `0.0001` alteraría el resultado por siempre bajo la misma tolerancia (`0.0001`). Pero aquí, el caos escala exponencialmente. El sistema no-lineal del doble péndulo actúa como multiplicador orgánico. En unos breves segundos transcurridos, una masa cruzará al hemisferio superior y otra caerá a plomo en picada. El caos total diverge su rastro de memoria para lograr colisiones coloridas masivas.

## 3. Batalla Analítica: Euler vs Runge-Kutta

Múltiples "Físicas Web Casuales" en HTML Canvas usan el **Método de Integración de Euler**. Simplemente miden la velocidad de la bolígrafo en el instante A y la empujan en línea recta proyectiva hacia el espacio instantáneo `dt`. 
Ese método causa fugas energéticas masivas en Sistemas de Caos Acoplado (las líneas rectas jamás se unen propiamente provocando la auto-explosión orbital por falta artificial de conservación energética en pocos intervalos).

Nuestro motor inyecta **Runge-Kutta de 4to Orden (RK4)** documentado de forma interactiva en la base `js/utils.js`:
1. Mide la inercia instantánea como Euler `k1`.
2. Trata de avanzar a la mitad del trayecto futuro real con ese impulso (`k2`).
3. Mide la deformabilidad a mitad del progreso usando el impulso anterior (`k3`).
4. Estima la terminación basándose empíricamente en el paso número tres (`k4`).

El motor termina fusionando las 4 "posibilidades de futuro" basándose en el teorema de Taylor. ¿Resultado? Fluidez extrema computacional.

## 4. Sub-Stepping Matemático ("Cortando el Tiempo Lento")

Para evitar romper computadores con lentitud: si el usuario impone correr a **10 Veces la Velocidad Normal**, el diferencial `dt` podría pasar a ser "1.6 fotogramas saltados de golpe" produciendo que los ángulos traspasen unos a otros y la gráfica explote (el péndulo atraviesa los cielos al equivocarse).

`engine.js` incluye una salvaguarda de protección dura a este error recurrente web. Toma el paso macro (0.16) y lo divide obligándolo a cumplir el umbral exigido `<= 0.005 segundos por paso algorítmico microscópico`. Se realizarán unos 30 iteraciones de RK4 escondidamente silenciosas antes de volver a molestar la Tarjeta de Red gráfica para dibujar el macro movimiento coherente. Evitando infinitamente la dispersión asincrónica a medida que se aumenta el reloj a 10x.
