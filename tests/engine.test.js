import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { validateEncounter, abilityModifier, distanceFeet, createCombat, rollExpression } from "../src/engine.js";

const example = JSON.parse(await readFile(new URL("../examples/encuentro-ejemplo.json", import.meta.url), "utf8"));

test("el encuentro de ejemplo pasa la validación estructural y semántica básica", () => {
  const result = validateEncounter(example);
  assert.equal(result.valid, true, result.errors.join("; "));
});

test("rechaza IDs duplicados y estados de PG imposibles", () => {
  const broken = structuredClone(example);
  broken.participants[1].instanceId = broken.participants[0].instanceId;
  broken.participants[0].state.hitPoints = 999;
  const result = validateEncounter(broken);
  assert.equal(result.valid, false);
  assert.ok(result.errors.some(x => x.includes("duplicado")));
  assert.ok(result.errors.some(x => x.includes("PG actuales")));
});

test("modificadores de característica usan redondeo hacia abajo", () => {
  assert.equal(abilityModifier(7), -2);
  assert.equal(abilityModifier(10), 0);
  assert.equal(abilityModifier(16), 3);
});

test("distancias de cuadrícula respetan regla diagonal de campaña", () => {
  assert.equal(distanceFeet({x:0,y:0},{x:3,y:2},5,"five_feet"),15);
  assert.equal(distanceFeet({x:0,y:0},{x:3,y:2},5,"alternating_5_10"),20);
});

test("expresiones de daño se calculan y rechazan entradas inseguras", () => {
  const result = rollExpression("2d6+3");
  assert.equal(result.dice.length, 2);
  assert.ok(result.total >= 5 && result.total <= 15);
  assert.throws(() => rollExpression("1d6;alert(1)"));
  assert.throws(() => rollExpression("100d6"));
});

test("iniciativa crea un orden y Cuervo/jugador conserva el turno manual", () => {
  const combat = createCombat(example, () => 10);
  const order = combat.initiative();
  assert.equal(order.length, 2);
  assert.equal(combat.current().controller, "player");
  assert.equal(combat.current().turn.action, false);
});

test("un ataque natural 1 falla automáticamente y queda auditado", () => {
  const combat = createCombat(example, () => 1);
  combat.initiative();
  const actor = combat.current();
  const target = combat.participants.find(p => p.side === "enemy");
  const before = target.state.hitPoints;
  target.state.position = {x:3,y:3};
  const result = combat.attack(actor.instanceId, target.instanceId, actor.profile.attacks[0].id);
  assert.equal(result.hit, false);
  assert.equal(result.natural, 1);
  assert.equal(target.state.hitPoints, before);
  assert.ok(combat.events.some(e => e.type === "attack_roll" && e.details.natural === 1));
});

test("el motor impide ataques cuerpo a cuerpo fuera de alcance", () => {
  const combat = createCombat(example, () => 10);
  combat.initiative();
  const actor = combat.current();
  const target = combat.participants.find(p => p.side === "enemy");
  assert.throws(() => combat.attack(actor.instanceId, target.instanceId, actor.profile.attacks[0].id), /fuera del alcance/);
});
