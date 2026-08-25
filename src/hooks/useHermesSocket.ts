'use client';

import { useEffect, useRef } from 'react';
import { useOfficeStore } from '@/store/useOfficeStore';
import { HermesBackendEvent, HermesBackendEventType } from '@/types/events';

const EVENT_TYPES: ReadonlySet<HermesBackendEventType> = new Set([
  'task_received',
  'subtask_assigned',
  'subtask_progress',
  'subtask_done',
  'synthesis_start',
  'done',
  'courier_dispatch',
  'courier_delivered',
  'agent_break',
]);

function isHermesEvent(value: unknown): value is HermesBackendEvent {
  return (
    typeof value === 'object' &&
    value !== null &&
    'type' in value &&
    EVENT_TYPES.has((value as { type: unknown }).type as HermesBackendEventType)
  );
}

const MAX_RECONNECT_DELAY_MS = 15000;
const BASE_RECONNECT_DELAY_MS = 1000;

/**
 * Connects to the real Hermes backend's live event stream (PRD section 4) and
 * pipes every event straight into the zustand store's handleHermesEvent — the
 * same handler the sidebar's manual "Broadcast Directive" demo trigger uses,
 * so the 3D scene reacts identically whether the source is a real backend or
 * the local `triggerInstruction` demo path.
 *
 * Configure via NEXT_PUBLIC_HERMES_WS_URL (see README). With no URL set this
 * hook is a no-op and the app stays fully usable via the manual trigger.
 */
export function useHermesSocket() {
  const reconnectAttempt = useRef(0);
  const socketRef = useRef<WebSocket | null>(null);
  const closedByUs = useRef(false);

  useEffect(() => {
    const url = process.env.NEXT_PUBLIC_HERMES_WS_URL;
    if (!url) return;

    closedByUs.current = false;
    let reconnectTimer: ReturnType<typeof setTimeout> | null = null;

    const connect = () => {
      const setConnectionStatus = useOfficeStore.getState().setConnectionStatus;
      setConnectionStatus('connecting');

      const socket = new WebSocket(url);
      socketRef.current = socket;

      socket.onopen = () => {
        reconnectAttempt.current = 0;
        setConnectionStatus('connected');
      };

      socket.onmessage = (event) => {
        let parsed: unknown;
        try {
          parsed = JSON.parse(event.data);
        } catch {
          console.warn('[useHermesSocket] ignored non-JSON message from backend');
          return;
        }
        if (!isHermesEvent(parsed)) {
          console.warn('[useHermesSocket] ignored message with unknown/missing event type', parsed);
          return;
        }
        useOfficeStore.getState().handleHermesEvent(parsed);
      };

      socket.onerror = () => {
        setConnectionStatus('error');
      };

      socket.onclose = () => {
        if (closedByUs.current) return;
        setConnectionStatus('disconnected');
        const delay = Math.min(BASE_RECONNECT_DELAY_MS * 2 ** reconnectAttempt.current, MAX_RECONNECT_DELAY_MS);
        reconnectAttempt.current += 1;
        reconnectTimer = setTimeout(connect, delay);
      };
    };

    connect();

    return () => {
      closedByUs.current = true;
      if (reconnectTimer) clearTimeout(reconnectTimer);
      socketRef.current?.close();
      useOfficeStore.getState().setConnectionStatus('disconnected');
    };
  }, []);
}
