'use client';

interface SegmentedButtonProps {
  options: string[];
  selected: string;
  onSelect: (value: string) => void;
  disabled?: boolean;
}

export default function SegmentedButton({ options, selected, onSelect, disabled = false }: SegmentedButtonProps) {
  return (
    <div className="flex bg-neutral-200 dark:bg-neutral-800 rounded-lg p-1 space-x-1">
      {options.map((option) => (
        <button
          key={option}
          onClick={() => onSelect(option)}
          disabled={disabled}
          className={`w-full px-3 py-1.5 text-sm font-semibold rounded-md transition-colors duration-200 focus:outline-none disabled:opacity-50
            ${selected === option
              ? 'bg-white dark:bg-neutral-700 text-red-500 shadow-sm'
              : 'text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700/50'
            }`}
        >
          {option}
        </button>
      ))}
    </div>
  );
}
