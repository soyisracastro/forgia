'use client';

import type { Level, Location, Equipment } from '@/types/wod';
import SegmentedButton from '@/components/ui/SegmentedButton';

interface WodControlsProps {
  location: Location;
  setLocation: (location: Location) => void;
  equipment: Equipment;
  setEquipment: (equipment: Equipment) => void;
  level: Level;
  setLevel: (level: Level) => void;
  injury: string;
  setInjury: (injury: string) => void;
  onGenerate: () => void;
  disabled: boolean;
}

const DiceIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><path d="M8 8h.01"/><path d="M16 8h.01"/><path d="M8 16h.01"/><path d="M16 16h.01"/><path d="M12 12h.01"/></svg>
);

const WodControls: React.FC<WodControlsProps> = ({
  location, setLocation,
  equipment, setEquipment,
  level, setLevel,
  injury, setInjury,
  onGenerate,
  disabled
}) => {
  return (
    <div className="mb-8 p-6 bg-neutral-100 dark:bg-neutral-800/50 rounded-lg border border-neutral-200 dark:border-neutral-700/60 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
        <div>
          <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
            Ubicaci&oacute;n
          </label>
          <SegmentedButton
            options={['Box', 'Casa']}
            selected={location}
            onSelect={(v) => setLocation(v as Location)}
            disabled={disabled}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
            Equipamiento
          </label>
          <SegmentedButton
            options={['Completo', 'Peso Corporal']}
            selected={equipment}
            onSelect={(v) => setEquipment(v as Equipment)}
            disabled={disabled}
          />
        </div>
      </div>

      <div>
          <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
            Nivel de Entrenamiento
          </label>
          <SegmentedButton
            options={['Principiante', 'Intermedio', 'Avanzado']}
            selected={level}
            onSelect={(v) => setLevel(v as Level)}
            disabled={disabled}
          />
      </div>

      <div>
        <label htmlFor="injury-input" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
          Lesiones o Limitaciones (Opcional)
        </label>
        <textarea
          id="injury-input"
          value={injury}
          onChange={(e) => setInjury(e.target.value)}
          disabled={disabled}
          placeholder="Ej: Dolor en hombro derecho, evitar saltos..."
          className="w-full px-3 py-2 bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-lg focus:ring-red-500 focus:border-red-500 transition duration-150 ease-in-out sm:text-sm disabled:opacity-50"
          rows={2}
        />
      </div>

      <div className="pt-4 border-t border-neutral-200 dark:border-neutral-700/60">
        <button
          onClick={onGenerate}
          disabled={disabled}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-base font-semibold text-white bg-red-500 rounded-lg hover:bg-red-600 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:bg-red-400 dark:focus:ring-offset-neutral-900"
        >
          <DiceIcon className="h-5 w-5" />
          Generar y Aplicar Cambios
        </button>
      </div>
    </div>
  );
};

export default WodControls;
