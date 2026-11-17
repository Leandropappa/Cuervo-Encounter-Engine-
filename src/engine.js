// Cuervo Encounter Engine — core rules module
// D&D 5e 2014 campaign profile. Unknown rules are never silently inferred.

export const ABILITIES = ["strength","dexterity","constitution","intelligence","wisdom","charisma"];
export const CONDITIONS = ["blinded","charmed","deafened","frightened","grappled","incapacitated","invisible","paralyzed","petrified","poisoned","prone","restrained","stunned","unconscious","exhaustion"];

export function validateEncounter(data) {
  const errors = [], warnings = [];
  if (!data || typeof data !== "object") return {valid:false,errors:["El archivo no contiene un objeto de encuentro."],warnings};
  if (data.schemaVersion !== "1.0.0") warnings.push("Versión de esquema no reconocida; se intentará validar sin migración.");
  if (!Array.isArray(data.participants) || data.participants.length < 2) errors.push("El encuentro necesita al menos dos participantes.");
  const ids = new Set();
  for (const [i,p] of (data.participants || []).entries()) {
    if (!p.instanceId || ids.has(p.instanceId)) errors.push(`Participante ${i+1}: instanceId vacío o duplicado.`);
    ids.add(p.instanceId);
    if (!p.profile && !p.profileRef) errors.push(`${p.instanceId}: falta profile o profileRef.`);
    if (p.profile && (!p.profile.name || !Number.isFinite(p.profile.armorClass) || !Number.isFinite(p.profile.hitPointsMax) || !p.profile.speedFeet?.walk && p.profile.speedFeet?.walk !== 0)) errors.push(`${p.instanceId}: la ficha carece de nombre, CA, PG máximos o velocidad.`);
    if (p.profile && (p.state?.hitPoints < 0 || p.state?.hitPoints > p.profile.hitPointsMax)) errors.push(`${p.instanceId}: PG actuales fuera del rango permitido.`);
    if (p.profile && p.state?.resources) for (const [key,val] of Object.entries(p.state.resources)) {
      const max=p.profile.resources?.[key]?.max;
      if (max !== undefined && val > max) errors.push(`${p.instanceId}: recurso ${key} supera su máximo.`);
    }
    if (p.state?.position && data.map && (p.state.position.x>=data.map.width || p.state.position.y>=data.map.height)) errors.push(`${p.instanceId}: posición fuera del mapa.`);
    if (p.controller==="player" && p.side!=="player") warnings.push(`${p.instanceId}: controlador jugador asignado a un bando no jugador.`);
    if (p.profileRef) warnings.push(`${p.instanceId}: referencia de ficha externa ${p.profileRef} no se puede resolver en esta versión.`);
    for (const a of p.profile?.attacks || []) if (a.implementation==="manual") warnings.push(`${p.instanceId}: ataque "${a.name}" requiere resolución manual.`);
  }
  if (!data.map || !Number.isInteger(data.map.width) || !Number.isInteger(data.map.height)) warnings.push("No hay mapa táctico válido; se jugará sin cuadrícula.");
  return {valid:errors.length===0,errors,warnings};
}

