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
      <div className="relative z-10 p-6 max-h-80 overflow-y-auto no-scrollbar">
        <div className="flex flex-col gap-4">
          {/* Movements list with dot indicators */}
          {items.map((item, i) => (
            <div key={i}>
              <div className="flex items-center gap-4">
                <div className={`size-2 rounded-full shrink-0 ${i === 0 ? 'bg-red-500/80' : 'bg-white/20'}`} />
                <span className="text-white text-xs font-medium">{item}</span>
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
        <div className="relative z-10 px-6 pt-3 pb-6 border-t border-white/5">
          <div className="text-amber-400/80 text-xs font-medium bg-amber-500/10 border border-amber-500/20 px-3 py-2 rounded-lg max-h-20 overflow-y-auto no-scrollbar">
            {section.notes}
          </div>
        </div>
      )}
    </div>
  );
};

export default LiveSectionView;
