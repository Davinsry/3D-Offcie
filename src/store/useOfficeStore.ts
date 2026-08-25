import { create } from 'zustand';
import { Agent, ActivityLog, AgentStatus } from '@/types/agent';
import { KEY_LOCATIONS, WORKSTATION_DESKS } from '@/constants/officeLayout';
import { audioFX } from '@/lib/audio';
import { HermesBackendEvent } from '@/types/events';
import { calculateVariedRoute } from '@/lib/navigation';
import * as crowdManager from '@/lib/crowdManager';

interface OfficeState {
  agents: Record<string, Agent>;
  selectedAgentId: string | null;
  soundEnabled: boolean;
  activityLogs: ActivityLog[];
  simulationPhase: 'idle' | 'vp_brief' | 'war_room' | 'working' | 'synthesis' | 'complete';
  dayNightCycle: 'day' | 'evening' | 'night';
  pizzaActive: boolean;
  // Live WebSocket connection state to the real Hermes backend (see hooks/useHermesSocket.ts).
  // 'disconnected' also covers "no backend URL configured" — the manual trigger button
  // in the sidebar always works as a fallback/demo path regardless of this state.
  connectionStatus: 'disconnected' | 'connecting' | 'connected' | 'error';
  setConnectionStatus: (status: OfficeState['connectionStatus']) => void;

  // Actions
  selectAgent: (id: string | null) => void;
  toggleSound: () => void;
  setDayNightCycle: (cycle: 'day' | 'evening' | 'night') => void;
  updateAgent: (id: string, updates: Partial<Agent>) => void;
  setAgentTarget: (id: string, target: [number, number, number], speedMode?: 'walk' | 'run') => void;
  addActivityLog: (log: Omit<ActivityLog, 'id' | 'timestamp'>) => void;
  
  // Event Driven Handler (WebSocket / Engine)
  handleHermesEvent: (event: HermesBackendEvent) => void;

  // Interactive controls & triggers
  triggerInstruction: (instructionType: string) => void;
  triggerPizzaDelivery: () => void;
  sendAgentToActivity: (agentId: string, activity: 'gym' | 'billiards' | 'pingpong' | 'coffee' | 'desk') => void;
  resetSimulation: () => void;
}

