---
description: Cómo validar manualmente las features del doble péndulo si el código es alterado.
---
# Verificación de Integridad del Simulador

Paso a paso automatizado para cerciorar que el Chaos Engine funciona fluidamente ante nuevos cambios:

1. Comienza sirviendo el proyecto localmente y capturando los puertos: `npm run start`
// turbo
2. Limpia caché en tu terminal antes de continuar en el navegador.
3. Entra a `localhost:3000` y ejecuta interacciones secuenciales.
4. Verifica estatus "Energía Total". Su valor no debe oscilar más de un 0.5% a lo largo de 120 segundos, corroborando que no rompiste matemática fundamental.
5. Verifica Minimapa usando "Efecto Mariposa". Identifica degradación en frame rate: Debe estar siempre atrincherado en ~60FPS.
