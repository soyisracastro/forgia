import type { Wod, WodSection } from '@/types/wod';

const sectionEmojis = {
  warmUp: '🔥',
  strengthSkill: '🏋️',
  metcon: '⚡',
  coolDown: '💚',
};

function getItems(section: WodSection): string[] {
  return section.movements || section.parts || section.details || [];
}

function formatSection(
  section: WodSection,
  type: keyof typeof sectionEmojis
): string {
  const emoji = sectionEmojis[type];
  const lines: string[] = [];

  // Header: emoji + title + optional duration
  let header = `${emoji} ${section.title.toUpperCase()}`;
  if (section.duration) header += ` (${section.duration})`;
  lines.push(header);

  // Type (e.g. "AMRAP 15", "For Time")
  if (section.type) {
    lines.push(section.type);
  }

  // Description
  if (section.description) {
    lines.push(section.description);
  }

  // Items: numbered for metcon, dashes for the rest
  const items = getItems(section);
  const isMetcon = type === 'metcon';
  for (let i = 0; i < items.length; i++) {
    lines.push(isMetcon ? `${i + 1}. ${items[i]}` : `- ${items[i]}`);
  }

  // Notes
  if (section.notes) {
    lines.push(`📝 Notas: ${section.notes}`);
  }

  return lines.join('\n');
}

export function formatWodAsText(wod: Wod): string {
  const parts: string[] = [
    `💪 ${wod.title.toUpperCase()}`,
    '━━━━━━━━━━━━━━━━',
    '',
    formatSection(wod.warmUp, 'warmUp'),
    '',
    formatSection(wod.strengthSkill, 'strengthSkill'),
    '',
    formatSection(wod.metcon, 'metcon'),
    '',
    formatSection(wod.coolDown, 'coolDown'),
  ];

  return parts.join('\n');
}
