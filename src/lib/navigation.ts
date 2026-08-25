import { Vector3 } from 'three';
import { KEY_LOCATIONS } from '@/constants/officeLayout';

// Via-points (transit points) connecting corridors and doors to avoid straight-line wall clipping
export const CORRIDOR_WAYPOINTS: Record<string, [number, number, number][]> = {
  // Hallway spine points
  central_hub: [[0, 0, 0], [0, 0, -4], [0, 0, 4]],
  vp_door: [[-10, 0, -6], [-6, 0, -6]],
  manager_door: [[-2, 0, -6], [0, 0, -6]],
  war_room_door: [[2, 0, -6], [7, 0, -6]],
  workstation_aisle_west: [[1, 0, 0], [1, 0, 4], [1, 0, 8]],
  workstation_aisle_east: [[14, 0, 0], [14, 0, 4], [14, 0, 8]],
  pantry_entrance: [[-10, 0, 4], [-10, 0, 8]],
  lounge_entrance: [[-2, 0, 2], [-4, 0, 2]],
  restroom_door: [[-10, 0, -1], [-8, 0, -1]],
};

// Pick a randomized transit waypoint between start and end to achieve route variety
export function calculateVariedRoute(
  start: [number, number, number],
  end: [number, number, number]
): [number, number, number][] {
  const startVec = new Vector3(...start);
  const endVec = new Vector3(...end);
  const dist = startVec.distanceTo(endVec);

  if (dist < 3) {
    return [end];
  }

  const waypoints: [number, number, number][] = [];

  // Determine transit waypoints based on room zones
  const startRoom = getRoomForPos(start);
  const endRoom = getRoomForPos(end);

  if (startRoom !== endRoom) {
    // Cross-room travel: pick intermediate doorway/hallway with random jitter
    const jitter = (Math.random() - 0.5) * 0.8;
    
    if (startRoom === 'vp_office' || endRoom === 'vp_office') {
      waypoints.push([-10 + jitter, 0, -6]);
    }
    if (startRoom === 'war_room' || endRoom === 'war_room') {
      waypoints.push([4 + jitter, 0, -6]);
    }
    if (startRoom === 'workstations' || endRoom === 'workstations') {
      const aisleX = Math.random() > 0.5 ? 1 : 14;
      waypoints.push([aisleX, 0, (start[2] + end[2]) / 2 + jitter]);
    }
    if (startRoom === 'pantry' || endRoom === 'pantry') {
      waypoints.push([-10 + jitter, 0, 4]);
    }
    if (startRoom === 'lounge' || endRoom === 'lounge') {
      waypoints.push([-3 + jitter, 0, 2]);
    }
  }

  // End destination with slight natural offset if not a strict desk seat
  waypoints.push(end);
  return waypoints;
}

function getRoomForPos(pos: [number, number, number]): string {
  const [x, , z] = pos;
  if (x < -9 && z < -4) return 'vp_office';
  if (x >= -9 && x <= 0 && z < -4) return 'manager_office';
  if (x > 0 && z < -4) return 'war_room';
  if (x > 0 && z >= -4) return 'workstations';
  if (x < -9 && z >= 4) return 'pantry';
  if (x >= -9 && x <= 0 && z >= 0) return 'lounge';
  if (x < -9 && z >= -4 && z < 4) return 'restroom';
  return 'hallway';
}
