import * as THREE from 'three';
import { Crowd, CrowdAgent, NavMesh } from 'recast-navigation';

export const WALK_SPEED = 3.2;
export const RUN_SPEED = 5.8;

interface AgentTransform {
  position: THREE.Vector3;
  velocity: THREE.Vector3;
}

let crowd: Crowd | null = null;
const handles = new Map<string, CrowdAgent>();
const transforms = new Map<string, AgentTransform>();
// Move requests that arrived before the crowd/agent existed yet (e.g. a manual
// trigger fired before the async navmesh bake finished) are queued and flushed
// on the next tick once the agent is registered.
const pendingMoves = new Map<string, [number, number, number]>();

export function initCrowd(navMesh: NavMesh, maxAgents = 24) {
  crowd?.destroy();
  handles.clear();
  transforms.clear();
  crowd = new Crowd(navMesh, { maxAgents, maxAgentRadius: 0.6 });
  return crowd;
}

export function addCrowdAgent(
  id: string,
  position: [number, number, number],
  opts?: { radius?: number; maxSpeed?: number }
) {
  if (!crowd) return;
  const radius = opts?.radius ?? 0.32;
  const agent = crowd.addAgent(new THREE.Vector3(...position), {
    radius,
    height: 1.7,
    maxAcceleration: 12,
    maxSpeed: opts?.maxSpeed ?? WALK_SPEED,
    collisionQueryRange: radius * 12,
    pathOptimizationRange: radius * 30,
    separationWeight: 2.2,
  });
  handles.set(id, agent);
  transforms.set(id, { position: new THREE.Vector3(...position), velocity: new THREE.Vector3() });

  const pending = pendingMoves.get(id);
  if (pending) {
    agent.requestMoveTarget(new THREE.Vector3(...pending));
    pendingMoves.delete(id);
  }
}

export function requestMove(id: string, target: [number, number, number]) {
  const agent = handles.get(id);
  if (!agent) {
    pendingMoves.set(id, target);
    return;
  }
  agent.requestMoveTarget(new THREE.Vector3(...target));
}

export function setMaxSpeed(id: string, speed: number) {
  const agent = handles.get(id);
  agent?.updateParameters({ maxSpeed: speed });
}

/**
 * Temporarily detaches an agent from the Crowd (e.g. while it plays a
 * stationary gym-equipment animation) without losing its last known
 * transform — getTransform() keeps returning its frozen position/velocity
 * so it still renders in place, it's just no longer part of crowd steering.
 * Call addCrowdAgent() again with the same id to rejoin.
 */
export function removeCrowdAgent(id: string) {
  if (!crowd) return;
  const agent = handles.get(id);
  if (!agent) return;
  crowd.removeAgent(agent.agentIndex);
  handles.delete(id);
  const t = transforms.get(id);
  t?.velocity.set(0, 0, 0);
}

export function hasCrowdAgent(id: string): boolean {
  return handles.has(id);
}

export function teleportAgent(id: string, position: [number, number, number]) {
  const agent = handles.get(id);
  if (!agent) {
    // Agent was detached (e.g. mid gym animation) — just re-add it fresh
    // rather than silently dropping the teleport request.
    addCrowdAgent(id, position);
    return;
  }
  agent.teleport(new THREE.Vector3(...position));
  agent.resetMoveTarget();
  const t = transforms.get(id);
  t?.position.set(...position);
  t?.velocity.set(0, 0, 0);
}

export function tickCrowd(dt: number) {
  if (!crowd) return;
  crowd.update(dt);
  handles.forEach((agent, id) => {
    const p = agent.position();
    const v = agent.velocity();
    const t = transforms.get(id);
    if (!t) return;
    t.position.set(p.x, p.y, p.z);
    t.velocity.set(v.x, v.y, v.z);
  });
  // Flush anything that was requested before its agent existed.
  if (pendingMoves.size > 0) {
    pendingMoves.forEach((target, id) => {
      const agent = handles.get(id);
      if (agent) {
        agent.requestMoveTarget(new THREE.Vector3(...target));
        pendingMoves.delete(id);
      }
    });
  }
}

export function getTransform(id: string): AgentTransform | undefined {
  return transforms.get(id);
}

export function isReady(): boolean {
  return crowd !== null;
}

export function destroyCrowd() {
  crowd?.destroy();
  crowd = null;
  handles.clear();
  transforms.clear();
  pendingMoves.clear();
}
