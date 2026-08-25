'use client';

import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import { Label } from './Label';
import { CharacterModel, CharacterAnimName } from './CharacterModel';
import * as THREE from 'three';
import { Agent } from '@/types/agent';
import { getTransform } from '@/lib/crowdManager';

interface AgentMeshProps {
  agent: Agent;
  isSelected: boolean;
  onSelect: (id: string) => void;
}

export const AgentMesh: React.FC<AgentMeshProps> = ({ agent, isSelected, onSelect }) => {
  const groupRef = useRef<THREE.Group>(null);
  const [anim, setAnim] = useState<CharacterAnimName>('Idle');

  useFrame((_, delta) => {
    if (!groupRef.current) return;
    const dt = Math.min(delta, 0.05);

    // Position & orientation are driven entirely by the recast-navigation Crowd
    // (see lib/crowdManager.ts) — pathfinding, wall/furniture avoidance and
    // agent-agent local avoidance all happen there, not in this component.
    const transform = getTransform(agent.id);
    const speed = transform ? transform.velocity.length() : 0;
    const isMoving = speed > 0.08;

    if (transform) {
      groupRef.current.position.x = transform.position.x;
      groupRef.current.position.z = transform.position.z;

      if (isMoving) {
        const angle = Math.atan2(transform.velocity.x, transform.velocity.z);
        groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, angle, Math.min(1, dt * 10));
      }
    }

    const nextAnim: CharacterAnimName = isMoving ? (agent.speedMode === 'run' ? 'Run' : 'Walk') : 'Idle';
    if (nextAnim !== anim) setAnim(nextAnim);
  });

  return (
    <group
      ref={groupRef}
      position={agent.position}
      onClick={(e) => {
        e.stopPropagation();
        onSelect(agent.id);
      }}
    >
      <CharacterModel color={agent.color} isSelected={isSelected} anim={anim} />

      {/* Selection Ring */}
      <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.35, 0.48, 24]} />
        <meshBasicMaterial color={isSelected ? '#38bdf8' : agent.color} side={THREE.DoubleSide} transparent opacity={isSelected ? 0.9 : 0.4} />
      </mesh>

      {/* Floating Tag */}
      <Label
        position={[0, 2.0, 0]}
        fontSize={0.2}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.03}
        outlineColor="#020617"
      >
        {agent.name.split(' ')[0]}
      </Label>

      {/* Thought / Speech Bubble when active */}
      {agent.thought && (
        <Html position={[0, 2.25, 0]} center distanceFactor={14}>
          <div className="bg-slate-900/90 border border-slate-700 text-slate-100 text-[10px] px-2.5 py-1 rounded-full shadow-lg whitespace-nowrap pointer-events-none backdrop-blur-sm flex items-center gap-1.5 animate-in fade-in zoom-in duration-200">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
            <span className="max-w-[140px] truncate">{agent.thought}</span>
          </div>
        </Html>
      )}
    </group>
  );
};
