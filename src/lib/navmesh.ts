import * as THREE from 'three';
import { init as initRecast, NavMesh } from 'recast-navigation';
import { threeToSoloNavMesh } from '@recast-navigation/three';
import { WALLS, FURNITURE_OBSTACLES, BoxObstacle } from '@/constants/officeLayout';

let recastInit: Promise<void> | null = null;

// recast-navigation ships a WASM module — init() is idempotent-safe to call once
// and must resolve before any NavMesh/Crowd class can be constructed.
export function ensureRecastReady(): Promise<void> {
  if (!recastInit) {
    recastInit = initRecast();
  }
  return recastInit;
}

function boxObstacleToMesh({ position, size }: BoxObstacle): THREE.Mesh {
  const geometry = new THREE.BoxGeometry(...size);
  const mesh = new THREE.Mesh(geometry);
  mesh.position.set(...position);
  mesh.updateMatrixWorld(true);
  return mesh;
}

/**
 * Bakes a solo NavMesh from the office's static collision geometry (walls + large
 * freestanding furniture, see constants/officeLayout.ts) plus a flat walkable ground plane.
 * Must be called after ensureRecastReady() resolves.
 */
export function buildOfficeNavMesh(): NavMesh {
  const groundGeometry = new THREE.PlaneGeometry(42, 34, 1, 1);
  groundGeometry.rotateX(-Math.PI / 2);
  const ground = new THREE.Mesh(groundGeometry);
  ground.updateMatrixWorld(true);

  const obstacles = [...WALLS, ...FURNITURE_OBSTACLES].map(boxObstacleToMesh);

  const result = threeToSoloNavMesh([ground, ...obstacles], {
    cs: 0.15,
    ch: 0.15,
    walkableSlopeAngle: 45,
    walkableHeight: 8, // in voxel units (ch): ~1.2m clearance
    walkableClimb: 2,
    walkableRadius: 2, // ~0.3m agent radius clearance from obstacles/walls
    borderSize: 2,
    minRegionArea: 4,
    mergeRegionArea: 10,
  });

  if (!result.success) {
    throw new Error(`Office navmesh generation failed: ${result.error}`);
  }

  return result.navMesh;
}
