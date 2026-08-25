'use client';

import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { RigidBody, CuboidCollider, type RapierRigidBody, type IntersectionEnterPayload } from '@react-three/rapier';
import { audioFX } from '@/lib/audio';

const BALL_COLORS = ['#ffffff', '#eab308', '#3b82f6', '#ef4444', '#a855f7', '#0f172a', '#10b981'];
const RACK_POSITIONS: [number, number, number][] = [
  [-0.6, 0.92, 0],
  [0.3, 0.92, 0],
  [0.42, 0.92, 0.07],
  [0.42, 0.92, -0.07],
  [0.54, 0.92, 0.14],
  [0.54, 0.92, 0],
  [0.54, 0.92, -0.14],
];
const POCKETS: [number, number][] = [
  [-1.32, -0.6],
  [0, -0.62],
  [1.32, -0.6],
  [-1.32, 0.6],
  [0, 0.62],
  [1.32, 0.6],
];
const HOLD_AREA: [number, number, number] = [1.9, 0.92, -0.7];

// Real Rapier-physics billiards: dynamic RigidBody spheres for each ball, fixed
// cushion colliders around the table, sensor colliders at each pocket. Two NPC
// "players" alternate — every few seconds, once all balls have settled, the cue
// ball gets an impulse aimed at a random remaining ball.
export const BilliardMinigame = ({ position }: { position: [number, number, number] }) => {
  const ballRefs = useRef<Map<number, RapierRigidBody>>(new Map());
  const lastShotTime = useRef<number | null>(null);
  const pottedCount = useRef(0);

  const handlePocket = (ballIndex: number) => (payload: IntersectionEnterPayload) => {
    const body = payload.other.rigidBody;
    if (!body) return;
    audioFX.billiardHit(0.6);
    if (ballIndex === 0) {
      // Cue ball potted — spot it back at the break position.
      body.setTranslation({ x: RACK_POSITIONS[0][0], y: RACK_POSITIONS[0][1], z: RACK_POSITIONS[0][2] }, true);
      body.setLinvel({ x: 0, y: 0, z: 0 }, true);
      body.setAngvel({ x: 0, y: 0, z: 0 }, true);
    } else {
      // Object ball potted — move it to the holding rack beside the table.
      pottedCount.current += 1;
      const [hx, hy, hz] = HOLD_AREA;
      body.setTranslation({ x: hx, y: hy, z: hz + pottedCount.current * 0.12 }, true);
      body.setLinvel({ x: 0, y: 0, z: 0 }, true);
      body.setAngvel({ x: 0, y: 0, z: 0 }, true);
    }
  };

  useFrame(() => {
    const now = Date.now();
    if (lastShotTime.current === null) lastShotTime.current = now;
    if (now - lastShotTime.current < 3500) return;

    let totalSpeed = 0;
    ballRefs.current.forEach((body) => {
      totalSpeed += new THREE.Vector3().copy(body.linvel()).length();
    });
    if (totalSpeed > 0.05) return;

    const cue = ballRefs.current.get(0);
    const others = [...ballRefs.current.entries()].filter(([idx]) => idx !== 0);
    if (!cue || others.length === 0) return;
    const [, targetBody] = others[Math.floor(Math.random() * others.length)];

    const cuePos = cue.translation();
    const targetPos = targetBody.translation();
    const dir = new THREE.Vector3(targetPos.x - cuePos.x, 0, targetPos.z - cuePos.z).normalize();
    const power = 2.2 + Math.random() * 1.4;
    cue.setLinvel({ x: dir.x * power, y: 0, z: dir.z * power }, true);
    audioFX.billiardHit(0.5);
    lastShotTime.current = now;
  });

  return (
    <group position={position}>
      <RigidBody type="fixed" colliders={false} friction={0.9} restitution={0.2}>
        {/* Table frame */}
        <mesh position={[0, 0.7, 0]} castShadow receiveShadow>
          <boxGeometry args={[3.2, 0.25, 1.8]} />
          <meshStandardMaterial color="#3f2314" roughness={0.4} />
        </mesh>
        {/* Playing surface (floor collider for the balls) */}
        <mesh position={[0, 0.83, 0]} receiveShadow>
          <boxGeometry args={[2.8, 0.02, 1.4]} />
          <meshStandardMaterial color="#047857" roughness={0.9} />
        </mesh>
        <CuboidCollider args={[1.4, 0.02, 0.7]} position={[0, 0.83, 0]} friction={0.6} />
        {/* Cushions */}
        <CuboidCollider args={[0.03, 0.08, 0.66]} position={[-1.33, 0.9, 0]} restitution={0.75} />
        <CuboidCollider args={[0.03, 0.08, 0.66]} position={[1.33, 0.9, 0]} restitution={0.75} />
        <CuboidCollider args={[1.33, 0.08, 0.03]} position={[0, 0.9, -0.65]} restitution={0.75} />
        <CuboidCollider args={[1.33, 0.08, 0.03]} position={[0, 0.9, 0.65]} restitution={0.75} />
      </RigidBody>

      {/* 6 Pockets (sensors) */}
      {POCKETS.map(([px, pz], idx) => (
        <mesh key={`pocket-${idx}`} position={[px, 0.84, pz]}>
          <cylinderGeometry args={[0.07, 0.07, 0.02, 16]} />
          <meshBasicMaterial color="#0f172a" />
        </mesh>
      ))}
      <RigidBody type="fixed" colliders={false} sensor>
        {POCKETS.map(([px, pz], idx) => (
          <CuboidCollider
            key={`pocket-sensor-${idx}`}
            args={[0.09, 0.15, 0.09]}
            position={[px, 0.8, pz]}
            sensor
            onIntersectionEnter={(payload) => {
              const idxOfBall = [...ballRefs.current.entries()].find(([, b]) => b === payload.other.rigidBody)?.[0];
              if (idxOfBall !== undefined) handlePocket(idxOfBall)(payload);
            }}
          />
        ))}
      </RigidBody>

      {/* Balls */}
      {RACK_POSITIONS.map((pos, idx) => (
        <RigidBody
          key={`ball-${idx}`}
          ref={(body) => {
            if (body) ballRefs.current.set(idx, body);
            else ballRefs.current.delete(idx);
          }}
          position={pos}
          colliders="ball"
          restitution={0.85}
          friction={0.15}
          linearDamping={0.5}
          angularDamping={0.6}
          onCollisionEnter={() => audioFX.billiardHit(0.2)}
        >
          <mesh castShadow>
            <sphereGeometry args={[0.045, 16, 16]} />
            <meshStandardMaterial color={BALL_COLORS[idx]} roughness={0.15} metalness={0.1} />
          </mesh>
        </RigidBody>
      ))}

      {/* Table Legs */}
      {[-1.3, 1.3].map((x) =>
        [-0.7, 0.7].map((z) => (
          <mesh key={`leg-${x}-${z}`} position={[x, 0.35, z]} castShadow>
            <cylinderGeometry args={[0.1, 0.12, 0.7, 12]} />
            <meshStandardMaterial color="#1c1917" />
          </mesh>
        ))
      )}
    </group>
  );
};

