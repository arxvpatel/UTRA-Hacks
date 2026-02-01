import { useState, useRef, useEffect } from 'react';
import { useRobotStore } from '../hooks/useRobotModel';

const CUSTOM_SOUND_KEY = 'custom-engine-sound';
const MAX_RECORDING_TIME = 10000; // 10 seconds max

export default function CustomSoundRecorder() {
  const [isRecording, setIsRecording] = useState(false);
  const [hasRecording, setHasRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [permissionDenied, setPermissionDenied] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);
  const previewAudioRef = useRef<HTMLAudioElement | null>(null);

  const setSelectedSound = useRobotStore((s) => s.setSelectedSound);
  const availableSounds = useRobotStore((s) => s.availableSounds);
  const setAvailableSounds = useRobotStore((s) => s.setAvailableSounds);

  // Check if there's a saved recording on mount
  useEffect(() => {
    const checkSavedRecording = async () => {
      try {
        const savedBlob = await getCustomSound();
        if (savedBlob) {
          setHasRecording(true);
        }
      } catch (error) {
        console.error('Error checking saved recording:', error);
      }
    };
    checkSavedRecording();
  }, []);

  const startRecording = async () => {
    try {
      setPermissionDenied(false);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm',
      });

      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        await saveCustomSound(audioBlob);
        setHasRecording(true);

        // Stop all tracks to release the microphone
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      mediaRecorderRef.current = mediaRecorder;
      setIsRecording(true);
      setRecordingTime(0);

      // Start timer
      const startTime = Date.now();
      timerRef.current = setInterval(() => {
        const elapsed = Date.now() - startTime;
        setRecordingTime(elapsed);

        // Auto-stop after max time
        if (elapsed >= MAX_RECORDING_TIME) {
          stopRecording();
        }
      }, 100);
    } catch (error) {
      console.error('Error accessing microphone:', error);
      setPermissionDenied(true);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current = null;
      setIsRecording(false);

      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  };

  const deleteRecording = async () => {
    try {
      await deleteCustomSound();
      setHasRecording(false);

      // If custom sound is selected, deselect it
      const customSoundInList = availableSounds.find((s) => s.id === 'custom-recording');
      if (customSoundInList) {
        setSelectedSound(null);
        setAvailableSounds(availableSounds.filter((s) => s.id !== 'custom-recording'));
      }
    } catch (error) {
      console.error('Error deleting recording:', error);
    }
  };

  const playPreview = async () => {
    try {
      const blob = await getCustomSound();
      if (!blob) return;

      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);

      audio.onended = () => {
        setIsPlaying(false);
        URL.revokeObjectURL(url);
      };

      audio.play();
      setIsPlaying(true);
      previewAudioRef.current = audio;
    } catch (error) {
      console.error('Error playing preview:', error);
    }
  };

  const stopPreview = () => {
    if (previewAudioRef.current) {
      previewAudioRef.current.pause();
      previewAudioRef.current = null;
      setIsPlaying(false);
    }
  };

  const useCustomSound = async () => {
    try {
      const blob = await getCustomSound();
      if (!blob) return;

      const url = URL.createObjectURL(blob);
      const customSound = {
        id: 'custom-recording',
        name: 'My Custom Sound',
        description: 'Your recorded voice/sound',
        audioUrl: url,
      };

      // Add to available sounds if not already there
      const exists = availableSounds.find((s) => s.id === 'custom-recording');
      if (!exists) {
        setAvailableSounds([customSound, ...availableSounds]);
      }

      // Set as selected sound
      setSelectedSound(customSound);
    } catch (error) {
      console.error('Error using custom sound:', error);
    }
  };

  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const deciseconds = Math.floor((ms % 1000) / 100);
    return `${seconds}.${deciseconds}s`;
  };

  return (
    <div className="space-y-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-medium text-gray-700">Custom Engine Sound</h3>
        {isRecording && (
          <span className="flex items-center gap-1.5 text-red-600 text-[10px]">
            <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
            Recording {formatTime(recordingTime)}
          </span>
        )}
      </div>

      {permissionDenied && (
        <div className="text-[10px] text-red-600 bg-red-50 p-2 rounded border border-red-200">
          Microphone access denied. Please enable microphone permissions.
        </div>
      )}

      <div className="space-y-1.5">
        {!hasRecording ? (
          <div className="space-y-1.5">
            <p className="text-[10px] text-gray-500">
              Record your own sound (up to 10s)
            </p>
            <button
              onClick={isRecording ? stopRecording : startRecording}
              disabled={isRecording && recordingTime >= MAX_RECORDING_TIME}
              className={`w-full px-2 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                isRecording
                  ? 'bg-red-100 hover:bg-red-200 text-red-700 border border-red-200'
                  : 'bg-blue-100 hover:bg-blue-200 text-blue-700 border border-blue-200'
              }`}
            >
              {isRecording ? 'Stop Recording' : 'Start Recording'}
            </button>
          </div>
        ) : (
          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5">
              <button
                onClick={isPlaying ? stopPreview : playPreview}
                className="flex-1 px-2 py-1.5 rounded-lg text-xs font-medium bg-green-100 hover:bg-green-200 text-green-700 border border-green-200 transition-colors"
              >
                {isPlaying ? '⏹ Stop' : '▶ Preview'}
              </button>
              <button
                onClick={deleteRecording}
                className="px-2 py-1.5 rounded-lg text-xs font-medium bg-red-100 hover:bg-red-200 text-red-700 border border-red-200 transition-colors"
              >
                🗑
              </button>
            </div>
            <button
              onClick={useCustomSound}
              className="w-full px-2 py-1.5 rounded-lg text-xs font-medium bg-purple-100 hover:bg-purple-200 text-purple-700 border border-purple-200 transition-colors"
            >
              Use as Engine Sound
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// Helper functions for IndexedDB storage
async function saveCustomSound(blob: Blob): Promise<void> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      try {
        localStorage.setItem(CUSTOM_SOUND_KEY, reader.result as string);
        resolve();
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

async function getCustomSound(): Promise<Blob | null> {
  try {
    const dataUrl = localStorage.getItem(CUSTOM_SOUND_KEY);
    if (!dataUrl) return null;

    const response = await fetch(dataUrl);
    return await response.blob();
  } catch (error) {
    console.error('Error getting custom sound:', error);
    return null;
  }
}

async function deleteCustomSound(): Promise<void> {
  localStorage.removeItem(CUSTOM_SOUND_KEY);
}
