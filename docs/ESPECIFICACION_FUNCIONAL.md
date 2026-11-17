# Especificación funcional — Cuervo Encounter Engine

**Estado:** documento de diseño inicial  
**Proyecto:** herramienta táctica para Las Cenizas de la Marea  
**Base de reglas:** D&D 5.ª edición, marco 2014, adaptado a las reglas aprobadas para la campaña  
**Principio rector:** resolver y registrar el combate con fidelidad y transparencia, sin quitar al jugador el control de Cuervo.

## 1. Propósito y límites

El motor debe permitir preparar, ejecutar, revisar y exportar encuentros tácticos de la campaña. No pretende implementar de una sola vez todo el reglamento de D&D ni sustituir las decisiones narrativas del DM.

Fuentes de autoridad, en este orden:
1. Reglas y decisiones explícitamente acordadas para Las Cenizas de la Marea.
2. Fichas mecánicas oficiales vigentes de la campaña.
3. Reglas básicas de D&D 5e compatibles con 2014, cuando la campaña no haya establecido una adaptación propia.

Una regla no implementada debe mostrarse como **pendiente de implementación** o **resolución manual**. El motor nunca debe simular que aplicó una regla que no conoce.

Fuera del alcance inicial:
- Implementar todas las clases, subclases, dotes, objetos mágicos y subsistemas publicados de D&D.
- Inventar estadísticas, competencias, equipo, conjuros o rasgos que no estén documentados.
- Tomar decisiones del jugador por Cuervo.
- Resolver automáticamente una acción especial cuando falten datos necesarios.
- Alterar, repetir o descartar tiradas para obtener un resultado narrativo conveniente.

## 2. Principios no negociables

1. **Cuervo pertenece al jugador.** El motor presenta opciones legales y calcula la resolución elegida; no elige su acción, objetivo, movimiento, recurso ni reacción.
2. **Aliados y enemigos actúan automáticamente**, dentro de las capacidades documentadas y de una política táctica explícita.
3. **Las fichas son la autoridad mecánica.** No se deducen competencias, salvaciones, sentidos, recursos ni equipo por el arquetipo o la narrativa.
4. **Toda resolución es auditable.** Debe poder verse qué dados se tiraron, qué modificadores se aplicaron, contra qué dificultad y qué regla produjo el resultado.
5. **Azar íntegro.** No se vuelve a tirar ni se modifica un resultado ya generado.
6. **Sin automatización ficticia.** Si el motor no puede resolver una situación, la pausa y solicita adjudicación manual.
7. **Separación de reglas y contenido.** El código de reglas no debe contener fichas concretas de la campaña.
8. **Continuidad.** El estado de un encuentro y su exportación deben permitir continuar la campaña sin perder decisiones o resultados confirmados.

## 3. Roles y comportamiento

### 3.1 Jugador — Cuervo

Al comenzar el turno de Cuervo, el motor debe detener la automatización y mostrar:
- Estado actual: PG, CA, velocidad, condiciones, recursos y efectos activos conocidos.
- Posición, movimiento disponible y casillas alcanzables, si se usa mapa.
- Acciones disponibles según su ficha y estado.
- Acciones adicionales disponibles, solo si una regla las concede.
- Reacciones disponibles y sus desencadenantes conocidos.
- Objetivos válidos, alcance, línea de visión y cobertura calculados cuando esas reglas estén implementadas.
- Advertencias por acciones que no puedan resolverse automáticamente.

El jugador elige qué hacer. El motor valida la legalidad, explica cualquier impedimento y solicita confirmación antes de consumir la acción o recurso cuando corresponda.

### 3.2 Aliados

Los aliados usan sus bloques de PNJ y rasgos documentados. El motor decide su turno mediante una política táctica configurable y visible.

Orden general de decisión:
1. Resolver una amenaza inmediata o un desencadenante de rasgo/reacción.
2. Usar una capacidad especial cuando su condición esté cumplida y su uso sea tácticamente coherente.
3. Proteger o asistir a un aliado cuando la ficha lo permita.
4. Elegir una acción ofensiva válida.
5. Reposicionarse si el movimiento aporta una ventaja táctica clara.
6. Si ninguna acción puede resolverse con los datos disponibles, registrar la limitación y pedir intervención del DM.

