import type { WodSection } from '@/types/wod';

type SectionType = 'warmUp' | 'strengthSkill' | 'metcon' | 'coolDown';

interface WodSectionCardProps {
  section: WodSection;
  icon: React.ReactNode;
  sectionType: SectionType;
  animationDelay?: string;
}

const borderColorMap: Record<SectionType, string> = {
  warmUp: 'border-l-amber-400/70 dark:border-l-amber-500/40',
  strengthSkill: 'border-l-blue-400/70 dark:border-l-blue-500/40',
  metcon: 'border-l-red-500 dark:border-l-red-500/80',
  coolDown: 'border-l-emerald-400/70 dark:border-l-emerald-500/40',
};

const iconColorMap: Record<SectionType, string> = {
  warmUp: 'text-amber-500',
  strengthSkill: 'text-blue-500',
  metcon: 'text-red-500',
  coolDown: 'text-emerald-500',
};

const bulletColorMap: Record<SectionType, string> = {
  warmUp: 'bg-amber-400/60 dark:bg-amber-500/40',
  strengthSkill: 'bg-blue-400/60 dark:bg-blue-500/40',
  metcon: 'bg-red-500/60 dark:bg-red-500/40',
  coolDown: 'bg-emerald-400/60 dark:bg-emerald-500/40',
};

const WodSectionCard: React.FC<WodSectionCardProps> = ({ section, icon, sectionType, animationDelay }) => {
  const isMetcon = sectionType === 'metcon';
  const items = section.movements || section.parts || section.details || [];

  const cardBg = isMetcon
    ? 'bg-neutral-50 dark:bg-neutral-800/70 shadow-sm'
    : 'bg-neutral-100 dark:bg-neutral-800/50';

  const titleSize = isMetcon ? 'text-xl font-bold' : 'text-lg font-bold tracking-tight';

  return (
    <div
      className={`print-card ${cardBg} rounded-lg p-5 lg:p-6 border border-neutral-200 dark:border-neutral-700/60 border-l-4 ${borderColorMap[sectionType]} overflow-hidden animate-fade-in-up`}
      style={animationDelay ? { animationDelay } : undefined}
    >
      {/* Header */}
      <div className="flex items-center pb-3 mb-3 border-b border-neutral-200/60 dark:border-neutral-700/40">
        <div className={`${iconColorMap[sectionType]} mr-3 shrink-0`}>{icon}</div>
        <div className="min-w-0">
          <h3 className={`${titleSize} text-neutral-900 dark:text-neutral-100`}>{section.title}</h3>
          <div className="flex items-center gap-2 mt-0.5">
            {section.duration && (
              <span className="inline-block bg-neutral-200 dark:bg-neutral-700/60 px-2 py-0.5 rounded-full text-xs font-medium text-neutral-600 dark:text-neutral-300">
                {section.duration}
              </span>
            )}
            {section.type && (
              <span className="text-sm font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
                {section.type}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Description */}
      {section.description && (
        <p className="mb-4 text-[15px] leading-relaxed text-neutral-600 dark:text-neutral-300">{section.description}</p>
      )}

      {/* Items list */}
      {items.length > 0 && (
        <ul className="space-y-3">
          {items.map((item, index) => (
            <li key={index} className="flex items-start">
              {isMetcon ? (
                <span className="shrink-0 w-6 text-sm font-bold text-red-500/80 dark:text-red-400/80">
                  {index + 1}.
                </span>
              ) : (
                <span className={`shrink-0 w-2 h-2 ${bulletColorMap[sectionType]} rounded-full mr-3 mt-1.75`} />
              )}
              <span className="text-neutral-700 dark:text-neutral-200">{item}</span>
            </li>
          ))}
        </ul>
      )}

      {/* Notes */}
      {section.notes && (
        <p className="mt-4 text-sm italic text-neutral-500 dark:text-neutral-400 border-t border-neutral-200/60 dark:border-neutral-700/40 pt-3">
          <strong className={iconColorMap[sectionType]}>Notas:</strong> {section.notes}
        </p>
      )}
    </div>
  );
};

export default WodSectionCard;
