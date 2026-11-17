# Cuervo Encounter Engine

Motor táctico de combate para **Las Cenizas de la Marea**. Su objetivo es resolver y registrar encuentros de forma consistente, sin quitarle al jugador el control de Cuervo.

## Documentación de diseño

- [Especificación funcional](docs/ESPECIFICACION_FUNCIONAL.md): alcance, principios, reglas, roles, arquitectura, pruebas y etapas.
- [Modelo de datos y formato de importación](docs/MODELO_DATOS_Y_FORMATO_ENCUENTRO.md): perfiles, instancias, capacidades, estado de combate, mapa y flujo de validación.
- [JSON Schema 1.0.0](schemas/encounter.schema.json): contrato estructural para validar archivos de encuentro.
- [Ejemplo de encuentro JSON](examples/encuentro-ejemplo.json): archivo didáctico con estadísticas ficticias, no pertenecientes a la campaña.

## Principios centrales

- Base: **D&D 5.ª edición, compatible con el marco básico de 2014**, adaptado a las reglas simplificadas y las fichas oficiales de la campaña.
- Cuervo queda bajo control exclusivo del jugador.
- Aliados y enemigos resuelven sus turnos automáticamente, usando solo las capacidades documentadas.
- Cada tirada, modificador, regla aplicada y consecuencia debe quedar registrada.
- El azar debe usar Web Crypto con muestreo sin sesgo; no se alteran ni repiten resultados.
- El mapa debe ser una herramienta mecánica: movimiento, distancias, obstáculos, línea de visión, alcance y cobertura.
- El resumen final debe poder pegarse en el chat de campaña y también exportarse como JSON estructurado.
- Toda regla no implementada se identifica como pendiente o manual.

## Reconstrucción desde cero

El prototipo actual se conserva en el historial de GitHub como referencia y respaldo. **No es la base que se seguirá ampliando.** La nueva implementación se desarrollará por módulos, con pruebas independientes del navegador y criterios de aceptación definidos en la especificación.

La reconstrucción no implica borrar el repositorio ni su historial. Tampoco se copiarán al repositorio público las fichas completas ni información privada de la campaña. Los datos de personajes y encuentros se cargarán mediante configuraciones validadas.

## Etapas previstas

1. Diseño de datos y formato de encuentro.
2. Núcleo: participantes, iniciativa, turnos, acciones, ataques, daño y azar criptográfico.
3. Acciones, salvaciones, condiciones, reacciones y recursos prioritarios.
4. Automatización táctica de aliados y enemigos.
5. Mapa táctico completo.
6. Importación desde el chat y fichas de campaña.
7. Registro, resumen, JSON, reimportación y pruebas de continuidad.
8. Interfaz, accesibilidad y pruebas prácticas.

No se dará por terminada una etapa hasta superar sus pruebas de aceptación.

## Uso y publicación

La aplicación publicada corresponde al prototipo anterior hasta que la reconstrucción esté lista. Para publicar con GitHub Pages, configurá **Settings → Pages → GitHub Actions**.

## Datos y privacidad

Los encuentros se mantienen localmente durante la sesión y se exportan a petición del usuario. No se deben enviar fichas ni registros a servicios externos ni incluir información privada de campaña en este repositorio público.