La IA no puede inventar conjuros preparados, espacios, usos restantes, equipo, competencias o conocimiento táctico.

### 3.3 Enemigos

Los enemigos actúan automáticamente usando exclusivamente su ficha, comportamiento configurado y la información que razonablemente poseen en escena. La política admite perfiles como agresivo, defensor, tirador, controlador, protector, cobarde o táctico. Un perfil orienta prioridades, pero nunca concede capacidades no escritas en la ficha.

### 3.4 Intervención del DM

El DM puede resolver manualmente una acción, elegir entre alternativas tácticas o confirmar una situación ambigua. La intervención queda registrada con autoría **DM/manual**, separada de los cálculos automáticos.

## 4. Preparación del encuentro

Antes de iniciar, el usuario debe poder:
- Crear un encuentro con nombre, descripción y notas.
- Añadir participantes desde fichas existentes o crear una ficha temporal.
- Asignar cada participante a jugador, aliado o enemigo.
- Revisar y ajustar valores específicos del encuentro sin alterar la ficha de origen.
- Definir PG actuales, recursos, condiciones y efectos iniciales.
- Definir iniciativa manual o tirar iniciativa con el motor.
- Crear el mapa, tamaño, escala, terreno, obstáculos y posiciones iniciales.
- Guardar una configuración exportable para reutilizarla.

Cada participante tiene una identidad estable dentro del encuentro. Los valores de encuentro son una copia de trabajo: modificar PG durante el combate no sobrescribe la ficha maestra.

No iniciar si faltan datos esenciales para las acciones que se pretende automatizar. Se puede permitir iniciar con advertencias cuando el DM decida que resolverá manualmente esos elementos.

## 5. Modelo de participante

El modelo de datos debe admitir, según corresponda:
- Identidad: nombre, identificador, rol, tamaño, tipo y fuente de la ficha.
- Atributos y modificadores.
- Bonificador de competencia.
- PG máximos y actuales, dados de golpe y muerte/estabilización cuando se implemente.
- Clase de armadura y sus componentes.
- Velocidad por tipo de movimiento.
- Iniciativa.
- Salvaciones y habilidades con competencia explícita.
- Sentidos y Percepción pasiva.
- Ataques: bonificador, alcance, tipo, expresión de daño, propiedades y requisitos.
- Acciones, acciones adicionales, reacciones y rasgos.
- Conjuros, CD, ataque de conjuro, espacios y concentración cuando existan en la ficha.
- Equipo, munición, objetos y recursos limitados.
- Condiciones, efectos temporales, duración y origen.
- Posición, tamaño de espacio y orientación si el escenario lo necesita.
- Política táctica para aliados/enemigos.

Los campos desconocidos permanecen desconocidos; no se convierten silenciosamente en cero, falso o un valor por defecto que altere las reglas.

## 6. Flujo de combate

### 6.1 Inicio
1. Validar participantes y configuración.
2. Resolver iniciativa según el método elegido.
3. Ordenar turnos de mayor a menor.
4. En empates, permitir la decisión correspondiente del DM/jugador según el marco 2014; registrar el desempate. No imponer un orden oculto.
5. Inicializar ronda, recursos de encuentro, registro y temporizadores de efectos.

### 6.2 Turno

El motor modela por separado:
- Movimiento.
- Una acción.
- Una acción adicional, solo si una regla la concede.
- Una reacción, disponible fuera del propio turno cuando se cumple su desencadenante.
- Interacciones con objetos y otras capacidades que correspondan.

No todas las criaturas tienen acción adicional o reacción especial disponible. No se crean por defecto.

Al terminar el turno, el motor procesa efectos que expiran al final del turno. Al comenzar un turno, procesa efectos que expiran al comienzo de ese turno. El orden de resolución debe ser consistente y quedar registrado.

### 6.3 Rondas y fin

Al completar el orden de iniciativa, comienza una nueva ronda. El motor detecta condiciones de victoria/derrota configuradas, pero permite que el DM continúe, interrumpa o finalice manualmente.

Al finalizar, congela el estado final, cierra los efectos correspondientes y genera los dos formatos de exportación descritos en la sección 13.

## 7. Reglas de resolución

### 7.1 Tiradas y modificadores

