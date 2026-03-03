import Link from 'next/link';
import Image from 'next/image';
import { CalendarRange, Trophy, Flame, Dumbbell, ArrowRight } from 'lucide-react';
import ThemeToggle from '@/components/ThemeToggle';
import TestimonialCarousel from '@/components/TestimonialCarousel';

const features = [
  {
    title: 'Programas Mensuales',
    description: '4 semanas periodizadas por IA: base, volumen, intensidad y deload. Tu WOD diario tiene un plan detrás.',
    icon: <CalendarRange className="w-6 h-6" />,
  },
  {
    title: 'Records y Cargas Reales',
    description: 'Registra tus PRs y la IA prescribe pesos como porcentajes de tu 1RM. Sin adivinar, sin inventar.',
    icon: <Trophy className="w-6 h-6" />,
  },
  {
    title: 'Preparación HYROX',
    description: 'Objetivo específico que cambia tu programación: running comprometido, fatigue sandwiches y metcons largos.',
    icon: <Flame className="w-6 h-6" />,
  },
  {
    title: 'Biblioteca de Benchmarks',
    description: 'Fran, Murph, Grace y más. Hazlos, registra tu resultado y mide tu progreso cada vez que los repitas.',
    icon: <Dumbbell className="w-6 h-6" />,
  },
];

const testimonials = [
  {
    name: 'Dani S.',
    label: 'Atleta RX',
    quote: 'Nunca había progresado tanto en mis levantamientos. La IA realmente entiende cuándo empujarme.',
    avatar: '/assets/dani-s-avatar.png'
  },
  {
    name: 'Marcos T.',
    label: 'Atleta RX',
    quote: 'Los WODs personalizados cambiaron mi rutina. La variedad es increíble y el progreso es constante.',
    avatar: '/assets/marcos-t-avatar.png'
  },
  {
    name: 'Sofia L.',
    label: 'Atleta RX',
    quote: 'La mejor inversión para mi entrenamiento. La IA se adapta perfectamente a mi equipo disponible.',
    avatar: '/assets/sofia-l-avatar.png'
  }
];

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="py-6">
        <div className="container mx-auto px-4 max-w-5xl flex justify-between items-center">
          <span className="flex items-center gap-2 text-xl font-semibold text-red-500">
            <Image src="/apple-touch-icon.png" alt="" width={24} height={24} className="rounded-md" />
            Forgia
          </span>
          <div className="flex items-center gap-4">
            <Link
              href="/blog"
              className="text-sm font-medium text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors"
            >
              Blog
            </Link>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="grow flex items-center relative overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-linear-to-br from-red-50 via-white to-orange-50 dark:from-neutral-900 dark:via-neutral-900 dark:to-neutral-800 -z-10" />
        <div className="absolute top-20 right-10 w-72 h-72 bg-red-200/30 dark:bg-red-500/10 rounded-full blur-3xl -z-10" />
        <div className="absolute bottom-20 left-10 w-96 h-96 bg-orange-200/20 dark:bg-orange-500/5 rounded-full blur-3xl -z-10" />

        <div className="container mx-auto px-4 max-w-5xl py-16 md:py-24">
          <div className="max-w-3xl mx-auto text-center animate-fade-in-up">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-neutral-900 dark:text-neutral-100 tracking-tight leading-tight">
              Tu entrenador de CrossFit{' '}
              <span className="bg-linear-to-r from-red-500 to-orange-500 bg-clip-text text-transparent">
                potenciado por IA
              </span>
            </h1>
            <p className="mt-6 text-lg md:text-xl text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto leading-relaxed">
              Genera WODs personalizados al instante basados en tu equipamiento, nivel y objetivos. Entrena donde sea, sin excusas, solo resultados.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/login"
                className="inline-flex items-center justify-center px-8 py-4 text-base font-semibold text-white bg-linear-to-r from-red-500 to-red-600 rounded-full hover:from-red-600 hover:to-red-700 transition-all duration-300 shadow-lg shadow-red-500/25 hover:shadow-red-500/40 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 dark:focus:ring-offset-neutral-900"
              >
                Comenzar Gratis
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
              <Link
                href="#features"
                className="inline-flex items-center justify-center px-8 py-4 text-base font-semibold rounded-full border-2 border-neutral-300 dark:border-neutral-600 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:border-neutral-400 dark:hover:border-neutral-500 transition-all duration-300"
              >
                Saber más
              </Link>
            </div>
            <p className="mt-4 text-sm text-neutral-500 dark:text-neutral-500">
              No se requiere tarjeta de crédito para empezar.
            </p>
          </div>
        </div>
      </section>

      <section className="py-8 md:py-12 animate-fade-in-up">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="relative aspect-video md:aspect-21/9 rounded-3xl overflow-hidden shadow-2xl group">
            <Image
              src="/assets/hero-visual.png"
              alt="Entrena donde sea con Forgia"
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-105"
              priority
            />
            <div className="absolute inset-0 bg-linear-to-t from-neutral-900/80 via-neutral-900/20 to-transparent flex flex-col justify-end p-8 md:p-12">
              <h3 className="text-2xl md:text-4xl font-bold text-white mb-2">
                Entrena donde sea
              </h3>
              <p className="text-white/80 text-lg md:text-xl max-w-lg">
                Gimnasio, casa, aire libre, tú decides.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-16 md:py-24 bg-neutral-50 dark:bg-neutral-800/50 scroll-mt-20">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 dark:text-neutral-100 mb-4">
              Todo lo que necesitas
            </h2>
            <p className="text-lg text-neutral-600 dark:text-neutral-400 max-w-xl mx-auto">
              Diseñado para atletas, impulsado por datos.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="group relative bg-white dark:bg-neutral-800 p-6 rounded-2xl border border-neutral-200 dark:border-neutral-700 hover:border-red-300 dark:hover:border-red-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-red-500/5 hover:-translate-y-1"
              >
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-linear-to-br from-red-500 to-orange-500 text-white mb-5 shadow-lg shadow-red-500/20 group-hover:scale-110 transition-transform duration-300">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-bold text-neutral-900 dark:text-neutral-100 mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonial Carousel */}
      <section className="py-16 md:py-20 relative">
        <div className="container mx-auto px-4 max-w-3xl">
          <TestimonialCarousel testimonials={testimonials} />
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-20 bg-linear-to-r from-red-500 to-orange-500">
        <div className="container mx-auto px-4 max-w-3xl text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Empieza a forjar tu mejor versión
          </h2>
          <p className="text-lg text-white/90 mb-8 max-w-xl mx-auto">
            Únete a miles de atletas que ya están mejorando su rendimiento con nuestra tecnología.
          </p>
          <Link
            href="/login"
            className="inline-flex items-center justify-center px-10 py-4 text-lg font-semibold text-red-600 bg-white rounded-full hover:bg-neutral-100 transition-all duration-300 shadow-xl hover:scale-105"
          >
            Comenzar Gratis
            <ArrowRight className="ml-2 w-5 h-5" />
          </Link>
          <p className="mt-4 text-sm text-white/70">
            No se requiere tarjeta de crédito para empezar.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="text-center py-6 text-neutral-500 text-sm border-t border-neutral-200 dark:border-neutral-800">
        <p>Impulsado por IA para superar tus límites.</p>
        <div className="flex justify-center gap-4 my-2">
          <Link href="/blog" className="hover:text-neutral-700 dark:hover:text-neutral-300 transition-colors">
            Blog
          </Link>
          <span>|</span>
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
