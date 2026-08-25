'use client';

import React, { useRef, useMemo, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import * as THREE from 'three';
import { audioFX } from '@/lib/audio';

// Interactive Billiards with Rapier Physics or High-Fidelity Collision Simulation
export const BilliardMinigame = ({ position }: { position: [number, number, number] }) => {
  const [balls, setBalls] = useState([
    { id: 0, pos: new THREE.Vector3(-0.6, 0.86, 0), vel: new THREE.Vector3(0, 0, 0), color: '#ffffff', isCue: true },
    { id: 1, pos: new THREE.Vector3(0.3, 0.86, 0), vel: new THREE.Vector3(0, 0, 0), color: '#eab308' },
    { id: 2, pos: new THREE.Vector3(0.42, 0.86, 0.07), vel: new THREE.Vector3(0, 0, 0), color: '#3b82f6' },
    { id: 3, pos: new THREE.Vector3(0.42, 0.86, -0.07), vel: new THREE.Vector3(0, 0, 0), color: '#ef4444' },
    { id: 4, pos: new THREE.Vector3(0.54, 0.86, 0.14), vel: new THREE.Vector3(0, 0, 0), color: '#a855f7' },
    { id: 5, pos: new THREE.Vector3(0.54, 0.86, 0), vel: new THREE.Vector3(0, 0, 0), color: '#0f172a' }, // 8-ball
    { id: 6, pos: new THREE.Vector3(0.54, 0.86, -0.14), vel: new THREE.Vector3(0, 0, 0), color: '#10b981' },
  ]);

  const lastShotTime = useRef(Date.now());
  const tableBounds = { minX: -1.3, maxX: 1.3, minZ: -0.62, maxZ: 0.62 };
  const pockets = useMemo(() => [
    new THREE.Vector3(-1.3, 0.86, -0.62),
    new THREE.Vector3(0, 0.86, -0.64),
    new THREE.Vector3(1.3, 0.86, -0.62),
    new THREE.Vector3(-1.3, 0.86, 0.62),
    new THREE.Vector3(0, 0.86, 0.64),
    new THREE.Vector3(1.3, 0.86, 0.62),
  ], []);

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05);

    // AI Shot trigger every 4 seconds if all balls are mostly stopped
    const now = Date.now();
    const totalSpeed = balls.reduce((acc, b) => acc + b.vel.length(), 0);
    if (now - lastShotTime.current > 3500 && totalSpeed < 0.05) {
      lastShotTime.current = now;
      // NPC aim cue ball towards target ball
      const cue = balls[0];
      const targetBall = balls[1 + Math.floor(Math.random() * (balls.length - 1))];
      if (cue && targetBall) {
        const dir = new THREE.Vector3().subVectors(targetBall.pos, cue.pos).normalize();
        cue.vel.copy(dir.multiplyScalar(2.5 + Math.random() * 1.5));
        audioFX.billiardHit(0.5);
      }
    }

    // Step ball physics
    balls.forEach((b1, i) => {
      if (b1.vel.length() > 0.001) {
        b1.pos.addScaledVector(b1.vel, dt);
        b1.vel.multiplyScalar(0.985); // Table friction

        // Wall cushion bounce
        if (b1.pos.x <= tableBounds.minX || b1.pos.x >= tableBounds.maxX) {
          b1.vel.x *= -0.85;
          b1.pos.x = THREE.MathUtils.clamp(b1.pos.x, tableBounds.minX, tableBounds.maxX);
          audioFX.billiardHit(0.2);
        }
        if (b1.pos.z <= tableBounds.minZ || b1.pos.z >= tableBounds.maxZ) {
          b1.vel.z *= -0.85;
          b1.pos.z = THREE.MathUtils.clamp(b1.pos.z, tableBounds.minZ, tableBounds.maxZ);
          audioFX.billiardHit(0.2);
        }

        // Pocket check
        pockets.forEach((p) => {
          if (b1.pos.distanceTo(p) < 0.12) {
            // Ball potted
            audioFX.billiardHit(0.6);
            if (b1.isCue) {
              b1.pos.set(-0.6, 0.86, 0);
              b1.vel.set(0, 0, 0);
            } else {
              b1.pos.set(1.6 + Math.random() * 0.2, 0.86, (Math.random() - 0.5) * 0.4);
              b1.vel.set(0, 0, 0);
            }
          }
        });

        // Ball-to-ball collisions
        for (let j = i + 1; j < balls.length; j++) {
          const b2 = balls[j];
          const dist = b1.pos.distanceTo(b2.pos);
          const r = 0.09;
          if (dist < r && dist > 0) {
            const normal = new THREE.Vector3().subVectors(b1.pos, b2.pos).normalize();
            const relVel = new THREE.Vector3().subVectors(b1.vel, b2.vel);
            const sepSpeed = relVel.dot(normal);
            if (sepSpeed < 0) {
              const impulse = -(1 + 0.9) * sepSpeed * 0.5;
              b1.vel.addScaledVector(normal, impulse);
              b2.vel.addScaledVector(normal, -impulse);
              audioFX.billiardHit(Math.min(0.4, Math.abs(sepSpeed) * 0.2));
            }
          }
        }
      }
    });
  });

  return (
    <group position={position}>
      {/* Table Structure */}
      <mesh position={[0, 0.7, 0]} castShadow receiveShadow>
        <boxGeometry args={[3.2, 0.25, 1.8]} />
        <meshStandardMaterial color="#3f2314" roughness={0.4} />
      </mesh>
      {/* Table Surface */}
      <mesh position={[0, 0.83, 0]} receiveShadow>
        <boxGeometry args={[2.8, 0.02, 1.4]} />
        <meshStandardMaterial color="#047857" roughness={0.9} />
      </mesh>

      {/* 6 Pockets */}
      {pockets.map((p, idx) => (
        <mesh key={`pocket-${idx}`} position={[p.x, 0.84, p.z]}>
          <cylinderGeometry args={[0.07, 0.07, 0.02, 16]} />
          <meshBasicMaterial color="#0f172a" />
        </mesh>
      ))}

      {/* Balls */}
      {balls.map((b) => (
        <mesh key={`ball-${b.id}`} position={[b.pos.x, b.pos.y, b.pos.z]} castShadow>
          <sphereGeometry args={[0.045, 16, 16]} />
          <meshStandardMaterial color={b.color} roughness={0.15} metalness={0.1} />
        </mesh>
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

// Interactive Ping Pong Minigame with NPC Reactive Paddles
export const PingPongMinigame = ({ position }: { position: [number, number, number] }) => {
  const ballPos = useRef(new THREE.Vector3(0, 0.85, 0));
  const ballVel = useRef(new THREE.Vector3(2.5, 0.8, 0.5));
  const paddleLeftZ = useRef(0);
  const paddleRightZ = useRef(0);
  const ballMesh = useRef<THREE.Mesh>(null);
  const leftPaddleMesh = useRef<THREE.Mesh>(null);
  const rightPaddleMesh = useRef<THREE.Mesh>(null);

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05);

    // Ball gravity & motion
    ballVel.current.y -= 9.8 * dt;
    ballPos.current.addScaledVector(ballVel.current, dt);

    // Table bounce (Y = 0.76)
    if (ballPos.current.y <= 0.76 && Math.abs(ballPos.current.x) < 1.35 && Math.abs(ballPos.current.z) < 0.7) {
      ballPos.current.y = 0.76;
      ballVel.current.y = 2.2;
      audioFX.billiardHit(0.15);
    }

    // AI reactive paddles follow ball Z
    paddleLeftZ.current = THREE.MathUtils.lerp(paddleLeftZ.current, ballPos.current.z, dt * 6);
    paddleRightZ.current = THREE.MathUtils.lerp(paddleRightZ.current, ballPos.current.z, dt * 6);

    // Left Paddle hit (X = -1.25)
    if (ballPos.current.x <= -1.25 && Math.abs(ballPos.current.z - paddleLeftZ.current) < 0.3) {
      ballVel.current.x = Math.abs(ballVel.current.x) * 1.02;
      ballVel.current.z += (Math.random() - 0.5) * 1.2;
      ballVel.current.y = 2.0;
      audioFX.billiardHit(0.3);
    }

    // Right Paddle hit (X = 1.25)
    if (ballPos.current.x >= 1.25 && Math.abs(ballPos.current.z - paddleRightZ.current) < 0.3) {
      ballVel.current.x = -Math.abs(ballVel.current.x) * 1.02;
      ballVel.current.z += (Math.random() - 0.5) * 1.2;
      ballVel.current.y = 2.0;
      audioFX.billiardHit(0.3);
    }

    // Out of bounds reset
    if (Math.abs(ballPos.current.x) > 2.0 || ballPos.current.y < 0.2) {
      ballPos.current.set(0, 1.1, 0);
      ballVel.current.set(Math.random() > 0.5 ? 2.5 : -2.5, 1.2, (Math.random() - 0.5) * 1.5);
    }

    if (ballMesh.current) ballMesh.current.position.copy(ballPos.current);
    if (leftPaddleMesh.current) leftPaddleMesh.current.position.set(-1.3, 0.85, paddleLeftZ.current);
    if (rightPaddleMesh.current) rightPaddleMesh.current.position.set(1.3, 0.85, paddleRightZ.current);
  });

  return (
    <group position={position}>
      {/* Ping Pong Table Top */}
      <mesh position={[0, 0.72, 0]} castShadow receiveShadow>
        <boxGeometry args={[2.7, 0.05, 1.5]} />
        <meshStandardMaterial color="#1d4ed8" roughness={0.3} />
      </mesh>
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
      {/* Legs */}
      <mesh position={[-0.9, 0.35, 0]} castShadow>
        <boxGeometry args={[0.06, 0.7, 1.2]} />
        <meshStandardMaterial color="#0f172a" />
      </mesh>
      <mesh position={[0.9, 0.35, 0]} castShadow>
        <boxGeometry args={[0.06, 0.7, 1.2]} />
        <meshStandardMaterial color="#0f172a" />
      </mesh>

      {/* Ball */}
      <mesh ref={ballMesh} castShadow>
        <sphereGeometry args={[0.03, 12, 12]} />
        <meshStandardMaterial color="#ea580c" roughness={0.2} />
      </mesh>

      {/* Left Paddle */}
      <mesh ref={leftPaddleMesh} castShadow>
        <boxGeometry args={[0.03, 0.18, 0.14]} />
        <meshStandardMaterial color="#dc2626" />
      </mesh>
      {/* Right Paddle */}
      <mesh ref={rightPaddleMesh} castShadow>
        <boxGeometry args={[0.03, 0.18, 0.14]} />
        <meshStandardMaterial color="#1e293b" />
      </mesh>
    </group>
  );
};

// Interactive Gym Area with Animated Workout Rigs
export const GymMinigame = ({ position }: { position: [number, number, number] }) => {
  const barbellY = useRef(0.9);
  const treadmillRef = useRef<THREE.Mesh>(null);

  useFrame(() => {
    // Weight bench bench-press animation
    barbellY.current = 0.85 + Math.abs(Math.sin(Date.now() * 0.003)) * 0.45;
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
        <group position={[0.4, barbellY.current, 0]}>
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
