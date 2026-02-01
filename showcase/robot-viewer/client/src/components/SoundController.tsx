/** Engine sound when driving; volume/pitch follow speed. */
import { useEffect, useRef } from 'react';
import { useRobotStore } from '../hooks/useRobotModel';
import { generateSound } from '../services/api';

export default function SoundController() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);
  const audioBlobUrlRef = useRef<string | null>(null);
  const currentSoundIdRef = useRef<string | null>(null);
  const isPlayingRef = useRef(false);

  const soundEnabled = useRobotStore((s) => s.soundEnabled);
  const soundVolume = useRobotStore((s) => s.soundVolume);
  const selectedSound = useRobotStore((s) => s.selectedSound);
  const isCarMoving = useRobotStore((s) => s.isCarMoving);
  const carSpeed = useRobotStore((s) => s.carSpeed);
  const showGround = useRobotStore((s) => s.showGround);
  const setIsLoadingSound = useRobotStore((s) => s.setIsLoadingSound);

  // Initialize audio context on first user interaction
  useEffect(() => {
    const initAudioContext = () => {
      if (!audioContextRef.current) {
        audioContextRef.current = new AudioContext();
        gainNodeRef.current = audioContextRef.current.createGain();
        gainNodeRef.current.connect(audioContextRef.current.destination);
      }
    };

    window.addEventListener('click', initAudioContext, { once: true });
    window.addEventListener('keydown', initAudioContext, { once: true });

    return () => {
      window.removeEventListener('click', initAudioContext);
      window.removeEventListener('keydown', initAudioContext);
      if (audioBlobUrlRef.current) {
        URL.revokeObjectURL(audioBlobUrlRef.current);
      }
    };
  }, []);

  // Load sound when selected sound changes
  useEffect(() => {
    const loadSound = async () => {
      if (!selectedSound) return;
      if (currentSoundIdRef.current === selectedSound.id && audioRef.current) return;

      setIsLoadingSound(true);

      try {
        // Clean up previous audio
        if (audioBlobUrlRef.current) {
          URL.revokeObjectURL(audioBlobUrlRef.current);
        }
        if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current = null;
        }
        if (sourceRef.current) {
          sourceRef.current.disconnect();
          sourceRef.current = null;
        }

        let url: string;

        // Check if this is a custom recording with audioUrl
        if (selectedSound.audioUrl) {
          // Use the provided audio URL (custom recording)
          url = selectedSound.audioUrl;
        } else {
          // Generate new sound via API
          const blob = await generateSound(selectedSound.id, 3);
          url = URL.createObjectURL(blob);
          audioBlobUrlRef.current = url;
        }

        // Create audio element
        const audio = new Audio(url);
        audio.loop = true;
        audioRef.current = audio;
        currentSoundIdRef.current = selectedSound.id;

        // Connect to audio context if available
        if (audioContextRef.current && gainNodeRef.current) {
          const source = audioContextRef.current.createMediaElementSource(audio);
          source.connect(gainNodeRef.current);
          sourceRef.current = source;
        }
      } catch (error) {
        console.error('Failed to load engine sound:', error);
      } finally {
        setIsLoadingSound(false);
      }
    };

    loadSound();
  }, [selectedSound, setIsLoadingSound]);

  // Update volume
  useEffect(() => {
    if (gainNodeRef.current) {
      gainNodeRef.current.gain.value = soundVolume;
    }
  }, [soundVolume]);

  // Start/stop engine based on car movement
  useEffect(() => {
    const shouldPlay = soundEnabled && isCarMoving && showGround && audioRef.current;

    const startEngine = async () => {
      if (!audioRef.current || isPlayingRef.current) return;

      try {
        if (audioContextRef.current?.state === 'suspended') {
          await audioContextRef.current.resume();
        }
        await audioRef.current.play();
        isPlayingRef.current = true;
      } catch (error) {
        console.error('Failed to start engine sound:', error);
      }
    };

    const stopEngine = () => {
      if (!audioRef.current || !isPlayingRef.current) return;
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      isPlayingRef.current = false;
    };

    if (shouldPlay) {
      startEngine();
    } else {
      stopEngine();
    }
  }, [soundEnabled, isCarMoving, showGround]);

  // Update playback rate based on speed
  useEffect(() => {
    if (!audioRef.current || !gainNodeRef.current) return;

    const normalizedSpeed = Math.abs(carSpeed) / 4.2;
    const playbackRate = 0.6 + normalizedSpeed * 1.2;
    audioRef.current.playbackRate = Math.min(Math.max(playbackRate, 0.5), 2.0);

    const volumeMultiplier = 0.4 + normalizedSpeed * 0.6;
    gainNodeRef.current.gain.value = soundVolume * volumeMultiplier;
  }, [carSpeed, soundVolume]);

  return null;
}
