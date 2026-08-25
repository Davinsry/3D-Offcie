'use client';

import React, { useState } from 'react';
import { useOfficeStore } from '@/store/useOfficeStore';
import {
  Volume2,
  VolumeX,
  Play,
  RotateCcw,
  Users,
  Activity,
  Bot,
  Coffee,
  Dumbbell,
  Sparkles,
  Sun,
  Moon,
  Sunset,
  Pizza,
  Gamepad2,
  Tv,
} from 'lucide-react';

const PRESET_INSTRUCTIONS = [
  { id: 'full_decomp', label: 'Feature: Multi-Agent Parallel Planning' },
  { id: 'sec_audit', label: 'Security Audit: Guardrails & Token Leaks' },
  { id: 'perf_test', label: 'Stress Test: Simulate 100 Agent Concurrent Stream' },
  { id: 'doc_gen', label: 'Docs: Generate PRD & Live API Reference' },
];

export const OfficeSidebar = () => {
  const [activeTab, setActiveTab] = useState<'feed' | 'inspector' | 'controls'>('feed');
  const [selectedInstruction, setSelectedInstruction] = useState(PRESET_INSTRUCTIONS[0].label);

  const {
    agents,
    selectedAgentId,
    selectAgent,
    soundEnabled,
    toggleSound,
    activityLogs,
    simulationPhase,
    dayNightCycle,
    setDayNightCycle,
    triggerInstruction,
    triggerPizzaDelivery,
    sendAgentToActivity,
    resetSimulation,
    connectionStatus,
  } = useOfficeStore();

  const selectedAgent = selectedAgentId ? agents[selectedAgentId] : null;

  const statusDotColor =
    connectionStatus === 'connected'
      ? 'bg-emerald-500'
      : connectionStatus === 'connecting'
        ? 'bg-amber-400'
        : connectionStatus === 'error'
          ? 'bg-rose-500'
          : 'bg-slate-500';
  const statusLabel =
    connectionStatus === 'connected'
      ? 'Live · connected to Hermes backend'
      : connectionStatus === 'connecting'
        ? 'Connecting to Hermes backend…'
        : connectionStatus === 'error'
          ? 'Hermes backend connection error — retrying'
          : 'Demo mode · manual trigger only (no NEXT_PUBLIC_HERMES_WS_URL configured, or backend offline)';

  return (
    <div className="w-96 h-full bg-slate-900/95 border-r border-slate-800 flex flex-col text-slate-200 z-10 backdrop-blur-md shadow-2xl">
      {/* Header */}
      <div className="p-4 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <div className={`w-3 h-3 rounded-full ${statusDotColor} animate-pulse`} title={statusLabel} />
          <div>
            <h1 className="font-bold text-sm tracking-wide text-white uppercase">Hermes Office 3D</h1>
            <p className="text-[11px] text-slate-400">Multi-Agent Live Simulator</p>
          </div>
        </div>

        {/* Lighting & Sound Controls */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() =>
              setDayNightCycle(dayNightCycle === 'day' ? 'evening' : dayNightCycle === 'evening' ? 'night' : 'day')
            }
            className="p-1.5 rounded-lg border border-slate-700 bg-slate-800 text-amber-400 hover:bg-slate-700 transition-colors"
            title="Toggle Day/Evening/Night"
          >
            {dayNightCycle === 'day' ? <Sun size={15} /> : dayNightCycle === 'evening' ? <Sunset size={15} /> : <Moon size={15} />}
          </button>
          <button
            onClick={toggleSound}
            className={`p-1.5 rounded-lg border transition-colors ${
              soundEnabled
                ? 'bg-indigo-500/20 border-indigo-500/40 text-indigo-300'
                : 'bg-slate-800 border-slate-700 text-slate-500'
            }`}
            title={soundEnabled ? 'Mute sound' : 'Unmute sound'}
          >
            {soundEnabled ? <Volume2 size={15} /> : <VolumeX size={15} />}
          </button>
        </div>
      </div>

      {/* VP Directive Control Bar */}
      <div className="p-3.5 border-b border-slate-800 bg-slate-950/40">
        <label className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold mb-1.5 flex items-center gap-1.5">
          <Sparkles size={12} className="text-amber-400" />
          VP Strategic Directive
        </label>
        <div className="space-y-2">
          <select
            value={selectedInstruction}
            onChange={(e) => setSelectedInstruction(e.target.value)}
            disabled={simulationPhase !== 'idle' && simulationPhase !== 'complete'}
            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500 transition-colors disabled:opacity-50"
          >
            {PRESET_INSTRUCTIONS.map((item) => (
              <option key={item.id} value={item.label}>
                {item.label}
              </option>
            ))}
          </select>

          <div className="flex gap-2">
            <button
              onClick={() => triggerInstruction(selectedInstruction)}
              disabled={simulationPhase !== 'idle' && simulationPhase !== 'complete'}
              className="flex-1 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-600 text-white text-xs font-semibold py-1.5 px-3 rounded-lg flex items-center justify-center gap-1.5 shadow-md shadow-indigo-500/10 transition-all"
            >
              <Play size={13} />
              Broadcast Directive
            </button>
            <button
              onClick={resetSimulation}
              className="bg-slate-800 hover:bg-slate-700 text-slate-300 p-1.5 rounded-lg border border-slate-700 transition-colors"
              title="Reset office state"
            >
              <RotateCcw size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-800 text-xs font-medium">
        <button
          onClick={() => setActiveTab('feed')}
          className={`flex-1 py-2.5 flex items-center justify-center gap-1.5 border-b-2 transition-colors ${
            activeTab === 'feed'
              ? 'border-indigo-500 text-indigo-400 bg-slate-800/40'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Activity size={14} />
          Feed ({activityLogs.length})
        </button>
        <button
          onClick={() => setActiveTab('inspector')}
          className={`flex-1 py-2.5 flex items-center justify-center gap-1.5 border-b-2 transition-colors ${
            activeTab === 'inspector'
              ? 'border-indigo-500 text-indigo-400 bg-slate-800/40'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Bot size={14} />
          Inspector {selectedAgent ? `(${selectedAgent.name.split(' ')[0]})` : ''}
        </button>
        <button
          onClick={() => setActiveTab('controls')}
          className={`flex-1 py-2.5 flex items-center justify-center gap-1.5 border-b-2 transition-colors ${
            activeTab === 'controls'
              ? 'border-indigo-500 text-indigo-400 bg-slate-800/40'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Gamepad2 size={14} />
          Minigames
        </button>
      </div>

      {/* Main Tab Body */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {activeTab === 'feed' && (
          <div className="space-y-2">
            {activityLogs.length === 0 ? (
              <div className="text-center py-8 text-slate-500 text-xs">
                Waiting for backend event broadcasts...
              </div>
            ) : (
              activityLogs.map((log) => (
                <div
                  key={log.id}
                  className="p-2.5 rounded-lg bg-slate-800/60 border border-slate-700/60 text-xs space-y-1 animate-in fade-in slide-in-from-top-1"
                >
                  <div className="flex items-center justify-between text-[10px] text-slate-400">
                    <span className="font-semibold text-indigo-300">{log.agentName}</span>
                    <span>{log.timestamp}</span>
                  </div>
                  <p className="text-slate-200 leading-relaxed">{log.message}</p>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'inspector' && (
          <div>
            {selectedAgent ? (
              <div className="space-y-3.5 text-xs">
                {/* Agent Card */}
                <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-white text-sm">{selectedAgent.name}</h3>
                      <p className="text-[11px] text-slate-400">{selectedAgent.role}</p>
                    </div>
                    <span
                      className="px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider"
                      style={{
                        backgroundColor: `${selectedAgent.color}20`,
                        color: selectedAgent.color,
                        border: `1px solid ${selectedAgent.color}40`,
                      }}
                    >
                      {selectedAgent.status}
                    </span>
                  </div>

                  {/* Thought Display */}
                  <div className="p-2 bg-slate-900/80 rounded-lg border border-slate-800 space-y-1">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold">Live Thought</span>
                    <p className="text-slate-200 italic font-mono text-[11px]">
                      &quot;{selectedAgent.thought || 'Idle & observing...'}&quot;
                    </p>
                  </div>

                  {/* Task & Progress */}
                  {selectedAgent.assignedTask && (
                    <div className="space-y-1.5 pt-1">
                      <div className="flex justify-between text-[11px]">
                        <span className="text-slate-400">Current Task:</span>
                        <span className="font-semibold text-white">{selectedAgent.progress || 0}%</span>
                      </div>
                      <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden">
                        <div
                          className="bg-indigo-500 h-full rounded-full transition-all duration-300"
                          style={{ width: `${selectedAgent.progress || 0}%` }}
                        />
                      </div>
                      <p className="text-[11px] text-slate-300 truncate">{selectedAgent.assignedTask}</p>
                    </div>
                  )}
                </div>

                {/* Manual Override Commands */}
                <div className="space-y-1.5">
                  <label className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">
                    Manual Agent Directives
                  </label>
                  <div className="grid grid-cols-2 gap-1.5">
                    <button
                      onClick={() => sendAgentToActivity(selectedAgent.id, 'desk')}
                      className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-left text-xs text-slate-300 flex items-center gap-1.5 transition-colors"
                    >
                      <Tv size={14} className="text-emerald-400" />
                      Return to Desk
                    </button>
                    <button
                      onClick={() => sendAgentToActivity(selectedAgent.id, 'coffee')}
                      className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-left text-xs text-slate-300 flex items-center gap-1.5 transition-colors"
                    >
                      <Coffee size={14} className="text-amber-400" />
                      Pantry Coffee
                    </button>
                    <button
                      onClick={() => sendAgentToActivity(selectedAgent.id, 'gym')}
                      className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-left text-xs text-slate-300 flex items-center gap-1.5 transition-colors"
                    >
                      <Dumbbell size={14} className="text-indigo-400" />
                      Gym Workout
                    </button>
                    <button
                      onClick={() => sendAgentToActivity(selectedAgent.id, 'billiards')}
                      className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-left text-xs text-slate-300 flex items-center gap-1.5 transition-colors"
                    >
                      <Gamepad2 size={14} className="text-rose-400" />
                      Play Billiards
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-slate-500 text-xs">
                Click any agent in the 3D office or select from the roster below to inspect thoughts and state.
              </div>
            )}
          </div>
        )}

        {activeTab === 'controls' && (
          <div className="space-y-3 text-xs">
            <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700 space-y-2">
              <h4 className="font-semibold text-white flex items-center gap-1.5">
                <Pizza size={14} className="text-orange-400" />
                Pizza Courier Dispatch
              </h4>
              <p className="text-slate-400 text-[11px]">
                Order pizza delivery to the pantry. Spawns courier NPC running to the pantry table.
              </p>
              <button
                onClick={triggerPizzaDelivery}
                className="w-full bg-orange-600 hover:bg-orange-500 text-white font-semibold py-1.5 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-colors"
              >
                <Pizza size={14} />
                Order Pizza Delivery
              </button>
            </div>

            <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700 space-y-2">
              <h4 className="font-semibold text-white flex items-center gap-1.5">
                <Gamepad2 size={14} className="text-emerald-400" />
                Office Minigame Status
              </h4>
              <div className="space-y-1.5 text-[11px] text-slate-300">
                <div className="flex justify-between">
                  <span>8-Ball Billiards Table:</span>
                  <span className="text-emerald-400 font-mono">Simulating Physics</span>
                </div>
                <div className="flex justify-between">
                  <span>Ping Pong Match:</span>
                  <span className="text-blue-400 font-mono">Reactive NPC AI</span>
                </div>
                <div className="flex justify-between">
                  <span>Gym Corner Rigs:</span>
                  <span className="text-indigo-400 font-mono">Active Workouts</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Agent Directory */}
      <div className="p-3 border-t border-slate-800 bg-slate-950/60">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold flex items-center gap-1">
            <Users size={12} />
            Agent Roster ({Object.keys(agents).length})
          </span>
          <span className="text-[10px] text-slate-500 font-mono">
            {Object.values(agents).filter((a) => a.status === 'working').length} active
          </span>
        </div>

        <div className="grid grid-cols-5 gap-1.5 max-h-24 overflow-y-auto pr-1">
          {Object.values(agents).map((agent) => {
            const isSelected = selectedAgentId === agent.id;
            return (
              <button
                key={agent.id}
                onClick={() => {
                  selectAgent(agent.id);
                  setActiveTab('inspector');
                }}
                className={`p-1 rounded-md text-[10px] font-mono border transition-all text-center truncate ${
                  isSelected
                    ? 'bg-indigo-600 border-indigo-400 text-white font-bold shadow-sm'
                    : 'bg-slate-800/60 border-slate-700/60 text-slate-300 hover:bg-slate-700'
                }`}
                style={{
                  borderLeft: isSelected ? undefined : `3px solid ${agent.color}`,
                }}
                title={`${agent.name} (${agent.status})`}
              >
                {agent.id.toUpperCase()}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
