'use client';

import { useState, useCallback } from 'react';
import { useVoiceAgent, type ClientAction } from '@/hooks/useVoiceAgent';
import {
  AudioVisualizer,
  ConnectionStatus,
  ControlButtons,
  ActionCards,
} from '@/components';

export default function Home() {
  // Client actions state
  const [actions, setActions] = useState<ClientAction[]>([]);

  // Handle incoming client actions
  const handleClientAction = useCallback((action: ClientAction) => {
    console.log('Received client action:', action);
    setActions((prev) => [...prev, action]);
  }, []);

  // Handle errors
  const handleError = useCallback((error: Error) => {
    console.error('Voice agent error:', error);
  }, []);

  // Initialize voice agent hook
  const {
    state,
    error,
    isMuted,
    isAgentSpeaking,
    audioLevel,
    connect,
    disconnect,
    toggleMute,
    roomName,
  } = useVoiceAgent({
    onClientAction: handleClientAction,
    onError: handleError,
    participantName: 'Executive',
  });

  // Dismiss action card
  const handleDismissAction = useCallback((index: number) => {
    setActions((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const isConnected = state === 'connected';

  return (
    <main className="relative min-h-screen flex flex-col items-center justify-center p-8 overflow-hidden">
      {/* Animated background orbs */}
      <div className="orb orb-cyan w-96 h-96 -top-48 -left-48 fixed" />
      <div className="orb orb-purple w-80 h-80 -bottom-40 -right-40 fixed" />
      
      {/* Grid overlay */}
      <div 
        className="fixed inset-0 pointer-events-none opacity-[0.02]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px',
        }}
      />

      {/* Main content container */}
      <div className="relative z-10 w-full max-w-4xl mx-auto flex flex-col items-center gap-8">
        
        {/* Header */}
        <header className="text-center space-y-4 mb-4">
          <div className="flex items-center justify-center gap-3">
            {/* Logo/Icon */}
            <div className="relative">
              <div className={`p-4 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-purple-500/20 
                             border border-cyan-500/30 ${isConnected ? 'glow-cyan' : ''}`}>
                <svg
                  className={`w-8 h-8 ${isConnected ? 'text-cyan-400' : 'text-slate-400'} transition-colors duration-300`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
              </div>
              {/* Pulse effect when connected */}
              {isConnected && (
                <div className="absolute inset-0 rounded-2xl border-2 border-cyan-400/50 pulse-ring" />
              )}
            </div>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
            <span className="text-gradient">Executive Assistant</span>
          </h1>
          
          <p className="text-slate-400 text-lg max-w-md mx-auto">
            Your voice-first AI assistant powered by real-time conversation
          </p>
        </header>

        {/* Connection Status */}
        <ConnectionStatus state={state} roomName={roomName} error={error} />

        {/* Audio Visualizer */}
        <div className={`relative w-full max-w-lg h-32 rounded-2xl overflow-hidden
                        glass-card transition-all duration-500
                        ${isConnected ? 'border-cyan-500/30' : 'border-slate-700/50'}`}>
          <AudioVisualizer
            audioLevel={audioLevel}
            isActive={isConnected}
            isAgentSpeaking={isAgentSpeaking}
            className="w-full h-full"
          />
          
          {/* Speaking indicator overlay */}
          {isConnected && (
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full transition-colors duration-200
                             ${isAgentSpeaking ? 'bg-cyan-400 animate-pulse' : 'bg-slate-500'}`} />
              <span className="text-xs font-medium text-slate-400">
                {isAgentSpeaking ? 'Agent Speaking' : 'Listening...'}
              </span>
            </div>
          )}
        </div>

        {/* Control Buttons */}
        <ControlButtons
          state={state}
          isMuted={isMuted}
          onConnect={connect}
          onDisconnect={disconnect}
          onToggleMute={toggleMute}
        />

        {/* Mute Status */}
        {isConnected && isMuted && (
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-red-500/10 border border-red-500/30">
            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <span className="text-sm text-red-400 font-medium">Microphone Muted</span>
          </div>
        )}

        {/* Dynamic Widget Area - Client Actions */}
        <div className="w-full flex flex-col items-center mt-4">
          {actions.length > 0 && (
            <div className="w-full max-w-md space-y-4">
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                        d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <span>Actions from Assistant</span>
              </div>
              <ActionCards actions={actions} onDismiss={handleDismissAction} />
            </div>
          )}
        </div>

        {/* Instructions when idle */}
        {state === 'idle' && (
          <div className="text-center space-y-4 mt-8 animate-slide-up">
            <div className="glass-card rounded-2xl p-6 max-w-md mx-auto">
              <h3 className="text-lg font-semibold text-slate-200 mb-3">
                How it works
              </h3>
              <ul className="space-y-3 text-sm text-slate-400">
                <li className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center text-xs font-bold">1</span>
                  <span>Click &quot;Start Conversation&quot; to connect with your AI assistant</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center text-xs font-bold">2</span>
                  <span>Speak naturally - the assistant will respond in real-time</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-xs font-bold">3</span>
                  <span>Watch for action cards - schedule meetings, get directions, and more</span>
                </li>
              </ul>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="fixed bottom-4 left-1/2 -translate-x-1/2 text-center">
        <p className="text-xs text-slate-600">
          Powered by <span className="text-slate-500">Vocal Bridge AI</span> • Real-time Voice Interface
        </p>
      </footer>
    </main>
  );
}
