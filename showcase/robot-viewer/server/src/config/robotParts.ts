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
    relatedTo: ['wheel-2', 'plate-1'],
    functionalRole: 'Provides locomotion and movement when rotating'
  },
  'wheel-2': {
    category: 'motion',
    keywords: ['wheel', 'drive', 'motion', 'movement', 'rotation', 'roll', 'locomotion', 'mobility'],
    description: 'Rear/left wheel - primary motion component for robot movement',
    relatedTo: ['wheel-1', 'plate-1'],
    functionalRole: 'Provides locomotion and movement when rotating'
  },
  'plate-1': {
    category: 'structure',
    keywords: ['plate', 'base', 'structure', 'chassis', 'frame', 'support', 'platform', 'foundation'],
    description: 'Base plate - structural foundation that supports and connects all moving parts',
    relatedTo: ['wheel-1', 'wheel-2'],
    functionalRole: 'Supports wheels and provides structural foundation for movement'
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