const INITIAL_AGENTS: Record<string, Agent> = {
  vp: {
    id: 'vp',
    name: 'Dapak (VP)',
    role: 'VP',
    status: 'idle',
    position: KEY_LOCATIONS.vp_desk,
    currentRoom: 'vp_office',
    thought: 'Reviewing quarterly AI agent objectives...',
    color: '#6366f1',
    speedMode: 'walk',
  },
  manager: {
    id: 'manager',
    name: 'Manager Agent',
    role: 'Manager',
    status: 'idle',
    position: KEY_LOCATIONS.manager_desk,
    currentRoom: 'manager_office',
    thought: 'Standing by for strategic delegation.',
    color: '#0ea5e9',
    speedMode: 'walk',
  },
  ob: {
    id: 'ob',
    name: 'Pak Budi (OB)',
    role: 'OB',
    status: 'idle',
    position: KEY_LOCATIONS.pantry_coffee,
    currentRoom: 'pantry',
    thought: 'Brewing fresh espresso in pantry.',
    color: '#eab308',
    speedMode: 'walk',
  },
  ob_assistant: {
    id: 'ob_assistant',
    name: 'Pak Joko (OB Assistant)',
    role: 'OB',
    status: 'idle',
    position: [-12, 0, 8],
    currentRoom: 'pantry',
    thought: 'Restocking office supplies.',
    color: '#ca8a04',
    speedMode: 'walk',
  },
  courier: {
    id: 'courier',
    name: 'Courier (Pizza Delivery)',
    role: 'Courier',
    status: 'idle',
    position: KEY_LOCATIONS.entrance,
    currentRoom: 'hallway',
    thought: 'Waiting at lobby entrance.',
    color: '#f97316',
    speedMode: 'run',
  },
  w1: {
    id: 'w1',
    name: 'Worker 1 (Data Analyst)',
    role: 'Data Analyst',
    status: 'working',
    position: WORKSTATION_DESKS[0],
    currentRoom: 'workstations',
    deskIndex: 0,
    thought: 'Parsing event pipeline metrics.',
    color: '#10b981',
    speedMode: 'walk',
  },
  w2: {
    id: 'w2',
    name: 'Worker 2 (Data Analyst)',
    role: 'Data Analyst',
    status: 'working',
    position: WORKSTATION_DESKS[1],
    currentRoom: 'workstations',
    deskIndex: 1,
    thought: 'Querying vector embedding store.',
    color: '#10b981',
    speedMode: 'walk',
  },
  w3: {
    id: 'w3',
    name: 'Worker 3 (Researcher)',
    role: 'Researcher',
    status: 'working',
    position: WORKSTATION_DESKS[2],
    currentRoom: 'workstations',
    deskIndex: 2,
    thought: 'Synthesizing benchmark telemetry.',
    color: '#14b8a6',
    speedMode: 'walk',
  },
  w4: {
    id: 'w4',
    name: 'Worker 4 (Researcher)',
    role: 'Researcher',
    status: 'working',
    position: WORKSTATION_DESKS[3],
    currentRoom: 'workstations',
    deskIndex: 3,
    thought: 'Reviewing frontier AI model release notes.',
    color: '#14b8a6',
    speedMode: 'walk',
  },
  w5: {
    id: 'w5',
    name: 'Worker 5 (Writer)',
    role: 'Writer',
    status: 'working',
    position: WORKSTATION_DESKS[4],
    currentRoom: 'workstations',
    deskIndex: 4,
    thought: 'Drafting multi-agent architectural specification.',
    color: '#8b5cf6',
    speedMode: 'walk',
  },
  w6: {
    id: 'w6',
    name: 'Worker 6 (Writer)',
    role: 'Writer',
    status: 'working',
    position: WORKSTATION_DESKS[5],
    currentRoom: 'workstations',
    deskIndex: 5,
    thought: 'Refining executive summary for release.',
    color: '#8b5cf6',
    speedMode: 'walk',
  },
  w7: {
    id: 'w7',
    name: 'Worker 7 (Engineer)',
    role: 'Engineer',
    status: 'working',
    position: WORKSTATION_DESKS[6],
    currentRoom: 'workstations',
    deskIndex: 6,
    thought: 'Optimizing Recast navigation WASM bindings.',
    color: '#ec4899',
    speedMode: 'walk',
  },
  w8: {
    id: 'w8',
    name: 'Worker 8 (Engineer)',
    role: 'Engineer',
    status: 'working',
    position: WORKSTATION_DESKS[7],
    currentRoom: 'workstations',
    deskIndex: 7,
    thought: 'Profiling frame render times in R3F.',
    color: '#ec4899',
    speedMode: 'walk',
  },
  w9: {
    id: 'w9',
    name: 'Worker 9 (Finance Lead)',
    role: 'Finance Lead',
    status: 'working',
    position: WORKSTATION_DESKS[8],
    currentRoom: 'workstations',
    deskIndex: 8,
    thought: 'Calculating LLM token usage cost models.',
    color: '#f59e0b',
    speedMode: 'walk',
  },
  w10: {
    id: 'w10',
    name: 'Worker 10 (Compliance Lead)',
    role: 'Compliance Lead',
    status: 'working',
    position: WORKSTATION_DESKS[9],
    currentRoom: 'workstations',
    deskIndex: 9,
    thought: 'Verifying data privacy guardrails and token audits.',
    color: '#ef4444',
    speedMode: 'walk',
  },
};

