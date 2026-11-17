# Modelo de datos y formato de importación — Cuervo Encounter Engine

**Versión del esquema:** 1.0.0  
**Estado:** propuesta técnica para la reconstrucción  
**Documento rector:** [Especificación funcional](ESPECIFICACION_FUNCIONAL.md)

Este documento define cómo se representan las fichas, los encuentros, el estado de combate y las reglas especiales. El formato es independiente de la interfaz y está pensado para que Nox pueda generar un encuentro desde el chat y el motor lo valide antes de cargarlo.

## 1. Decisiones de diseño

- Un **perfil** describe la ficha base; una **instancia** representa a esa criatura concreta dentro de un encuentro.
- Los cambios durante el combate afectan solo a la instancia, nunca a la ficha maestra.
- Los valores desconocidos se omiten o se declaran explícitamente como `null`; nunca se inventan ceros o competencias.
- Las capacidades son datos estructurados y ejecutables por el motor de reglas. Una capacidad sin implementación se importa como `manual`, no se ejecuta parcialmente.
- Las distancias internas usan **pies** como unidad canónica. La interfaz puede mostrar metros como conversión visual.
- Cada encuentro declara su edición y sus adaptaciones de campaña. No se mezclan reglas 2014 y 2024.
- El JSON contiene solo datos del encuentro y perfiles necesarios. No contiene biografías, secretos narrativos ni documentos privados ajenos a la mecánica.

## 2. Archivos y organización

La implementación usará esta organización:

```text
src/
  domain/
    encounter.js
    participant.js
    events.js
  rules/
    initiative.js
    actions.js
    attacks.js
    damage.js
    conditions.js
    reactions.js
  dice/
    secure-rng.js
    roll.js
  tactics/
    grid.js
    movement.js
    line-of-sight.js
    cover.js
  agents/
    ally-policy.js
    enemy-policy.js
  io/
    validate-encounter.js
    import-encounter.js
    export-encounter.js
schemas/
  encounter.schema.json
examples/
  encuentro-ejemplo.json
tests/
  ...
```

Esta es la organización objetivo, no una afirmación de que esos módulos ya estén implementados.

## 3. Estructura raíz del encuentro

| Campo | Obligatorio | Descripción |
|---|---|---|
| `schemaVersion` | Sí | Versión del formato, actualmente `1.0.0`. |
| `encounterId` | Sí | Identificador estable y único del encuentro. |
| `name` | Sí | Nombre visible. |
| `ruleset` | Sí | Sistema, marco 2014 y adaptaciones de campaña. |
| `metadata` | No | Autor, fecha de creación, notas técnicas. |
| `participants` | Sí | Instancias participantes. |
| `map` | No | Cuadrícula, terreno, obstáculos y posiciones. |
| `initiative` | No | Método y orden manual opcional. |
| `objectives` | No | Condiciones de victoria/derrota y objetivos narrativos. |
| `automation` | No | Política táctica de aliados y enemigos. |
| `houseRules` | No | Reglas específicas de este encuentro, con identificador y descripción. |

Los campos no obligatorios no se completan con valores asumidos por el importador.

## 4. Perfil mecánico

Un perfil contiene los datos relativamente estables de una criatura:

- Identidad: `profileId`, nombre, rol, tamaño, tipo y etiquetas.
- Estadísticas: atributos, competencia, CA, PG máximos, velocidades e iniciativa.
- Salvaciones y habilidades: solo las confirmadas en la ficha.
- Sentidos: visión, visión en oscuridad y Percepción pasiva cuando consten.
- Ataques: bonificador, alcance, tipo de ataque, daño, propiedades y requisitos.
- Capacidades: acciones, acciones adicionales, reacciones, rasgos y conjuros.
- Recursos: usos, espacios y frecuencia de recuperación.
- Resistencias, vulnerabilidades e inmunidades, si están documentadas.

### Atributos

Los atributos se guardan como valores numéricos entre 1 y 30. Los modificadores pueden calcularse desde el valor, pero si la ficha de campaña establece un modificador explícito distinto, se debe conservar y señalar la discrepancia para revisión.

### Competencias

Una competencia se representa explícitamente, por ejemplo:

```json
{
  "savingThrows": {
    "dexterity": { "bonus": 5, "proficient": true }
  },
  "skills": {
    "stealth": { "bonus": 5, "proficient": true }
  }
}
```

No se deduce competencia a partir del bonificador final.

## 5. Capacidades mecánicas

Cada capacidad usa una estructura común:

- `id`: identificador único dentro del perfil.
- `name`: nombre visible.
- `kind`: `action`, `bonusAction`, `reaction`, `trait`, `spell` o `other`.
- `implementation`: `engine` si el motor conoce la regla, o `manual` si requiere adjudicación.
- `trigger`: desencadenante, obligatorio para reacciones.
- `requirements`: requisitos y restricciones.
- `uses`: cantidad y recuperación, si corresponde.
- `effect`: efecto estructurado que el motor pueda resolver.
- `sourceNote`: referencia a la ficha o decisión de campaña.

Ejemplo conceptual de reacción:

```json
{
  "id": "interposition",
  "name": "Interposición",
  "kind": "reaction",
  "implementation": "engine",
  "trigger": {
    "event": "attack_declared",
    "targetMustBeAlly": true,
    "rangeFeet": 5,
    "requiresSightOfAttacker": true
  },
  "uses": {
    "max": 1,
    "recharge": "short_or_long_rest"
  },
  "effect": {
    "type": "impose_disadvantage",
    "roll": "attack"
  }
}
```

