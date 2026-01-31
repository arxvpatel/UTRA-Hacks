import type { RobotPart, PartCategory } from '../types/index.js';

function categorizeByName(id: string): { category: PartCategory; keywords: string[] } {
  if (id.startsWith('technic_driver_')) return { category: 'control', keywords: ['driver', 'figure', 'pilot'] };
  if (id.startsWith('technic_shaft_')) return { category: 'motion', keywords: ['shaft', 'axle', 'drive'] };
  if (id.startsWith('technic_bump_')) return { category: 'structure', keywords: ['connector', 'support', 'bump'] };
  if (id.startsWith('technic_1_') || id.startsWith('technic_2_')) return { category: 'structure', keywords: ['connector', 'joint', 'technic'] };
  if (id.startsWith('tech_light_')) return { category: 'sensors', keywords: ['light', 'lamp', 'headlight'] };
  if (id.startsWith('prt_') || id.startsWith('x_prt_')) return { category: 'structure', keywords: ['panel', 'plate', 'trim'] };
  if (id.startsWith('body_')) return { category: 'structure', keywords: ['body', 'frame', 'chassis'] };
  return { category: 'structure', keywords: ['part'] };
}

function formatName(id: string): string {
  return id
    .replace(/_SOLIDS_\d+$/, '')
    .replace(/_p$/, '')
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

// All mesh names from the Buggy model
const meshNames = [
  'body_115', 'body_72', 'body_114', 'body_113', 'body_111', 'body_108', 'body_107',
  'body_109', 'body_106', 'body_104', 'body_102',
  'technic_driver_torso_p_SOLIDS_1', 'technic_driver_thigh_l_p_SOLIDS_1',
  'technic_driver_shin_p_SOLIDS_3', 'technic_driver_shin_p_SOLIDS_1',
  'technic_driver_hip_joint_p_SOLIDS_1', 'technic_driver_helmet_p_SOLIDS_1',
  'technic_driver_head_p_SOLIDS_1',
  'body_100', 'body_99', 'body_98', 'body_97',
  'technic_driver_arm_joint_p_SOLIDS_5', 'technic_driver_arm_joint_p_SOLIDS_1',
  'body_96', 'body_94', 'body_92', 'body_90', 'body_88', 'body_86', 'body_84', 'body_71',
  'technic_shaft_x6_SOLIDS_1',
  'body_82', 'body_81',
  'technic_shaft_x8_SOLIDS_1',
  'body_79', 'body_78', 'body_76',
  'technic_2_2_l_p_SOLIDS_3', 'technic_2_2_l_p_SOLIDS_1',
  'tech_light_p_SOLIDS_3', 'tech_light_p_SOLIDS_1',
  'x_prt_1_2_a_u_SOLIDS_3', 'x_prt_1_2_a_u_SOLIDS_1',
  'body_74', 'body_73',
  'technic_shaft_x8_SOLIDS_3', 'technic_shaft_x4_SOLIDS_4',
  'technic_shaft_x4_SOLIDS_1', 'technic_shaft_x10_SOLIDS_1',
  'body_70',
  'technic_bump_support_p_SOLIDS_1',
  'body_69', 'body_68',
  'technic_1_2_side_p_SOLIDS_3', 'technic_1_2_side_p_SOLIDS_1',
  'body_67',
  'technic_1_1_p_SOLIDS_5', 'technic_1_1_p_SOLIDS_1',
  'body_66', 'body_65', 'body_64', 'body_63',
  'prt_2_8_t_SOLIDS_4', 'prt_2_8_t_SOLIDS_1',
  'body_62', 'body_61', 'body_60', 'body_59',
  'prt_1_6_SOLIDS_3', 'prt_1_6_SOLIDS_1',
  'body_58', 'body_57', 'body_56', 'body_55', 'body_54',
  'prt_1_16_SOLIDS_3', 'prt_1_16_SOLIDS_1',
  'prt_1_12_SOLIDS_3', 'prt_1_12_SOLIDS_1',
  'body_53', 'body_52', 'body_51', 'body_49', 'body_47', 'body_45', 'body_43',
  'body_41', 'body_39', 'body_37', 'body_35', 'body_33', 'body_31', 'body_29',
  'body_27', 'body_25', 'body_23', 'body_21', 'body_19', 'body_17', 'body_15',
  'body_13', 'body_11', 'body_9', 'body_7', 'body_5', 'body_3', 'body_1',
];

export const robotParts: RobotPart[] = meshNames.map((id) => {
  const { category, keywords } = categorizeByName(id);
  return {
    id,
    name: formatName(id),
    description: `Buggy part: ${formatName(id)}`,
    keywords: [id, ...keywords],
    category,
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
        `- ID: "${p.id}" | Name: ${p.name} | Description: ${p.description} | Keywords: ${p.keywords.join(', ')}`
    )
    .join('\n');
}
