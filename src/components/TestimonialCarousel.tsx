'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';

interface Testimonial {
  name: string;
  label: string;
  quote: string;
  avatar: string;
}

interface TestimonialCarouselProps {
  testimonials: Testimonial[];
}

export default function TestimonialCarousel({ testimonials }: TestimonialCarouselProps) {
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
        behavior: 'smooth',
      });
    }
  };

  return (
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
  );
}
