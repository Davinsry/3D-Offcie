'use client';

import React from 'react';
import { Text } from '@react-three/drei';
import { ROOM_BOUNDARIES, WORKSTATION_DESKS } from '@/constants/officeLayout';

// Wall component helper
const Wall = ({
  position,
  args,
  color = '#334155',
}: {
  position: [number, number, number];
  args: [number, number, number];
  color?: string;
}) => (
  <mesh position={position} receiveShadow castShadow>
    <boxGeometry args={args} />
    <meshStandardMaterial color={color} roughness={0.7} />
  </mesh>
);

// Desk with computer monitor
const WorkstationDesk = ({
  position,
  index,
}: {
  position: [number, number, number];
  index: number;
}) => (
  <group position={position}>
    {/* Table Top */}
    <mesh position={[0, 0.7, 0]} castShadow receiveShadow>
      <boxGeometry args={[1.6, 0.08, 0.9]} />
      <meshStandardMaterial color="#cbd5e1" roughness={0.3} />
    </mesh>
    {/* Table Legs */}
    <mesh position={[-0.7, 0.35, -0.35]} castShadow>
      <boxGeometry args={[0.08, 0.7, 0.08]} />
      <meshStandardMaterial color="#475569" metalness={0.5} />
    </mesh>
    <mesh position={[0.7, 0.35, -0.35]} castShadow>
      <boxGeometry args={[0.08, 0.7, 0.08]} />
      <meshStandardMaterial color="#475569" metalness={0.5} />
    </mesh>
    <mesh position={[-0.7, 0.35, 0.35]} castShadow>
      <boxGeometry args={[0.08, 0.7, 0.08]} />
      <meshStandardMaterial color="#475569" metalness={0.5} />
    </mesh>
    <mesh position={[0.7, 0.35, 0.35]} castShadow>
      <boxGeometry args={[0.08, 0.7, 0.08]} />
      <meshStandardMaterial color="#475569" metalness={0.5} />
    </mesh>
    {/* Monitor */}
    <mesh position={[0, 1.05, -0.25]} castShadow>
      <boxGeometry args={[0.7, 0.45, 0.04]} />
      <meshStandardMaterial color="#0f172a" roughness={0.2} metalness={0.8} />
    </mesh>
    {/* Screen glow */}
    <mesh position={[0, 1.05, -0.22]}>
      <planeGeometry args={[0.66, 0.41]} />
      <meshBasicMaterial color="#38bdf8" />
    </mesh>
    {/* Monitor Stand */}
    <mesh position={[0, 0.78, -0.25]}>
      <boxGeometry args={[0.12, 0.16, 0.12]} />
      <meshStandardMaterial color="#334155" />
    </mesh>
    {/* Office Chair */}
    <mesh position={[0, 0.45, 0.5]} castShadow>
      <boxGeometry args={[0.5, 0.08, 0.5]} />
      <meshStandardMaterial color="#1e293b" />
    </mesh>
    <mesh position={[0, 0.75, 0.72]} castShadow>
      <boxGeometry args={[0.5, 0.55, 0.08]} />
      <meshStandardMaterial color="#1e293b" />
    </mesh>
    {/* Desk Number Label */}
    <Text position={[0, 0.76, 0.3]} fontSize={0.15} color="#64748b" rotation={[-Math.PI / 2, 0, 0]}>
      {`D-${index + 1}`}
    </Text>
  </group>
);

// War Room Oval/Rect Table with chairs
const WarRoomTable = ({ position }: { position: [number, number, number] }) => (
  <group position={position}>
    {/* Conference Table */}
    <mesh position={[0, 0.75, 0]} castShadow receiveShadow>
      <boxGeometry args={[6.5, 0.1, 2.8]} />
      <meshStandardMaterial color="#1e293b" roughness={0.2} metalness={0.3} />
    </mesh>
    {/* Center Hologram/Display Strip */}
    <mesh position={[0, 0.81, 0]}>
      <boxGeometry args={[5.8, 0.02, 1.2]} />
      <meshStandardMaterial color="#f43f5e" emissive="#f43f5e" emissiveIntensity={0.6} />
    </mesh>
    {/* Base pedestals */}
    <mesh position={[-2, 0.37, 0]} castShadow>
      <cylinderGeometry args={[0.4, 0.5, 0.75, 16]} />
      <meshStandardMaterial color="#0f172a" metalness={0.6} />
    </mesh>
    <mesh position={[2, 0.37, 0]} castShadow>
      <cylinderGeometry args={[0.4, 0.5, 0.75, 16]} />
      <meshStandardMaterial color="#0f172a" metalness={0.6} />
    </mesh>
    {/* War Room Wall Screen */}
    <mesh position={[0, 2.5, -3.9]} receiveShadow>
      <boxGeometry args={[5.5, 2.2, 0.1]} />
      <meshStandardMaterial color="#0284c7" emissive="#0369a1" emissiveIntensity={0.4} />
    </mesh>
  </group>
);

