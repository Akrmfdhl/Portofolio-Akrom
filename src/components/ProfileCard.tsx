import { useEffect, useRef } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'motion/react';

export default function ProfileCard() {
  const cardRef = useRef<HTMLDivElement>(null);

  const rotateX = useMotionValue(0);
  const rotateY = useMotionValue(0);

  const springConfig = { damping: 30, stiffness: 300, mass: 0.6 };
  const rX = useSpring(rotateX, springConfig);
  const rY = useSpring(rotateY, springConfig);

  const glossX = useSpring(useTransform(rotateY, [-15, 15], [100, -100]), springConfig);
  const glossY = useSpring(useTransform(rotateX, [-15, 15], [100, -100]), springConfig);

  useEffect(() => {
    const card = cardRef.current;
    if (!card) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = card.getBoundingClientRect();
      const width = rect.width;
      const height = rect.height;
      const mouseX = e.clientX - rect.left - width / 2;
      const mouseY = e.clientY - rect.top - height / 2;

      const rotX = (mouseY / (height / 2)) * -15;
      const rotY = (mouseX / (width / 2)) * 15;

      rotateX.set(rotX);
      rotateY.set(rotY);
    };

    const handleMouseLeave = () => {
      rotateX.set(0);
      rotateY.set(0);
    };

    card.addEventListener('mousemove', handleMouseMove);
    card.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      card.removeEventListener('mousemove', handleMouseMove);
      card.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [rotateX, rotateY]);

  return (
    <div className="w-full py-md flex items-center justify-center [perspective:1000px] select-none">
      <motion.div
        ref={cardRef}
        style={{
          rotateX: rX,
          rotateY: rY,
          transformStyle: 'preserve-3d',
        }}
        className="w-full max-w-profile-w bg-surface-tile-2/45 border border-hairline/10 rounded-lg p-lg flex flex-col items-center gap-md shadow-product cursor-pointer relative overflow-hidden"
      >
        <div
          style={{
            transform: 'translateZ(60px)',
            transformStyle: 'preserve-3d',
          }}
          className="w-32 h-32 rounded-full overflow-hidden border border-hairline bg-surface-tile-1"
        >
          <img
            src="/src/assets/FOTO CV.jpeg"
            alt="Akrom Fadhil M."
            className="w-full h-full object-cover select-none"
          />
        </div>

        <div
          style={{ transform: 'translateZ(40px)' }}
          className="text-center flex flex-col gap-xxs"
        >
          <h3 className="text-body-strong text-body-on-dark font-semibold">Akrom Fadhil M.</h3>
          <p className="text-caption text-primary font-medium">Software Engineer</p>
        </div>

        <p
          style={{ transform: 'translateZ(30px)' }}
          className="text-caption text-body-muted text-center leading-relaxed max-w-profile-inner-w"
        >
          Computer Science student passionate about building simple, useful, and thoughtful digital solutions.
        </p>

        <motion.div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `radial-gradient(circle 100px at calc(50% + ${glossX}px) calc(50% + ${glossY}px), rgba(255, 255, 255, 0.15), transparent)`,
          }}
        />
      </motion.div>
    </div>
  );
}
