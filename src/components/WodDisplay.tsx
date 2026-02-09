import { Wod } from '@/types/wod';
import WodSectionCard from './WodSectionCard';

const CalendarIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" x2="16" y1="2" y2="6" /><line x1="8" x2="8" y1="2" y2="6" /><line x1="3" x2="21" y1="10" y2="10" />
  </svg>
);

interface WodDisplayProps {
  wod: Wod;
}

const WodDisplay: React.FC<WodDisplayProps> = ({ wod }) => {
  const dateStr = new Intl.DateTimeFormat('es-ES', { dateStyle: 'long' }).format(new Date());

  return (
    <div className="space-y-6">
      {/* Title + Date */}
      <div className="animate-fade-in-up">
        <h2 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100 tracking-tight">
          {wod.title}
        </h2>
        <div className="flex items-center gap-2 mt-2 text-sm text-neutral-500 dark:text-neutral-400">
          <CalendarIcon />
          <span className="capitalize">{dateStr}</span>
        </div>
      </div>

      {/* Section cards — single column */}
      <div className="space-y-4">
        <WodSectionCard section={wod.warmUp} sectionType="warmUp" animationDelay="0ms" />
        <WodSectionCard section={wod.strengthSkill} sectionType="strengthSkill" animationDelay="75ms" />
        <WodSectionCard section={wod.metcon} sectionType="metcon" animationDelay="150ms" />
        <WodSectionCard section={wod.coolDown} sectionType="coolDown" animationDelay="225ms" />
      </div>
    </div>
  );
};

export default WodDisplay;
