'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import {
  Room,
  RoomEvent,
  Track,
  ConnectionState,
  RemoteTrack,
  Participant,
  DataPacket_Kind,
  LocalParticipant,
  RemoteParticipant,
} from 'livekit-client';

// ============================================================================
// Types
// ============================================================================

export type VoiceAgentState = 
  | 'idle' 
  | 'connecting' 
  | 'connected' 
  | 'disconnecting' 
  | 'error';

export interface CalendarEventAction {
  type: 'show_calendar_event';
  payload: {
    title: string;
    time: string;
    date: string;
    description?: string;
    location?: string;
  };
}

export interface MapsAction {
  type: 'Maps';
  payload: {
    url: string;
    title?: string;
  };
}

export interface GenericAction {
  type: string;
  payload: Record<string, unknown>;
}

export type ClientAction = CalendarEventAction | MapsAction | GenericAction;

export interface UseVoiceAgentOptions {
  onClientAction?: (action: ClientAction) => void;
  onError?: (error: Error) => void;
  participantName?: string;
}

export interface UseVoiceAgentReturn {
  state: VoiceAgentState;
  error: string | null;
  isMuted: boolean;
  isAgentSpeaking: boolean;
  audioLevel: number;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  toggleMute: () => Promise<void>;
  roomName: string | null;
}

// ============================================================================
// Hook Implementation
// ============================================================================