export const useOfficeStore = create<OfficeState>((set, get) => ({
  agents: INITIAL_AGENTS,
  selectedAgentId: null,
  soundEnabled: true,
  activityLogs: [],
  simulationPhase: 'idle',
  dayNightCycle: 'day',
  pizzaActive: false,
  connectionStatus: 'disconnected',

  setConnectionStatus: (status) => set({ connectionStatus: status }),

  selectAgent: (id) => set({ selectedAgentId: id }),

  toggleSound: () => {
    const next = !get().soundEnabled;
    audioFX.setSoundEnabled(next);
    set({ soundEnabled: next });
  },

  setDayNightCycle: (cycle) => set({ dayNightCycle: cycle }),

  updateAgent: (id, updates) =>
    set((state) => ({
      agents: {
        ...state.agents,
        [id]: { ...state.agents[id], ...updates },
      },
    })),

  setAgentTarget: (id, target, speedMode = 'walk') => {
    const agent = get().agents[id];
    if (!agent) return;

    // Randomized transit via-point(s) for route variety — actual pathfinding,
    // wall/furniture avoidance and agent-agent collision avoidance across
    // those points is handled entirely by the recast-navigation Crowd
    // (see lib/crowdManager.ts + components/canvas/CrowdManager.tsx).
    const waypoints = calculateVariedRoute(agent.position, target);
    const nextTarget = waypoints[0] || target;

    crowdManager.setMaxSpeed(id, speedMode === 'run' ? crowdManager.RUN_SPEED : crowdManager.WALK_SPEED);
    crowdManager.requestMove(id, nextTarget);

    set((state) => ({
      agents: {
        ...state.agents,
        [id]: {
          ...state.agents[id],
          targetPosition: nextTarget,
          targetWaypoints: waypoints.slice(1),
          speedMode,
          status: 'walking',
        },
      },
    }));
  },

  addActivityLog: (log) => {
    const newLog: ActivityLog = {
      ...log,
      id: Math.random().toString(36).substring(2, 9),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    };
    set((state) => ({
      activityLogs: [newLog, ...state.activityLogs].slice(0, 50),
    }));
  },

  // Map backend WebSocket / simulated events directly to 3D agents
  handleHermesEvent: (event: HermesBackendEvent) => {
    const { addActivityLog, setAgentTarget, updateAgent } = get();

    switch (event.type) {
      case 'task_received': {
        audioFX.phoneRing();
        set({ simulationPhase: 'vp_brief' });
        updateAgent('vp', {
          status: 'idle',
          thought: `Received high-level directive: "${event.task}"`,
        });
        addActivityLog({
          agentId: 'vp',
          agentName: 'Dapak (VP)',
          message: `Received Strategic Directive: ${event.task}`,
          type: 'task',
        });
        // Manager walks to VP Office for briefing
        setAgentTarget('manager', [-12, 0, -10], 'walk');
        updateAgent('manager', {
          thought: 'Heading to VP office for task brief.',
        });
        break;
      }

      case 'subtask_assigned': {
        if (event.agentId) {
          const deskPos = event.targetDeskId !== undefined ? WORKSTATION_DESKS[event.targetDeskId] : undefined;
          updateAgent(event.agentId, {
            assignedTask: event.task,
            progress: 0,
            status: 'walking',
            thought: `Assigned: ${event.task}`,
          });
          if (deskPos) {
            setAgentTarget(event.agentId, deskPos, 'walk');
          }
          addActivityLog({
            agentId: event.agentId,
            agentName: get().agents[event.agentId]?.name || event.agentId,
            message: `Assigned subtask: ${event.task}`,
            type: 'task',
          });
          audioFX.taskAssigned();
        }
        break;
      }

      case 'subtask_progress': {
        if (event.agentId) {
          updateAgent(event.agentId, {
            progress: event.progress || 50,
            status: 'working',
            thought: event.thought || `Executing subtask (${event.progress}%)`,
          });
          audioFX.keyboardTyping();
        }
        break;
      }

      case 'subtask_done': {
        if (event.agentId) {
          updateAgent(event.agentId, {
            progress: 100,
            status: 'idle',
            thought: `Completed: ${event.task}`,
          });
          addActivityLog({
            agentId: event.agentId,
            agentName: get().agents[event.agentId]?.name || event.agentId,
            message: `Completed subtask: ${event.task}`,
            type: 'info',
          });
          audioFX.taskSuccess();
        }
        break;
      }

      case 'synthesis_start': {
        set({ simulationPhase: 'synthesis' });
        updateAgent('manager', {
          status: 'working',
          thought: 'Synthesizing all worker outputs into unified response...',
        });
        addActivityLog({
          agentId: 'manager',
          agentName: 'Manager Agent',
          message: 'Synthesizing sub-agent outputs.',
          type: 'task',
        });
        break;
      }

      case 'done': {
        set({ simulationPhase: 'complete' });
        audioFX.taskSuccess();
        updateAgent('manager', {
          status: 'idle',
          thought: 'Task complete! Output delivered to VP.',
        });
        addActivityLog({
          agentId: 'manager',
          agentName: 'Manager Agent',
          message: 'Task successfully completed!',
          type: 'info',
        });
        break;
      }

      case 'courier_dispatch': {
        set({ pizzaActive: true });
        audioFX.doorBell();
        setAgentTarget('courier', [-14, 0, 8], 'run');
        updateAgent('courier', {
          status: 'delivering',
          thought: 'Delivering hot pizza to pantry table!',
        });
        addActivityLog({
          agentId: 'courier',
          agentName: 'Courier',
          message: 'Pizza courier arrived at the office!',
          type: 'break',
        });
        break;
      }

      default:
        break;
    }
  },

  // Manual interactive trigger for testing/demonstrating events
  triggerInstruction: (instructionType: string) => {
    const { handleHermesEvent } = get();

    handleHermesEvent({
      type: 'task_received',
      task: instructionType,
    });

    // Simulate event pipeline
    setTimeout(() => {
      set({ simulationPhase: 'war_room' });
      // War room gathering
      const workerIds = ['w1', 'w2', 'w3', 'w4', 'w5', 'w6', 'w7', 'w8', 'w9', 'w10'];
      const offsets = [
        [-2.5, -1.8], [-1.2, -1.8], [0, -1.8], [1.2, -1.8], [2.5, -1.8],
        [-2.5, 1.8], [-1.2, 1.8], [0, 1.8], [1.2, 1.8], [2.5, 1.8],
      ];
      workerIds.forEach((id, idx) => {
        const [ox, oz] = offsets[idx];
        get().setAgentTarget(id, [7 + ox, 0, -10 + oz], 'run');
        get().updateAgent(id, {
          status: 'meeting',
          thought: 'Attending tactical sprint planning in War Room.',
        });
      });
      get().setAgentTarget('manager', [7, 0, -13], 'run');
      get().addActivityLog({
        agentId: 'manager',
        agentName: 'Manager Agent',
        message: 'Convening all 10 worker agents in War Room.',
        type: 'meeting',
      });
    }, 2500);

    setTimeout(() => {
      set({ simulationPhase: 'working' });
      const workerIds = ['w1', 'w2', 'w3', 'w4', 'w5', 'w6', 'w7', 'w8', 'w9', 'w10'];
      workerIds.forEach((id, idx) => {
        handleHermesEvent({
          type: 'subtask_assigned',
          agentId: id,
          task: `Decomposed Subtask #${idx + 1} for ${instructionType}`,
          targetDeskId: idx,
        });
      });
    }, 7000);

    setTimeout(() => {
      const workerIds = ['w1', 'w2', 'w3', 'w4', 'w5', 'w6', 'w7', 'w8', 'w9', 'w10'];
      workerIds.forEach((id) => {
        handleHermesEvent({
          type: 'subtask_progress',
          agentId: id,
          progress: 80,
        });
      });
    }, 11000);

    setTimeout(() => {
      const workerIds = ['w1', 'w2', 'w3', 'w4', 'w5', 'w6', 'w7', 'w8', 'w9', 'w10'];
      workerIds.forEach((id, idx) => {
        handleHermesEvent({
          type: 'subtask_done',
          agentId: id,
          task: `Subtask #${idx + 1}`,
        });
      });
      handleHermesEvent({ type: 'synthesis_start' });
    }, 15000);

    setTimeout(() => {
      handleHermesEvent({ type: 'done' });
    }, 18000);
  },

  triggerPizzaDelivery: () => {
    get().handleHermesEvent({ type: 'courier_dispatch' });
  },

  sendAgentToActivity: (agentId, activity) => {
    const { setAgentTarget, updateAgent, addActivityLog } = get();
    const agent = get().agents[agentId];
    if (!agent) return;

    let target: [number, number, number] = KEY_LOCATIONS.pantry_coffee;
    let status: AgentStatus = 'break';
    let thought = 'Taking a quick break.';

    if (activity === 'gym') {
      target = KEY_LOCATIONS.lounge_gym;
      status = 'gym';
      thought = 'Working out on the treadmill / weight bench.';
    } else if (activity === 'billiards') {
      target = KEY_LOCATIONS.lounge_billiard;
      status = 'billiards';
      thought = 'Playing a round of 8-ball billiards.';
    } else if (activity === 'pingpong') {
      target = KEY_LOCATIONS.lounge_pingpong;
      status = 'pingpong';
      thought = 'Playing a fast ping pong rally.';
    } else if (activity === 'desk' && agent.deskIndex !== undefined) {
      target = WORKSTATION_DESKS[agent.deskIndex];
      status = 'working';
      thought = 'Back at desk working.';
    }

    setAgentTarget(agentId, target, 'walk');
    updateAgent(agentId, { status, thought });
    addActivityLog({
      agentId,
      agentName: agent.name,
      message: `Manual override: Sent to ${activity}`,
      type: 'break',
    });
  },

  resetSimulation: () => {
    Object.values(INITIAL_AGENTS).forEach((agent) => {
      crowdManager.teleportAgent(agent.id, agent.position);
    });
    set({
      agents: INITIAL_AGENTS,
      selectedAgentId: null,
      activityLogs: [],
      simulationPhase: 'idle',
      pizzaActive: false,
    });
  },
}));