// Real Rapier-physics ping pong: dynamic ball under gravity bouncing off the
// table + net colliders, kinematic paddle RigidBodies that an AI drives to
// track the ball's z position — contact with a kinematic body pushes the
// dynamic ball just like a real paddle hit.
export const PingPongMinigame = ({ position }: { position: [number, number, number] }) => {
  const ballRef = useRef<RapierRigidBody>(null);
  const leftPaddleRef = useRef<RapierRigidBody>(null);
  const rightPaddleRef = useRef<RapierRigidBody>(null);
  const paddleLeftZ = useRef(0);
  const paddleRightZ = useRef(0);

  const resetBall = () => {
    const ball = ballRef.current;
    if (!ball) return;
    ball.setTranslation({ x: 0, y: 1.1, z: 0 }, true);
    ball.setLinvel({ x: Math.random() > 0.5 ? 2.3 : -2.3, y: 1.0, z: (Math.random() - 0.5) * 1.2 }, true);
    ball.setAngvel({ x: 0, y: 0, z: 0 }, true);
  };

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05);
    const ball = ballRef.current;
    if (!ball) return;

    const pos = ball.translation();
    if (Math.abs(pos.x) > 2.0 || pos.y < 0.2) {
      resetBall();
      return;
    }

    paddleLeftZ.current = THREE.MathUtils.lerp(paddleLeftZ.current, pos.z, dt * 6);
    paddleRightZ.current = THREE.MathUtils.lerp(paddleRightZ.current, pos.z, dt * 6);
    leftPaddleRef.current?.setNextKinematicTranslation({ x: -1.3, y: 0.85, z: paddleLeftZ.current });
    rightPaddleRef.current?.setNextKinematicTranslation({ x: 1.3, y: 0.85, z: paddleRightZ.current });
  });

  return (
    <group position={position}>
      <RigidBody type="fixed" colliders={false} friction={0.3} restitution={0.75}>
        {/* Table Top */}
        <mesh position={[0, 0.72, 0]} castShadow receiveShadow>
          <boxGeometry args={[2.7, 0.05, 1.5]} />
          <meshStandardMaterial color="#1d4ed8" roughness={0.3} />
        </mesh>
        <CuboidCollider args={[1.35, 0.025, 0.75]} position={[0, 0.72, 0]} />
        {/* Table Center Stripe */}
        <mesh position={[0, 0.748, 0]}>
          <boxGeometry args={[2.7, 0.005, 0.02]} />
          <meshBasicMaterial color="#ffffff" />
        </mesh>
        {/* Net */}
        <mesh position={[0, 0.82, 0]}>
          <boxGeometry args={[0.02, 0.15, 1.6]} />
          <meshStandardMaterial color="#f8fafc" transparent opacity={0.8} />
        </mesh>
        <CuboidCollider args={[0.01, 0.075, 0.8]} position={[0, 0.82, 0]} restitution={0.1} />
        {/* Legs */}
        <mesh position={[-0.9, 0.35, 0]} castShadow>
          <boxGeometry args={[0.06, 0.7, 1.2]} />
          <meshStandardMaterial color="#0f172a" />
        </mesh>
        <mesh position={[0.9, 0.35, 0]} castShadow>
          <boxGeometry args={[0.06, 0.7, 1.2]} />
          <meshStandardMaterial color="#0f172a" />
        </mesh>
      </RigidBody>

      {/* Ball */}
      <RigidBody
        ref={ballRef}
        position={[0, 0.85, 0]}
        colliders="ball"
        restitution={0.85}
        friction={0.2}
        linearVelocity={[2.5, 0.8, 0.5]}
        onCollisionEnter={() => audioFX.billiardHit(0.25)}
      >
        <mesh castShadow>
          <sphereGeometry args={[0.03, 12, 12]} />
          <meshStandardMaterial color="#ea580c" roughness={0.2} />
        </mesh>
      </RigidBody>

      {/* Left Paddle (kinematic, AI-driven) */}
      <RigidBody ref={leftPaddleRef} type="kinematicPosition" position={[-1.3, 0.85, 0]} colliders="cuboid">
        <mesh castShadow>
          <boxGeometry args={[0.03, 0.18, 0.14]} />
          <meshStandardMaterial color="#dc2626" />
        </mesh>
      </RigidBody>
      {/* Right Paddle (kinematic, AI-driven) */}
      <RigidBody ref={rightPaddleRef} type="kinematicPosition" position={[1.3, 0.85, 0]} colliders="cuboid">
        <mesh castShadow>
          <boxGeometry args={[0.03, 0.18, 0.14]} />
          <meshStandardMaterial color="#1e293b" />
        </mesh>
      </RigidBody>
    </group>
  );
};

