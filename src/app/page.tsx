'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
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
  const [activeIndex, setActiveIndex] = useState(0);
  const carouselRef = useRef<HTMLDivElement>(null);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const scrollLeft = e.currentTarget.scrollLeft;
    const width = e.currentTarget.offsetWidth;
    const newIndex = Math.round(scrollLeft / width);
    if (newIndex !== activeIndex) {
      setActiveIndex(newIndex);
    }
  };

  const scrollToIdx = (idx: number) => {
    if (carouselRef.current) {
      carouselRef.current.scrollTo({
        left: idx * carouselRef.current.offsetWidth,
        behavior: 'smooth'
      });
    }
  };
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
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-2"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
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
          <div className="relative bg-neutral-900 border border-neutral-800 rounded-3xl overflow-hidden shadow-2xl shadow-red-500/5">
            {/* Decorative elements */}
            <div className="absolute top-0 left-0 w-32 h-32 bg-red-500/20 rounded-full blur-2xl" />
            <div className="absolute bottom-0 right-0 w-40 h-40 bg-orange-500/10 rounded-full blur-2xl" />
            
            <div 
              ref={carouselRef}
              onScroll={handleScroll}
              className="flex overflow-x-auto scroll-smooth snap-x snap-mandatory no-scrollbar"
            >
              {testimonials.map((testimonial, idx) => (
                <div key={idx} className="min-w-full snap-center p-8 md:p-14 text-center">
                  <div className="relative z-10">
                    <div className="flex justify-center gap-1 mb-6">
                      {[...Array(5)].map((_, i) => (
                        <svg key={i} xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="text-red-500">
                          <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
                        </svg>
                      ))}
                    </div>
                    <blockquote className="text-xl md:text-2xl font-medium text-white mb-8 leading-relaxed max-w-2xl mx-auto">
                      &ldquo;{testimonial.quote}&rdquo;
                    </blockquote>
                    <div className="flex items-center justify-center gap-4">
                      <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-red-500/20">
                        <Image 
                          src={testimonial.avatar}
                          alt={testimonial.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="text-left">
                        <p className="font-semibold text-white">{testimonial.name}</p>
                        <p className="text-sm text-neutral-400">{testimonial.label}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Navigation Dots */}
            <div className="flex justify-center gap-2 pb-8 relative z-10">
              {testimonials.map((_, idx) => (
                <button 
                  key={idx}
                  onClick={() => scrollToIdx(idx)}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${idx === activeIndex ? 'bg-red-500 w-4' : 'bg-neutral-600'}`}
                  aria-label={`Ir al testimonio ${idx + 1}`}
                />
              ))}
            </div>
          </div>
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
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-2"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
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
