import { useEffect, useRef } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'motion/react';
import { projects } from '../data/projects';

export default function FlyingPosters() {
  const containerRef = useRef<HTMLDivElement>(null);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { damping: 50, stiffness: 200, mass: 1 };
  const rotateX = useSpring(useTransform(mouseY, [-300, 300], [15, -15]), springConfig);
  const rotateY = useSpring(useTransform(mouseX, [-300, 300], [-15, 15]), springConfig);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      mouseX.set(x);
      mouseY.set(y);
    };

    const handleMouseLeave = () => {
      mouseX.set(0);
      mouseY.set(0);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [mouseX, mouseY]);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-[60vh] flex items-center justify-center overflow-hidden bg-surface-tile-1 py-section select-none [perspective:1200px]"
    >
      <motion.div
        style={{
          rotateX,
          rotateY,
          transformStyle: 'preserve-3d',
        }}
        className="relative w-full h-full max-w-content-text flex items-center justify-center"
      >
        {projects.map((project, index) => {
          const offsets = [
            { x: '-15%', y: '-20%', z: '50px', rotate: '-5deg' },
            { x: '20%', y: '-15%', z: '150px', rotate: '8deg' },
            { x: '-25%', y: '15%', z: '100px', rotate: '-10deg' },
            { x: '15%', y: '25%', z: '200px', rotate: '5deg' },
          ];
          const pos = offsets[index % offsets.length];

          return (
            <motion.div
              key={project.slug}
              whileHover={{ scale: 1.08, z: '250px', transition: { duration: 0.3 } }}
              className="absolute w-poster-w h-poster-h rounded-lg border border-hairline/20 overflow-hidden shadow-product cursor-pointer bg-surface-tile-2"
              style={{
                left: `calc(50% + ${pos.x})`,
                top: `calc(50% + ${pos.y})`,
                transform: `translate(-50%, -50%) translateZ(${pos.z}) rotate(${pos.rotate})`,
              }}
            >
              <img
                src={project.screenshotUrl}
                alt={project.name}
                className="w-full h-full object-cover rounded-lg"
              />
              <div className="absolute inset-0 bg-surface-black/40 flex flex-col justify-end p-xs opacity-0 hover:opacity-100 transition-opacity">
                <span className="text-caption-strong text-body-on-dark">{project.name}</span>
                <span className="text-fine-print text-body-muted">{project.role}</span>
              </div>
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
}
