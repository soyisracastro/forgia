import type { WodSection } from '@/types/wod';

type SectionType = 'warmUp' | 'strengthSkill' | 'metcon' | 'coolDown';

interface WodSectionCardProps {
  section: WodSection;
  sectionType: SectionType;
  animationDelay?: string;
}

const accentColorMap: Record<SectionType, string> = {
  warmUp: 'bg-amber-400',
  strengthSkill: 'bg-blue-400',
  metcon: 'bg-red-500',
  coolDown: 'bg-emerald-400',
};

const iconColorMap: Record<SectionType, string> = {
  warmUp: 'text-amber-500 dark:text-amber-400',
  strengthSkill: 'text-blue-500 dark:text-blue-400',
  metcon: 'text-red-500',
  coolDown: 'text-emerald-500 dark:text-emerald-400',
};

const iconBgMap: Record<SectionType, string> = {
  warmUp: 'bg-amber-500/10 text-amber-500 dark:text-amber-400',
  strengthSkill: 'bg-blue-500/10 text-blue-500 dark:text-blue-400',
  metcon: 'bg-red-500/15 text-red-500',
  coolDown: 'bg-emerald-500/10 text-emerald-500 dark:text-emerald-400',
};

const bulletColorMap: Record<SectionType, string> = {
  warmUp: 'bg-amber-400',
  strengthSkill: 'bg-blue-400',
  metcon: 'bg-red-500',
  coolDown: 'bg-emerald-400',
};

const subtitleMap: Record<SectionType, string> = {
  warmUp: 'Activación',
  strengthSkill: 'Potencia',
  metcon: 'High Intensity',
  coolDown: 'Recuperación',
};

// --- Internal SVG Icons ---

const SectionIcon: React.FC<{ sectionType: SectionType }> = ({ sectionType }) => {
  const cls = 'h-5 w-5';
  switch (sectionType) {
    case 'warmUp':
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
        </svg>
      );
    case 'strengthSkill':
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="m6.5 6.5 11 11" /><path d="m21 21-1-1" /><path d="m3 3 1 1" /><path d="m18 22 4-4" /><path d="m2 6 4-4" /><path d="m3 10 7-7" /><path d="m14 21 7-7" />
        </svg>
      );
    case 'metcon':
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
        </svg>
      );
    case 'coolDown':
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
        </svg>
      );
  }
};

const ClockIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
  </svg>
);

const WarningIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" /><path d="M12 9v4" /><path d="M12 17h.01" />
  </svg>
);

// --- Helper Render Functions ---

function renderMetconItems(items: string[]) {
  return (
    <div className="space-y-0 mt-3">
      {items.map((item, index) => {
        // Try to split "15 Wall Balls (9/6 kg)" into reps and movement
        const match = item.match(/^(\d+[\s\w]*?)\s+(.+)$/);
        return (
          <div
            key={index}
            className="flex items-center gap-3 py-3 border-b border-neutral-200/40 dark:border-neutral-700/30 last:border-b-0"
          >
            {match && (
              <span className="text-sm font-bold text-red-500 shrink-0 w-12 text-right">
                {match[1].trim()}
              </span>
            )}
            <span className="text-sm font-medium text-neutral-700 dark:text-neutral-200">
              {match ? match[2] : item}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function renderBulletItems(items: string[], sectionType: SectionType) {
  return (
    <ul className="space-y-2.5 mt-3">
      {items.map((item, index) => (
        <li key={index} className="flex items-start">
          <span className={`shrink-0 w-1.5 h-1.5 ${bulletColorMap[sectionType]} rounded-full mr-3 mt-2`} />
          <span className="text-sm text-neutral-600 dark:text-neutral-300">{item}</span>
        </li>
      ))}
    </ul>
  );
}

function renderStrategyTip(notes: string, label?: string) {
  return (
    <div className="mt-4 flex items-start gap-2.5 p-3 bg-amber-500/5 dark:bg-amber-500/10 rounded-lg border border-amber-500/20">
      <WarningIcon className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
      <div>
        <p className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 mb-0.5">
          {label || 'Estrategia'}
        </p>
        <p className="text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed">{notes}</p>
      </div>
    </div>
  );
}

// --- Main Component ---

const WodSectionCard: React.FC<WodSectionCardProps> = ({ section, sectionType, animationDelay }) => {
  const isMetcon = sectionType === 'metcon';
  const items = section.movements || section.parts || section.details || [];

  const cardBg = isMetcon
    ? 'bg-neutral-50 dark:bg-neutral-800/80 border-red-500/20 dark:border-red-500/10 shadow-sm'
    : 'bg-white dark:bg-neutral-800/50 border-neutral-200 dark:border-neutral-700/60';

  return (
    <div
      className={`print-card relative rounded-xl overflow-hidden border ${cardBg} animate-fade-in-up`}
      style={animationDelay ? { animationDelay } : undefined}
    >
      {/* Left accent bar */}
      <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${accentColorMap[sectionType]} rounded-l-xl`} />

      {/* Metcon gradient overlay */}
      {isMetcon && (
        <div className="absolute inset-0 bg-linear-to-br from-red-500/5 to-transparent pointer-events-none" />
      )}

      <div className="relative pl-5 pr-5 py-5">
        {/* Header row */}
        <div className="flex items-start justify-between mb-3">
          <div className="min-w-0 flex-1">
            <p className={`text-xs font-bold uppercase tracking-widest mb-1 ${iconColorMap[sectionType]}`}>
              {subtitleMap[sectionType]}
            </p>
            <h3 className={`${isMetcon ? 'text-xl' : 'text-lg'} font-bold text-neutral-900 dark:text-neutral-100`}>
              {section.title}
            </h3>
            {/* Duration + type badges */}
            <div className="flex items-center gap-2 mt-1.5">
              {section.duration && (
                <span className="inline-flex items-center gap-1 text-xs font-medium text-neutral-500 dark:text-neutral-400">
                  <ClockIcon className="h-3.5 w-3.5" />
                  {section.duration}
                </span>
              )}
              {section.type && (
                <span className={`inline-block px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wide ${
                  isMetcon
                    ? 'bg-red-500/15 text-red-500'
                    : 'bg-neutral-200 dark:bg-neutral-700/60 text-neutral-600 dark:text-neutral-300'
                }`}>
                  {section.type}
                </span>
              )}
            </div>
          </div>
          {/* Circular icon */}
          <div className={`shrink-0 ml-3 w-10 h-10 rounded-full flex items-center justify-center ${iconBgMap[sectionType]}`}>
            <SectionIcon sectionType={sectionType} />
          </div>
        </div>

        {/* Description */}
        {section.description && (
          <p className="mb-3 text-sm leading-relaxed text-neutral-600 dark:text-neutral-300">
            {section.description}
          </p>
        )}

        {/* Items list */}
        {items.length > 0 && (
          isMetcon ? renderMetconItems(items) : renderBulletItems(items, sectionType)
        )}

        {/* Metcon: strategy tip from notes */}
        {isMetcon && section.notes && renderStrategyTip(section.notes, section.notesLabel)}

        {/* Non-metcon: regular notes */}
        {!isMetcon && section.notes && (
          <p className="mt-4 text-sm italic text-neutral-500 dark:text-neutral-400 border-t border-neutral-200/60 dark:border-neutral-700/40 pt-3">
            <strong className={iconColorMap[sectionType]}>Notas:</strong> {section.notes}
          </p>
        )}
      </div>
    </div>
  );
};

export default WodSectionCard;
