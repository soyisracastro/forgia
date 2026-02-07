import type { WodSection } from '@/types/wod';

type SectionType = 'warmUp' | 'strengthSkill' | 'metcon' | 'coolDown';

interface LiveSectionViewProps {
  section: WodSection;
  sectionType: SectionType;
}

const titleColorMap: Record<SectionType, string> = {
  warmUp: 'text-amber-400',
  strengthSkill: 'text-blue-400',
  metcon: 'text-red-400',
  coolDown: 'text-emerald-400',
};

const badgeBgMap: Record<SectionType, string> = {
  warmUp: 'bg-amber-500/20 text-amber-300',
  strengthSkill: 'bg-blue-500/20 text-blue-300',
  metcon: 'bg-red-500/20 text-red-300',
  coolDown: 'bg-emerald-500/20 text-emerald-300',
};

const LiveSectionView: React.FC<LiveSectionViewProps> = ({ section, sectionType }) => {
  const items = section.movements || section.parts || section.details || [];

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Section title */}
      <h2 className={`text-lg font-bold text-center mb-3 ${titleColorMap[sectionType]}`}>
        {section.title}
      </h2>

      {/* Type badge for metcon */}
      {section.type && (
        <div className="flex justify-center mb-3">
          <span className={`px-3 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${badgeBgMap[sectionType]}`}>
            {section.type}
          </span>
        </div>
      )}

      {/* Description */}
      {section.description && (
        <p className="text-sm text-center text-neutral-400 mb-4">{section.description}</p>
      )}

      {/* Movements list */}
      {items.length > 0 && (
        <div className="max-h-[30vh] overflow-y-auto px-2 scrollbar-thin">
          <ul className="space-y-2">
            {items.map((item, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="shrink-0 w-6 text-right text-sm font-semibold text-neutral-500">
                  {i + 1}.
                </span>
                <span className="text-neutral-200 text-sm">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Notes */}
      {section.notes && (
        <p className="mt-4 text-xs italic text-neutral-500 text-center">
          {section.notes}
        </p>
      )}
    </div>
  );
};

export default LiveSectionView;
