'use client';

import type { VoiceAgentState } from '@/hooks/useVoiceAgent';

interface ConnectionStatusProps {
  state: VoiceAgentState;
  roomName: string | null;
  error: string | null;
}

const stateConfig: Record<VoiceAgentState, { label: string; color: string; pulse: boolean }> = {
  idle: {
    label: 'Ready',
    color: 'bg-slate-500',
    pulse: false,
  },
  connecting: {
    label: 'Connecting...',
    color: 'bg-yellow-500',
    pulse: true,
  },
  connected: {
    label: 'Connected',
    color: 'bg-emerald-500',
    pulse: true,
  },
  disconnecting: {
    label: 'Disconnecting...',
    color: 'bg-orange-500',
    pulse: true,
  },
  error: {
    label: 'Error',
    color: 'bg-red-500',
    pulse: false,
  },
};

export function ConnectionStatus({ state, roomName, error }: ConnectionStatusProps) {
  const config = stateConfig[state];

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="flex items-center gap-3">
        {/* Status indicator */}
        <div className="relative">
          <div
            className={`w-3 h-3 rounded-full ${config.color}`}
          />
          {config.pulse && (
            <div
              className={`absolute inset-0 w-3 h-3 rounded-full ${config.color} animate-ping opacity-75`}
            />
          )}
        </div>
        
        {/* Status text */}
        <span className="text-sm font-medium text-slate-300">
          {config.label}
        </span>
      </div>

      {/* Room name when connected */}
      {state === 'connected' && roomName && (
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <svg
            className="w-3 h-3"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
            />
          </svg>
          <span className="font-mono">{roomName}</span>
        </div>
      )}

      {/* Error message */}
      {state === 'error' && error && (
        <div className="mt-2 px-4 py-2 bg-red-500/10 border border-red-500/20 rounded-lg">
          <p className="text-xs text-red-400">{error}</p>
        </div>
      )}
    </div>
  );
}
