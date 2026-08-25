'use client';

import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Grid } from '@react-three/drei';
import { Physics } from '@react-three/rapier';
import { OfficeLayout } from './OfficeLayout';
import { AgentMesh } from './AgentMesh';
import { CrowdManager } from './CrowdManager';
import { BilliardMinigame, PingPongMinigame, GymMinigame } from './InteractiveMinigames';
import { useOfficeStore } from '@/store/useOfficeStore';

export const OfficeScene = () => {
  const agents = useOfficeStore((state) => state.agents);
  const selectedAgentId = useOfficeStore((state) => state.selectedAgentId);
  const selectAgent = useOfficeStore((state) => state.selectAgent);
  const dayNightCycle = useOfficeStore((state) => state.dayNightCycle);

  const lightIntensity = dayNightCycle === 'day' ? 1.2 : dayNightCycle === 'evening' ? 0.7 : 0.25;
  const ambientIntensity = dayNightCycle === 'day' ? 0.8 : dayNightCycle === 'evening' ? 0.5 : 0.2;
  const skyColor = dayNightCycle === 'day' ? '#090d16' : dayNightCycle === 'evening' ? '#1c1326' : '#02040a';
  const directionalColor = dayNightCycle === 'evening' ? '#f59e0b' : '#ffffff';

  const agentList = Object.values(agents);

  return (
    <div className="w-full h-full relative bg-slate-950">
      <Canvas
        camera={{ position: [0, 28, 26], fov: 45 }}
        shadows
        className="w-full h-full"
      >
        <color attach="background" args={[skyColor]} />
        
        {/* Lighting & Day/Night Cycle */}
        <ambientLight intensity={ambientIntensity} />
        <directionalLight
          position={[15, 25, 15]}
          intensity={lightIntensity}
          color={directionalColor}
          castShadow
          shadow-mapSize={[1024, 1024]}
          shadow-camera-left={-25}
          shadow-camera-right={25}
          shadow-camera-top={25}
          shadow-camera-bottom={-25}
        />
        <pointLight position={[0, 10, 0]} intensity={dayNightCycle === 'night' ? 0.8 : 0.4} color="#38bdf8" />
        
        {/* Ground grid */}
        <Grid
          position={[0, -0.02, 0]}
          args={[60, 60]}
          cellSize={1}
          cellThickness={0.5}
          cellColor="#1e293b"
          sectionSize={5}
          sectionThickness={1}
          sectionColor="#334155"
          fadeDistance={50}
          fadeStrength={1.5}
        />

        {/* Office Layout & Geometry */}
        <OfficeLayout />

        {/* recast-navigation NavMesh + Crowd: single source of truth for all agent movement */}
        <CrowdManager />

        {/* Interactive Minigames — real Rapier physics for billiards + ping pong */}
        <Physics gravity={[0, -9.81, 0]}>
          <BilliardMinigame position={[-6, 0, 4]} />
          <PingPongMinigame position={[-4, 0, 8]} />
        </Physics>
        <GymMinigame position={[-7, 0, 10]} />

        {/* Agents with crowd simulation and rigged, animated characters */}
        <Suspense fallback={null}>
          {agentList.map((agent) => (
            <AgentMesh
              key={agent.id}
              agent={agent}
              isSelected={selectedAgentId === agent.id}
              onSelect={selectAgent}
            />
          ))}
        </Suspense>

        {/* Controls */}
        <OrbitControls
          makeDefault
          maxPolarAngle={Math.PI / 2.1}
          minDistance={5}
          maxDistance={50}
          target={[0, 0, 0]}
        />
      </Canvas>
    </div>
  );
};
