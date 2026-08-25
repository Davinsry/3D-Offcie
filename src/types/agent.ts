export type AgentRole =
  | 'VP'
  | 'Manager'
  | 'OB'
  | 'Data Analyst'
  | 'Researcher'
  | 'Writer'
  | 'Engineer'
  | 'Finance Lead'
  | 'Compliance Lead'
  | 'Courier';

export type AgentStatus =
  | 'idle'
  | 'walking'
  | 'working'
  | 'meeting'
  | 'break'
  | 'gym'
  | 'billiards'
  | 'pingpong'
  | 'delivering';

export interface Agent {
  id: string;
  name: string;
  role: AgentRole;
  status: AgentStatus;
  position: [number, number, number];
  targetPosition?: [number, number, number];
  targetWaypoints?: [number, number, number][];
  currentRoom: string;
  assignedTask?: string;
  progress?: number;
  thought?: string;
  color: string;
  deskIndex?: number;
  speedMode: 'walk' | 'run';
}

export interface ActivityLog {
  id: string;
  timestamp: string;
  agentId: string;
  agentName: string;
  message: string;
  type: 'info' | 'task' | 'meeting' | 'break';
}

export interface RoomBoundary {
  id: string;
  name: string;
  color: string;
  bounds: {
    x: number;
    z: number;
    width: number;
    depth: number;
  };
  center: [number, number, number];
}