// Billiard Table
const BilliardTable = ({ position }: { position: [number, number, number] }) => (
  <group position={position}>
    {/* Table frame */}
    <mesh position={[0, 0.7, 0]} castShadow receiveShadow>
      <boxGeometry args={[3.2, 0.25, 1.8]} />
      <meshStandardMaterial color="#451a03" roughness={0.4} />
    </mesh>
    {/* Green cloth surface */}
    <mesh position={[0, 0.84, 0]} receiveShadow>
      <boxGeometry args={[2.8, 0.05, 1.4]} />
      <meshStandardMaterial color="#059669" roughness={0.9} />
    </mesh>
    {/* Billiard balls sample */}
    <mesh position={[-0.4, 0.92, 0]} castShadow>
      <sphereGeometry args={[0.06, 12, 12]} />
      <meshStandardMaterial color="#ffffff" roughness={0.1} />
    </mesh>
    <mesh position={[0.5, 0.92, 0.1]} castShadow>
      <sphereGeometry args={[0.06, 12, 12]} />
      <meshStandardMaterial color="#ef4444" roughness={0.1} />
    </mesh>
    <mesh position={[0.6, 0.92, -0.05]} castShadow>
      <sphereGeometry args={[0.06, 12, 12]} />
      <meshStandardMaterial color="#eab308" roughness={0.1} />
    </mesh>
    {/* Legs */}
    {[-1.3, 1.3].map((x) =>
      [-0.7, 0.7].map((z) => (
        <mesh key={`billiards-leg-${x}-${z}`} position={[x, 0.35, z]} castShadow>
          <cylinderGeometry args={[0.1, 0.12, 0.7, 12]} />
          <meshStandardMaterial color="#292524" />
        </mesh>
      ))
    )}
  </group>
);

// Ping Pong Table
const PingPongTable = ({ position }: { position: [number, number, number] }) => (
  <group position={position}>
    {/* Blue Surface */}
    <mesh position={[0, 0.7, 0]} castShadow receiveShadow>
      <boxGeometry args={[2.8, 0.06, 1.5]} />
      <meshStandardMaterial color="#2563eb" roughness={0.3} />
    </mesh>
    {/* Net */}
    <mesh position={[0, 0.8, 0]}>
      <boxGeometry args={[0.04, 0.16, 1.6]} />
      <meshStandardMaterial color="#f8fafc" roughness={0.8} transparent opacity={0.85} />
    </mesh>
    {/* Legs frame */}
    <mesh position={[-0.9, 0.35, 0]} castShadow>
      <boxGeometry args={[0.06, 0.7, 1.2]} />
      <meshStandardMaterial color="#0f172a" metalness={0.8} />
    </mesh>
    <mesh position={[0.9, 0.35, 0]} castShadow>
      <boxGeometry args={[0.06, 0.7, 1.2]} />
      <meshStandardMaterial color="#0f172a" metalness={0.8} />
    </mesh>
  </group>
);

