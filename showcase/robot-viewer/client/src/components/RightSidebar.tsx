import { useState, useEffect, useMemo, useRef } from 'react';
import { useRobotStore } from '../hooks/useRobotModel';
import { getAvailableSounds } from '../services/api';

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
    title: 'Wheels',
    summary: 'The front and rear wheels provide locomotion. We tested every tire we had and tuned the drive for the red and green tracks.',
    parts: [
      { id: 'wheel-1', role: 'Front/right wheel. Primary motion component for robot movement.' },
      { id: 'wheel-2', role: 'Rear/left wheel. Works with wheel-1 for stable driving and turns.' },
    ],
  },
  {
    title: 'Base Plate',
    summary: 'The laser-cut base plate is the structural foundation. Everything mounts to it: wheels, Arduino, sensors, and power.',
    parts: [
      { id: 'plate-1', role: 'Base plate. Supports all components and keeps the chassis rigid.' },
    ],
  },
  {
    title: 'IR Sensors',
    summary: 'Infrared proximity sensors detect obstacles and line edges. We use them for obstacle avoidance on the red track and line following.',
    parts: [
      { id: 'sensor-1', role: 'Left IR sensor. Detects obstacles and reflectance for line following.' },
      { id: 'sensor-2', role: 'Right IR sensor. Paired with sensor-1 for symmetric detection.' },
    ],
  },
  {
    title: 'Arduino Brain',
    summary: 'The Arduino Uno runs all our code: line following, obstacle avoidance, bullseye centering, and shooting logic.',
    parts: [
      { id: 'arduino-1', role: 'Main microcontroller. Reads sensors, drives motors, and runs the challenge algorithms.' },
    ],
  },
  {
    title: 'Motor Driver',
    summary: 'The L298N motor driver takes low-power signals from the Arduino and drives the wheel motors at the right speed and direction.',
    parts: [
      { id: 'motor-driver-1', role: 'H-bridge motor driver. Controls speed and direction of both wheels.' },
    ],
  },
  {
    title: 'Breadboard',
    summary: 'The breadboard lets us wire sensors and logic without soldering. Easy to change during testing.',
    parts: [
      { id: 'breadboard-1', role: 'Solderless prototyping board. Connects Arduino, sensors, and power cleanly.' },
    ],
  },
  {
    title: 'Power',
    summary: '67, 67 67 67 67 six seven SIX SEVEN',
    parts: [
      { id: 'battery-1', role: '67, 67 67 67 67 six seven SIX SEVEN' },
      { id: 'battery-2', role: '67, 67 67 67 67 six seven SIX SEVEN' },
    ],
  },
];

type Section = 'none' | 'sound' | 'tour' | 'algorithms';

const BULLSEYE_ALGORITHM = `Section 1: Bullseye (Target Shooting). Find center from random start.

1. Move straight toward the edge (any direction) until the color sensor detects BLUE (blue zone at the wall).

2. Stop. Do a 180° turn (face the opposite direction).

3. Travel straight toward the opposite side. Measure and record the time T until you detect BLUE again (or reach the opposite edge).

4. Half-time = T ÷ 2. This is the time needed to reach the center along this axis.

5. Do a 180° turn again (face back toward the center).

6. Travel forward for exactly half-time (T/2). Stop. You are now at the center along this axis.

7. Do a 90° turn (to align with the perpendicular axis).

8. Move straight until you are in the middle:
   - Option A: Move until the color sensor detects BLACK (black center zone), then stop.
   - Option B: Repeat the same edge, measure, half-time procedure on this axis, then stop at center.

9. You are at the black center. Shoot or launch the ball forward for scoring.`;

const RED_TRACK_ALGORITHM = `Red Track. Obstacle avoidance with ultrasonic.

1. Follow the red line (line following as normal).

2. Continuously read the ultrasonic sensor for distance to obstacles ahead.

3. If distance < 15 cm (or 10 cm; pick a threshold, e.g. 10 to 15 cm):
   - Stop forward motion.
   - Execute a semi-circle around the obstacle:
     - Turn ~90° in one direction (e.g. left or right).
     - Drive forward in an arc for a set time or until the line is detected again.
     - Turn back toward the line (about 90° the other way) to rejoin the path.
   - Resume line following.

4. If distance ≥ threshold, keep following the line as normal.

5. Repeat until you reach the end of the red track (e.g. box drop off, reupload point).`;