Cada tirada registra:
- Dado o conjunto de dados.
- Resultado individual de cada dado.
- Modificadores y su origen.
- Ventaja/desventaja y dados descartados, si corresponde.
- Total final.
- Umbral enfrentado (CA, CD u otro).
- Resultado y efecto aplicado.

Ventaja y desventaja se resuelven con dos d20 y se conserva el mayor o menor respectivamente. Si ambas se aplican a una misma tirada, se cancelan según las reglas correspondientes. No se acumulan múltiples fuentes de ventaja o desventaja para tirar dados adicionales, salvo regla específica.

### 7.2 Fuente de azar

El motor usa Web Crypto (crypto.getRandomValues) con muestreo sin sesgo para generar dados. No usa Math.random().

La capa de azar es independiente del motor de reglas, de modo que pueda:
- Generar tiradas localmente con aleatoriedad criptográfica.
- Registrar el resultado bruto y la identificación de la tirada.
- Aceptar, en una futura integración, resultados importados desde Cuervo Dice Engine.
- Impedir que una misma tirada se aplique dos veces.

El registro permite auditar lo ocurrido, aunque no promete reproducir una fuente criptográfica sin guardar una semilla verificable. Si se incorpora un sistema de semilla/proof, debe documentarse antes de presentarlo como verificable.

### 7.3 Ataques

Un ataque valida, según la ficha y las reglas implementadas:
- Que el atacante pueda realizar esa acción.
- Que el objetivo sea válido.
- Alcance y tipo de ataque.
- Línea de visión cuando sea necesaria.
- Cobertura.
- Ventaja/desventaja.
- Reacciones y rasgos que puedan modificar la tirada.
- CA efectiva del objetivo.

El resultado natural del d20 se conserva para aplicar críticos y fallos/éxitos automáticos cuando la regla lo establezca. El motor no trata cualquier total alto como crítico.

### 7.4 Daño y críticos

- Admitir expresiones de dados y modificadores con validación estricta.
- Registrar cada dado de daño.
- Aplicar multiplicadores y reglas de crítico de acuerdo con la base 2014 y las excepciones de campaña.
- Aplicar resistencias, vulnerabilidades e inmunidades solo cuando estén documentadas.
- Aplicar reducción, absorción o prevención de daño por rasgos y reacciones antes de actualizar PG, siguiendo el orden correcto.
- Registrar daño final, PG resultantes y cualquier transición a 0 PG.

### 7.5 Salvaciones y pruebas

Admitir atributo, competencia, CD, ventaja/desventaja y efectos. El motor solo calcula una salvación o prueba si conoce el modificador correcto y los rasgos aplicables. Si falta información, debe pedirla.

### 7.6 Acciones y capacidades

Las acciones estándar y capacidades particulares se definen como datos/reglas, no como texto decorativo. Cada capacidad declara:
- Tipo de acción o reacción.
- Requisitos y desencadenante.
- Objetivos y alcance.
- Tirada o salvación necesaria.
- Efecto.
- Duración.
- Usos y recuperación.
- Interacciones con otras reglas.

### 7.7 Condiciones y efectos

El motor admite condiciones de D&D 5e 2014 relevantes para la campaña, con sus consecuencias mecánicas explícitas. Los efectos temporales indican inicio, vencimiento, fuente y posibilidad de terminar antes. No alcanza con mostrar una etiqueta visual.

### 7.8 Concentración y recursos

Cuando una ficha use conjuros o capacidades limitadas, el motor lleva espacios, usos, concentración y pruebas asociadas. Si la mecánica no está implementada, la acción se registra como manual y no se consumen recursos silenciosamente.

## 8. Mapa táctico

El mapa es una herramienta de reglas, no solo una ilustración.

Debe admitir:
- Cuadrícula configurable; valor inicial de referencia: casillas de 5 pies.
- Tamaño de mapa configurable.
- Posiciones de criaturas y tamaño de sus espacios.
- Obstáculos y elementos del escenario.
- Terreno difícil y otros tipos de terreno cuando se implementen.
- Distancia, movimiento restante y rutas alcanzables.
- Línea de visión y cobertura.
- Alcance normal y largo de ataques a distancia.
- Alcance de ataques cuerpo a cuerpo y efectos.
- Zonas y áreas de efecto en etapas posteriores.

