import Link from 'next/link';
import ThemeToggle from '@/components/ThemeToggle';

const features = [
  {
    title: 'WODs con IA',
    description: 'Entrenamientos generados por inteligencia artificial, únicos cada día y adaptados a tu nivel.',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.98-3A2.5 2.5 0 0 1 9.5 2Z"/><path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3A2.5 2.5 0 0 0 14.5 2Z"/></svg>
    ),
  },
  {
    title: 'Personalizado',
    description: 'Adapta cada entrenamiento a tu equipamiento, ubicación y lesiones o limitaciones.',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>
    ),
  },
  {
    title: 'Trackea tu Progreso',
    description: 'Guarda tus entrenamientos y revisa tu historial para medir tu avance semana a semana.',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
    ),
  },
  {
    title: 'Estructura Completa',
    description: 'Calentamiento, fuerza, metcon y enfriamiento. Entrenamientos profesionales listos para ejecutar.',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="7" height="7" x="3" y="3" rx="1"/><rect width="7" height="7" x="14" y="3" rx="1"/><rect width="7" height="7" x="14" y="14" rx="1"/><rect width="7" height="7" x="3" y="14" rx="1"/></svg>
    ),
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="py-6">
        <div className="container mx-auto px-4 max-w-5xl flex justify-between items-center">
          <span className="text-xl font-semibold text-red-500">
            Forgia
          </span>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <Link
              href="/login"
              className="text-sm font-medium text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors"
            >
              Iniciar sesión
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="grow flex items-center">
        <div className="container mx-auto px-4 max-w-5xl py-16 md:py-24">
          <div className="max-w-2xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-neutral-900 dark:text-neutral-100 tracking-tight">
              Tu entrenador de CrossFit{' '}
              <span className="text-red-500">potenciado por IA</span>
            </h1>
            <p className="mt-6 text-lg text-neutral-600 dark:text-neutral-400 max-w-xl mx-auto">
              Genera WODs completos y personalizados en segundos. Calentamiento, fuerza, metcon y enfriamiento — todo adaptado a tu nivel y equipamiento.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/login"
                className="inline-flex items-center justify-center px-8 py-3 text-base font-semibold text-white bg-red-500 rounded-lg hover:bg-red-600 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 dark:focus:ring-offset-neutral-900"
              >
                Comenzar
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center justify-center px-8 py-3 text-base font-semibold rounded-lg border border-neutral-300 dark:border-neutral-600 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors duration-200"
              >
                Ya tengo cuenta
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 md:py-24 border-t border-neutral-200 dark:border-neutral-800">
        <div className="container mx-auto px-4 max-w-5xl">
          <h2 className="text-2xl md:text-3xl font-bold text-center text-neutral-900 dark:text-neutral-100 mb-12">
            Todo lo que necesitas para entrenar
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="text-center p-6 rounded-xl border border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700 transition-colors"
              >
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-red-50 dark:bg-red-500/10 text-red-500 mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="text-center py-6 text-neutral-500 text-sm border-t border-neutral-200 dark:border-neutral-800">
        <p>Impulsado por IA para superar tus límites.</p>
        <div className="flex justify-center gap-4 my-2">
          <Link href="/privacidad" className="hover:text-neutral-700 dark:hover:text-neutral-300 transition-colors">
            Aviso de Privacidad
          </Link>
          <span>|</span>
          <Link href="/terminos" className="hover:text-neutral-700 dark:hover:text-neutral-300 transition-colors">
            Términos y Condiciones
          </Link>
        </div>
        <p>&copy; {new Date().getFullYear()} Forgia. Todos los derechos reservados.</p>
      </footer>
    </div>
  );
}