export default function RightSidebar() {
  const [activeSection, setActiveSection] = useState<Section>('none');
  const [stepIndex, setStepIndex] = useState(0);

  // Store selectors
  const cameraMode = useRobotStore((s) => s.cameraMode);
  const toggleCameraMode = useRobotStore((s) => s.toggleCameraMode);
  const soundEnabled = useRobotStore((s) => s.soundEnabled);
  const soundVolume = useRobotStore((s) => s.soundVolume);
  const selectedSound = useRobotStore((s) => s.selectedSound);
  const availableSounds = useRobotStore((s) => s.availableSounds);
  const isLoadingSound = useRobotStore((s) => s.isLoadingSound);
  const showGround = useRobotStore((s) => s.showGround);
  const setSoundEnabled = useRobotStore((s) => s.setSoundEnabled);
  const setSoundVolume = useRobotStore((s) => s.setSoundVolume);
  const setSelectedSound = useRobotStore((s) => s.setSelectedSound);
  const setAvailableSounds = useRobotStore((s) => s.setAvailableSounds);
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

  // Load sounds on mount
  useEffect(() => {
    getAvailableSounds().then(setAvailableSounds).catch(console.error);
  }, [setAvailableSounds]);

  // Tour logic
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
    if (activeSection !== 'tour') return;
    const ids = Array.from(new Set(step.parts.map((part) => part.id)));
    if (ids.length > 0) {
      highlightParts(ids);
    } else {
      clearHighlights();
    }
    selectPart(null);
  }, [activeSection, step.parts, highlightParts, clearHighlights, selectPart]);

  const startTour = () => {
    previousSelectionRef.current = {
      highlightedParts: [...highlightedParts],
      selectedPart,
    };
    setTourActive(true);
    setStepIndex(0);
    setActiveSection('tour');
  };

  const endTour = () => {
    setTourActive(false);
    setActiveSection('none');
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

  const toggleSection = (section: Section) => {
    if (section === 'tour') {
      if (activeSection === 'tour') {
        endTour();
      } else {
        startTour();
      }
    } else {
      setActiveSection(activeSection === section ? 'none' : section);
    }
  };

  return (
    <div className="fixed top-4 right-4 z-20 w-64 right-sidebar-container">
      <div className="bg-white/90 backdrop-blur-md rounded-xl border border-gray-200 shadow-2xl overflow-hidden">
        {/* Camera Toggle */}
        <div className="px-3 py-2 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 text-gray-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
              />
            </svg>
            <span className="text-xs text-gray-700 font-medium">Camera</span>
          </div>
          <button
            onClick={toggleCameraMode}
            className="text-[10px] px-2 py-1 rounded bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
          >
            {cameraMode === 'third' ? 'Third Person' : 'First Person'}
          </button>
        </div>

        {/* Engine Sound Section */}
        <div className="border-b border-gray-200">
          <button
            onClick={() => toggleSection('sound')}
            className="w-full px-3 py-2 flex items-center justify-between hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 text-gray-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
                />
              </svg>
              <span className="text-xs text-gray-700 font-medium">Engine Sound</span>
            </div>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className={`h-4 w-4 text-gray-400 transition-transform ${activeSection === 'sound' ? 'rotate-180' : ''}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {activeSection === 'sound' && (
            <div className="px-3 pb-3 space-y-2">
              {/* Enable/Disable toggle */}
              <div className="flex items-center justify-between">
                <label className="text-[10px] text-gray-500 uppercase tracking-wide">Sound</label>
                <button
                  onClick={() => setSoundEnabled(!soundEnabled)}
                  className={`relative w-8 h-4 rounded-full transition-colors ${
                    soundEnabled ? 'bg-blue-600' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`absolute top-0.5 left-0.5 w-3 h-3 bg-white rounded-full transition-transform ${
                      soundEnabled ? 'translate-x-4' : ''
                    }`}
                  />
                </button>
              </div>

              {/* Volume slider */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[10px] text-gray-500 uppercase tracking-wide">Volume</label>
                  <span className="text-[10px] text-gray-400">{Math.round(soundVolume * 100)}%</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.01}
                  value={soundVolume}
                  onChange={(e) => setSoundVolume(Number(e.target.value))}
                  className="w-full h-1 accent-blue-600 cursor-pointer"
                  disabled={!soundEnabled}
                />
              </div>

              {/* Sound selection */}
              <div>
                <label className="text-[10px] text-gray-500 uppercase tracking-wide block mb-1">
                  Engine Type
                </label>
                <div className="max-h-[150px] overflow-y-auto custom-scrollbar space-y-1">
                  {availableSounds.map((sound) => {
                    const isSelected = selectedSound?.id === sound.id;
                    return (
                      <button
                        key={sound.id}
                        onClick={() => setSelectedSound(sound)}
                        disabled={!soundEnabled}
                        className={`w-full text-left px-2 py-1.5 rounded-lg transition-colors ${
                          isSelected
                            ? 'bg-blue-100 text-blue-700 border border-blue-200'
                            : 'hover:bg-gray-100 text-gray-700 border border-transparent'
                        } ${!soundEnabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        <div className="text-xs font-medium">{sound.name}</div>
                        <div className="text-[10px] text-gray-400">{sound.description}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Status */}
              <div className="text-center pt-1">
                {isLoadingSound ? (
                  <div className="flex items-center justify-center gap-2 text-[10px] text-blue-600">
                    <svg className="animate-spin h-3 w-3" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Generating sound...
                  </div>
                ) : selectedSound ? (
                  <div className="text-[10px] text-gray-400">
                    {showGround ? 'Drive to hear engine!' : 'Enable Drive mode first'}
                  </div>
                ) : (
                  <div className="text-[10px] text-gray-400">Select an engine sound</div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Challenge Algorithms Section */}
        <div className="border-b border-gray-200">
          <button
            onClick={() => toggleSection('algorithms')}
            className="w-full px-3 py-2 flex items-center justify-between hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 text-gray-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                />
              </svg>
              <span className="text-xs text-gray-700 font-medium">Challenge Algorithms</span>
            </div>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className={`h-4 w-4 text-gray-400 transition-transform ${activeSection === 'algorithms' ? 'rotate-180' : ''}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {activeSection === 'algorithms' && (
            <div className="px-3 pb-3 space-y-3">
              <div>
                <div className="text-[10px] text-gray-400 uppercase tracking-wide mb-1.5">Bullseye (Section 1)</div>
                <pre className="text-[10px] text-gray-700 leading-relaxed whitespace-pre-wrap font-sans bg-gray-50 border border-gray-200 rounded-lg p-2.5 max-h-[280px] overflow-y-auto custom-scrollbar">
                  {BULLSEYE_ALGORITHM}
                </pre>
              </div>
              <div>
                <div className="text-[10px] text-gray-400 uppercase tracking-wide mb-1.5">Red Track (obstacle avoidance)</div>
                <pre className="text-[10px] text-gray-700 leading-relaxed whitespace-pre-wrap font-sans bg-gray-50 border border-gray-200 rounded-lg p-2.5 max-h-[220px] overflow-y-auto custom-scrollbar">
                  {RED_TRACK_ALGORITHM}
                </pre>
              </div>
            </div>
          )}
        </div>

        {/* Tour Guide Section */}
        <div>
          <button
            onClick={() => toggleSection('tour')}
            className="w-full px-3 py-2 flex items-center justify-between hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 text-gray-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
                />
              </svg>
              <span className="text-xs text-gray-700 font-medium">Tour Guide</span>
            </div>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className={`h-4 w-4 text-gray-400 transition-transform ${activeSection === 'tour' ? 'rotate-180' : ''}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {activeSection === 'tour' && (
            <div className="px-3 pb-3">
              <div className="mb-2">
                <div className="text-[10px] text-gray-400 uppercase tracking-wide">Step {clampedIndex + 1} of {TOUR_STEPS.length}</div>
                <h3 className="text-gray-800 text-sm font-semibold">{step.title}</h3>
              </div>

              <p className="text-gray-600 text-xs leading-relaxed mb-2">{step.summary}</p>

              <div className="space-y-1 mb-3">
                <div className="text-[10px] text-gray-400 uppercase tracking-wide">Highlighted Parts</div>
                {resolvedParts.length === 0 ? (
                  <div className="text-[10px] text-gray-400">No parts assigned to this step.</div>
                ) : (
                  <div className="max-h-[200px] overflow-y-auto custom-scrollbar space-y-1">
                    {resolvedParts.map((part) => (
                      <div key={part.id} className="bg-gray-50 border border-gray-200 rounded-lg p-2">
                        <div className="flex items-center justify-between">
                          <div className="text-[10px] font-semibold text-gray-700">{part.name}</div>
                          <div className="text-[9px] text-gray-400">{part.id}</div>
                        </div>
                        <div className="text-[10px] text-gray-500">{part.role}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between">
                <button
                  onClick={goPrevious}
                  disabled={clampedIndex === 0}
                  className="text-[10px] px-2 py-1 rounded border border-gray-200 text-gray-500 hover:text-gray-700 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Back
                </button>
                <button
                  onClick={goNext}
                  className="text-[10px] px-2 py-1 rounded bg-blue-600 text-white hover:bg-blue-500 transition-colors"
                >
                  {clampedIndex >= TOUR_STEPS.length - 1 ? 'Finish' : 'Next'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