// Gym Equipment (Treadmill + Weight Bench)
const GymArea = ({ position }: { position: [number, number, number] }) => (
  <group position={position}>
    {/* Treadmill */}
    <group position={[-1.2, 0, 0]}>
      <mesh position={[0, 0.15, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.6, 0.25, 0.7]} />
        <meshStandardMaterial color="#1e293b" metalness={0.7} />
      </mesh>
      {/* Console post */}
      <mesh position={[0.7, 0.7, 0]} castShadow>
        <boxGeometry args={[0.1, 0.9, 0.6]} />
        <meshStandardMaterial color="#0f172a" metalness={0.9} />
      </mesh>
      {/* Screen */}
      <mesh position={[0.7, 1.15, 0]}>
        <boxGeometry args={[0.08, 0.25, 0.4]} />
        <meshStandardMaterial color="#10b981" emissive="#10b981" emissiveIntensity={0.5} />
      </mesh>
    </group>

    {/* Weight Bench */}
    <group position={[1.2, 0, 0]}>
      <mesh position={[0, 0.4, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.5, 0.1, 0.45]} />
        <meshStandardMaterial color="#0f172a" roughness={0.4} />
      </mesh>
      {/* Barbell Rack */}
      <mesh position={[0.6, 0.7, -0.3]} castShadow>
        <boxGeometry args={[0.06, 0.8, 0.06]} />
        <meshStandardMaterial color="#64748b" metalness={0.9} />
      </mesh>
      <mesh position={[0.6, 0.7, 0.3]} castShadow>
        <boxGeometry args={[0.06, 0.8, 0.06]} />
        <meshStandardMaterial color="#64748b" metalness={0.9} />
      </mesh>
      {/* Barbell */}
      <mesh position={[0.6, 1.1, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <cylinderGeometry args={[0.03, 0.03, 1.2, 12]} />
        <meshStandardMaterial color="#94a3b8" metalness={0.9} />
      </mesh>
    </group>
  </group>
);

// Pantry counter & coffee machine
const PantryArea = ({ position }: { position: [number, number, number] }) => (
  <group position={position}>
    {/* L-shaped counter */}
    <mesh position={[0, 0.5, 0]} castShadow receiveShadow>
      <boxGeometry args={[3.2, 1.0, 1.2]} />
      <meshStandardMaterial color="#334155" roughness={0.3} />
    </mesh>
    {/* Countertop */}
    <mesh position={[0, 1.02, 0]} receiveShadow>
      <boxGeometry args={[3.3, 0.08, 1.3]} />
      <meshStandardMaterial color="#f1f5f9" roughness={0.1} />
    </mesh>
    {/* Espresso Machine */}
    <mesh position={[-0.8, 1.3, 0]} castShadow>
      <boxGeometry args={[0.5, 0.5, 0.5]} />
      <meshStandardMaterial color="#dc2626" metalness={0.6} roughness={0.3} />
    </mesh>
    {/* Pizza Box */}
    <mesh position={[0.6, 1.08, 0]} castShadow>
      <boxGeometry args={[0.6, 0.08, 0.6]} />
      <meshStandardMaterial color="#d97706" roughness={0.8} />
    </mesh>
  </group>
);

export const OfficeLayout = () => {
  return (
    <group>
      {/* Floor Foundation */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
        <planeGeometry args={[42, 34]} />
        <meshStandardMaterial color="#0f172a" roughness={0.8} />
      </mesh>

      {/* Room Floor Mats / Zones */}
      {Object.values(ROOM_BOUNDARIES).map((room) => (
        <group key={room.id} position={room.center}>
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.005, 0]} receiveShadow>
            <planeGeometry args={[room.bounds.width - 0.2, room.bounds.depth - 0.2]} />
            <meshStandardMaterial color={room.color} roughness={0.6} opacity={0.15} transparent />
          </mesh>
          <Text
            position={[0, 0.02, 0]}
            rotation={[-Math.PI / 2, 0, 0]}
            fontSize={0.5}
            color={room.color}
            anchorX="center"
            anchorY="middle"
          >
            {room.name.toUpperCase()}
          </Text>
        </group>
      ))}

      {/* Perimeter Walls (Office Outer Boundaries) */}
      {/* North Wall */}
      <Wall position={[0, 1.5, -14.5]} args={[38, 3, 0.4]} />
      {/* South Wall */}
      <Wall position={[0, 1.5, 14.5]} args={[38, 3, 0.4]} />
      {/* West Wall */}
      <Wall position={[-18.5, 1.5, 0]} args={[0.4, 3, 29]} />
      {/* East Wall */}
      <Wall position={[18.5, 1.5, 0]} args={[0.4, 3, 29]} />

      {/* Interior Dividers */}
      {/* VP / Manager divider */}
      <Wall position={[-9.5, 1.2, -10]} args={[0.2, 2.4, 8]} color="#1e293b" />
      {/* Manager / War Room divider */}
      <Wall position={[-0.5, 1.2, -10]} args={[0.2, 2.4, 8]} color="#1e293b" />
      {/* North / South main hallway divider */}
      <Wall position={[-5, 1.2, -5.5]} args={[26, 2.4, 0.2]} color="#1e293b" />
      {/* Restroom / Lounge divider */}
      <Wall position={[-14, 1.2, 2.5]} args={[8, 2.4, 0.2]} color="#1e293b" />
      {/* Lounge / Workstations divider */}
      <Wall position={[0, 1.2, 4]} args={[0.2, 2.4, 16]} color="#1e293b" />

      {/* Specific Room Furniture */}
      {/* VP Office Desk */}
      <group position={[-14, 0, -10]}>
        <mesh position={[0, 0.75, 0]} castShadow receiveShadow>
          <boxGeometry args={[2.4, 0.1, 1.2]} />
          <meshStandardMaterial color="#451a03" roughness={0.3} />
        </mesh>
        <mesh position={[0, 1.1, -0.3]} castShadow>
          <boxGeometry args={[0.9, 0.55, 0.05]} />
          <meshStandardMaterial color="#0f172a" metalness={0.9} />
        </mesh>
      </group>

      {/* Manager Office Desk */}
      <group position={[-5, 0, -10]}>
        <mesh position={[0, 0.75, 0]} castShadow receiveShadow>
          <boxGeometry args={[2.0, 0.1, 1.0]} />
          <meshStandardMaterial color="#1e293b" roughness={0.4} />
        </mesh>
        <mesh position={[0, 1.1, -0.3]} castShadow>
          <boxGeometry args={[0.8, 0.5, 0.05]} />
          <meshStandardMaterial color="#0f172a" metalness={0.9} />
        </mesh>
      </group>

      {/* Grand War Room */}
      <WarRoomTable position={[7, 0, -10]} />

      {/* 10 Workstations */}
      {WORKSTATION_DESKS.map((pos, idx) => (
        <WorkstationDesk key={`workstation-${idx}`} position={pos} index={idx} />
      ))}

      {/* Billiards in Lounge */}
      <BilliardTable position={[-6, 0, 4]} />

      {/* Ping Pong in Lounge */}
      <PingPongTable position={[-4, 0, 8]} />

      {/* Gym Corner in Lounge */}
      <GymArea position={[-7, 0, 10]} />

      {/* Pantry */}
      <PantryArea position={[-14, 0, 8]} />
    </group>
  );
};
