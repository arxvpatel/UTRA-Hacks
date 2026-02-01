/** Right sidebar: camera, engine sound, tour, challenge algorithms. */
import { useState, useEffect, useMemo, useRef } from 'react';
import { useRobotStore } from '../hooks/useRobotModel';
import { getAvailableSounds } from '../services/api';
import CustomSoundRecorder from './CustomSoundRecorder';

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
    title: 'Ultrasonic Sensor',
    summary: 'The ultrasonic distance sensor measures the distance to obstacles ahead using sound waves. Critical for obstacle detection and avoidance on the red track.',
    parts: [
      { id: 'ultrasonic-sensor-1', role: 'Ultrasonic distance sensor. Continuously monitors distance ahead to detect obstacles.' },
    ],
  },
  {
    title: 'Color Sensor',
    summary: 'The color/light sensor detects surface colors beneath the robot. Used for line following, detecting blue walls, and finding the black center in the bullseye challenge.',
    parts: [
      { id: 'color-sensor-1', role: 'Color/light sensor. Detects red lines, blue walls, black center, and other surface colors.' },
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

type AlgorithmStep = {
  description: string;
  highlightParts: string[]; // Part IDs to highlight for this step
};

type Algorithm = {
  name: string;
  steps: AlgorithmStep[];
};

const BULLSEYE_ALGORITHM: Algorithm = {
  name: 'BULLSEYE ALGORITHM (TARGET CENTERING)',
  steps: [
    {
      description: 'Use the color sensor to detect the color directly beneath the robot.',
      highlightParts: ['color-sensor-1'],
    },
    {
      description: 'Drive straight in any direction until the color sensor detects BLUE at the wall.',
      highlightParts: ['wheel-1', 'wheel-2', 'color-sensor-1'],
    },
    {
      description: 'Stop and turn 180°.',
      highlightParts: ['wheel-1', 'wheel-2', 'motor-driver-1'],
    },
    {
      description: 'Drive straight toward the opposite side until BLUE is detected again.',
      highlightParts: ['wheel-1', 'wheel-2', 'color-sensor-1'],
    },
    {
      description: 'Use the Arduino millis() function to measure the total travel time T.',
      highlightParts: ['arduino-1'],
    },
    {
      description: 'Compute half-time = T / 2.',
      highlightParts: ['arduino-1'],
    },
    {
      description: 'Turn 180° to face back toward the center.',
      highlightParts: ['wheel-1', 'wheel-2', 'motor-driver-1'],
    },
    {
      description: 'Drive forward for exactly T / 2 using millis() timing.',
      highlightParts: ['wheel-1', 'wheel-2', 'arduino-1'],
    },
    {
      description: 'Stop. The robot is now centered along this axis.',
      highlightParts: ['wheel-1', 'wheel-2'],
    },
    {
      description: 'Turn 90° to align with the perpendicular axis.',
      highlightParts: ['wheel-1', 'wheel-2', 'motor-driver-1'],
    },
    {
      description: 'Move forward until: The color sensor detects BLACK, or the same edge-to-edge timing method is repeated.',
      highlightParts: ['wheel-1', 'wheel-2', 'color-sensor-1', 'arduino-1'],
    },
    {
      description: 'Once BLACK is detected, the robot is at the center.',
      highlightParts: ['color-sensor-1'],
    },
    {
      description: 'Shoot or launch the ball to score.',
      highlightParts: ['arduino-1'],
    },
  ],
};

const RED_TRACK_ALGORITHM: Algorithm = {
  name: 'RED TRACK ALGORITHM (OBSTACLES + BOX HANDLING)',
  steps: [
    {
      description: 'Follow the red line using the color sensor.',
      highlightParts: ['color-sensor-1', 'wheel-1', 'wheel-2'],
    },
    {
      description: 'Continuously measure distance ahead using the ultrasonic sensor.',
      highlightParts: ['ultrasonic-sensor-1'],
    },
    {
      description: 'If an obstacle is detected within the threshold distance: Stop forward motion.',
      highlightParts: ['ultrasonic-sensor-1', 'arduino-1', 'wheel-1', 'wheel-2'],
    },
    {
      description: 'Turn approximately 90°.',
      highlightParts: ['wheel-1', 'wheel-2', 'motor-driver-1'],
    },
    {
      description: 'Drive in a curved path to go around the obstacle.',
      highlightParts: ['wheel-1', 'wheel-2', 'motor-driver-1'],
    },
    {
      description: 'Re-align with the red line and resume line following.',
      highlightParts: ['color-sensor-1', 'wheel-1', 'wheel-2'],
    },
    {
      description: 'If no obstacle is detected, continue line following normally.',
      highlightParts: ['color-sensor-1', 'wheel-1', 'wheel-2'],
    },
    {
      description: 'While on the red track: Use a custom-built arm made from 3D printed parts.',
      highlightParts: ['arduino-1'],
    },
    {
      description: 'The arm hooks and unhooks boxes.',
      highlightParts: ['arduino-1'],
    },
    {
      description: 'Boxes are transported and dropped into the blue box area as required.',
      highlightParts: ['wheel-1', 'wheel-2', 'arduino-1'],
    },
    {
      description: 'Repeat until the end of the red track is reached.',
      highlightParts: ['color-sensor-1', 'ultrasonic-sensor-1', 'wheel-1', 'wheel-2', 'arduino-1'],
    },
  ],
};

export default function RightSidebar() {
  const [activeSection, setActiveSection] = useState<Section>('none');
  const [stepIndex, setStepIndex] = useState(0);
  const [selectedAlgorithm, setSelectedAlgorithm] = useState<'bullseye' | 'redtrack' | null>(null);
  const [algorithmStepIndex, setAlgorithmStepIndex] = useState(0);

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
      if (section === 'algorithms' && activeSection !== 'algorithms') {
        // Reset algorithm state when opening
        setSelectedAlgorithm(null);
        setAlgorithmStepIndex(0);
      } else if (section === 'algorithms' && activeSection === 'algorithms') {
        // Closing algorithms section - clear highlights
        clearHighlights();
        selectPart(null);
      }
      setActiveSection(activeSection === section ? 'none' : section);
    }
  };

  const startAlgorithmWalkthrough = (algorithm: 'bullseye' | 'redtrack') => {
    setSelectedAlgorithm(algorithm);
    setAlgorithmStepIndex(0);
  };

  const goBackToAlgorithmList = () => {
    setSelectedAlgorithm(null);
    setAlgorithmStepIndex(0);
    clearHighlights();
    selectPart(null);
  };

  const goToPreviousAlgorithmStep = () => {
    setAlgorithmStepIndex((current) => Math.max(current - 1, 0));
  };

  const goToNextAlgorithmStep = () => {
    const currentAlgorithm = selectedAlgorithm === 'bullseye' ? BULLSEYE_ALGORITHM : RED_TRACK_ALGORITHM;
    if (algorithmStepIndex >= currentAlgorithm.steps.length - 1) {
      // Finished all steps, go back to algorithm list
      goBackToAlgorithmList();
    } else {
      setAlgorithmStepIndex((current) => current + 1);
    }
  };

  // Highlight parts when algorithm step changes
  useEffect(() => {
    if (activeSection !== 'algorithms' || !selectedAlgorithm) return;

    const currentAlgorithm = selectedAlgorithm === 'bullseye' ? BULLSEYE_ALGORITHM : RED_TRACK_ALGORITHM;
    const currentStep = currentAlgorithm.steps[algorithmStepIndex];

    if (currentStep && currentStep.highlightParts.length > 0) {
      highlightParts(currentStep.highlightParts);
    } else {
      clearHighlights();
    }
    selectPart(null);
  }, [activeSection, selectedAlgorithm, algorithmStepIndex, highlightParts, clearHighlights, selectPart]);

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

              {/* Custom Sound Recorder */}
              <div>
                <CustomSoundRecorder />
              </div>

              {/* Status */}
              <div className="text-center">
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
            <div className="px-3 pb-3">
              {!selectedAlgorithm ? (
                // Algorithm selection screen
                <div className="space-y-2">
                  <div className="text-[10px] text-gray-400 uppercase tracking-wide mb-2">
                    Select an algorithm to start walkthrough
                  </div>
                  <button
                    onClick={() => startAlgorithmWalkthrough('bullseye')}
                    className="w-full text-left px-3 py-2.5 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
                  >
                    <div className="text-xs font-semibold text-blue-700">Bullseye Algorithm</div>
                    <div className="text-[10px] text-blue-600 mt-0.5">Target Centering</div>
                  </button>
                  <button
                    onClick={() => startAlgorithmWalkthrough('redtrack')}
                    className="w-full text-left px-3 py-2.5 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors"
                  >
                    <div className="text-xs font-semibold text-red-700">Red Track Algorithm</div>
                    <div className="text-[10px] text-red-600 mt-0.5">Obstacles + Box Handling</div>
                  </button>
                </div>
              ) : (
                // Algorithm walkthrough screen
                (() => {
                  const currentAlgorithm = selectedAlgorithm === 'bullseye' ? BULLSEYE_ALGORITHM : RED_TRACK_ALGORITHM;
                  const currentStep = currentAlgorithm.steps[algorithmStepIndex];
                  const totalSteps = currentAlgorithm.steps.length;

                  return (
                    <div>
                      {/* Header */}
                      <div className="mb-3">
                        <button
                          onClick={goBackToAlgorithmList}
                          className="text-[10px] text-gray-500 hover:text-gray-700 flex items-center gap-1 mb-2"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-3 w-3"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                          </svg>
                          Back to algorithms
                        </button>
                        <div className="text-[10px] text-gray-400 uppercase tracking-wide">
                          Step {algorithmStepIndex + 1} of {totalSteps}
                        </div>
                        <h3 className={`text-sm font-semibold ${selectedAlgorithm === 'bullseye' ? 'text-blue-700' : 'text-red-700'}`}>
                          {currentAlgorithm.name}
                        </h3>
                      </div>

                      {/* Current Step */}
                      <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 mb-3 min-h-[120px]">
                        <p className="text-xs text-gray-700 leading-relaxed">
                          {currentStep.description}
                        </p>
                        {currentStep.highlightParts.length > 0 && (
                          <div className="mt-3 pt-3 border-t border-gray-200">
                            <div className="text-[9px] text-gray-400 uppercase tracking-wide mb-1.5">
                              Highlighted Parts
                            </div>
                            <div className="flex flex-wrap gap-1">
                              {currentStep.highlightParts.map((partId) => (
                                <span
                                  key={partId}
                                  className="text-[9px] px-1.5 py-0.5 bg-purple-100 text-purple-700 rounded"
                                >
                                  {partId}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Navigation */}
                      <div className="flex items-center justify-between">
                        <button
                          onClick={goToPreviousAlgorithmStep}
                          disabled={algorithmStepIndex === 0}
                          className="text-[10px] px-2 py-1 rounded border border-gray-200 text-gray-500 hover:text-gray-700 disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          Previous
                        </button>
                        <div className="text-[9px] text-gray-400">
                          {algorithmStepIndex + 1} / {totalSteps}
                        </div>
                        <button
                          onClick={goToNextAlgorithmStep}
                          className={`text-[10px] px-2 py-1 rounded transition-colors text-white ${
                            selectedAlgorithm === 'bullseye'
                              ? 'bg-blue-600 hover:bg-blue-500'
                              : 'bg-red-600 hover:bg-red-500'
                          }`}
                        >
                          {algorithmStepIndex >= totalSteps - 1 ? 'Finish' : 'Next'}
                        </button>
                      </div>
                    </div>
                  );
                })()
              )}
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
