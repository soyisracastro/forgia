import { WodSection } from '@/types/wod';

interface WodSectionCardProps {
  section: WodSection;
  icon: React.ReactNode;
}

const WodSectionCard: React.FC<WodSectionCardProps> = ({ section, icon }) => {
  return (
    <div className="bg-neutral-100 dark:bg-neutral-800/50 rounded-lg p-6 border border-neutral-200 dark:border-neutral-700/60 transition-colors duration-200 hover:bg-neutral-200/60 dark:hover:bg-neutral-800">
      <div className="flex items-center mb-4">
        <div className="text-red-500 mr-4">{icon}</div>
        <div>
          <h3 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">{section.title}</h3>
          {section.duration && <p className="text-sm text-neutral-500 dark:text-neutral-400">{section.duration}</p>}
          {section.type && <p className="text-sm font-semibold text-neutral-600 dark:text-neutral-300">{section.type}</p>}
        </div>
      </div>

      {section.description && <p className="mb-4 text-neutral-600 dark:text-neutral-300">{section.description}</p>}

      <ul className="space-y-3 list-none">
        {(section.parts || section.details || section.movements)?.map((item, index) => (
          <li key={index} className="flex items-start">
            <span className="flex-shrink-0 w-1.5 h-1.5 bg-neutral-400 dark:bg-neutral-500 rounded-full mr-3 mt-[7px]"></span>
            <span className="text-neutral-700 dark:text-neutral-200">{item}</span>
          </li>
        ))}
      </ul>

      {section.notes && <p className="mt-4 text-sm text-neutral-500 dark:text-neutral-400 border-t border-neutral-200 dark:border-neutral-700 pt-3"><strong>Notas:</strong> {section.notes}</p>}
    </div>
  );
};

export default WodSectionCard;
