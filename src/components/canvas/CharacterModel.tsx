'use client';

import React, { useEffect, useMemo, useRef } from 'react';
import { useGLTF, useAnimations } from '@react-three/drei';
import * as THREE from 'three';
import { clone as cloneSkeleton } from 'three/examples/jsm/utils/SkeletonUtils.js';

const MODEL_URL = '/models/Soldier.glb';

export type CharacterAnimName = 'Idle' | 'Walk' | 'Run';

interface CharacterModelProps {
  color: string;
  isSelected: boolean;
  anim: CharacterAnimName;
  // 0..1 crossfade speed multiplier isn't exposed — kept simple: fixed fade duration.
}

// Rigged low-poly humanoid (three.js's official "Soldier" sample asset — CC0-equivalent,
// MIT-licensed alongside three.js itself) with real Idle/Walk/Run animation clips, driven
// by @react-three/drei's useAnimations. Replaces the earlier flat box-primitive character.
// Each agent gets its own SkeletonUtils clone so skeletons/animation mixers don't collide.
export const CharacterModel: React.FC<CharacterModelProps> = ({ color, isSelected, anim }) => {
  const gltf = useGLTF(MODEL_URL);
  const cloned = useMemo(() => cloneSkeleton(gltf.scene), [gltf.scene]);
  const group = useRef<THREE.Group>(null);
  const { actions } = useAnimations(gltf.animations, group);
  const currentAnim = useRef<CharacterAnimName | null>(null);

  useEffect(() => {
    // Tint the body material per-agent (mirrors the old box character's per-agent color)
    // without mutating the shared cached material used by other clones.
    cloned.traverse((obj) => {
      const mesh = obj as THREE.Mesh;
      if (!mesh.isMesh) return;
      const applyTint = (mat: THREE.Material) => {
        if (!(mat instanceof THREE.MeshStandardMaterial)) return mat;
        const tinted = mat.clone();
        tinted.color = new THREE.Color(color);
        if (isSelected) {
          tinted.emissive = new THREE.Color(color);
          tinted.emissiveIntensity = 0.35;
        }
        return tinted;
      };
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      mesh.material = Array.isArray(mesh.material) ? mesh.material.map(applyTint) : applyTint(mesh.material);
    });
  }, [cloned, color, isSelected]);

  useEffect(() => {
    if (currentAnim.current === anim) return;
    const next = actions[anim];
    const prevName = currentAnim.current;
    const prev = prevName ? actions[prevName] : null;
    next?.reset().fadeIn(0.25).play();
    if (prev && prev !== next) prev.fadeOut(0.25);
    currentAnim.current = anim;
  }, [anim, actions]);

  return (
    <group ref={group} scale={0.035}>
      <primitive object={cloned} />
    </group>
  );
};

useGLTF.preload(MODEL_URL);
