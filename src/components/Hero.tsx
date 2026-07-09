import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import GridScan from './backgrounds/GridScan';
import fotoCv from '../assets/FOTO CV.jpeg';
import catatCrypto from '../assets/catat-crypto.png';

export default function Hero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const titleCharsRef = useRef<HTMLSpanElement[]>([]);
  const subCharsRef = useRef<HTMLSpanElement[]>([]);
  const leadRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const phoneRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power4.out' } });

      // Animate split title letters
      tl.fromTo(
        titleCharsRef.current,
        { yPercent: 100 },
        { yPercent: 0, duration: 1.0, stagger: 0.04, delay: 0.1 }
      )
      // Animate subtitle letters
      .fromTo(
        subCharsRef.current,
        { yPercent: 100 },
        { yPercent: 0, duration: 0.8, stagger: 0.02 },
        '-=0.6'
      )
      // Animate lead paragraph
      .fromTo(
        leadRef.current,
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8 },
        '-=0.5'
      )
      // Animate buttons
      .fromTo(
        ctaRef.current,
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8 },
        '-=0.6'
      )
      // Animate floating phone entry
      .fromTo(
        phoneRef.current,
        { scale: 0.8, opacity: 0, y: 50 },
        { scale: 1, opacity: 1, y: 0, duration: 1.2 },
        '-=1.2'
      );

      // Continuous float animation for phone mockup
      gsap.to(phoneRef.current, {
        y: -15,
        duration: 3,
        yoyo: true,
        repeat: -1,
        ease: 'sine.inOut',
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  const nameStr = "Akrom Fadhil M.";
  const roleStr = "Software Engineer";

  return (
    <section
      ref={containerRef}
      className="bg-surface-tile-1 text-on-dark flex flex-col justify-center items-center px-lg py-section min-h-screen relative overflow-hidden w-full select-none"
    >
      <GridScan
        sensitivity={0.55}
        lineThickness={1}
        linesColor="rgb(47, 41, 58)"
        gridScale={0.1}
        scanColor="rgb(255, 159, 252)"
        scanOpacity={0.4}
        bloomIntensity={0.6}
        noiseIntensity={0.01}
      />

      <div className="max-w-content-max mx-auto grid grid-cols-1 lg:grid-cols-12 gap-xl items-center relative z-10 w-full">
        {/* Left Column - Typographic Text Reveal */}
        <div className="flex flex-col gap-lg lg:col-span-7 items-start text-left">
          <h1 className="text-hero-display text-body-on-dark flex flex-col gap-xxs">
            {/* Split Name */}
            <span className="inline-block overflow-hidden h-20">
              {nameStr.split('').map((char, index) => (
                <span
                  key={index}
                  ref={(el) => {
                    if (el) titleCharsRef.current[index] = el;
                  }}
                  className="inline-block transform origin-bottom"
                >
                  {char === ' ' ? '\u00A0' : char}
                </span>
              ))}
            </span>
            {/* Split Subtitle */}
            <span className="inline-block overflow-hidden h-8 text-primary-on-dark text-caption-strong tracking-wide">
              {roleStr.split('').map((char, index) => (
                <span
                  key={index}
                  ref={(el) => {
                    if (el) subCharsRef.current[index] = el;
                  }}
                  className="inline-block transform origin-bottom"
                >
                  {char === ' ' ? '\u00A0' : char}
                </span>
              ))}
            </span>
          </h1>

          <p
            ref={leadRef}
            className="text-lead text-body-muted max-w-content-hero leading-relaxed opacity-0"
          >
            Computer Science student passionate about software development, IT, and problem-solving. Interested in building simple, useful, and thoughtful digital solutions.
          </p>

          <div
            ref={ctaRef}
            className="flex flex-row gap-md mt-sm opacity-0"
          >
            <a
              href="#projects"
              className="bg-primary text-on-primary text-body rounded-pill px-lg py-sm transition-all hover:opacity-90 active:scale-95 font-semibold"
            >
              View Projects
            </a>
            <a
              href="#contact"
              className="bg-transparent border border-primary text-primary text-body rounded-pill px-lg py-sm transition-all hover:bg-primary/10 active:scale-95 font-semibold"
            >
              Contact Me
            </a>
          </div>
        </div>

        {/* Right Column - Premium Glassmorphic Phone Showcase */}
        <div className="lg:col-span-5 flex justify-center items-center w-full">
          <div
            ref={phoneRef}
            className="border-4 border-hairline/10 bg-surface-black/75 backdrop-blur-2xl p-sm shadow-product flex flex-col justify-between overflow-hidden relative opacity-0"
            style={{
              width: 270,
              height: 540,
              borderRadius: 42,
              boxShadow: '0 0 40px rgba(0, 210, 255, 0.12)',
            }}
          >
            {/* Device Notch */}
            <div className="w-20 h-4 bg-surface-black rounded-full mx-auto mb-xs relative z-20 flex items-center justify-center">
              <div className="w-2.5 h-2.5 bg-primary/20 rounded-full animate-ping" />
            </div>

            {/* Inner Dashboard Widget */}
            <div className="flex-1 flex flex-col justify-between py-xs relative z-10 text-center overflow-hidden">
              {/* Mini Header */}
              <div className="flex justify-between items-center px-xs py-xxs bg-surface-tile-2/60 border border-hairline/5 backdrop-blur-md rounded-md select-none mx-xxs">
                <div className="flex items-center gap-xs">
                  <span className="font-bold text-body-on-dark tracking-wide font-apple-text" style={{ fontSize: 9 }}>akrom.dev</span>
                </div>
                <div className="flex gap-xs items-center">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                  <span className="text-body-muted font-apple-text" style={{ fontSize: 8 }}>Online</span>
                </div>
              </div>

              {/* Dribbble Style Portfolio UI Body */}
              <div className="flex-1 flex flex-col gap-xxs items-center px-xxs my-xxs overflow-y-auto scrollbar-none">
                
                {/* Large Rectangular Portrait Photo */}
                <div className="w-32 h-36 rounded-md overflow-hidden relative border border-hairline/10 bg-surface-tile-1 shadow-sm mt-xxs">
                  <img src={fotoCv} alt="" className="w-full h-full object-cover select-none" />
                  <div className="absolute inset-0 bg-gradient-to-t from-surface-black/60 via-transparent to-transparent pointer-events-none" />
                </div>

                {/* Name & Role */}
                <div className="flex flex-col gap-none mt-xs">
                  <span className="font-extrabold text-body-on-dark leading-none" style={{ fontSize: 13 }}>Akrom Fadhil M.</span>
                  <span className="text-primary font-semibold leading-none mt-xxs" style={{ fontSize: 9 }}>Software Engineer · Tangerang</span>
                </div>

                {/* Micro Testimonial / Intro */}
                <p className="text-body-muted leading-relaxed mt-xxs text-center px-xs" style={{ fontSize: 8 }}>
                  I am a Computer Science student passionate about software engineering, building simple, useful, and thoughtful digital solutions while continuously improving technical skills.
                </p>

                {/* Metrics Blocks */}
                <div className="grid grid-cols-3 gap-xxs w-full mt-xs">
                  <div className="bg-surface-tile-2/65 border border-hairline/5 p-xxs rounded flex flex-col items-center">
                    <span className="text-body-muted font-apple-text" style={{ fontSize: 6 }}>Projects</span>
                    <span className="text-body-on-dark font-bold mt-xxs" style={{ fontSize: 9 }}>4 Major</span>
                  </div>
                  <div className="bg-surface-tile-2/65 border border-hairline/5 p-xxs rounded flex flex-col items-center">
                    <span className="text-body-muted font-apple-text" style={{ fontSize: 6 }}>Rating</span>
                    <span className="text-primary font-bold mt-xxs" style={{ fontSize: 9 }}>5.0 ★</span>
                  </div>
                  <div className="bg-surface-tile-2/65 border border-hairline/5 p-xxs rounded flex flex-col items-center">
                    <span className="text-body-muted font-apple-text" style={{ fontSize: 6 }}>Intern</span>
                    <span className="text-body-on-dark font-bold mt-xxs" style={{ fontSize: 9 }}>2 Roles</span>
                  </div>
                </div>

                {/* Featured Project Showcase Card (Catat Crypto) */}
                <div className="w-full bg-surface-tile-2/80 border border-hairline/5 rounded-md p-xs flex gap-xs items-center justify-between mt-xs shadow-md select-none text-left">
                  <div className="flex flex-col gap-xxs">
                    <span className="font-bold text-body-on-dark" style={{ fontSize: 8 }}>Catat Crypto</span>
                    <span className="text-primary font-bold" style={{ fontSize: 6 }}>PRODUCTION READY</span>
                  </div>
                  <div className="w-10 h-7 bg-surface-tile-1 border border-hairline/10 rounded overflow-hidden flex-shrink-0">
                    <img src={catatCrypto} alt="" className="w-full h-full object-cover" />
                  </div>
                </div>

                {/* Large Action Buttons */}
                <div className="flex gap-xxs w-full mt-xs mb-xxs">
                  <a href="#contact" className="bg-primary text-on-primary font-bold py-1.5 rounded-pill flex-1 text-center transition-all hover:opacity-90 active:scale-95 cursor-pointer" style={{ fontSize: 8 }}>
                    Hire now
                  </a>
                  <a href="#projects" className="bg-surface-tile-2/70 border border-hairline/15 text-body-on-dark font-medium py-1.5 rounded-pill flex-1 text-center transition-all hover:bg-surface-tile-2 active:scale-95 cursor-pointer" style={{ fontSize: 8 }}>
                    View Projects
                  </a>
                </div>

              </div>
            </div>

            {/* Bottom Home Indicator */}
            <div className="w-24 h-1 bg-body-on-dark/30 rounded-full mx-auto mt-xs relative z-20" />

            {/* Linear gradient definition */}
            <svg className="w-0 h-0 absolute">
              <defs>
                <linearGradient id="heroPhoneGlow" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="rgb(0, 210, 255)" />
                  <stop offset="100%" stopColor="rgb(255, 159, 252)" />
                </linearGradient>
              </defs>
            </svg>
          </div>
        </div>
      </div>
    </section>
  );
}
