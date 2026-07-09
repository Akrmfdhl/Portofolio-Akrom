import { useRef } from 'react';
import { motion, useMotionValue, useSpring, useTransform, MotionValue } from 'motion/react';

interface DockItemProps {
  mouseX: MotionValue<number>;
  label: string;
  href: string;
  icon: string;
}

function DockItem({ mouseX, label, href, icon }: DockItemProps) {
  const ref = useRef<HTMLAnchorElement>(null);

  const distance = useTransform(mouseX, (val) => {
    const bounds = ref.current?.getBoundingClientRect() ?? { x: 0, width: 0 };
    return val - bounds.x - bounds.width / 2;
  });

  const widthTransform = useTransform(distance, [-150, 0, 150], [44, 72, 44]);
  const heightTransform = useTransform(distance, [-150, 0, 150], [44, 72, 44]);

  const width = useSpring(widthTransform, { mass: 0.1, stiffness: 150, damping: 12 });
  const height = useSpring(heightTransform, { mass: 0.1, stiffness: 150, damping: 12 });

  return (
    <motion.a
      ref={ref}
      href={href}
      style={{ width, height }}
      className="flex items-center justify-center rounded-full bg-canvas border border-hairline/30 backdrop-blur-md transition-all hover:bg-canvas-parchment relative group"
    >
      <span className="text-body-strong font-apple-text">{icon}</span>
      <span className="absolute bottom-16 bg-surface-black text-on-dark text-caption px-xs py-xxs rounded-sm opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap border border-hairline/10">
        {label}
      </span>
    </motion.a>
  );
}

export default function Dock() {
  const mouseX = useMotionValue(Infinity);

  const handleMouseMove = (e: React.MouseEvent) => mouseX.set(e.clientX);
  const handleMouseLeave = () => mouseX.set(Infinity);

  return (
    <div className="fixed bottom-lg left-1/2 -translate-x-1/2 z-40 hidden nav-collapse:block pointer-events-none">
      <motion.div
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="mx-auto flex h-nav items-end gap-sm bg-canvas-parchment/60 backdrop-blur-lg border border-hairline/20 px-sm py-xxs rounded-pill pointer-events-auto shadow-product select-none"
        style={{ height: 'auto' }}
      >
        <DockItem
          mouseX={mouseX}
          label="Home"
          href="/#"
          icon="􀎟"
        />
        <DockItem
          mouseX={mouseX}
          label="About"
          href="/#about"
          icon="􀉩"
        />
        <DockItem
          mouseX={mouseX}
          label="Projects"
          href="/#projects"
          icon="􀓔"
        />
        <DockItem
          mouseX={mouseX}
          label="Contact"
          href="/#contact"
          icon="􀍕"
        />
        <div className="w-px h-8 bg-hairline/30 self-center" />
        <DockItem
          mouseX={mouseX}
          label="GitHub"
          href="https://github.com/Akrmfdhl"
          icon="􀳾"
        />
        <DockItem
          mouseX={mouseX}
          label="LinkedIn"
          href="https://linkedin.com/in/akrom"
          icon="􀳿"
        />
      </motion.div>
    </div>
  );
}
