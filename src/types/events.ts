export type HermesBackendEventType =
  | 'task_received'
  | 'subtask_assigned'
  | 'subtask_progress'
  | 'subtask_done'
  | 'synthesis_start'
  | 'done'
  | 'courier_dispatch'
  | 'courier_delivered'
  | 'agent_break';

export interface HermesBackendEvent {
  type: HermesBackendEventType;
  taskId?: string;
  agentId?: string;
  agentIds?: string[];
  task?: string;
  targetDeskId?: number;
  targetLocation?: [number, number, number];
  progress?: number;
  thought?: string;
  statusText?: string;
  payload?: Record<string, unknown>;
  timestamp?: number;
}
