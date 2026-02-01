import type { RobotPart, PartCategory } from '../types/index.js';

// Enhanced part metadata with relationships and functional descriptions
const partMetadata: Record<string, {
  category: PartCategory;
  keywords: string[];
  description: string;
  relatedTo: string[];
  functionalRole: string;
}> = {
  'wheel-1': {
    category: 'motion',
    keywords: ['wheel', 'drive', 'motion', 'movement', 'rotation', 'roll', 'locomotion', 'mobility'],
    description: 'Front/right wheel - primary motion component for robot movement',
    relatedTo: ['wheel-2', 'plate-1', 'motor-driver-1'],
    functionalRole: 'Provides locomotion and movement when rotating'
  },
  'wheel-2': {
    category: 'motion',
    keywords: ['wheel', 'drive', 'motion', 'movement', 'rotation', 'roll', 'locomotion', 'mobility'],
    description: 'Rear/left wheel - primary motion component for robot movement',
    relatedTo: ['wheel-1', 'plate-1', 'motor-driver-1'],
    functionalRole: 'Provides locomotion and movement when rotating'
  },
  'plate-1': {
    category: 'structure',
    keywords: ['plate', 'base', 'structure', 'chassis', 'frame', 'support', 'platform', 'foundation'],
    description: 'Base plate - structural foundation that supports and connects all moving parts',
    relatedTo: ['wheel-1', 'wheel-2', 'arduino-1', 'motor-driver-1', 'breadboard-1'],
    functionalRole: 'Supports wheels and provides structural foundation for movement'
  },
  'sensor-1': {
    category: 'sensors',
    keywords: ['infrared', 'ir', 'sensor', 'proximity', 'distance', 'detection', 'obstacle', 'detection'],
    description: 'Infrared proximity sensor #1 - detects obstacles and measures distance',
    relatedTo: ['sensor-2', 'arduino-1', 'breadboard-1'],
    functionalRole: 'Detects nearby objects and obstacles using infrared light reflection'
  },
  'sensor-2': {
    category: 'sensors',
    keywords: ['infrared', 'ir', 'sensor', 'proximity', 'distance', 'detection', 'obstacle', 'detection'],
    description: 'Infrared proximity sensor #2 - detects obstacles and measures distance',
    relatedTo: ['sensor-1', 'arduino-1', 'breadboard-1'],
    functionalRole: 'Detects nearby objects and obstacles using infrared light reflection'
  },
  'arduino-1': {
    category: 'control',
    keywords: ['arduino', 'microcontroller', 'brain', 'controller', 'processor', 'uno', 'main', 'cpu', 'computer'],
    description: 'Arduino Uno R3 - main microcontroller and brain of the robot',
    relatedTo: ['motor-driver-1', 'sensor-1', 'sensor-2', 'breadboard-1', 'battery-1'],
    functionalRole: 'Controls all robot functions, processes sensor data, and executes programs'
  },
  'motor-driver-1': {
    category: 'control',
    keywords: ['motor driver', 'h-bridge', 'l298n', 'power', 'controller', 'speed', 'direction'],
    description: 'L298N motor driver - controls motor speed and direction',
    relatedTo: ['wheel-1', 'wheel-2', 'arduino-1', 'battery-2'],
    functionalRole: 'Amplifies Arduino signals to drive motors with variable speed and direction'
  },
  'breadboard-1': {
    category: 'structure',
    keywords: ['breadboard', 'prototyping', 'wiring', 'connections', 'circuit', 'electronics'],
    description: '400-pin breadboard - solderless prototyping board for circuit connections',
    relatedTo: ['arduino-1', 'sensor-1', 'sensor-2', 'plate-1'],
    functionalRole: 'Provides temporary electrical connections between components without soldering'
  },
  'battery-1': {
    category: 'power',
    keywords: ['battery', 'power', 'energy', '9v', 'voltage', 'supply', 'electricity', 'main'],
    description: '9V battery #1 - primary power source for Arduino and logic circuits',
    relatedTo: ['battery-2', 'arduino-1'],
    functionalRole: 'Supplies power to the Arduino microcontroller and sensors'
  },
  'battery-2': {
    category: 'power',
    keywords: ['battery', 'power', 'energy', '9v', 'voltage', 'supply', 'electricity', 'motor'],
    description: '9V battery #2 - secondary power source for motors and high-current components',
    relatedTo: ['battery-1', 'motor-driver-1'],
    functionalRole: 'Supplies power to the motor driver and motors for movement'
  }
};

function formatName(id: string): string {
  return id
    .replace(/_SOLIDS_\d+$/, '')
    .replace(/_p$/, '')
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

// All mesh names from the UTRA robot model
const meshNames = [
  'wheel-1',
  'wheel-2',
  'plate-1',
  'sensor-1',
  'sensor-2',
  'arduino-1',
  'motor-driver-1',
  'breadboard-1',
  'battery-1',
  'battery-2',
];

export const robotParts: RobotPart[] = meshNames.map((id) => {
  const metadata = partMetadata[id] || {
    category: 'structure' as PartCategory,
    keywords: ['part'],
    description: `UTRA Robot part: ${formatName(id)}`,
    relatedTo: [],
    functionalRole: 'Unknown part'
  };
  return {
    id,
    name: formatName(id),
    description: metadata.description,
    keywords: [id, ...metadata.keywords],
    category: metadata.category,
    relatedTo: metadata.relatedTo,
    functionalRole: metadata.functionalRole
  };
});

export function getPartById(id: string): RobotPart | undefined {
  return robotParts.find((p) => p.id === id);
}

export function getPartsByCategory(category: PartCategory): RobotPart[] {
  return robotParts.filter((p) => p.category === category);
}

export function getAllPartIds(): string[] {
  return robotParts.map((p) => p.id);
}

export function getPartsListForAI(): string {
  return robotParts
    .map(
      (p) =>
        `- ID: "${p.id}" | Name: ${p.name} | Category: ${p.category}
  Description: ${p.description}
  Function: ${p.functionalRole}
  Related Parts: ${p.relatedTo?.join(', ') || 'none'}
  Keywords: ${p.keywords.join(', ')}`
    )
    .join('\n\n');
}