La medición diagonal es configurable. Para la adaptación inicial de campaña se conserva la decisión simplificada ya utilizada: una casilla diagonal cuesta 5 pies, salvo que una regla o encuentro indique otra cosa. La implementación evita atravesar obstáculos, criaturas u ocupar espacios inválidos.

La línea de visión y la cobertura son conceptos distintos: un obstáculo puede bloquear la visión o conceder cobertura según su tipo y geometría. No deben reducirse a una única comprobación binaria.

## 9. Automatización táctica

La automatización debe ser explicable. El registro permite entender:
- Qué opciones consideró válidas.
- Por qué eligió ese objetivo.
- Qué rasgo, acción o prioridad utilizó.
- Por qué descartó una alternativa relevante.
- Qué limitación impidió resolver una acción.

No se exige mostrar una explicación extensa en pantalla durante cada turno automático, pero sí conservar un registro conciso y auditable.

Los perfiles tácticos son configurables por encuentro y no alteran la ficha mecánica.

## 10. Arquitectura propuesta

Separar el motor en módulos pequeños y comprobables:

1. **Modelo de datos:** participantes, fichas, encuentros, mapa, estado y eventos.
2. **Reglas base:** economía de acciones, iniciativa, ataques, daño, salvaciones, condiciones y duración.
3. **Azar:** generación criptográfica, validación y registro de tiradas.
4. **Geometría táctica:** distancias, movimiento, rutas, línea de visión y cobertura.
5. **Capacidades:** acciones, rasgos, reacciones, conjuros y recursos.
6. **Agentes tácticos:** política de aliados y enemigos.
7. **Interfaz:** preparación, turno del jugador, mapa, estado, registro y exportación.
8. **Importación/exportación:** configuración de encuentro y resumen final.
9. **Pruebas:** casos unitarios de reglas y escenarios completos.

La lógica de reglas debe poder probarse sin abrir la interfaz. La interfaz solo solicita decisiones y representa el estado producido por el motor.

### Persistencia y privacidad

- Primera versión: estado en memoria durante la sesión y exportación explícita.
- No enviar fichas ni encuentros a servicios externos.
- No copiar contenido privado de campaña al repositorio público.
- Las fichas reales se cargarán mediante configuración exportada desde el entorno de campaña, sin publicar datos sensibles en este repositorio.

## 11. Importación desde el chat

Nox prepara un bloque estructurado de encuentro que incluye:
- Identificador y nombre del encuentro.
- Participantes y referencias de ficha.
- Valores de encuentro y estado inicial.
- Mapa, obstáculos, terreno y posiciones.
- Objetivos, notas y comportamiento táctico.
- Reglas especiales acordadas para ese encuentro.

El motor valida el bloque antes de importarlo y muestra un resumen de lo que va a crear. Los campos desconocidos o inválidos se señalan; no se corrigen silenciosamente.

El formato será versionado para que futuras versiones puedan migrar configuraciones antiguas.

## 12. Registro de auditoría

Cada evento es estructurado y no solo una línea de texto. Como mínimo:
- Número de ronda y turno.
- Actor y objetivo.
- Tipo de evento.
- Acción declarada.
- Tiradas individuales y modificadores.
- Regla aplicada.
- Resultado.
- Cambios de PG, recursos, posición, condiciones y efectos.
- Fuente: motor, jugador o DM/manual.
- Marca temporal local y secuencia única.

La interfaz puede presentar un registro narrativo legible generado a partir de esos eventos, pero la exportación estructurada conserva todos los datos.

## 13. Exportación y continuidad

Al cerrar el combate, ofrecer:

### A. Resumen legible para pegar en el chat

Debe incluir:
- Identificación y resultado del encuentro.
- Estado final de cada participante.
- Iniciativa y rondas.
- Acciones de Cuervo, aliados y enemigos.
- Tiradas, modificadores, CA/CD y daños.
- Recursos gastados y condiciones restantes.
- Posiciones y estado del mapa si son relevantes.
- Decisiones manuales y reglas pendientes.
- Incidencias, datos provisionales y elementos que Nox debe actualizar en la continuidad de campaña.

### B. Archivo estructurado JSON

Contiene el estado completo y los eventos sin pérdida de información. Incluye versión del esquema para permitir importación y auditoría futura.

La exportación se genera después de registrar el evento de cierre, de modo que no se pierda la última acción ni el motivo de finalización.

