'use client';

interface SegmentedButtonProps {
  options: string[];
  selected: string;
  onSelect: (value: string) => void;
  disabled?: boolean;
}

export default function SegmentedButton({ options, selected, onSelect, disabled = false }: SegmentedButtonProps) {
  return (
    <div className="flex bg-neutral-200 dark:bg-neutral-800 rounded-lg p-1 space-x-1 border border-neutral-300 dark:border-neutral-700">
      {options.map((option) => (
        <button
          key={option}
          onClick={() => onSelect(option)}
          disabled={disabled}
          className={`w-full px-3 py-1.5 text-sm font-semibold rounded-md transition-all duration-200 focus:outline-none disabled:opacity-50
            ${selected === option
              ? 'bg-red-500 text-white shadow-sm'
              : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
            }`}
        >
          {option}
        </button>
      ))}
    </div>
  );
}
