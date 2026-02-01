import { useState, type FormEvent } from 'react';
import { useVoiceRecording } from '../hooks/useVoiceRecording';
import { useRobotStore } from '../hooks/useRobotModel';
import { processVoiceCommand, processTextQuery } from '../services/api';

export default function VoiceControl() {
  const { isRecording, isSupported, error: micError, startRecording, stopRecording } =
    useVoiceRecording();
  const [textQuery, setTextQuery] = useState('');

  const isLoading = useRobotStore((s) => s.isLoading);
  const lastTranscription = useRobotStore((s) => s.lastTranscription);
  const error = useRobotStore((s) => s.error);
  const apiStatus = useRobotStore((s) => s.apiStatus);
  const highlightParts = useRobotStore((s) => s.highlightParts);
  const setLoading = useRobotStore((s) => s.setLoading);
  const setTranscription = useRobotStore((s) => s.setTranscription);
  const setError = useRobotStore((s) => s.setError);

  const handleMicClick = async () => {
    if (isRecording) {
      const blob = await stopRecording();
      if (!blob) return;
      setLoading(true);
      setError(null);
      try {
        const result = await processVoiceCommand(blob);
        setTranscription(result.transcription);
        highlightParts(result.matchedParts.map((p) => p.id));
      } catch {
        setError('Failed to process voice command');
      } finally {
        setLoading(false);
      }
    } else {
      await startRecording();
    }
  };

  const handleTextSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!textQuery.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const result = await processTextQuery(textQuery.trim());
      setTranscription(result.transcription);
      highlightParts(result.matchedParts.map((p) => p.id));
      setTextQuery('');
    } catch {
      setError('Failed to process query');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-3">
      {apiStatus?.demoMode && (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 text-xs px-3 py-1.5 rounded-lg backdrop-blur-sm">
          Demo Mode — API keys not configured
        </div>
      )}

      {(error || micError) && (
        <div className="bg-red-50 border border-red-200 text-red-600 text-xs px-3 py-1.5 rounded-lg backdrop-blur-sm max-w-xs text-center">
          {error || micError}
        </div>
      )}

      {lastTranscription && (
        <div className="bg-white/80 backdrop-blur-sm text-gray-600 text-sm px-4 py-2 rounded-lg border border-gray-200 max-w-md text-center">
          "{lastTranscription}"
        </div>
      )}

      <div className="bg-white/90 backdrop-blur-md rounded-2xl border border-gray-200 p-4 flex flex-col items-center gap-3 shadow-2xl">
        {/* Mic button */}
        <button
          onClick={handleMicClick}
          disabled={isLoading || !isSupported}
          className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${
            isRecording
              ? 'bg-red-500 animate-pulse shadow-lg shadow-red-500/40'
              : isLoading
              ? 'bg-gray-300 cursor-wait'
              : 'bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-500/30'
          } disabled:opacity-40 disabled:cursor-not-allowed`}
        >
          {isLoading ? (
            <svg className="w-6 h-6 text-white animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          ) : (
            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" />
              <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
            </svg>
          )}
        </button>

        <div className="text-gray-400 text-xs">or type</div>

        {/* Text input */}
        <form onSubmit={handleTextSubmit} className="flex gap-2">
          <input
            type="text"
            value={textQuery}
            onChange={(e) => setTextQuery(e.target.value)}
            placeholder="Ask about a robot part..."
            disabled={isLoading}
            className="bg-gray-100 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-blue-400 w-56 disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={isLoading || !textQuery.trim()}
            className="bg-blue-600 hover:bg-blue-500 text-white text-sm px-3 py-2 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Go
          </button>
        </form>
      </div>
    </div>
  );
}