## 14. Pruebas de aceptación

No considerar una fase terminada hasta pasar pruebas reproducibles.

### Núcleo
- Iniciativa descendente y empates resueltos sin orden arbitrario oculto.
- Turnos y rondas correctos, incluidos participantes derrotados.
- Economía de acciones y reacciones sin usos duplicados.
- Ataques, CA, ventaja/desventaja, críticos y daño con registro de cada dado.
- Actualización de PG, 0 PG y finalización de combate.
- Acciones ilegales rechazadas sin consumir recursos.

### Control del jugador
- El turno de Cuervo siempre espera una elección explícita.
- El motor no ejecuta el siguiente turno hasta confirmar la acción de Cuervo.
- Movimiento, objetivo, recursos y reacciones de Cuervo no se deciden automáticamente.

### Aliados y enemigos
- Usan solo capacidades presentes en sus fichas.
- Aplican rasgos y reacciones cuando se cumplen sus desencadenantes.
- No inventan datos ausentes.
- Su decisión puede explicarse en el registro.

### Mapa
- Distancias, movimiento y rutas respetan velocidad y obstáculos.
- Criaturas no se superponen.
- Alcance, línea de visión y cobertura se calculan por separado.
- Tamaños de criaturas y terreno se respetan cuando estén implementados.

### Azar y auditoría
- Dados criptográficos sin sesgo por módulo dedicado.
- Ninguna tirada se altera ni se repite automáticamente.
- Todas las tiradas y cálculos se pueden revisar en el registro.

### Exportación
- El resumen incluye el último evento y el estado final.
- JSON se puede importar de nuevo sin pérdida.
- Se distinguen las resoluciones automáticas de las manuales.

## 15. Plan de implementación por etapas

| Etapa | Entrega | Criterio para avanzar |
|---|---|---|
| 0. Diseño | Esta especificación, modelo de datos y formato de encuentro | Reglas y límites acordados |
| 1. Núcleo | Participantes, iniciativa, turnos, acciones, ataques, daño y azar criptográfico | Pruebas del núcleo aprobadas |
| 2. Acciones y estados | Esquivar, esconderse, condiciones, salvaciones, reacciones y recursos prioritarios | Casos de campaña aprobados |
| 3. Automatización | Aliados/enemigos con rasgos y perfiles tácticos | Turnos automáticos auditables |
| 4. Mapa | Movimiento, tamaños, alcance, línea de visión, cobertura y terreno | Escenarios tácticos aprobados |
| 5. Integración | Importar encuentro desde Nox y fichas de campaña | Importación validada |
| 6. Continuidad | Resumen legible, JSON, reimportación y cierre fiable | Pruebas de ida y vuelta aprobadas |
| 7. Pulido | Interfaz, accesibilidad, móvil y documentación | Prueba práctica completa |

Las etapas pueden solaparse en tareas pequeñas, pero no se añade una mecánica compleja antes de definir sus reglas y pruebas.

## 16. Decisiones pendientes que deben quedar explícitas

Estas decisiones no deben resolverse por suposición:
- Qué reglas simplificadas de campaña prevalecen sobre el marco 2014 en cada caso concreto.
- Qué política táctica predeterminada se desea para cada aliado y tipo de enemigo.
- Qué reglas de cuadrícula, diagonal, flanqueo y tamaño se usarán en cada encuentro.
- Qué acciones, conjuros y rasgos se implementan primero, según las fichas reales.
- Si el jugador quiere introducir manualmente alguna tirada de Cuervo Dice Engine o permitir que el motor genere todas las tiradas localmente.
- Qué datos del encuentro deben persistir automáticamente entre sesiones y cuáles solo mediante exportación.

Hasta que una decisión se acuerde, se conserva el comportamiento más transparente: solicitar intervención manual y dejar constancia.

## 17. Criterio de calidad final

El motor estará listo para uso habitual cuando un combate de prueba pueda completarse de principio a fin sin que el usuario tenga que corregir cálculos ocultos, cuando Cuervo nunca pierda el control de sus decisiones, cuando aliados y enemigos respeten sus fichas, y cuando el resumen exportado permita a Nox actualizar la continuidad de la campaña sin reconstruir lo ocurrido a partir de recuerdos incompletos.
