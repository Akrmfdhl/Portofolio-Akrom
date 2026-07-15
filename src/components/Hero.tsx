import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'motion/react';
import GridScan from './backgrounds/GridScan';
import fotoCv from '../assets/FOTO CV.jpeg';

export default function Hero() {
  const containerRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  });

  const photoScale = useTransform(scrollYProgress, [0, 0.25, 0.5, 0.75, 1], [1, 0.9, 0.95, 0.85, 0.8]);
  const photoRotateY = useTransform(scrollYProgress, [0, 0.25, 0.5, 0.75, 1], [-15, 10, -10, 5, 0]);
  const photoRotateX = useTransform(scrollYProgress, [0, 0.25, 0.5, 0.75, 1], [5, -5, 5, -5, 0]);
  const photoX = useTransform(
    scrollYProgress,
    [0, 0.2, 0.28, 0.48, 0.55, 0.75, 0.82, 1],
    ['0%', '0%', '20%', '20%', '-20%', '-20%', '0%', '0%']
  );
  const photoOpacity = useTransform(scrollYProgress, [0, 0.85, 0.95], [1, 1, 0.4]);

  const text1Opacity = useTransform(scrollYProgress, [0, 0.15, 0.22], [1, 1, 0]);
  const text1Y = useTransform(scrollYProgress, [0, 0.22], [0, -60]);
  const text1Scale = useTransform(scrollYProgress, [0, 0.22], [1, 0.9]);

  const text2Opacity = useTransform(scrollYProgress, [0.22, 0.28, 0.45, 0.5], [0, 1, 1, 0]);
  const text2Y = useTransform(scrollYProgress, [0.22, 0.28, 0.45, 0.5], [60, 0, 0, -60]);

  const text3Opacity = useTransform(scrollYProgress, [0.5, 0.55, 0.75, 0.8], [0, 1, 1, 0]);
  const text3Y = useTransform(scrollYProgress, [0.5, 0.55, 0.75, 0.8], [60, 0, 0, -60]);

  const text4Opacity = useTransform(scrollYProgress, [0.8, 0.85, 1.0], [0, 1, 1]);
  const text4Y = useTransform(scrollYProgress, [0.8, 0.85], [60, 0]);
  const text4Scale = useTransform(scrollYProgress, [0.8, 0.85], [0.95, 1]);

  return (
    <section ref={containerRef} className="relative h-[450vh] w-full select-none bg-canvas">
      <div className="sticky top-0 h-screen w-full overflow-hidden flex items-center justify-center bg-gradient-to-b from-neutral-800/20 to-canvas">
        <GridScan
          sensitivity={0.55}
          lineThickness={1}
          linesColor="rgb(47, 41, 58)"
          gridScale={0.1}
          scanColor="rgb(245, 158, 11)"
          scanOpacity={0.25}
          bloomIntensity={0.6}
          noiseIntensity={0.01}
        />

        <div className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none perspective-[1200px]">
          <motion.div
            style={{
              scale: photoScale,
              rotateY: photoRotateY,
              rotateX: photoRotateX,
              x: photoX,
              opacity: photoOpacity,
              boxShadow: '0 0 50px rgba(245, 158, 11, 0.25)',
            }}
            className="w-[240px] h-[310px] sm:w-[280px] sm:h-[360px] md:w-[320px] md:h-[400px] lg:w-[360px] lg:h-[450px] rounded-[24px] border border-primary/20 overflow-hidden relative"
          >
            <img src={fotoCv} alt="Akrom Fadhil" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-canvas/40 via-transparent to-transparent" />
          </motion.div>
        </div>

        <div className="absolute inset-0 z-10 max-w-content-max mx-auto px-lg flex flex-col justify-center items-center pointer-events-none">
          <motion.div
            style={{ opacity: text1Opacity, y: text1Y, scale: text1Scale }}
            className="flex flex-col items-center text-center gap-xxs"
          >
            <h1 className="text-hero-display text-white">Akrom Fadhil</h1>
            <p className="text-lead text-primary mt-xxs font-semibold">Fullstack Developer</p>
          </motion.div>

          <motion.div
            style={{ opacity: text2Opacity, y: text2Y }}
            className="absolute left-1/2 -translate-x-1/2 w-[90vw] sm:w-[80vw] lg:w-[400px] xl:w-[480px] text-center lg:left-24 lg:translate-x-0 lg:text-left flex flex-col gap-xs sm:gap-sm items-center lg:items-start justify-center"
          >
            <h2 className="text-3xl sm:text-4xl lg:text-display-lg text-white font-extrabold leading-tight">
              Building systems that scale.
            </h2>
            <p className="text-lg sm:text-xl lg:text-lead-airy text-body-muted">
              Hands-on experience across frontend, backend, and infrastructure frameworks.
            </p>
          </motion.div>

          <motion.div
            style={{ opacity: text3Opacity, y: text3Y }}
            className="absolute left-1/2 -translate-x-1/2 w-[90vw] sm:w-[80vw] lg:w-[400px] xl:w-[480px] text-center lg:left-auto lg:right-24 lg:translate-x-0 lg:text-right flex flex-col gap-xs sm:gap-sm items-center lg:items-end justify-center"
          >
            <h2 className="text-3xl sm:text-4xl lg:text-display-lg text-white font-extrabold leading-tight">
              Logic is how it feels.
            </h2>
            <p className="text-lg sm:text-xl lg:text-lead-airy text-body-muted">
              Engineering performance-focused solutions and multi-agent AI systems.
            </p>
          </motion.div>

          <motion.div
            style={{ opacity: text4Opacity, y: text4Y, scale: text4Scale }}
            className="flex flex-col items-center text-center gap-md pointer-events-auto"
          >
            <h2 className="text-3xl sm:text-4xl lg:text-display-lg text-white max-w-2xl leading-tight">
              Let's build something worth remembering.
            </h2>
            <a
              href="https://wa.me/6281234567890"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-primary text-on-primary text-body rounded-pill px-xl py-sm hover:opacity-90 active:scale-95 transition-all font-bold tracking-wide shadow-lg shadow-primary/20"
            >
              Get In Touch
            </a>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
