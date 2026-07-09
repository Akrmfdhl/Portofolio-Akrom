import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Link } from 'react-router-dom';
import { projects } from '../data/projects';

gsap.registerPlugin(ScrollTrigger);

function getProjectBadge(slug: string) {
  switch (slug) {
    case 'catat-crypto':
      return 'PRODUCTION READY';
    case 'lms-curriculum':
      return 'ACTIVE DEPLOY';
    case 'blocksim':
      return 'BETA RELEASE';
    case 'tiss':
      return 'CORE INTEGRATION';
    default:
      return 'STABLE';
  }
}

export default function Projects() {
  const containerRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement[]>([]);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const container = containerRef.current;
    if (!container) return;

    const cards = cardsRef.current.filter(Boolean);
    if (cards.length === 0) return;

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: container,
        start: 'top top',
        end: 'bottom bottom',
        scrub: true,
      },
    });

    cards.forEach((card, index) => {
      if (index === 0) return;

      tl.fromTo(
        card,
        { yPercent: 100 },
        { yPercent: 0, ease: 'none', duration: 1 },
        `card-${index}`
      );

      const prevCard = cards[index - 1];
      if (prevCard) {
        tl.to(
          prevCard,
          {
            scale: 0.93,
            y: -30,
            opacity: 0.6,
            ease: 'none',
            duration: 1,
          },
          `card-${index}`
        );
      }
    });

    return () => {
      ScrollTrigger.getAll().forEach((t) => t.kill());
    };
  }, []);

  return (
    <div
      ref={containerRef}
      id="projects"
      className="relative w-full h-[400vh] bg-surface-tile-1 select-none z-10"
    >
      <div className="sticky top-0 h-screen w-full flex flex-col justify-center items-center py-lg overflow-hidden">
        {/* Title layer */}
        <div className="w-full max-w-content-max px-lg flex flex-col gap-xxs mb-md relative z-20">
          <h2 className="text-display-md text-body-on-dark">Projects</h2>
          <p className="text-caption text-body-muted">Scroll to reveal system contributions</p>
        </div>

        {/* Cards deck */}
        <div className="relative w-full max-w-content-max px-lg flex-1 flex items-center justify-center">
          {projects.map((project, index) => (
            <div
              key={project.slug}
              ref={(el) => {
                if (el) cardsRef.current[index] = el;
              }}
              className="absolute w-full h-full bg-surface-tile-3 border border-hairline/15 rounded-lg p-lg shadow-product flex flex-col md:flex-row gap-lg justify-between origin-top"
              style={{
                zIndex: index + 1,
              }}
            >
              {/* Left Details */}
              <div className="flex flex-col justify-between w-full md:w-5/12 h-full py-xs">
                <div className="flex flex-col gap-md">
                  <div className="flex flex-col gap-xxs items-start">
                    <div className="flex items-center gap-xs">
                      <span className="text-caption text-primary font-semibold uppercase tracking-wider">{project.role}</span>
                      <span className="text-fine-print text-primary bg-primary/10 border border-primary/25 rounded-pill px-xs py-xxs font-bold tracking-wide select-none" style={{ boxShadow: '0 0 10px rgba(0, 210, 255, 0.15)' }}>
                        {getProjectBadge(project.slug)}
                      </span>
                    </div>
                    <h3 className="text-display-md text-body-on-dark font-semibold leading-tight mt-xxs">{project.name}</h3>
                  </div>
                  <p className="text-body text-body-muted leading-relaxed">{project.description}</p>
                </div>

                <div className="flex flex-col gap-md mt-lg">
                  <div className="flex flex-wrap gap-xxs">
                    {project.stack.map((tech) => (
                      <span
                        key={tech}
                        className="bg-surface-tile-1 border border-hairline/10 text-caption rounded-pill px-xs py-xxs font-apple-text text-fine-print text-body-muted"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>

                  <div className="flex justify-between items-center pt-sm border-t border-hairline/10">
                    <Link
                      to={`/projects/${project.slug}`}
                      className="text-link hover:underline font-semibold font-apple-text text-caption"
                    >
                      Case Study &rarr;
                    </Link>
                    {project.isPrivate ? (
                      <span className="text-fine-print text-body-muted bg-surface-tile-1 border border-hairline/10 rounded-pill px-xs py-xxs font-apple-text">
                        Private repo
                      </span>
                    ) : (
                      <span className="text-fine-print text-primary bg-surface-tile-1 border border-primary/30 rounded-pill px-xs py-xxs font-apple-text">
                        Public
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Right macOS Browser Dashboard Mockup */}
              <div className="w-full md:w-7/12 h-full flex flex-col bg-surface-tile-2 border border-hairline/10 rounded-lg overflow-hidden shadow-product relative">
                {/* Title Bar */}
                <div className="flex items-center gap-1.5 px-3 py-2 border-b border-hairline/5 bg-surface-black/35">
                  <div className="w-2.5 h-2.5 rounded-full bg-mac-red" />
                  <div className="w-2.5 h-2.5 rounded-full bg-mac-yellow" />
                  <div className="w-2.5 h-2.5 rounded-full bg-mac-green" />
                  <span className="text-fine-print text-body-muted/40 font-mono mx-auto truncate pr-8 select-none">
                    {project.slug}.akrom.dev
                  </span>
                </div>
                {/* Screen body */}
                <div className="flex-1 overflow-hidden relative flex items-center justify-center bg-surface-tile-1">
                  <img
                    src={project.screenshotUrl}
                    alt={project.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-surface-tile-1/40 to-transparent pointer-events-none" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
