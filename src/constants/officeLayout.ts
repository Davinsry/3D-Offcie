import { RoomBoundary } from '@/types/agent';

export interface BoxObstacle {
  id: string;
  position: [number, number, number];
  size: [number, number, number];
  color?: string;
}

// Office coordinate mapping (meters)
// Overall Office bounds approx 40m x 32m
export const ROOM_BOUNDARIES: Record<string, RoomBoundary> = {
  vp_office: {
    id: 'vp_office',
    name: 'VP Office',
    color: '#818cf8', // Indigo
    bounds: { x: -14, z: -10, width: 8, depth: 8 },
    center: [-14, 0, -10],
  },
  manager_office: {
    id: 'manager_office',
    name: 'Manager Office',
    color: '#38bdf8', // Sky blue
    bounds: { x: -5, z: -10, width: 8, depth: 8 },
    center: [-5, 0, -10],
  },
  war_room: {
    id: 'war_room',
    name: 'Grand War Room',
    color: '#f43f5e', // Rose / Red
    bounds: { x: 7, z: -10, width: 14, depth: 8 },
    center: [7, 0, -10],
  },
  workstations: {
    id: 'workstations',
    name: 'Workstation Area',
    color: '#34d399', // Emerald green
    bounds: { x: 7, z: 4, width: 14, depth: 16 },
    center: [7, 0, 4],
  },
  restroom: {
    id: 'restroom',
    name: 'Restroom',
    color: '#94a3b8', // Slate
    bounds: { x: -14, z: -1, width: 8, depth: 6 },
    center: [-14, 0, -1],
  },
  lounge: {
    id: 'lounge',
    name: 'Chill & Gaming Lounge',
    color: '#fbbf24', // Amber
    bounds: { x: -5, z: 6, width: 10, depth: 12 },
    center: [-5, 0, 6],
  },
  pantry: {
    id: 'pantry',
    name: 'Pantry & Dining',
    color: '#fb923c', // Orange
    bounds: { x: -14, z: 8, width: 8, depth: 8 },
    center: [-14, 0, 8],
  },
};

// Key locations for path transit / targets
export const KEY_LOCATIONS = {
  vp_desk: [-14, 0, -11] as [number, number, number],
  manager_desk: [-5, 0, -11] as [number, number, number],
  war_room_table: [7, 0, -10] as [number, number, number],
  pantry_coffee: [-14, 0, 10] as [number, number, number],
  // Note: these sit just outside their furniture's navmesh obstacle footprint
  // (see FURNITURE_OBSTACLES below) — the obstacle center itself is unreachable.
  lounge_billiard: [-6, 0, 5.3] as [number, number, number],
  lounge_pingpong: [-4, 0, 9.2] as [number, number, number],
  lounge_gym: [-7, 0, 10.8] as [number, number, number],
  lounge_gaming: [-2, 0, 2.6] as [number, number, number],
  entrance: [0, 0, 13] as [number, number, number],
};

// Structural walls (perimeter + interior dividers). Single source of truth,
// shared by the renderer (OfficeLayout) and the navmesh baker (lib/navmesh.ts)
// so geometry can never drift between what's drawn and what agents can walk through.
export const WALLS: BoxObstacle[] = [
  { id: 'wall_north', position: [0, 1.5, -14.5], size: [38, 3, 0.4] },
  { id: 'wall_south', position: [0, 1.5, 14.5], size: [38, 3, 0.4] },
  { id: 'wall_west', position: [-18.5, 1.5, 0], size: [0.4, 3, 29] },
  { id: 'wall_east', position: [18.5, 1.5, 0], size: [0.4, 3, 29] },
  { id: 'wall_vp_manager', position: [-9.5, 1.2, -10], size: [0.2, 2.4, 8] },
  { id: 'wall_manager_warroom', position: [-0.5, 1.2, -10], size: [0.2, 2.4, 8] },
  // Hallway divider (z=-5.5), split into segments with door gaps so the VP
  // office, Manager office and War Room — each otherwise a sealed box — have
  // an actual walkable opening onto the south hallway for navmesh pathfinding.
  { id: 'wall_hallway_divider_1', position: [-15, 1.2, -5.5], size: [6, 2.4, 0.2] }, // west of VP door
  { id: 'wall_hallway_divider_2', position: [-8, 1.2, -5.5], size: [4, 2.4, 0.2] }, // between VP + Manager doors
  { id: 'wall_hallway_divider_3', position: [-0.5, 1.2, -5.5], size: [7, 2.4, 0.2] }, // between Manager + War Room doors
  { id: 'wall_hallway_divider_4', position: [6.5, 1.2, -5.5], size: [3, 2.4, 0.2] }, // east of War Room door
  { id: 'wall_restroom_lounge', position: [-14, 1.2, 2.5], size: [8, 2.4, 0.2] },
  { id: 'wall_lounge_workstations', position: [0, 1.2, 4], size: [0.2, 2.4, 16] },
];

// Large freestanding furniture that agents must walk around (not sit/stand inside of).
// Desks agents are assigned to (VP/Manager/workstation desks) are intentionally excluded —
// an agent's resting position IS the desk coordinate, so it must stay walkable. The war
// room table is excluded for the same reason: worker "meeting seat" positions are fixed
// offsets around/at the table, by design (mirrors the desk seating convention above).
export const FURNITURE_OBSTACLES: BoxObstacle[] = [
  { id: 'billiard_table', position: [-6, 0.8, 4], size: [3.4, 1.6, 2.0] },
  { id: 'pingpong_table', position: [-4, 0.8, 8], size: [3.0, 1.6, 1.7] },
  { id: 'gym_treadmill', position: [-8.2, 0.5, 10], size: [1.8, 1.6, 0.9] },
  { id: 'gym_bench', position: [-5.8, 0.5, 10], size: [1.7, 1.6, 0.65] },
  { id: 'gaming_corner', position: [-2, 0.5, 1.8], size: [1.8, 1.6, 1.0] },
  { id: 'pantry_counter', position: [-14, 0.5, 8], size: [3.4, 1.6, 1.4] },
];

// 10 Workstation desk positions
export const WORKSTATION_DESKS: [number, number, number][] = [
  // Column 1 (left row)
  [3, 0, -2],
  [3, 0, 1],
  [3, 0, 4],
  [3, 0, 7],
  [3, 0, 10],
  // Column 2 (right row)
  [11, 0, -2],
  [11, 0, 1],
  [11, 0, 4],
  [11, 0, 7],
  [11, 0, 10],
];
