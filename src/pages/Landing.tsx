import { Suspense, lazy, useEffect, useRef, useState } from 'react';
import type { FormEvent, ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import Lenis from 'lenis';
import TerminalModal from '../components/TerminalModal';
import {
  ARCHIVE_PROJECTS,
  CERTIFICATIONS,
  EDUCATION,
  EXPERIENCES,
  FAQS,
  FEATURED_PROJECTS,
  PROFILE,
  RAIL_GROUPS,
  SKILL_CLUSTERS,
  STOPS,
  engineState,
  findStopIndex,
  getActiveVehicleLabel,
  getFirstStopIndexForRailGroup,
  getRailGroupIndexForStop,
  notifyEngineUi,
  sanitizeExternalUrl,
  sanitizeTextInput,
  subscribeEngineUi,
} from '../data/portfolioJourney';
import {
  installAudioAutoUnlock,
  playPulseSfx,
  playWaypointSfx,
  toggleSoundEngine,
} from '../utils/soundEngine';

const UnrealStage = lazy(() => import('../components/three/UnrealStage'));

gsap.registerPlugin(ScrollTrigger, useGSAP);

interface LandingProps {
  onOpenResume: () => void;
}

interface StopSectionProps {
  id: string;
  as?: 'section' | 'article';
  className?: string;
  side?: 'left' | 'right';
  title: string;
  subtitleMeta?: string;
  level?: 1 | 2 | 3;
  minimized?: boolean;
  onToggleMinimize?: () => void;
  children: ReactNode;
}

function StopSection({
  id,
  as = 'section',
  className = '',
  side = 'left',
  title,
  subtitleMeta,
  level = 3,
  minimized = false,
  onToggleMinimize,
  children,
}: StopSectionProps) {
  const ref = useRef<HTMLElement>(null);
  const HeadingTag = `h${level}` as 'h1' | 'h2' | 'h3';

  useGSAP(
    () => {
      if (engineState.reduced || !ref.current) return;
      gsap.from('.mask__in', {
        yPercent: 105,
        duration: 0.85,
        ease: 'expo.out',
        scrollTrigger: {
          trigger: ref.current,
          start: 'top 80%',
          once: true,
        },
      });
    },
    { scope: ref }
  );

  const Tag = as;

  return (
    <Tag
      ref={ref as never}
      id={id}
      data-stop={id}
      className={`stop stop--${side} ${className}`}
      aria-labelledby={`${id}-title`}
    >
      <div className={`stop__body ${minimized ? 'stop__body--minimized' : ''}`}>
        <div className="stop__header">
          <HeadingTag id={`${id}-title`} className={`stop__title stop__title--h${level}`}>
            <span className="mask">
              <span className="mask__in">{title}</span>
            </span>
          </HeadingTag>

          {onToggleMinimize && (
            <button
              type="button"
              className="instrument-toggle"
              onClick={onToggleMinimize}
              data-interactive-ui
              aria-label={minimized ? 'Expand story card' : 'Minimize story card'}
              title={minimized ? 'Expand Card' : 'Minimize Card to view 3D Scene'}
            >
              <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
                {minimized ? (
                  <path
                    d="M4 10L8 6L12 10"
                    stroke="currentColor"
                    strokeWidth="1.75"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                ) : (
                  <path
                    d="M4 6L8 10L12 6"
                    stroke="currentColor"
                    strokeWidth="1.75"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                )}
              </svg>
            </button>
          )}
        </div>

        {subtitleMeta && <p className="stop__submeta">{subtitleMeta}</p>}

        {!minimized && <div className="stop__content">{children}</div>}
      </div>
    </Tag>
  );
}

function TechList({ items }: { items: string[] }) {
  return (
    <ul className="tech" aria-label="Technologies">
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  );
}

export default function Landing({ onOpenResume }: LandingProps) {
  const progressBarRef = useRef<HTMLSpanElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const lenisRef = useRef<Lenis | null>(null);
  const stopOffsetsRef = useRef<number[]>([]);

  const [activeStop, setActiveStop] = useState(0);
  const [featuresOpen, setFeaturesOpen] = useState(false);
  const [terminalOpen, setTerminalOpen] = useState(false);
  const [expandedCaseStudy, setExpandedCaseStudy] = useState<string | null>(null);
  const [expandedExpId, setExpandedExpId] = useState<string | null>('exp-vora');
  const [cardsMinimized, setCardsMinimized] = useState(false);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  const [, setUiTick] = useState(0);

  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactMsg, setContactMsg] = useState('');
  const [contactStatus, setContactStatus] = useState<'idle' | 'sending' | 'sent'>('idle');

  useEffect(() => {
    document.title = 'Akrom Fadhil — Fullstack, Multi-Agent AI & Distributed Systems';
    installAudioAutoUnlock();
    return subscribeEngineUi(() => {
      setUiTick((n) => n + 1);
    });
  }, []);

  useEffect(() => {
    const onPointerDownOutside = (e: PointerEvent) => {
      if (
        featuresOpen &&
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setFeaturesOpen(false);
      }
    };
    window.addEventListener('pointerdown', onPointerDownOutside);
    return () => window.removeEventListener('pointerdown', onPointerDownOutside);
  }, [featuresOpen]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const isInput =
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable);
      if (e.key === 'Escape' && featuresOpen) {
        setFeaturesOpen(false);
      } else if (e.key === '`' && !isInput && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        setTerminalOpen((prev) => !prev);
      } else if (e.code === 'Space' && !isInput && !terminalOpen) {
        engineState.pulse = 1.0;
        playPulseSfx(520);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [terminalOpen, featuresOpen]);

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    engineState.reduced = reduced;

    const computeStopOffsets = () => {
      const vh = window.innerHeight;
      const maxScroll = Math.max(1, document.documentElement.scrollHeight - vh);
      const els = Array.from(document.querySelectorAll<HTMLElement>('[data-stop]'));
      stopOffsetsRef.current = els.map((el, idx) => {
        if (idx === 0) return 0;
        if (idx === els.length - 1) return maxScroll;
        const rect = el.getBoundingClientRect();
        return Math.min(
          maxScroll,
          Math.max(0, rect.top + window.scrollY + rect.height / 2 - vh / 2)
        );
      });
    };

    const mapScrollToProgress = (scrollY: number): number => {
      const offsets = stopOffsetsRef.current;
      const len = offsets.length;
      if (len < 2 || scrollY <= offsets[0]) return 0;
      for (let i = 0; i < len - 1; i++) {
        const a = offsets[i];
        const b = offsets[i + 1];
        if (scrollY <= b) {
          return i + (b > a ? (scrollY - a) / (b - a) : 0);
        }
      }
      return len - 1;
    };

    let lenis: Lenis | null = null;
    if (!reduced) {
      lenis = new Lenis({
        lerp: 0.1,
        autoRaf: false,
        smoothWheel: true,
      });
      lenis.on('scroll', ScrollTrigger.update);
      lenisRef.current = lenis;
    }

    let prevActive = -1;
    let prevLo = -1;
    let prevHi = -1;

    const onTick = (timeSec: number, deltaMs: number) => {
      lenis?.raf(timeSec * 1000);
      const dt = Math.min(0.1, Math.max(0.001, deltaMs / 1000));
      engineState.target = mapScrollToProgress(window.scrollY);
      const prevT = engineState.t;

      if (reduced) {
        engineState.t = Math.round(engineState.target);
      } else {
        engineState.t += (engineState.target - engineState.t) * (1 - Math.exp(-dt * 7));
        if (Math.abs(engineState.target - engineState.t) < 0.0004) {
          engineState.t = engineState.target;
        }
      }

      engineState.velocity = (engineState.t - prevT) / dt;

      if (progressBarRef.current) {
        const ratio = Math.max(0, Math.min(1, engineState.t / (STOPS.length - 1)));
        progressBarRef.current.style.transform = `scaleX(${ratio})`;
      }

      const nextActive = Math.round(engineState.target);
      const nextLo = Math.max(0, Math.floor(Math.min(engineState.t, engineState.target)) - 1);
      const nextHi = Math.min(
        STOPS.length - 1,
        Math.ceil(Math.max(engineState.t, engineState.target)) + 1
      );

      if (nextActive !== prevActive || nextLo !== prevLo || nextHi !== prevHi) {
        if (nextActive !== prevActive && prevActive !== -1) {
          playWaypointSfx(nextActive);
        }
        prevActive = nextActive;
        prevLo = nextLo;
        prevHi = nextHi;
        engineState.activeStop = nextActive;
        engineState.lo = nextLo;
        engineState.hi = nextHi;
        setActiveStop(nextActive);
      }
    };

    gsap.ticker.add(onTick);
    gsap.ticker.lagSmoothing(0);
    computeStopOffsets();
    ScrollTrigger.addEventListener('refresh', computeStopOffsets);

    let resizeTimer = 0;
    const resizeObs = new ResizeObserver(() => {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(() => {
        ScrollTrigger.refresh();
      }, 120);
    });
    resizeObs.observe(document.body);
    document.fonts?.ready.then(() => ScrollTrigger.refresh());

    const onPointerMove = (e: PointerEvent) => {
      engineState.pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
      engineState.pointer.y = -((e.clientY / window.innerHeight) * 2 - 1);
      engineState.pointer.clientX = e.clientX;
      engineState.pointer.clientY = e.clientY;
      engineState.pointer.active = true;
    };

    const onTouchMove = (e: TouchEvent) => {
      const touch = e.touches[0];
      if (!touch) return;
      engineState.pointer.x = (touch.clientX / window.innerWidth) * 2 - 1;
      engineState.pointer.y = -((touch.clientY / window.innerHeight) * 2 - 1);
      engineState.pointer.clientX = touch.clientX;
      engineState.pointer.clientY = touch.clientY;
      engineState.pointer.active = true;
    };

    window.addEventListener('pointermove', onPointerMove, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: true });

    return () => {
      gsap.ticker.remove(onTick);
      ScrollTrigger.removeEventListener('refresh', computeStopOffsets);
      resizeObs.disconnect();
      window.clearTimeout(resizeTimer);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('touchmove', onTouchMove);
      lenis?.destroy();
      lenisRef.current = null;
    };
  }, []);

  const scrollToStop = (stopIndex: number) => {
    const clamped = Math.max(0, Math.min(stopOffsetsRef.current.length - 1, stopIndex));
    const targetY = stopOffsetsRef.current[clamped] ?? 0;
    if (lenisRef.current && !engineState.reduced) {
      lenisRef.current.scrollTo(targetY, {
        duration: 1.4,
        easing: (t: number) => 1 - Math.pow(1 - t, 4),
      });
    } else {
      window.scrollTo({ top: targetY, behavior: 'auto' });
    }
  };

  const activeRailGroup = getRailGroupIndexForStop(activeStop);
  const hovered = engineState.hovered;
  const activeStopMeta = STOPS[activeStop] ?? STOPS[0];

  const handleContactSubmit = (e: FormEvent) => {
    e.preventDefault();
    const cleanName = sanitizeTextInput(contactName, 80);
    const cleanEmail = sanitizeTextInput(contactEmail, 80);
    const cleanMsg = sanitizeTextInput(contactMsg, 600);
    if (!cleanName || !cleanEmail || !cleanMsg || !cleanEmail.includes('@')) return;
    setContactStatus('sending');
    engineState.pulse = 1.0;
    playPulseSfx(640);
    window.setTimeout(() => {
      setContactStatus('sent');
      setContactName('');
      setContactEmail('');
      setContactMsg('');
    }, 550);
  };

  const toggleMinimizeAll = () => {
    setCardsMinimized((prev) => !prev);
  };

  const safeGithubProfile = sanitizeExternalUrl(PROFILE.github);
  const safeLinkedinProfile = sanitizeExternalUrl(PROFILE.linkedin);
  const safeWhatsappProfile = sanitizeExternalUrl(PROFILE.whatsapp);

  return (
    <div className="unreal-portfolio">
      <a className="skip" href="#content">
        Skip to content
      </a>

      <Suspense fallback={null}>
        <UnrealStage />
      </Suspense>

      {hovered && engineState.cameraMode === 'rail' && (
        <div
          className="reticle"
          style={{
            transform: `translate3d(${Math.min(window.innerWidth - 260, Math.max(24, hovered.screenX))}px, ${Math.min(window.innerHeight - 110, Math.max(68, hovered.screenY))}px, 0)`,
          }}
          aria-hidden="true"
        >
          <div className="reticle__crosshair" />
          <div className="reticle__card">
            <span className="reticle__tag">{hovered.name}</span>
            <span className="reticle__sub">{hovered.category}</span>
            <span className="reticle__metric">{hovered.metric}</span>
          </div>
        </div>
      )}

      <header className="nav" data-interactive-ui>
        <div className="nav__left">
          <a
            className="nav__home"
            href="#edge"
            onClick={(e) => {
              e.preventDefault();
              scrollToStop(0);
            }}
          >
            {PROFILE.handle}
          </a>

          <span className="nav__stage-indicator">
            {getActiveVehicleLabel(engineState.target)} · {activeStopMeta.povLabel}
          </span>
        </div>

        <nav aria-label="Primary" className="nav__links">
          <button
            type="button"
            className={`btn btn--small ${engineState.audioEnabled ? 'btn--active' : ''}`}
            onClick={() => toggleSoundEngine()}
            aria-label="Toggle background music and soundscape"
          >
            {engineState.audioEnabled ? 'Sound On' : 'Muted'}
          </button>

          <div className="nav-dropdown" ref={dropdownRef}>
            <button
              type="button"
              className={`btn btn--small ${featuresOpen ? 'btn--active' : ''}`}
              aria-expanded={featuresOpen}
              aria-haspopup="true"
              onClick={() => setFeaturesOpen((prev) => !prev)}
            >
              <span>Features</span>
              <svg
                className={`nav-dropdown__chevron ${featuresOpen ? 'nav-dropdown__chevron--open' : ''}`}
                viewBox="0 0 16 16"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M4 6L8 10L12 6"
                  stroke="currentColor"
                  strokeWidth="1.75"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>

            {featuresOpen && (
              <div className="nav-dropdown__menu" role="menu" aria-label="3D Controls and Chapters">
                <div className="nav-dropdown__group">
                  <p className="nav-dropdown__heading">3D Viewport Controls</p>
                  <button
                    type="button"
                    role="menuitem"
                    className="nav-dropdown__item"
                    onClick={() => {
                      engineState.cameraMode = engineState.cameraMode === 'rail' ? 'orbit' : 'rail';
                      notifyEngineUi();
                      setFeaturesOpen(false);
                    }}
                  >
                    <span>Camera Mode</span>
                    <strong>{engineState.cameraMode === 'rail' ? 'Multi-POV' : '3D Orbit'}</strong>
                  </button>

                  <button
                    type="button"
                    role="menuitem"
                    className="nav-dropdown__item"
                    onClick={() => {
                      engineState.pulse = 1.0;
                      playPulseSfx(540);
                      setFeaturesOpen(false);
                    }}
                  >
                    <span>Propulsion Boost</span>
                    <strong>Trigger (Space)</strong>
                  </button>

                  <button
                    type="button"
                    role="menuitem"
                    className="nav-dropdown__item"
                    onClick={() => {
                      toggleMinimizeAll();
                      setFeaturesOpen(false);
                    }}
                  >
                    <span>Story Cards</span>
                    <strong>{cardsMinimized ? 'Hidden' : 'Visible'}</strong>
                  </button>

                  <button
                    type="button"
                    role="menuitem"
                    className="nav-dropdown__item"
                    onClick={() => {
                      setFeaturesOpen(false);
                      setTerminalOpen(true);
                    }}
                  >
                    <span>Command Shell</span>
                    <strong>Open CLI (`)</strong>
                  </button>
                </div>

                <div className="nav-dropdown__group">
                  <p className="nav-dropdown__heading">Journey Stages</p>
                  {RAIL_GROUPS.map((group, idx) => {
                    const firstIdx = getFirstStopIndexForRailGroup(idx);
                    const isCurrent = idx === activeRailGroup;
                    return (
                      <button
                        key={group.id}
                        type="button"
                        role="menuitem"
                        className={`nav-dropdown__item ${isCurrent ? 'nav-dropdown__item--active' : ''}`}
                        onClick={() => {
                          scrollToStop(firstIdx);
                          setFeaturesOpen(false);
                        }}
                      >
                        <span>{group.label}</span>
                        <strong>{group.host}</strong>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <button
            type="button"
            className="btn btn--small"
            onClick={onOpenResume}
          >
            CV
          </button>

          <a
            href="#delivered"
            className="btn btn--small btn--amber"
            onClick={(e) => {
              e.preventDefault();
              scrollToStop(findStopIndex('delivered'));
            }}
          >
            Contact
          </a>
        </nav>

        <span className="nav__progress" aria-hidden="true">
          <span ref={progressBarRef} />
        </span>
      </header>

      <main id="content">
        <StopSection
          id="edge"
          className="stop--hero"
          side={STOPS[0].cardSide}
          level={1}
          title={PROFILE.name}
          subtitleMeta={`${STOPS[0].sector} · ${STOPS[0].povLabel}`}
          minimized={cardsMinimized}
          onToggleMinimize={toggleMinimizeAll}
        >
          <div className="cv-profile-row">
            <img
              src={PROFILE.avatarUrl}
              alt={PROFILE.fullName}
              className="cv-profile-row__avatar"
            />
            <div>
              <p className="hero__role">{PROFILE.title}</p>
              <p className="meta">{PROFILE.location}</p>
            </div>
          </div>

          <p className="lede">{PROFILE.bio}</p>

          <div className="hero__actions" data-interactive-ui>
            <button
              type="button"
              className="btn btn--amber"
              onClick={() => scrollToStop(findStopIndex('proxy'))}
            >
              Read CV & Summary
            </button>
            <button
              type="button"
              className="btn"
              onClick={onOpenResume}
            >
              Full CV Modal
            </button>
            <a
              href={PROFILE.avatarUrl}
              download="Akrom_Fadhil_CV.jpeg"
              className="btn"
            >
              Download CV
            </a>
          </div>

          <p className="hero__cue">
            <span className="hero__dot" aria-hidden="true" />
            Scroll through the Alpine Highway (Car) → Viaduct (Train) → Sky (Jet) → Space (Rocket)
          </p>
        </StopSection>

        <StopSection
          id="proxy"
          side={STOPS[1].cardSide}
          level={2}
          title="Curriculum Vitae & Summary"
          subtitleMeta={`${STOPS[1].sector} · ${STOPS[1].povLabel}`}
          minimized={cardsMinimized}
          onToggleMinimize={toggleMinimizeAll}
        >
          <dl className="stats">
            {PROFILE.stats.map((stat) => (
              <div key={stat.label}>
                <dt>
                  {stat.label}
                  <span className="stats__detail">{stat.detail}</span>
                </dt>
                <dd>{stat.value}</dd>
              </div>
            ))}
          </dl>

          <ul className="story">
            {PROFILE.aboutStory.map((paragraph) => (
              <li key={paragraph}>{paragraph}</li>
            ))}
          </ul>

          <div className="cv-inline-block">
            <h3>Academic Education</h3>
            <ul className="cv-edu-list">
              {EDUCATION.map((edu) => (
                <li key={edu.institution}>
                  <strong>{edu.institution}</strong>
                  <span>{edu.degree} ({edu.period})</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="links" data-interactive-ui>
            <button type="button" className="btn btn--small btn--amber" onClick={onOpenResume}>
              Open Interactive CV
            </button>
            {safeGithubProfile && (
              <a href={safeGithubProfile} target="_blank" rel="noopener noreferrer">
                GitHub
              </a>
            )}
            {safeLinkedinProfile && (
              <a href={safeLinkedinProfile} target="_blank" rel="noopener noreferrer">
                LinkedIn
              </a>
            )}
          </div>
        </StopSection>

        <section className="group" aria-labelledby="experience-title">
          <h2 id="experience-title" className="group__title">
            Stage 02 · Mountain Gorge Viaduct · Work Experience
          </h2>

          {EXPERIENCES.map((exp, idx) => {
            const stopMeta = STOPS[2 + idx];
            const isExpOpen = expandedExpId === exp.id;
            const safeRepoUrl = sanitizeExternalUrl(exp.liveUrl);
            return (
              <StopSection
                key={exp.id}
                id={exp.id}
                as="article"
                side={stopMeta?.cardSide ?? 'left'}
                className={exp.isCurrent ? 'stop--current' : ''}
                title={exp.role}
                subtitleMeta={`${exp.company} · ${exp.period} · ${stopMeta?.povLabel ?? ''}`}
                minimized={cardsMinimized}
                onToggleMinimize={toggleMinimizeAll}
              >
                <p className="meta meta--amber">
                  {exp.metricsBadge} · {exp.location}
                </p>

                <p className="lede lede--small">{exp.description[0]}</p>

                {isExpOpen && exp.description.length > 1 && (
                  <ul className="points">
                    {exp.description.slice(1).map((bullet) => (
                      <li key={bullet}>{bullet}</li>
                    ))}
                  </ul>
                )}

                <TechList items={exp.technologies} />

                <div className="links" data-interactive-ui>
                  {exp.description.length > 1 && (
                    <button
                      type="button"
                      className="btn btn--small"
                      onClick={() => setExpandedExpId(isExpOpen ? null : exp.id)}
                    >
                      {isExpOpen ? 'Show Less' : 'Read Full Scope'}
                    </button>
                  )}
                  {safeRepoUrl && (
                    <a href={safeRepoUrl} target="_blank" rel="noopener noreferrer">
                      View Repository
                    </a>
                  )}
                </div>
              </StopSection>
            );
          })}
        </section>

        <StopSection
          id="rag"
          side={STOPS[findStopIndex('rag')]?.cardSide ?? 'left'}
          level={2}
          title="Technical & Soft Skills"
          subtitleMeta={`${STOPS[findStopIndex('rag')]?.sector ?? ''} · ${STOPS[findStopIndex('rag')]?.povLabel ?? ''}`}
          minimized={cardsMinimized}
          onToggleMinimize={toggleMinimizeAll}
        >
          <div className="skills">
            {SKILL_CLUSTERS.map((cluster) => (
              <section key={cluster.id} aria-label={cluster.title} className="skills__card">
                <h3>{cluster.title}</h3>
                <ul>
                  {cluster.skills.map((skill) => (
                    <li key={skill}>{skill}</li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        </StopSection>

        <section className="group" aria-labelledby="projects-title">
          <h2 id="projects-title" className="group__title">
            Stages 03 & 04 · Alpine Sky to Deep Space · Flagship Projects
          </h2>

          {FEATURED_PROJECTS.map((proj) => {
            const isExpanded = expandedCaseStudy === proj.id;
            const stopMeta = STOPS[findStopIndex(proj.id)];
            const safeProjGithub = sanitizeExternalUrl(proj.githubUrl);
            return (
              <StopSection
                key={proj.id}
                id={proj.id}
                as="article"
                side={stopMeta?.cardSide ?? 'left'}
                title={proj.title}
                subtitleMeta={`${proj.subtitle} · ${stopMeta?.povLabel ?? ''}`}
                minimized={cardsMinimized}
                onToggleMinimize={toggleMinimizeAll}
              >
                <p className="meta">
                  {proj.role} · <span className="meta--amber">{proj.metric}</span>
                </p>
                <p className="lede lede--small">{proj.summary}</p>

                {isExpanded && (
                  <div className="case-study-drawer" data-interactive-ui>
                    <ul className="points">
                      {proj.highlights.map((h) => (
                        <li key={h}>{h}</li>
                      ))}
                    </ul>
                    <div className="case-study-drawer__grid">
                      <div>
                        <h4>Problem</h4>
                        <p>{proj.problem}</p>
                      </div>
                      <div>
                        <h4>Architecture Approach</h4>
                        <p>{proj.approach}</p>
                      </div>
                      <div>
                        <h4>Measured Outcome</h4>
                        <p>{proj.outcome}</p>
                      </div>
                    </div>
                  </div>
                )}

                <TechList items={proj.technologies} />

                <div className="links" data-interactive-ui>
                  <button
                    type="button"
                    className="btn btn--small"
                    onClick={() =>
                      setExpandedCaseStudy(isExpanded ? null : proj.id)
                    }
                  >
                    {isExpanded ? 'Hide Architecture' : 'Architecture Breakdown'}
                  </button>
                  <Link to={`/projects/${proj.slug}`}>Case Study</Link>
                  {safeProjGithub && (
                    <a href={safeProjGithub} target="_blank" rel="noopener noreferrer">
                      Source on GitHub
                    </a>
                  )}
                </div>
              </StopSection>
            );
          })}

          <StopSection
            id="archive"
            className="stop--wide"
            side={STOPS[findStopIndex('archive')]?.cardSide ?? 'right'}
            title="Additional Production Systems"
            subtitleMeta={`${STOPS[findStopIndex('archive')]?.sector ?? ''} · ${STOPS[findStopIndex('archive')]?.povLabel ?? ''}`}
            minimized={cardsMinimized}
            onToggleMinimize={toggleMinimizeAll}
          >
            <ul className="archive">
              {ARCHIVE_PROJECTS.map((ap) => (
                <li key={ap.id}>
                  <article>
                    <div className="archive__head">
                      <h4>{ap.title}</h4>
                      <span className="meta meta--amber">{ap.metric}</span>
                    </div>
                    <p className="archive__sub">{ap.subtitle}</p>
                    <p>{ap.summary}</p>
                    <TechList items={ap.technologies} />
                  </article>
                </li>
              ))}
            </ul>
          </StopSection>
        </section>

        <StopSection
          id="delivered"
          className="stop--wide stop--last"
          side={STOPS[findStopIndex('delivered')]?.cardSide ?? 'left'}
          level={2}
          title="Curriculum Vitae & Contact"
          subtitleMeta={`${STOPS[findStopIndex('delivered')]?.sector ?? ''} · ${STOPS[findStopIndex('delivered')]?.povLabel ?? ''}`}
          minimized={cardsMinimized}
          onToggleMinimize={toggleMinimizeAll}
        >
          <p className="contact__mail" data-interactive-ui>
            <a href={`mailto:${PROFILE.email}`}>{PROFILE.email}</a>
          </p>

          <p className="links" data-interactive-ui>
            {safeGithubProfile && (
              <a href={safeGithubProfile} target="_blank" rel="noopener noreferrer">
                GitHub
              </a>
            )}
            {safeLinkedinProfile && (
              <a href={safeLinkedinProfile} target="_blank" rel="noopener noreferrer">
                LinkedIn
              </a>
            )}
            {safeWhatsappProfile && (
              <a href={safeWhatsappProfile} target="_blank" rel="noopener noreferrer">
                WhatsApp ({PROFILE.phone})
              </a>
            )}
            <button type="button" className="btn btn--small" onClick={onOpenResume}>
              Open Digital CV
            </button>
          </p>

          <div className="transmission-grid" data-interactive-ui>
            <form className="transmission-form" onSubmit={handleContactSubmit}>
              <h3 className="transmission-form__title">Send a Direct Message</h3>
              <div className="transmission-form__row">
                <label>
                  <span>Name</span>
                  <input
                    type="text"
                    required
                    maxLength={80}
                    placeholder="Your Name / Organization"
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                  />
                </label>
                <label>
                  <span>Email</span>
                  <input
                    type="email"
                    required
                    maxLength={80}
                    placeholder="you@company.com"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                  />
                </label>
              </div>
              <label>
                <span>Message</span>
                <textarea
                  rows={3}
                  required
                  maxLength={600}
                  placeholder="Describe your project, architecture needs, or engineering role..."
                  value={contactMsg}
                  onChange={(e) => setContactMsg(e.target.value)}
                />
              </label>
              <div className="transmission-form__actions">
                <button type="submit" className="btn btn--amber" disabled={contactStatus === 'sending'}>
                  {contactStatus === 'sending' ? 'Sending...' : 'Send Message'}
                </button>
                {contactStatus === 'sent' && (
                  <span className="transmission-form__ack">
                    Message verified and queued for {PROFILE.email}
                  </span>
                )}
              </div>
            </form>

            <div className="faq-panel">
              <h3 className="transmission-form__title">Frequently Asked Questions</h3>
              <div className="faq-list">
                {FAQS.map((faq, idx) => {
                  const isOpen = openFaqIndex === idx;
                  return (
                    <div key={faq.question} className="faq-item">
                      <button
                        type="button"
                        className="faq-item__q"
                        onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                        aria-expanded={isOpen}
                      >
                        <span>{faq.question}</span>
                        <svg
                          className={`faq-item__chevron ${isOpen ? 'faq-item__chevron--open' : ''}`}
                          viewBox="0 0 16 16"
                          fill="none"
                          aria-hidden="true"
                        >
                          <path
                            d="M4 6L8 10L12 6"
                            stroke="currentColor"
                            strokeWidth="1.75"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </button>
                      {isOpen && <p className="faq-item__a">{faq.answer}</p>}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="creds">
            <section aria-labelledby="education-title">
              <h3 id="education-title">Education</h3>
              <ul>
                {EDUCATION.map((edu) => (
                  <li key={edu.institution}>
                    <strong>{edu.degree}</strong>
                    <span>{edu.institution}</span>
                    <span className="meta">
                      {edu.period} · {edu.location} — {edu.highlight}
                    </span>
                  </li>
                ))}
              </ul>
            </section>

            <section aria-labelledby="certs-title">
              <h3 id="certs-title">Experience & Credentials</h3>
              <ul>
                {CERTIFICATIONS.map((cert) => (
                  <li key={cert.title}>
                    <strong>{cert.title}</strong>
                    <span>
                      {cert.issuer} · {cert.badge}
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          </div>

          <p className="meta footer">
            {PROFILE.fullName} · {PROFILE.location}. Press <kbd>`</kbd> for CLI or <kbd>Space</kbd> for boost.
          </p>
        </StopSection>
      </main>

      <TerminalModal
        isOpen={terminalOpen}
        onClose={() => setTerminalOpen(false)}
        onScrollToStop={scrollToStop}
        onOpenResume={onOpenResume}
      />
    </div>
  );
}
