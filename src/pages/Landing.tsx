import { Suspense, lazy, useEffect, useRef, useState } from 'react';
import type { FormEvent, ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import Lenis from 'lenis';
import TerminalModal from '../components/TerminalModal';
import Preloader from '../components/Preloader';
import {
  ARCHIVE_PROJECTS,
  CERTIFICATIONS,
  EDUCATION,
  EXPERIENCES,
  FAQS,
  FEATURED_PROJECTS,
  PROFILE,
  SKILL_CLUSTERS,
  STOPS,
  engineState,
  findStopIndex,
  getFirstStopIndexForRailGroup,
  getRailGroupIndexForStop,
  notifyEngineUi,
  sanitizeExternalUrl,
  sanitizeTextInput,
  subscribeEngineUi,
} from '../data/portfolioJourney';
import { PICKABLE_COPY, pickText, useI18n } from '../lib/i18n';
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
  minimizeLabel?: string;
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
  minimizeLabel,
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
              aria-label={minimizeLabel}
              title={minimizeLabel}
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
  const { locale, setLocale, copy } = useI18n();
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
    document.documentElement.lang = locale;
    document.title = copy.docTitle;
  }, [locale, copy.docTitle]);

  useEffect(() => {
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

  const activeRailGroup = Math.max(0, getRailGroupIndexForStop(activeStop));
  const activeChapter = copy.chapters[activeRailGroup] ?? copy.chapters[0];
  const hovered = engineState.hovered;
  const hoveredMeta = hovered ? PICKABLE_COPY[hovered.hoverKey]?.[locale] : undefined;

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

  const minimizeAria = cardsMinimized ? copy.nav.expandCard : copy.nav.minimizeCard;
  const safeGithubProfile = sanitizeExternalUrl(PROFILE.github);
  const safeLinkedinProfile = sanitizeExternalUrl(PROFILE.linkedin);
  const safeWhatsappProfile = sanitizeExternalUrl(PROFILE.whatsapp);

  return (
    <div className="unreal-portfolio">
      <Preloader />

      <a className="skip" href="#content">
        {copy.skip}
      </a>

      <Suspense fallback={null}>
        <UnrealStage />
      </Suspense>

      {hovered && hoveredMeta && engineState.cameraMode === 'rail' && (
        <div
          className="reticle"
          style={{
            transform: `translate3d(${Math.min(window.innerWidth - 260, Math.max(24, hovered.screenX))}px, ${Math.min(window.innerHeight - 110, Math.max(68, hovered.screenY))}px, 0)`,
          }}
          aria-hidden="true"
        >
          <div className="reticle__crosshair" />
          <div className="reticle__card">
            <span className="reticle__tag">{hoveredMeta.title}</span>
            <span className="reticle__sub">{hoveredMeta.subtitle}</span>
            <span className="reticle__metric">{hoveredMeta.detail}</span>
          </div>
        </div>
      )}

      <header className="nav" data-interactive-ui>
        <div className="nav__left">
          <a
            className="nav__home"
            href="#edge"
            aria-label={copy.nav.homeAria}
            onClick={(e) => {
              e.preventDefault();
              scrollToStop(0);
            }}
          >
            {PROFILE.handle}
          </a>

          <span className="nav__pill">{activeChapter.short}</span>
        </div>

        <nav aria-label="Primary" className="nav__links">
          <div className="lang-switch" role="group" aria-label="Language">
            <button
              type="button"
              className={`lang-switch__btn ${locale === 'id' ? 'lang-switch__btn--active' : ''}`}
              onClick={() => setLocale('id')}
              aria-pressed={locale === 'id'}
            >
              ID
            </button>
            <button
              type="button"
              className={`lang-switch__btn ${locale === 'en' ? 'lang-switch__btn--active' : ''}`}
              onClick={() => setLocale('en')}
              aria-pressed={locale === 'en'}
            >
              EN
            </button>
          </div>

          <button
            type="button"
            className={`btn btn--small nav__audio ${engineState.audioEnabled ? 'btn--active' : ''}`}
            onClick={() => toggleSoundEngine()}
            aria-label={copy.nav.soundAria}
            aria-pressed={engineState.audioEnabled}
          >
            <svg viewBox="0 0 16 16" fill="none" className="nav__icon" aria-hidden="true">
              <path
                d="M2.5 6.2H5.2L8.8 3.2V12.8L5.2 9.8H2.5V6.2Z"
                stroke="currentColor"
                strokeWidth="1.4"
                strokeLinejoin="round"
              />
              {engineState.audioEnabled ? (
                <path
                  d="M11.2 5.4C12 6.2 12.4 7.1 12.4 8C12.4 8.9 12 9.8 11.2 10.6"
                  stroke="currentColor"
                  strokeWidth="1.4"
                  strokeLinecap="round"
                />
              ) : (
                <path
                  d="M11 6L14 10M14 6L11 10"
                  stroke="currentColor"
                  strokeWidth="1.4"
                  strokeLinecap="round"
                />
              )}
            </svg>
            <span className="nav__audio-label">
              {engineState.audioEnabled ? copy.nav.soundOn : copy.nav.soundOff}
            </span>
          </button>

          <div className="nav-dropdown" ref={dropdownRef}>
            <button
              type="button"
              className={`btn btn--small ${featuresOpen ? 'btn--active' : ''}`}
              aria-expanded={featuresOpen}
              aria-haspopup="true"
              onClick={() => setFeaturesOpen((prev) => !prev)}
            >
              <span>{copy.nav.menu}</span>
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
              <div className="nav-dropdown__menu" role="menu" aria-label={copy.nav.chaptersHeading}>
                <div className="nav-dropdown__group">
                  <p className="nav-dropdown__heading">{copy.nav.chaptersHeading}</p>
                  {copy.chapters.map((chapter, idx) => {
                    const firstIdx = getFirstStopIndexForRailGroup(idx);
                    const isCurrent = idx === activeRailGroup;
                    return (
                      <button
                        key={chapter.id}
                        type="button"
                        role="menuitem"
                        className={`nav-dropdown__item ${isCurrent ? 'nav-dropdown__item--active' : ''}`}
                        onClick={() => {
                          scrollToStop(firstIdx);
                          setFeaturesOpen(false);
                        }}
                      >
                        <span>{chapter.label}</span>
                        <strong>{chapter.sub}</strong>
                      </button>
                    );
                  })}
                </div>

                <div className="nav-dropdown__group">
                  <p className="nav-dropdown__heading">{copy.nav.viewHeading}</p>
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
                    <span>{copy.nav.cameraMode}</span>
                    <strong>
                      {engineState.cameraMode === 'rail'
                        ? copy.nav.cameraGuided
                        : copy.nav.cameraOrbit}
                    </strong>
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
                    <span>{copy.nav.cardsToggle}</span>
                    <strong>
                      {cardsMinimized ? copy.nav.cardsMinimal : copy.nav.cardsVisible}
                    </strong>
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
                    <span>{copy.nav.motionBoost}</span>
                    <strong>{copy.nav.motionBoostKey}</strong>
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
                    <span>{copy.nav.quickJump}</span>
                    <strong>{copy.nav.quickJumpKey}</strong>
                  </button>

                  <button
                    type="button"
                    role="menuitem"
                    className="nav-dropdown__item nav-dropdown__mobile-only"
                    onClick={() => {
                      setFeaturesOpen(false);
                      onOpenResume();
                    }}
                  >
                    <span>{copy.resume.headingSuffix}</span>
                    <strong>{copy.nav.cv}</strong>
                  </button>
                </div>
              </div>
            )}
          </div>

          <button
            type="button"
            className="btn btn--small nav__desktop-action"
            onClick={onOpenResume}
          >
            {copy.nav.cv}
          </button>

          <a
            href="#delivered"
            className="btn btn--small btn--amber nav__desktop-action"
            onClick={(e) => {
              e.preventDefault();
              scrollToStop(findStopIndex('delivered'));
            }}
          >
            {copy.nav.contact}
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
          subtitleMeta={`${copy.hero.chapterMeta} · ${pickText(locale, STOPS[0].povLabel)}`}
          minimized={cardsMinimized}
          minimizeLabel={minimizeAria}
          onToggleMinimize={toggleMinimizeAll}
        >
          <div className="cv-profile-row">
            <img
              src={PROFILE.avatarUrl}
              alt={PROFILE.fullName}
              className="cv-profile-row__avatar"
            />
            <div>
              <p className="hero__role">{copy.hero.role}</p>
              <p className="meta">{PROFILE.location}</p>
            </div>
          </div>

          <p className="lede">{copy.hero.bio}</p>

          <div className="hero__actions" data-interactive-ui>
            <button
              type="button"
              className="btn btn--amber"
              onClick={() => scrollToStop(findStopIndex('proxy'))}
            >
              {copy.hero.ctaSummary}
            </button>
            <button
              type="button"
              className="btn"
              onClick={onOpenResume}
            >
              {copy.hero.ctaCv}
            </button>
            <a
              href={PROFILE.avatarUrl}
              download="Akrom_Fadhil_CV.jpeg"
              className="btn"
            >
              {copy.hero.ctaDownload}
            </a>
          </div>

          <p className="hero__cue">
            <span className="hero__dot" aria-hidden="true" />
            {copy.hero.cue}
          </p>
        </StopSection>

        <StopSection
          id="proxy"
          side={STOPS[1].cardSide}
          level={2}
          title={copy.summary.title}
          subtitleMeta={`${copy.summary.chapterMeta} · ${pickText(locale, STOPS[1].povLabel)}`}
          minimized={cardsMinimized}
          minimizeLabel={minimizeAria}
          onToggleMinimize={toggleMinimizeAll}
        >
          <dl className="stats">
            {PROFILE.stats.map((stat) => (
              <div key={stat.value}>
                <dt>
                  {pickText(locale, stat.label)}
                  <span className="stats__detail">{pickText(locale, stat.detail)}</span>
                </dt>
                <dd>{stat.value}</dd>
              </div>
            ))}
          </dl>

          <ul className="story">
            {PROFILE.aboutStory[locale].map((paragraph) => (
              <li key={paragraph}>{paragraph}</li>
            ))}
          </ul>

          <div className="cv-inline-block">
            <h3>{copy.summary.educationHeading}</h3>
            <ul className="cv-edu-list">
              {EDUCATION.map((edu) => (
                <li key={edu.institution}>
                  <strong>{edu.institution}</strong>
                  <span>
                    {pickText(locale, edu.degree)} ({pickText(locale, edu.period)})
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div className="links" data-interactive-ui>
            <button type="button" className="btn btn--small btn--amber" onClick={onOpenResume}>
              {copy.summary.openCv}
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
            {copy.experience.groupTitle}
          </h2>

          {EXPERIENCES.map((exp, idx) => {
            const stopMeta = STOPS[2 + idx];
            const isExpOpen = expandedExpId === exp.id;
            const safeRepoUrl = sanitizeExternalUrl(exp.liveUrl);
            const locBullets = exp.description[locale];
            return (
              <StopSection
                key={exp.id}
                id={exp.id}
                as="article"
                side={stopMeta?.cardSide ?? 'left'}
                className={exp.isCurrent ? 'stop--current' : ''}
                title={pickText(locale, exp.role)}
                subtitleMeta={`${exp.company} · ${pickText(locale, exp.period)} · ${stopMeta ? pickText(locale, stopMeta.povLabel) : ''}`}
                minimized={cardsMinimized}
                minimizeLabel={minimizeAria}
                onToggleMinimize={toggleMinimizeAll}
              >
                <p className="meta meta--amber">
                  {pickText(locale, exp.metricsBadge)} · {pickText(locale, exp.location)}
                </p>

                <p className="lede lede--small">{locBullets[0]}</p>

                {isExpOpen && locBullets.length > 1 && (
                  <ul className="points">
                    {locBullets.slice(1).map((bullet) => (
                      <li key={bullet}>{bullet}</li>
                    ))}
                  </ul>
                )}

                <TechList items={exp.technologies} />

                <div className="links" data-interactive-ui>
                  {locBullets.length > 1 && (
                    <button
                      type="button"
                      className="btn btn--small"
                      onClick={() => setExpandedExpId(isExpOpen ? null : exp.id)}
                    >
                      {isExpOpen ? copy.experience.readLess : copy.experience.readMore}
                    </button>
                  )}
                  {safeRepoUrl && (
                    <a href={safeRepoUrl} target="_blank" rel="noopener noreferrer">
                      {copy.experience.viewRepo}
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
          title={copy.skills.title}
          subtitleMeta={`${copy.skills.chapterMeta} · ${pickText(locale, STOPS[findStopIndex('rag')]?.povLabel ?? { id: '', en: '' })}`}
          minimized={cardsMinimized}
          minimizeLabel={minimizeAria}
          onToggleMinimize={toggleMinimizeAll}
        >
          <div className="skills">
            {SKILL_CLUSTERS.map((cluster) => (
              <section
                key={cluster.id}
                aria-label={pickText(locale, cluster.title)}
                className="skills__card"
              >
                <h3>{pickText(locale, cluster.title)}</h3>
                <ul>
                  {cluster.skills[locale].map((skill) => (
                    <li key={skill}>{skill}</li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        </StopSection>

        <section className="group" aria-labelledby="projects-title">
          <h2 id="projects-title" className="group__title">
            {copy.projects.groupTitle}
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
                subtitleMeta={`${pickText(locale, proj.subtitle)} · ${stopMeta ? pickText(locale, stopMeta.povLabel) : ''}`}
                minimized={cardsMinimized}
                minimizeLabel={minimizeAria}
                onToggleMinimize={toggleMinimizeAll}
              >
                <p className="meta">
                  {pickText(locale, proj.role)} ·{' '}
                  <span className="meta--amber">{pickText(locale, proj.metric)}</span>
                </p>
                <p className="lede lede--small">{pickText(locale, proj.summary)}</p>

                {isExpanded && (
                  <div className="case-study-drawer" data-interactive-ui>
                    <ul className="points">
                      {proj.highlights[locale].map((h) => (
                        <li key={h}>{h}</li>
                      ))}
                    </ul>
                    <div className="case-study-drawer__grid">
                      <div>
                        <h4>{copy.projects.problemLabel}</h4>
                        <p>{pickText(locale, proj.problem)}</p>
                      </div>
                      <div>
                        <h4>{copy.projects.approachLabel}</h4>
                        <p>{pickText(locale, proj.approach)}</p>
                      </div>
                      <div>
                        <h4>{copy.projects.outcomeLabel}</h4>
                        <p>{pickText(locale, proj.outcome)}</p>
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
                    {isExpanded ? copy.projects.hideBreakdown : copy.projects.showBreakdown}
                  </button>
                  <Link to={`/projects/${proj.slug}`}>{copy.projects.caseStudy}</Link>
                  {safeProjGithub && (
                    <a href={safeProjGithub} target="_blank" rel="noopener noreferrer">
                      {copy.projects.sourceGithub}
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
            title={copy.projects.archiveTitle}
            subtitleMeta={`${copy.projects.archiveMeta} · ${pickText(locale, STOPS[findStopIndex('archive')]?.povLabel ?? { id: '', en: '' })}`}
            minimized={cardsMinimized}
            minimizeLabel={minimizeAria}
            onToggleMinimize={toggleMinimizeAll}
          >
            <ul className="archive">
              {ARCHIVE_PROJECTS.map((ap) => (
                <li key={ap.id}>
                  <article>
                    <div className="archive__head">
                      <h4>{ap.title}</h4>
                      <span className="meta meta--amber">{pickText(locale, ap.metric)}</span>
                    </div>
                    <p className="archive__sub">{pickText(locale, ap.subtitle)}</p>
                    <p>{pickText(locale, ap.summary)}</p>
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
          title={copy.contact.title}
          subtitleMeta={`${copy.contact.chapterMeta} · ${pickText(locale, STOPS[findStopIndex('delivered')]?.povLabel ?? { id: '', en: '' })}`}
          minimized={cardsMinimized}
          minimizeLabel={minimizeAria}
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
              {copy.contact.openCv}
            </button>
          </p>

          <div className="transmission-grid" data-interactive-ui>
            <form className="transmission-form" onSubmit={handleContactSubmit}>
              <h3 className="transmission-form__title">{copy.contact.formTitle}</h3>
              <div className="transmission-form__row">
                <label>
                  <span>{copy.contact.nameLabel}</span>
                  <input
                    type="text"
                    required
                    maxLength={80}
                    placeholder={copy.contact.namePlaceholder}
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                  />
                </label>
                <label>
                  <span>{copy.contact.emailLabel}</span>
                  <input
                    type="email"
                    required
                    maxLength={80}
                    placeholder={copy.contact.emailPlaceholder}
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                  />
                </label>
              </div>
              <label>
                <span>{copy.contact.messageLabel}</span>
                <textarea
                  rows={3}
                  required
                  maxLength={600}
                  placeholder={copy.contact.messagePlaceholder}
                  value={contactMsg}
                  onChange={(e) => setContactMsg(e.target.value)}
                />
              </label>
              <div className="transmission-form__actions">
                <button
                  type="submit"
                  className="btn btn--amber"
                  disabled={contactStatus === 'sending'}
                >
                  {contactStatus === 'sending'
                    ? copy.contact.submitSending
                    : copy.contact.submitIdle}
                </button>
                {contactStatus === 'sent' && (
                  <span className="transmission-form__ack">
                    {copy.contact.ackPrefix} {PROFILE.email}.
                  </span>
                )}
              </div>
            </form>

            <div className="faq-panel">
              <h3 className="transmission-form__title">{copy.contact.faqTitle}</h3>
              <div className="faq-list">
                {FAQS.map((faq, idx) => {
                  const isOpen = openFaqIndex === idx;
                  return (
                    <div key={faq.question.en} className="faq-item">
                      <button
                        type="button"
                        className="faq-item__q"
                        onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                        aria-expanded={isOpen}
                      >
                        <span>{pickText(locale, faq.question)}</span>
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
                      {isOpen && <p className="faq-item__a">{pickText(locale, faq.answer)}</p>}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="creds">
            <section aria-labelledby="education-title">
              <h3 id="education-title">{copy.contact.educationTitle}</h3>
              <ul>
                {EDUCATION.map((edu) => (
                  <li key={edu.institution}>
                    <strong>{pickText(locale, edu.degree)}</strong>
                    <span>{edu.institution}</span>
                    <span className="meta">
                      {pickText(locale, edu.period)} · {edu.location} —{' '}
                      {pickText(locale, edu.highlight)}
                    </span>
                  </li>
                ))}
              </ul>
            </section>

            <section aria-labelledby="certs-title">
              <h3 id="certs-title">{copy.contact.credentialsTitle}</h3>
              <ul>
                {CERTIFICATIONS.map((cert) => (
                  <li key={cert.issuer}>
                    <strong>{pickText(locale, cert.title)}</strong>
                    <span>
                      {cert.issuer} · {pickText(locale, cert.badge)}
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          </div>

          <p className="meta footer">{copy.contact.footerNote}</p>
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