El ejemplo ilustra el modelo. La ficha real y las pruebas de reglas determinan la semántica definitiva; no basta con importar este objeto para afirmar que la reacción ya está implementada.

## 6. Instancia de participante

Cada participante del encuentro contiene:

- `instanceId`: identidad única en este encuentro.
- `profile`: ficha mecánica embebida o referencia a un perfil disponible.
- `side`: `player`, `ally` o `enemy`.
- `controller`: `player`, `ai` o `dm`.
- `state`: PG actuales, recursos actuales, condiciones, efectos, posición y estado de actividad.
- `initiative`: valor y desempate opcional.
- `tactics`: perfil y prioridades del agente automático, si corresponde.

El perfil puede incluirse directamente en `profile` o referenciarse mediante `profileRef`. Si la referencia no se resuelve, el importador debe detener la carga de ese participante y explicar qué perfil falta. No se permiten referencias externas arbitrarias ni descargas remotas.

## 7. Estado de combate

El estado de cada instancia se mantiene separado del perfil:

- PG actuales.
- Dados de golpe/recursos restantes, si el motor los gestiona.
- Usos restantes de capacidades.
- Espacios de conjuro.
- Condiciones y efectos activos, con origen y vencimiento.
- Concentración.
- Posición en la cuadrícula.
- Estado: activo, incapacitado, inconsciente, muerto, retirado o fuera de escena, según reglas implementadas.

Los valores actuales iniciales deben estar dentro de los límites de la ficha, salvo que el DM confirme explícitamente una excepción.

## 8. Mapa y coordenadas

- `width` y `height`: número de casillas.
- `cellSizeFeet`: tamaño físico de una casilla.
- `diagonalRule`: regla de diagonal identificada; en la adaptación inicial de campaña, `five_feet`.
- `terrain`: regiones o casillas con coste de movimiento o efecto.
- `obstacles`: geometría y propiedades; bloquear movimiento, visión o conceder cobertura son propiedades distintas.
- `positions`: se almacenan en cada instancia como coordenadas de casilla `x`, `y`; criaturas grandes declaran tamaño y ocupan el espacio correspondiente.

El mapa no inventa altura, iluminación, ocultamiento ni cobertura si esos datos no fueron configurados.

## 9. Iniciativa

El encuentro puede usar:
- `roll`: el motor tira iniciativa para los participantes con modificador conocido.
- `manual`: Nox/DM proporciona los valores.
- `mixed`: algunos valores manuales y otros generados.

Los empates se representan y se resuelven explícitamente. El importador no reordena participantes empatados de forma silenciosa.

## 10. Automatización

Cada instancia controlada por IA puede declarar:
- `archetype`: agresivo, defensor, tirador, controlador, protector, cobarde o personalizado.
- `priorities`: lista ordenada de objetivos tácticos.
- `protects`: identificadores de aliados a proteger.
- `retreatAtHpPercent`: umbral opcional, si el DM lo establece.
- `manualFallback`: si la decisión requiere intervención del DM.

El perfil táctico no concede acciones ni capacidades. Solo ordena la selección entre opciones legales definidas por la ficha y el motor.

## 11. Validación e importación

La importación se ejecuta en dos fases:

### Fase A — Validación sin efectos

1. Leer JSON y comprobar sintaxis.
2. Comprobar `schemaVersion`.
3. Validar estructura y tipos.
4. Resolver perfiles locales.
5. Comprobar identificadores duplicados.
6. Comprobar coherencia de PG, recursos, coordenadas, iniciativa y referencias.
7. Marcar capacidades manuales o reglas todavía no soportadas.
8. Mostrar un informe previo al usuario.

### Fase B — Confirmación y carga

Solo después de la confirmación:
1. Crear la instancia del encuentro.
2. Clonar estados iniciales.
3. Construir el mapa.
4. Preparar iniciativa y registro.
5. Mostrar resumen de participantes, reglas manuales y advertencias.

La importación no tira dados, no inicia combate y no consume recursos. Eso ocurre solo cuando el usuario inicia el encuentro.

## 12. Informe previo de importación

Antes de confirmar, la interfaz debe mostrar:
- Nombre e identificador del encuentro.
- Cantidad de participantes por bando.
- Fichas resueltas y referencias faltantes.
- Mapa y tamaño.
- Método de iniciativa.
- Capacidades que el motor puede ejecutar.
- Capacidades que requieren resolución manual.
- Campos desconocidos, inconsistencias y advertencias.

Errores estructurales bloquean la importación. Advertencias no críticas permiten continuar solo con confirmación explícita.

## 13. Versionado y compatibilidad

- La versión del esquema usa semver.
- Cambios compatibles añaden campos opcionales y aumentan versión menor.
- Cambios incompatibles aumentan versión mayor.
- El motor no debe importar una versión mayor desconocida.
- Las migraciones deben ser explícitas, probadas y no alterar resultados o estadísticas silenciosamente.

## 14. Plantilla mínima

La plantilla real y un ejemplo ilustrativo están en:
- [JSON Schema](../schemas/encounter.schema.json)
- [Encuentro ilustrativo](../examples/encuentro-ejemplo.json)

El ejemplo usa estadísticas ficticias claramente rotuladas. No debe utilizarse como ficha oficial de ningún personaje de Las Cenizas de la Marea.
