import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export default function BlogCTA() {
  return (
    <section className="my-12 rounded-2xl bg-gradient-to-r from-red-500 to-orange-500 p-8 md:p-10 text-center">
      <h3 className="text-2xl md:text-3xl font-bold text-white mb-3">
        Entrena con inteligencia
      </h3>
      <p className="text-white/90 mb-6 max-w-lg mx-auto">
        Forgia genera WODs personalizados usando tus records, tu nivel y tu
        equipo. Empieza gratis hoy.
      </p>
      <Link
        href="/login"
        className="inline-flex items-center justify-center px-8 py-3 text-base font-semibold text-red-600 bg-white rounded-full hover:bg-neutral-100 transition-all duration-300 shadow-xl hover:scale-105"
      >
        Comenzar Gratis
        <ArrowRight className="ml-2 w-5 h-5" />
      </Link>
    </section>
  );
}
