import type { WodSection } from '@/types/wod';

interface LiveSectionViewProps {
  section: WodSection;
}

const LiveSectionView: React.FC<LiveSectionViewProps> = ({ section }) => {
  const items = section.movements || section.parts || section.details || [];

  return (
    <div className="w-full max-w-md mx-auto bg-neutral-900 rounded-3xl border border-white/5 shadow-2xl relative overflow-hidden">
      {/* Subtle background gradient */}
      <div className="absolute inset-0 bg-linear-to-br from-white/5 to-transparent pointer-events-none" />

      {/* Scrollable content area */}
      <div className="relative z-10 p-6">
        <div className="flex flex-col gap-4">
          {/* Movements list with dot indicators */}
          {items.map((item, i) => (
            <div key={i}>
              <div className="flex items-center gap-4">
                <div className={`size-2 rounded-full shrink-0 ${i === 0 ? 'bg-red-500/80' : 'bg-white/20'}`} />
                <span className="text-white text-base font-medium">{item}</span>
              </div>
              {i < items.length - 1 && (
                <div className="h-px w-full bg-white/5 mt-4" />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Notes / Scaling info */}
      {section.notes && (
        <div className="relative z-10 px-6 pb-4 flex justify-center">
          <span className="text-white/30 text-xs font-medium bg-white/5 px-3 py-2 rounded-lg">
            {section.notes}
          </span>
        </div>
      )}
    </div>
  );
};

export default LiveSectionView;
