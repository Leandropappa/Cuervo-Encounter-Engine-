# Cuervo Encounter Engine

Motor táctico de combate para **Las Cenizas de la Marea**. Su objetivo es ejecutar y registrar encuentros de forma consistente, sin quitarle al jugador el control de Cuervo.

## Marco de reglas de la campaña

- Base: **D&D 5.ª edición, compatible con el marco básico de 2014**.
- Adaptación: se utilizan las reglas simplificadas y los bloques de PNJ establecidos para *Las Cenizas de la Marea*. No se busca reproducir íntegramente todos los subsistemas del reglamento oficial.
- Prioridad: respetar las reglas y fichas mecánicas vigentes en el repositorio privado de campaña. Las decisiones narrativas del DM no deben contradecir resultados mecánicos ya establecidos.
- Cuervo: todas sus decisiones y acciones quedan bajo control del jugador.
- Aliados y enemigos: el motor puede resolver sus turnos automáticamente según sus fichas, capacidades y comportamiento configurado.
- Transparencia: cada resolución debe registrar dados, modificadores, dificultad o CA, regla aplicada y resultado. Una mecánica todavía no implementada debe identificarse como pendiente o manual; nunca presentarse como si el motor la hubiera resuelto.

## Arquitectura prevista

El desarrollo se organizará en componentes separados para evitar reglas rígidas o parches aislados:

1. **Motor de reglas:** acciones, economía de turnos, ataques, daño, salvaciones, condiciones, movimiento, alcance, cobertura, línea de visión y efectos temporales.
2. **Contenido:** fichas de personajes, PNJ, enemigos, objetos, equipo, rasgos y conjuros que realmente formen parte de la campaña.
3. **Encuentros:** configuración importable generada desde el chat, con participantes, equipo, escenario, posiciones y condiciones iniciales.
4. **Mapa táctico:** cuadrícula de 5 pies, obstáculos, terreno, movimiento y relaciones espaciales. La generación aleatoria deberá respetar las condiciones y la transitabilidad del escenario.
5. **Registro y exportación:** historial verificable de turnos, tiradas, posiciones, daños, estados y efectos, listo para compartir en el chat de campaña.

La arquitectura debe permitir incorporar nuevas capacidades sin tener que implementar todo D&D de una vez. Se priorizan las reglas que utiliza la campaña y se agregan reglas avanzadas cuando sean necesarias.

## Estado actual — prototipo v0.1

- Carga manual de personaje jugador, aliados y enemigos.
- Iniciativa y orden de turnos.
- Decisiones manuales para el personaje jugador.
- Resolución automática básica de ataques para aliados y enemigos.
- Seguimiento de PV, CA y estado de participantes.
- Registro detallado, cierre del encuentro y exportación del resumen en texto.

## Hoja de ruta

1. Mapa cuadriculado, posiciones, movimiento, obstáculos, alcance y línea de visión.
2. Acciones, acción adicional, reacción, ataques, críticos, daño y salvaciones.
3. Condiciones, cobertura, ocultamiento y efectos temporales.
4. Rasgos de clase y capacidades particulares de las fichas de campaña.
5. Equipo, objetos, conjuros y efectos especiales presentes en la campaña.
6. Importación de encuentros mediante un bloque de configuración generado por Nox.
7. Pruebas de reglas y escenarios para verificar que cada mecánica se aplique y se registre correctamente.

## Uso

Abrí `index.html` en un navegador moderno. Para publicar con GitHub Pages, habilitá Pages desde **Settings → Pages** y seleccioná **GitHub Actions** como fuente de publicación.

## Datos y privacidad

Los encuentros se mantienen en memoria durante la sesión. Esta versión no envía fichas ni registros a un servidor. No incluyas información privada de campaña en este repositorio público.

## Límites de la versión preliminar

La automatización actual usa ataques básicos configurables. El mapa táctico, la importación de encuentros y las reglas especiales todavía no están implementados. Las acciones especiales que no tengan resolución mecánica disponible requieren adjudicación manual y deben quedar identificadas como tales.

