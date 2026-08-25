import { RoomBoundary } from '@/types/agent';

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
  lounge_billiard: [-6, 0, 4] as [number, number, number],
  lounge_pingpong: [-4, 0, 8] as [number, number, number],
  lounge_gym: [-7, 0, 10] as [number, number, number],
  entrance: [0, 0, 13] as [number, number, number],
};

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
