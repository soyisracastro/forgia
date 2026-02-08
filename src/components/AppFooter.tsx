import Link from 'next/link';

export default function AppFooter() {
  return (
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
  );
}