function secureInt(maxExclusive) {
  if (!globalThis.crypto?.getRandomValues) throw new Error("Web Crypto no está disponible; no se generará azar inseguro.");
  if (!Number.isInteger(maxExclusive) || maxExclusive<1 || maxExclusive>65536) throw new Error("Límite de dado inválido.");
  const range=65536, limit=Math.floor(range/maxExclusive)*maxExclusive;
  const buf=new Uint16Array(1);
  let n;
  do { crypto.getRandomValues(buf); n=buf[0]; } while(n>=limit);
  return n%maxExclusive;
}
export function rollDie(sides) {
  if (!Number.isInteger(sides)||sides<2||sides>100) throw new Error("Dado no válido.");
  return secureInt(sides)+1;
}
export function rollExpression(expression) {
  if (typeof expression!=="string" || !/^[0-9dD+\- ]{1,40}$/.test(expression)) throw new Error("Expresión de daño no válida.");
  const normalized=expression.replace(/\s/g,"").toLowerCase();
  const tokens=normalized.match(/[+-]?[^+-]+/g);
  if (!tokens) throw new Error("Expresión vacía.");
  const dice=[], modifiers=[];
  let total=0;
  for (const token of tokens) {
    const sign=token.startsWith("-")?-1:1, part=token.replace(/^[+-]/,"");
    if (part.includes("d")) {
      const [countRaw,sidesRaw]=part.split("d"), count=countRaw===""?1:Number(countRaw), sides=Number(sidesRaw);
      if (!Number.isInteger(count)||count<1||count>20||!Number.isInteger(sides)||sides<2||sides>100) throw new Error("Cantidad o tipo de dado fuera de rango.");
      for(let i=0;i<count;i++){const value=rollDie(sides);dice.push({die:`d${sides}`,value,sign});total+=value*sign;}
    } else {
      const value=Number(part);
      if(!Number.isInteger(value)) throw new Error("Modificador inválido.");
      modifiers.push({value:value*sign}); total+=value*sign;
    }
  }
  return {expression,dice,modifiers,total};
}
export function abilityModifier(score) { return Math.floor((score-10)/2); }
export function distanceFeet(a,b,cellSize=5,rule="five_feet") {
  const dx=Math.abs(a.x-b.x),dy=Math.abs(a.y-b.y);
  if(rule==="euclidean") return Math.hypot(dx,dy)*cellSize;
  if(rule==="alternating_5_10") return (Math.max(dx,dy)+Math.floor(Math.min(dx,dy)/2))*cellSize;
  return Math.max(dx,dy)*cellSize;
}
export function createCombat(encounter, random=rollDie) {
  const check=validateEncounter(encounter);
  if(!check.valid) throw new Error(check.errors.join("\n"));
  const participants=encounter.participants.map(p=>({...structuredClone(p),state:{...p.state,resources:{...(p.state.resources||{})},conditions:[...(p.state.conditions||[])],effects:[...(p.state.effects||[])]},turn:{action:false,bonusAction:false,movement:0,reaction:true}}));
  const events=[];
  let sequence=0, round=1, turnIndex=0, active=false, finished=false;
  const log=(type,actorId,details={},source="engine")=>events.push({sequence:++sequence,round,turn:turnIndex,actorId,type,details,source,timestamp:new Date().toISOString()});
  function initiative() {
    const unresolved=[];
    for(const p of participants){
      if(Number.isInteger(p.initiative?.total)) continue;
      const bonus=p.profile.initiativeBonus;
      if(!Number.isInteger(bonus)){unresolved.push(p.instanceId);continue;}
      const d=random(20), total=d+bonus; p.initiative={...(p.initiative||{}),total};
      log("initiative",p.instanceId,{d20:d,bonus,total});
    }
    if(unresolved.length) throw new Error("Falta bonificador de iniciativa: "+unresolved.join(", "));
    participants.sort((a,b)=>b.initiative.total-a.initiative.total || (a.initiative.tieBreakOrder??999)-(b.initiative.tieBreakOrder??999));
    active=true; turnIndex=0; beginTurn(); return participants.map(p=>({id:p.instanceId,total:p.initiative.total}));
  }
  function current(){return participants[turnIndex]||null;}
  function beginTurn(){
    const p=current(); if(!p||finished)return;
    p.turn={action:false,bonusAction:false,movement:p.profile.speedFeet.walk||0,reaction:p.turn?.reaction??true};
    log("turn_start",p.instanceId,{round});
  }
  function nextTurn(){
    if(!active||finished) throw new Error("No hay combate activo.");
    const ended=current(); log("turn_end",ended.instanceId,{});
    turnIndex++;
    if(turnIndex>=participants.length){turnIndex=0;round++;log("round_start",null,{round});}
    beginTurn(); return current();
  }
  function spend(p,kind){
    if(kind==="action"||kind==="bonusAction"){if(p.turn[kind])throw new Error("Ese tipo de acción ya fue utilizado.");p.turn[kind]=true;}
    else if(kind==="reaction"){if(!p.turn.reaction)throw new Error("Reacción ya utilizada.");p.turn.reaction=false;}
  }
  function attack(actorId,targetId,attackId,{advantage=0,consumeAction=true}={}) {
    const a=participants.find(p=>p.instanceId===actorId), t=participants.find(p=>p.instanceId===targetId);
    if(!a||!t) throw new Error("Atacante u objetivo inexistente.");
    const weapon=a.profile.attacks?.find(x=>x.id===attackId);
    if(!weapon) throw new Error("Ataque no encontrado en la ficha.");
    if(weapon.implementation==="manual") throw new Error("Este ataque está marcado para resolución manual.");
    if(t.state.hitPoints<=0) throw new Error("El objetivo ya no tiene PG.");
    let effectiveAdvantage=advantage, measuredRange=null;
    if(encounter.map && a.state.position && t.state.position && Number.isFinite(weapon.range?.normalFeet)){
      measuredRange=distanceFeet(a.state.position,t.state.position,encounter.map.cellSizeFeet,encounter.map.diagonalRule);
      const ranged=weapon.attackType==="ranged_weapon"||weapon.attackType==="ranged_spell";
      const maximum=ranged?(weapon.range.longFeet??weapon.range.normalFeet):weapon.range.normalFeet;
      if(measuredRange>maximum) throw new Error("Objetivo fuera del alcance del ataque.");
      if(ranged&&measuredRange>weapon.range.normalFeet) effectiveAdvantage-=1;
    }
    effectiveAdvantage=Math.max(-1,Math.min(1,effectiveAdvantage));
    if(consumeAction){if(a!==current())throw new Error("Solo puede actuar el participante cuyo turno está activo.");spend(a,"action");}
    const d1=random(20),d2=effectiveAdvantage===0?null:random(20),natural=d2===null?d1:(effectiveAdvantage>0?Math.max(d1,d2):Math.min(d1,d2));
    const total=natural+weapon.attackBonus, hit=natural===20 || (natural!==1 && total>=t.profile.armorClass);
    log("attack_roll",actorId,{targetId,attackId,weapon:weapon.name,d20:d1,secondD20:d2,advantage:effectiveAdvantage,rangeFeet:measuredRange,natural,bonus:weapon.attackBonus,total,targetAC:t.profile.armorClass,hit,critical:natural===20});
    let damage=null;
    if(hit){
      damage=rollExpression(weapon.damage);
      if(natural===20){const extra=rollExpression(weapon.damage.replace(/(\d*)d(\d+)/gi,(_,n,s)=>`${(Number(n)||1)}d${s}`));damage={...damage,dice:[...damage.dice,...extra.dice],total:damage.total+extra.dice.reduce((s,d)=>s+d.value*d.sign,0),criticalExtra:extra};}
      const before=t.state.hitPoints, applied=Math.max(0,damage.total), after=Math.max(0,before-applied);
      t.state.hitPoints=after; log("damage",actorId,{targetId,expression:weapon.damage,roll:damage,damage:applied,before,after,damageType:weapon.damageType,critical:natural===20});
      if(after===0) log("reduced_to_zero",targetId,{source:actorId});
    }
    return {hit,natural,total,damage,target:t.state.hitPoints};
  }
  function move(actorId,x,y){
    const p=participants.find(v=>v.instanceId===actorId); if(!p||p!==current())throw new Error("No es el turno de ese participante.");
    if(!encounter.map)throw new Error("El encuentro no tiene mapa.");
    if(!Number.isInteger(x)||!Number.isInteger(y)||x<0||y<0||x>=encounter.map.width||y>=encounter.map.height)throw new Error("Destino fuera del mapa.");
    const from=p.state.position;if(!from)throw new Error("Participante sin posición.");
    const cost=distanceFeet(from,{x,y},encounter.map.cellSizeFeet,encounter.map.diagonalRule);
    if(cost>p.turn.movement)throw new Error("Movimiento insuficiente.");
    const blocked=(encounter.map.obstacles||[]).some(o=>o.blocksMovement&&(o.cells||[]).some(c=>c.x===x&&c.y===y));
    const occupied=participants.some(q=>q!==p&&q.state.position?.x===x&&q.state.position?.y===y&&q.state.hitPoints>0);
    if(blocked||occupied)throw new Error("Casilla bloqueada u ocupada.");
    p.state.position={x,y};p.turn.movement-=cost;log("movement",actorId,{from,to:{x,y},cost,remaining:p.turn.movement});return p.turn.movement;
  }
  function end(){
    if(finished)return;
    finished=true;active=false;log("encounter_end",null,{round,participants:participants.map(p=>({id:p.instanceId,hp:p.state.hitPoints}))});
  }
  function state(){return {encounter,participants,events,round,turnIndex,active,finished,current:current()?.instanceId||null};}
  function exportJSON(){return JSON.stringify({schemaVersion:encounter.schemaVersion,encounterId:encounter.encounterId,name:encounter.name,status:finished?"finished":active?"active":"prepared",round,turnIndex,participants,events},null,2);}
  function exportText(){
    const lines=[`ENCUENTRO: ${encounter.name}`,`Estado: ${finished?"Finalizado":active?"En curso":"Preparado"} | Ronda: ${round}`,"","PARTICIPANTES",...participants.map(p=>`- ${p.profile.name}: ${p.state.hitPoints}/${p.profile.hitPointsMax} PG (CA ${p.profile.armorClass})`),"","REGISTRO"];
    for(const e of events) lines.push(`[${e.sequence}] R${e.round} ${e.type} ${e.actorId||""} ${JSON.stringify(e.details)}`);
    return lines.join("\n");
  }
  function autoTurn(){
    const actor=current();if(!actor||actor.controller!=="ai")throw new Error("El turno activo no pertenece a la IA.");
    const foes=participants.filter(p=>p.side!==actor.side&&p.state.hitPoints>0);
    const attacks=actor.profile.attacks||[];
    if(actor.state.hitPoints<=0){log("auto_skip",actor.instanceId,{reason:"sin PG"});return {kind:"skip"};}
    if(!foes.length){log("auto_skip",actor.instanceId,{reason:"sin objetivos activos"});return {kind:"skip"};}
    const usable=attacks.find(a=>a.implementation!=="manual");
    if(!usable){log("manual_required",actor.instanceId,{reason:"No hay ataque automatizable documentado"});return {kind:"manual"};}
    const target=foes.sort((a,b)=>{
      if(actor.state.position&&a.state.position&&b.state.position)return distanceFeet(actor.state.position,a.state.position)-distanceFeet(actor.state.position,b.state.position);
      return a.state.hitPoints-b.state.hitPoints;
    })[0];
    if(actor!==current())return {kind:"error"};
    const result=attack(actor.instanceId,target.instanceId,usable.id,{consumeAction:false});
    actor.turn.action=true;
    log("ai_decision",actor.instanceId,{targetId:target.instanceId,attackId:usable.id,reason:"objetivo enemigo válido más cercano con ataque documentado"});
    return {kind:"attack",target:target.instanceId,result};
  }
  return {participants,events,initiative,current,nextTurn,attack,move,end,state,exportJSON,exportText,autoTurn,log};
}
