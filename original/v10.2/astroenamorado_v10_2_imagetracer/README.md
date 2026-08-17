# AstroEnamorado v10.1 ProcGen — corrección de cambio de imagen

## Error corregido

La v10 ProcGen conservaba `externalStarlessImage` y `externalSvgText` después de
usar los demos IC434/NGC3576. Si después se adjuntaba una galaxia nueva, el
pipeline seguía usando el starless y/o SVG de la imagen anterior.

Por eso parecía que no ejecutaba:
- PSF
- extracción starless
- vectorización automática

## Nuevo comportamiento

Al usar **Adjuntar astrofotografía**:

1. se descarta el starless externo anterior;
2. se descarta el SVG anterior;
3. se limpia el selector de ambos archivos;
4. se ejecuta PSF sobre la imagen nueva;
5. se crea starless automático;
6. se vectoriza automáticamente ese nuevo starless;
7. se genera el gas procedural 3D.

Los demos conservan sus recursos asociados únicamente cuando se cargan desde
sus botones específicos.

También hay un botón:

    Descartar starless/SVG externos

para volver inmediatamente al procesamiento automático de la imagen actual.

## Prueba con una galaxia

1. Carga la galaxia mediante `Adjuntar astrofotografía`.
2. Mira el mensaje inferior. Debe terminar aproximadamente con:
   `PSF: N estrellas · starless: automático · vector: N formas automáticas`.
3. Comprueba los diagnósticos:
   - Original
   - Starless
   - PSF mask
   - Vector
   - Posterizado

Después puedes cargar un starless o SVG externo específicamente para esa misma
galaxia si quieres sustituir una etapa automática.


## v10.2
Diagnósticos clicables/copiar PNG, Reprocesar sticky, ImageTracerJS 1.2.6 como vectorizador SVG principal. Requiere Internet para cargar ImageTracer desde jsDelivr; el modo legacy queda disponible.