// Interactive Gym Area with Animated Workout Rigs (no physics needed — a simple
// looping local animation, per PRD section 8.3).
export const GymMinigame = ({ position }: { position: [number, number, number] }) => {
  const barbellGroupRef = useRef<THREE.Group>(null);
  const treadmillRef = useRef<THREE.Mesh>(null);

  useFrame(() => {
    if (barbellGroupRef.current) {
      barbellGroupRef.current.position.y = 0.85 + Math.abs(Math.sin(Date.now() * 0.003)) * 0.45;
    }
  });

  return (
    <group position={position}>
      {/* Treadmill 1 */}
      <group position={[-1.2, 0, 0]}>
        <mesh position={[0, 0.15, 0]} castShadow receiveShadow>
          <boxGeometry args={[1.8, 0.22, 0.8]} />
          <meshStandardMaterial color="#0f172a" metalness={0.8} />
        </mesh>
        <mesh ref={treadmillRef} position={[0, 0.27, 0]}>
          <planeGeometry args={[1.5, 0.6]} />
          <meshStandardMaterial color="#334155" roughness={0.9} />
        </mesh>
        <mesh position={[0.8, 0.7, 0]} castShadow>
          <boxGeometry args={[0.08, 0.9, 0.7]} />
          <meshStandardMaterial color="#1e293b" />
        </mesh>
        <mesh position={[0.8, 1.15, 0]}>
          <boxGeometry args={[0.06, 0.25, 0.4]} />
          <meshStandardMaterial color="#10b981" emissive="#10b981" emissiveIntensity={0.6} />
        </mesh>
      </group>

      {/* Weight Bench */}
      <group position={[1.2, 0, 0]}>
        {/* Bench Cushion */}
        <mesh position={[0, 0.4, 0]} castShadow>
          <boxGeometry args={[1.5, 0.1, 0.45]} />
          <meshStandardMaterial color="#1e293b" />
        </mesh>
        {/* Support Racks */}
        <mesh position={[0.4, 0.65, -0.3]} castShadow>
          <boxGeometry args={[0.06, 1.1, 0.06]} />
          <meshStandardMaterial color="#475569" metalness={0.8} />
        </mesh>
        <mesh position={[0.4, 0.65, 0.3]} castShadow>
          <boxGeometry args={[0.06, 1.1, 0.06]} />
          <meshStandardMaterial color="#475569" metalness={0.8} />
        </mesh>
        {/* Animated Barbell */}
        <group ref={barbellGroupRef} position={[0.4, 0.9, 0]}>
          <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
            <cylinderGeometry args={[0.02, 0.02, 1.2, 8]} />
            <meshStandardMaterial color="#94a3b8" metalness={0.9} />
          </mesh>
          <mesh position={[0, 0, -0.45]} rotation={[Math.PI / 2, 0, 0]} castShadow>
            <cylinderGeometry args={[0.18, 0.18, 0.06, 16]} />
            <meshStandardMaterial color="#0f172a" />
          </mesh>
          <mesh position={[0, 0, 0.45]} rotation={[Math.PI / 2, 0, 0]} castShadow>
            <cylinderGeometry args={[0.18, 0.18, 0.06, 16]} />
            <meshStandardMaterial color="#0f172a" />
          </mesh>
        </group>
      </group>
    </group>
  );
};
