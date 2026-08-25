'use client';

import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text, Html } from '@react-three/drei';
import * as THREE from 'three';
import { Agent } from '@/types/agent';
import { useOfficeStore } from '@/store/useOfficeStore';

interface AgentMeshProps {
  agent: Agent;
  isSelected: boolean;
  onSelect: (id: string) => void;
  allAgents: Agent[];
}

export const AgentMesh: React.FC<AgentMeshProps> = ({ agent, isSelected, onSelect, allAgents }) => {
  const groupRef = useRef<THREE.Group>(null);
  const leftLegRef = useRef<THREE.Mesh>(null);
  const rightLegRef = useRef<THREE.Mesh>(null);
  const leftArmRef = useRef<THREE.Mesh>(null);
  const rightArmRef = useRef<THREE.Mesh>(null);

  const currentPos = useRef(new THREE.Vector3(...agent.position));
  const updateAgent = useOfficeStore((state) => state.updateAgent);

  useFrame((_, delta) => {
    if (!groupRef.current) return;

    const dt = Math.min(delta, 0.05);

    // Dynamic animation limbs
    const isMoving = !!agent.targetPosition;
    const isWorking = agent.status === 'working';
    const isGym = agent.status === 'gym';
    const time = Date.now() * 0.008;

    if (isMoving && agent.targetPosition) {
      const target = new THREE.Vector3(...agent.targetPosition);
      const baseSpeed = agent.speedMode === 'run' ? 5.8 : 3.2;
      
      // ORCA-inspired Local Crowd Avoidance
      // Push direction slightly away from any neighboring agent within 0.8m radius
      const avoidance = new THREE.Vector3(0, 0, 0);
      allAgents.forEach((other) => {
        if (other.id !== agent.id) {
          const otherPos = new THREE.Vector3(...other.position);
          const dist = currentPos.current.distanceTo(otherPos);
          if (dist < 0.9 && dist > 0.001) {
            const pushDir = new THREE.Vector3().subVectors(currentPos.current, otherPos).normalize();
            avoidance.add(pushDir.multiplyScalar((0.9 - dist) * 2.5));
          }
        }
      });

      const dir = new THREE.Vector3().subVectors(target, currentPos.current);
      const dist = dir.length();

      if (dist > 0.15) {
        dir.normalize().add(avoidance.multiplyScalar(0.4)).normalize();
        const step = Math.min(baseSpeed * dt, dist);
        currentPos.current.add(dir.multiplyScalar(step));
        groupRef.current.position.copy(currentPos.current);

        // Smooth rotation towards velocity
        const angle = Math.atan2(dir.x, dir.z);
        groupRef.current.rotation.y = angle;

        // Limb swinging & vertical bob
        const walkFreq = agent.speedMode === 'run' ? 1.8 : 1.0;
        const legSwing = Math.sin(time * walkFreq * 8) * (agent.speedMode === 'run' ? 0.7 : 0.45);
        if (leftLegRef.current) leftLegRef.current.rotation.x = legSwing;
        if (rightLegRef.current) rightLegRef.current.rotation.x = -legSwing;
        if (leftArmRef.current) leftArmRef.current.rotation.x = -legSwing;
        if (rightArmRef.current) rightArmRef.current.rotation.x = legSwing;

        groupRef.current.position.y = Math.abs(Math.sin(time * walkFreq * 8)) * 0.1;
      } else {
        // Arrived at current target / waypoint
        if (agent.targetWaypoints && agent.targetWaypoints.length > 0) {
          const nextTarget = agent.targetWaypoints[0];
          const remainingWaypoints = agent.targetWaypoints.slice(1);
          updateAgent(agent.id, {
            position: [currentPos.current.x, currentPos.current.y, currentPos.current.z],
            targetPosition: nextTarget,
            targetWaypoints: remainingWaypoints,
          });
        } else {
          // Reached final destination
          currentPos.current.copy(target);
          groupRef.current.position.copy(target);
          groupRef.current.position.y = 0;
          if (leftLegRef.current) leftLegRef.current.rotation.x = 0;
          if (rightLegRef.current) rightLegRef.current.rotation.x = 0;
          if (leftArmRef.current) leftArmRef.current.rotation.x = 0;
          if (rightArmRef.current) rightArmRef.current.rotation.x = 0;

          updateAgent(agent.id, {
            position: [target.x, target.y, target.z],
            targetPosition: undefined,
            targetWaypoints: undefined,
            status: agent.deskIndex !== undefined ? 'working' : 'idle',
          });
        }
      }
    } else {
      groupRef.current.position.copy(currentPos.current);

      // Idle / Working / Gym gestures
      if (isWorking) {
        // Typing motion
        if (leftArmRef.current) leftArmRef.current.rotation.x = -Math.PI / 3 + Math.sin(time * 12) * 0.08;
        if (rightArmRef.current) rightArmRef.current.rotation.x = -Math.PI / 3 + Math.cos(time * 12) * 0.08;
      } else if (isGym) {
        // Gym workout motion
        const gymPhase = Math.sin(time * 4);
        if (leftArmRef.current) leftArmRef.current.rotation.x = gymPhase * 0.8;
        if (rightArmRef.current) rightArmRef.current.rotation.x = gymPhase * 0.8;
      } else {
        // Subtle breathing idle
        groupRef.current.position.y = Math.sin(time * 2) * 0.02;
        if (leftArmRef.current) leftArmRef.current.rotation.x = 0;
        if (rightArmRef.current) rightArmRef.current.rotation.x = 0;
      }
    }
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
      {/* 3D Rigged / Styled Low-Poly Character Figure */}
      {/* Torso */}
      <mesh position={[0, 0.75, 0]} castShadow>
        <boxGeometry args={[0.36, 0.48, 0.22]} />
        <meshStandardMaterial
          color={agent.color}
          roughness={0.4}
          metalness={0.2}
          emissive={isSelected ? agent.color : '#000000'}
          emissiveIntensity={isSelected ? 0.4 : 0}
        />
      </mesh>

      {/* Head */}
      <mesh position={[0, 1.25, 0]} castShadow>
        <boxGeometry args={[0.28, 0.28, 0.28]} />
        <meshStandardMaterial color="#fed7aa" roughness={0.5} />
      </mesh>

      {/* Hair / Cap */}
      <mesh position={[0, 1.38, 0]}>
        <boxGeometry args={[0.3, 0.08, 0.3]} />
        <meshStandardMaterial color="#1e293b" />
      </mesh>

      {/* Visor / Glasses */}
      <mesh position={[0, 1.28, 0.14]}>
        <boxGeometry args={[0.26, 0.08, 0.06]} />
        <meshStandardMaterial color="#0f172a" metalness={0.9} roughness={0.1} />
      </mesh>

      {/* Left Arm */}
      <mesh ref={leftArmRef} position={[-0.24, 0.7, 0]} castShadow>
        <boxGeometry args={[0.1, 0.4, 0.1]} />
        <meshStandardMaterial color={agent.color} />
      </mesh>

      {/* Right Arm */}
      <mesh ref={rightArmRef} position={[0.24, 0.7, 0]} castShadow>
        <boxGeometry args={[0.1, 0.4, 0.1]} />
        <meshStandardMaterial color={agent.color} />
      </mesh>

      {/* Left Leg */}
      <mesh ref={leftLegRef} position={[-0.1, 0.25, 0]} castShadow>
        <boxGeometry args={[0.12, 0.5, 0.14]} />
        <meshStandardMaterial color="#1e293b" />
      </mesh>

      {/* Right Leg */}
      <mesh ref={rightLegRef} position={[0.1, 0.25, 0]} castShadow>
        <boxGeometry args={[0.12, 0.5, 0.14]} />
        <meshStandardMaterial color="#1e293b" />
      </mesh>

      {/* Selection Ring */}
      <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.35, 0.48, 24]} />
        <meshBasicMaterial color={isSelected ? '#38bdf8' : agent.color} side={THREE.DoubleSide} transparent opacity={isSelected ? 0.9 : 0.4} />
      </mesh>

      {/* Floating Tag */}
      <Text
        position={[0, 1.68, 0]}
        fontSize={0.2}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.03}
        outlineColor="#020617"
      >
        {agent.name.split(' ')[0]}
      </Text>

      {/* Thought / Speech Bubble when active */}
      {agent.thought && (
        <Html position={[0, 1.95, 0]} center distanceFactor={14}>
          <div className="bg-slate-900/90 border border-slate-700 text-slate-100 text-[10px] px-2.5 py-1 rounded-full shadow-lg whitespace-nowrap pointer-events-none backdrop-blur-sm flex items-center gap-1.5 animate-in fade-in zoom-in duration-200">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
            <span className="max-w-[140px] truncate">{agent.thought}</span>
          </div>
        </Html>
      )}
    </group>
  );
};
