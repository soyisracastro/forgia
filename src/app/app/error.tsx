'use client';

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 px-4 text-center">
      <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">
        Algo salió mal
      </h2>
      <p className="text-neutral-500 dark:text-neutral-400 max-w-md">
        Ocurrió un error inesperado. Intenta recargar la página.
      </p>
      <button
        onClick={reset}
        className="px-6 py-2.5 text-sm font-semibold text-white bg-red-500 rounded-xl hover:bg-red-600 transition-colors"
      >
        Intentar de nuevo
      </button>
    </div>
  );
}
