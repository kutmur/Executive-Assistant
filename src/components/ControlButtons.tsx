'use client';

import type { VoiceAgentState } from '@/hooks/useVoiceAgent';

interface ControlButtonsProps {
  state: VoiceAgentState;
  isMuted: boolean;
  onConnect: () => void;
  onDisconnect: () => void;
  onToggleMute: () => void;
}

export function ControlButtons({
  state,
  isMuted,
  onConnect,
  onDisconnect,
  onToggleMute,
}: ControlButtonsProps) {
  const isConnected = state === 'connected';
  const isConnecting = state === 'connecting' || state === 'disconnecting';

  return (
    <div className="flex items-center gap-4">
      {/* Main Connect/Disconnect Button */}
      {!isConnected ? (
        <button
          onClick={onConnect}
          disabled={isConnecting}
          className="group relative px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-2xl font-semibold text-white text-lg shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 transition-all duration-300 ease-out hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
        >
          {/* Animated border */}
          <span className="absolute inset-0 rounded-2xl bg-gradient-to-r from-cyan-400 to-blue-500 opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-300" />
          
          <span className="relative flex items-center gap-3">
            {isConnecting ? (
              <>
                <svg
                  className="w-6 h-6 animate-spin"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                <span>Connecting...</span>
              </>
            ) : (
              <>
                {/* Microphone icon */}
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
                  />
                </svg>
                <span>Start Conversation</span>
              </>
            )}
          </span>
        </button>
      ) : (
        <div className="flex items-center gap-3">
          {/* Mute/Unmute Button */}
          <button
            onClick={onToggleMute}
            className={`group relative p-4 rounded-xl font-medium text-white transition-all duration-300 ease-out hover:scale-105 active:scale-95 ${isMuted ? 'bg-red-500/20 border border-red-500/50 hover:bg-red-500/30' : 'bg-slate-700/50 border border-slate-600/50 hover:bg-slate-600/50'}`}
            title={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted ? (
              // Muted icon
              <svg
                className="w-6 h-6 text-red-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2"
                />
              </svg>
            ) : (
              // Unmuted icon
              <svg
                className="w-6 h-6 text-slate-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
                />
              </svg>
            )}
          </button>

          {/* Disconnect Button */}
          <button
            onClick={onDisconnect}
            className="group relative px-6 py-4 bg-slate-800/50 border border-slate-700/50 rounded-xl font-medium text-slate-300 transition-all duration-300 ease-out hover:bg-red-500/20 hover:border-red-500/50 hover:text-red-400 hover:scale-105 active:scale-95"
          >
            <span className="flex items-center gap-2">
              {/* Disconnect icon */}
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
              <span>End</span>
            </span>
          </button>
        </div>
      )}
    </div>
  );
}