export function useVoiceAgent(options: UseVoiceAgentOptions = {}): UseVoiceAgentReturn {
  const { onClientAction, onError, participantName = 'User' } = options;

  // State
  const [state, setState] = useState<VoiceAgentState>('idle');
  const [error, setError] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isAgentSpeaking, setIsAgentSpeaking] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const [roomName, setRoomName] = useState<string | null>(null);

  // Refs
  const roomRef = useRef<Room | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const audioElementRef = useRef<HTMLAudioElement | null>(null);

  // Cleanup audio analysis
  const cleanupAudioAnalysis = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    analyserRef.current = null;
    setAudioLevel(0);
    setIsAgentSpeaking(false);
  }, []);

  // Setup audio analysis for visualizer
  const setupAudioAnalysis = useCallback((audioElement: HTMLAudioElement) => {
    try {
      // Create audio context
      const audioContext = new AudioContext();
      audioContextRef.current = audioContext;

      // Create analyser node
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      analyser.smoothingTimeConstant = 0.8;
      analyserRef.current = analyser;

      // Create media element source from the audio element
      const source = audioContext.createMediaElementSource(audioElement);
      source.connect(analyser);
      analyser.connect(audioContext.destination);

      // Animation loop for audio level
      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      
      const updateAudioLevel = () => {
        if (!analyserRef.current) return;
        
        analyserRef.current.getByteFrequencyData(dataArray);
        
        // Calculate average level
        const average = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;
        const normalizedLevel = average / 255;
        
        setAudioLevel(normalizedLevel);
        setIsAgentSpeaking(normalizedLevel > 0.05);
        
        animationFrameRef.current = requestAnimationFrame(updateAudioLevel);
      };

      updateAudioLevel();
    } catch (err) {
      console.error('Failed to setup audio analysis:', err);
    }
  }, []);

  // Handle incoming audio tracks
  const handleTrackSubscribed = useCallback(
    (track: RemoteTrack, _publication: unknown, _participant: RemoteParticipant) => {
      if (track.kind === Track.Kind.Audio) {
        console.log('Audio track subscribed, attaching...');
        
        // Create audio element and attach track
        const audioElement = track.attach() as HTMLAudioElement;
        audioElement.autoplay = true;
        audioElement.setAttribute('playsinline', 'true');
        
        // Store reference
        audioElementRef.current = audioElement;
        
        // Handle autoplay policy - try to play
        const playAudio = async () => {
          try {
            await audioElement.play();
            console.log('Audio playback started');
            setupAudioAnalysis(audioElement);
          } catch (err) {
            console.warn('Autoplay blocked, will retry on user interaction:', err);
            // Add click listener to enable audio on user interaction
            const enableAudio = async () => {
              try {
                await audioElement.play();
                setupAudioAnalysis(audioElement);
                document.removeEventListener('click', enableAudio);
              } catch (e) {
                console.error('Failed to play audio:', e);
              }
            };
            document.addEventListener('click', enableAudio);
          }
        };
        
        playAudio();
      }
    },
    [setupAudioAnalysis]
  );

  // Handle track unsubscribed
  const handleTrackUnsubscribed = useCallback(
    (track: RemoteTrack) => {
      if (track.kind === Track.Kind.Audio) {
        track.detach();
        cleanupAudioAnalysis();
      }
    },
    [cleanupAudioAnalysis]
  );

  // Handle data received (Client Actions)
  const handleDataReceived = useCallback(
    (
      payload: Uint8Array,
      _participant?: RemoteParticipant,
      _kind?: DataPacket_Kind,
      topic?: string
    ) => {
      try {
        const strData = new TextDecoder().decode(payload);
        const data = JSON.parse(strData);
        
        console.log('Data received:', { topic, data });

        // Check if this is a client action (handle both topic names)
        if (topic === 'client_actions' || topic === 'client_action' || data.type === 'client_action') {
          // Extract action type and payload - handle different message formats
          const actionType = data.action_type || data.type || 'unknown';
          const actionPayload = data.payload || data;
          
          const action: ClientAction = {
            type: actionType,
            payload: actionPayload,
          };
          
          console.log('Client action received:', action);
          onClientAction?.(action);
        }
      } catch (err) {
        console.error('Failed to parse data payload:', err);
      }
    },
    [onClientAction]
  );

  // Handle connection state changes
  const handleConnectionStateChanged = useCallback((connectionState: ConnectionState) => {
    console.log('Connection state changed:', connectionState);
    
    switch (connectionState) {
      case ConnectionState.Connected:
        setState('connected');
        setError(null);
        break;
      case ConnectionState.Connecting:
      case ConnectionState.Reconnecting:
        setState('connecting');
        break;
      case ConnectionState.Disconnected:
        setState('idle');
        break;
    }
  }, []);

  // Connect to voice agent
  const connect = useCallback(async () => {
    if (state === 'connecting' || state === 'connected') {
      console.warn('Already connected or connecting');
      return;
    }

    setState('connecting');
    setError(null);

    try {
      // Fetch token from our API route
      const response = await fetch('/api/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ participant_name: participantName }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.details || errorData.error || 'Failed to fetch token');
      }

      const { livekit_url, token, room_name } = await response.json();
      
      console.log('Token received, connecting to room:', room_name);
      setRoomName(room_name);

      // Create room instance
      const room = new Room({
        adaptiveStream: true,
        dynacast: true,
        audioCaptureDefaults: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      roomRef.current = room;

      // Setup event listeners
      room.on(RoomEvent.TrackSubscribed, handleTrackSubscribed);
      room.on(RoomEvent.TrackUnsubscribed, handleTrackUnsubscribed);
      room.on(RoomEvent.DataReceived, handleDataReceived);
      room.on(RoomEvent.ConnectionStateChanged, handleConnectionStateChanged);
      
      room.on(RoomEvent.Disconnected, () => {
        console.log('Disconnected from room');
        setState('idle');
        cleanupAudioAnalysis();
      });

      // Connect to room
      await room.connect(livekit_url, token);
      console.log('Connected to room');

      // Enable microphone
      await room.localParticipant.setMicrophoneEnabled(true);
      console.log('Microphone enabled');
      
      setState('connected');
    } catch (err) {
      console.error('Connection error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Connection failed';
      setError(errorMessage);
      setState('error');
      onError?.(err instanceof Error ? err : new Error(errorMessage));
    }
  }, [
    state,
    participantName,
    handleTrackSubscribed,
    handleTrackUnsubscribed,
    handleDataReceived,
    handleConnectionStateChanged,
    cleanupAudioAnalysis,
    onError,
  ]);

  // Disconnect from voice agent
  const disconnect = useCallback(async () => {
    if (!roomRef.current) return;

    setState('disconnecting');
    
    try {
      await roomRef.current.disconnect();
      roomRef.current = null;
      setRoomName(null);
      cleanupAudioAnalysis();
      setState('idle');
      setIsMuted(false);
    } catch (err) {
      console.error('Disconnect error:', err);
      setState('error');
    }
  }, [cleanupAudioAnalysis]);

  // Toggle mute
  const toggleMute = useCallback(async () => {
    if (!roomRef.current?.localParticipant) return;

    try {
      const newMutedState = !isMuted;
      await roomRef.current.localParticipant.setMicrophoneEnabled(!newMutedState);
      setIsMuted(newMutedState);
    } catch (err) {
      console.error('Failed to toggle mute:', err);
    }
  }, [isMuted]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (roomRef.current) {
        roomRef.current.disconnect();
      }
      cleanupAudioAnalysis();
    };
  }, [cleanupAudioAnalysis]);

  return {
    state,
    error,
    isMuted,
    isAgentSpeaking,
    audioLevel,
    connect,
    disconnect,
    toggleMute,
    roomName,
  };
}
