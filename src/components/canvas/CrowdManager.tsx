'use client';

import { useEffect, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { useOfficeStore } from '@/store/useOfficeStore';
import { ensureRecastReady, buildOfficeNavMesh } from '@/lib/navmesh';
import * as crowdManager from '@/lib/crowdManager';
import { WORKSTATION_DESKS } from '@/constants/officeLayout';

// How long an agent spends playing the stationary gym-equipment animation
// (see PRD section 8.3) before rejoining the crowd and heading back to its desk.
const GYM_ACTIVITY_DURATION_MS = 8000;

/**
 * Owns the recast-navigation NavMesh + Crowd for the whole scene.
 *
 * This is the single source of truth for agent movement: it bakes the navmesh
 * from static office geometry once, registers every agent as a Crowd agent,
 * and each frame steps the crowd simulation (which handles pathfinding,
 * wall/furniture avoidance and agent-agent local avoidance/ORCA on its own —
 * no manual collision math anywhere else in the codebase).
 *
 * It also advances each agent through its (possibly randomized) waypoint
 * chain and flips status back to idle/working once the final destination
 * on the navmesh is reached.
 */
export const CrowdManager = () => {
  const [ready, setReady] = useState(false);
  const initialized = useRef(false);
  // agentId -> epoch ms when its gym animation should end and it should
  // rejoin the crowd (see handleGymArrival below).
  const gymWakeAt = useRef<Map<string, number>>(new Map());

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;
    let cancelled = false;

    (async () => {
      await ensureRecastReady();
      if (cancelled) return;
      const navMesh = buildOfficeNavMesh();
      crowdManager.initCrowd(navMesh, 24);

      const agents = useOfficeStore.getState().agents;
      Object.values(agents).forEach((agent) => {
        crowdManager.addCrowdAgent(agent.id, agent.position, {
          radius: 0.32,
          maxSpeed: agent.speedMode === 'run' ? crowdManager.RUN_SPEED : crowdManager.WALK_SPEED,
        });
      });

      if (!cancelled) setReady(true);
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  useFrame((_, delta) => {
    if (!ready) return;
    const dt = Math.min(delta, 0.05);
    crowdManager.tickCrowd(dt);

    const state = useOfficeStore.getState();
    Object.values(state.agents).forEach((agent) => {
      if (!agent.targetPosition) return;
      const transform = crowdManager.getTransform(agent.id);
      if (!transform) return;

      const [tx, , tz] = agent.targetPosition;
      const dx = transform.position.x - tx;
      const dz = transform.position.z - tz;
      const arrived = dx * dx + dz * dz < 0.06;
      if (!arrived) return;

      if (agent.targetWaypoints && agent.targetWaypoints.length > 0) {
        const [next, ...rest] = agent.targetWaypoints;
        crowdManager.requestMove(agent.id, next);
        state.updateAgent(agent.id, { targetPosition: next, targetWaypoints: rest });
      } else {
        // Only auto-derive a resting status from deskIndex for a plain "walk
        // somewhere" transit (status still 'walking'). A caller that already
        // set an explicit end-state before the walk started — 'gym',
        // 'billiards', 'pingpong', 'break', 'meeting' — keeps that status on
        // arrival instead of it being silently overwritten back to
        // idle/working the instant the agent's feet stop moving.
        const finalStatus = agent.status === 'walking' ? (agent.deskIndex !== undefined ? 'working' : 'idle') : agent.status;
        state.updateAgent(agent.id, { targetPosition: undefined, targetWaypoints: undefined, status: finalStatus });

        if (finalStatus === 'gym') {
          // Detach from crowd steering while the stationary workout animation
          // plays (PRD 8.3) — it keeps rendering in place via its frozen
          // transform, just no longer participates in crowd avoidance.
          crowdManager.removeCrowdAgent(agent.id);
          gymWakeAt.current.set(agent.id, Date.now() + GYM_ACTIVITY_DURATION_MS);
        }
      }
    });

    // Rejoin the crowd once an agent's gym animation duration elapses, then
    // send it back to its desk (or idle in place if it has none).
    gymWakeAt.current.forEach((wakeAt, agentId) => {
      if (Date.now() < wakeAt) return;
      gymWakeAt.current.delete(agentId);
      const agent = state.agents[agentId];
      if (!agent) return;
      const transform = crowdManager.getTransform(agentId);
      const currentPos: [number, number, number] = transform
        ? [transform.position.x, transform.position.y, transform.position.z]
        : agent.position;
      crowdManager.addCrowdAgent(agentId, currentPos, {
        radius: 0.32,
        maxSpeed: crowdManager.WALK_SPEED,
      });
      if (agent.deskIndex !== undefined) {
        state.setAgentTarget(agentId, WORKSTATION_DESKS[agent.deskIndex], 'walk');
        state.updateAgent(agentId, { thought: 'Back at desk working.' });
      } else {
        state.updateAgent(agentId, { status: 'idle', thought: 'Wrapping up at the gym.' });
      }
    });
  });

  return null;
};
