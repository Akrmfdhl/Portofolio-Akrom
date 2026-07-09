import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

export default function Hero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const leadRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

      tl.fromTo(
        headlineRef.current,
        { y: 40, opacity: 0 },
        { y: 0, opacity: 1, duration: 1.2, delay: 0.2 }
      )
        .fromTo(
          leadRef.current,
          { y: 30, opacity: 0 },
          { y: 0, opacity: 1, duration: 1.0 },
          '-=0.8'
        )
        .fromTo(
          ctaRef.current,
          { y: 20, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.8 },
          '-=0.6'
        );
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={containerRef}
      className="bg-surface-tile-1 text-on-dark flex flex-col justify-center items-center text-center px-lg py-section min-h-[calc(100vh-var(--spacing-nav))] relative overflow-hidden"
    >
      <div className="max-w-content-hero mx-auto flex flex-col items-center gap-lg">
        <h1
          ref={headlineRef}
          className="text-hero-display text-body-on-dark opacity-0 select-none"
        >
          Akrom
          <br />
          <span className="text-primary-on-dark">Frontend & Fullstack Developer</span>
        </h1>
        <p
          ref={leadRef}
          className="text-lead text-body-muted max-w-content-form opacity-0"
        >
          Crafting pixel-perfect, photography-first digital museum galleries.
        </p>
        <div
          ref={ctaRef}
          className="flex flex-row gap-md mt-sm opacity-0"
        >
          <a
            href="#projects"
            className="bg-primary text-on-primary text-body rounded-pill px-lg py-sm transition-all hover:opacity-90 active:scale-95"
          >
            View Projects
          </a>
          <a
            href="#contact"
            className="bg-transparent border border-primary text-primary text-body rounded-pill px-lg py-sm transition-all hover:bg-primary/10 active:scale-95"
          >
            Contact Me
          </a>
        </div>
      </div>
    </section>
  );
}
