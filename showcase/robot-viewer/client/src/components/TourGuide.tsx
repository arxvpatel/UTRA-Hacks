import { useEffect, useMemo, useRef, useState } from 'react';
import { useRobotStore } from '../hooks/useRobotModel';

type TourStepPart = {
  id: string;
  role: string;
};

type TourStep = {
  title: string;
  summary: string;
  parts: TourStepPart[];
};

const TOUR_STEPS: TourStep[] = [
  {
    title: 'Step Title (edit me)',
    summary: 'Short description of what this step explains. Replace this placeholder text.',
    parts: [
      { id: 'wheel-1', role: 'Role of part 1 (replace with a real explanation).' },
      { id: 'wheel-2', role: 'Role of part 2 (replace with a real explanation).' },
    ],
  },
  {
    title: 'Second Step Title (edit me)',
    summary: 'Explain a mechanism, sensor, or control logic here.',
    parts: [
      { id: 'plate-1', role: 'Role of this part in the process.' },
      { id: 'wheel-1', role: 'Add another relevant part or remove if not needed.' },
    ],
  },
  {
    title: 'Third Step Title (edit me)',
    summary: 'Describe what the system does and why these parts matter.',
    parts: [],
  },
];

export default function TourGuide() {
  const [isOpen, setIsOpen] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);

  const parts = useRobotStore((s) => s.parts);
  const highlightedParts = useRobotStore((s) => s.highlightedParts);
  const selectedPart = useRobotStore((s) => s.selectedPart);
  const highlightParts = useRobotStore((s) => s.highlightParts);
  const clearHighlights = useRobotStore((s) => s.clearHighlights);
  const selectPart = useRobotStore((s) => s.selectPart);
  const setTourActive = useRobotStore((s) => s.setTourActive);

  const previousSelectionRef = useRef<{
    highlightedParts: string[];
    selectedPart: string | null;
  } | null>(null);

  const clampedIndex = Math.min(Math.max(stepIndex, 0), TOUR_STEPS.length - 1);
  const step = TOUR_STEPS[clampedIndex];

  const resolvedParts = useMemo(() => {
    return step.parts.map((tourPart) => {
      const match = parts.find((part) => part.id === tourPart.id);
      return {
        ...tourPart,
        name: match?.name ?? tourPart.id,
        description: match?.description ?? null,
      };
    });
  }, [parts, step.parts]);

  useEffect(() => {
    if (!isOpen) return;
    const ids = Array.from(new Set(step.parts.map((part) => part.id)));
    if (ids.length > 0) {
      highlightParts(ids);
    } else {
      clearHighlights();
    }
    selectPart(null);
  }, [isOpen, step.parts, highlightParts, clearHighlights, selectPart]);

  const startTour = () => {
    previousSelectionRef.current = {
      highlightedParts: [...highlightedParts],
      selectedPart,
    };
    setTourActive(true);
    setStepIndex(0);
    setIsOpen(true);
  };

  const endTour = () => {
    setTourActive(false);
    setIsOpen(false);
    const previous = previousSelectionRef.current;
    if (previous) {
      highlightParts(previous.highlightedParts);
      selectPart(previous.selectedPart);
    } else {
      clearHighlights();
      selectPart(null);
    }
    previousSelectionRef.current = null;
  };

  const goPrevious = () => {
    setStepIndex((current) => Math.max(current - 1, 0));
  };

  const goNext = () => {
    if (clampedIndex >= TOUR_STEPS.length - 1) {
      endTour();
      return;
    }
    setStepIndex((current) => Math.min(current + 1, TOUR_STEPS.length - 1));
  };

  return (
    <div className="fixed bottom-16 right-4 z-20">
      {!isOpen ? (
        <button
          onClick={startTour}
          className="bg-white/90 backdrop-blur-md text-gray-700 px-3 py-2 rounded-lg border border-gray-200 text-xs font-medium hover:bg-gray-50 transition-colors shadow-lg"
        >
          Tour Guide
        </button>
      ) : (
        <div className="w-80 max-w-[90vw] bg-white/90 backdrop-blur-md rounded-xl border border-gray-200 shadow-2xl overflow-hidden">
          <div className="flex items-start justify-between px-4 py-3 border-b border-gray-200">
            <div>
              <div className="text-[10px] text-gray-400 uppercase tracking-wide">Tour Guide</div>
              <h3 className="text-gray-800 text-sm font-semibold">{step.title}</h3>
            </div>
            <button
              onClick={endTour}
              className="text-[10px] text-gray-400 hover:text-gray-700 transition-colors"
            >
              End
            </button>
          </div>

          <div className="p-4 space-y-3 max-h-[60vh] overflow-y-auto custom-scrollbar">
            <p className="text-gray-600 text-sm leading-relaxed">{step.summary}</p>

            <div className="space-y-2">
              <div className="text-[10px] text-gray-400 uppercase tracking-wide">
                Highlighted Parts
              </div>
              {resolvedParts.length === 0 ? (
                <div className="text-xs text-gray-400">
                  No parts assigned yet. Add part IDs to this step in
                  <span className="font-mono"> TOUR_STEPS</span>.
                </div>
              ) : (
                resolvedParts.map((part) => (
                  <div
                    key={part.id}
                    className="bg-gray-50 border border-gray-200 rounded-lg p-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="text-xs font-semibold text-gray-700">{part.name}</div>
                      <div className="text-[10px] text-gray-400">{part.id}</div>
                    </div>
                    <div className="text-xs text-gray-500">{part.role}</div>
                    {part.description && (
                      <div className="text-[10px] text-gray-400">{part.description}</div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="px-4 py-3 border-t border-gray-200 flex items-center justify-between">
            <div className="text-[10px] text-gray-400">
              Step {clampedIndex + 1} of {TOUR_STEPS.length}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={goPrevious}
                disabled={clampedIndex === 0}
                className="text-xs px-2 py-1 rounded border border-gray-200 text-gray-500 hover:text-gray-700 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Back
              </button>
              <button
                onClick={goNext}
                className="text-xs px-2 py-1 rounded bg-blue-600 text-white hover:bg-blue-500 transition-colors"
              >
                {clampedIndex >= TOUR_STEPS.length - 1 ? 'Finish' : 'Next'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
