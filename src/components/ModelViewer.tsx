import { useEffect, useState, useRef } from 'react';
import { motion, useSpring } from 'motion/react';

export default function ModelViewer() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [rotX, setRotX] = useState(-20);
  const [rotY, setRotY] = useState(45);

  const dragStartX = useRef(0);
  const dragStartY = useRef(0);
  const startRotX = useRef(0);
  const startRotY = useRef(0);

  const springConfig = { damping: 40, stiffness: 200, mass: 1 };
  const rX = useSpring(rotX, springConfig);
  const rY = useSpring(rotY, springConfig);

  useEffect(() => {
    rX.set(rotX);
    rY.set(rotY);
  }, [rotX, rotY, rX, rY]);

  const handlePointerDown = (e: React.PointerEvent) => {
    setIsDragging(true);
    dragStartX.current = e.clientX;
    dragStartY.current = e.clientY;
    startRotX.current = rotX;
    startRotY.current = rotY;
    if (containerRef.current) {
      containerRef.current.setPointerCapture(e.pointerId);
    }
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    const deltaX = e.clientX - dragStartX.current;
    const deltaY = e.clientY - dragStartY.current;
    setRotY(startRotY.current + deltaX * 0.5);
    setRotX(startRotX.current - deltaY * 0.5);
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    setIsDragging(false);
    if (containerRef.current) {
      containerRef.current.releasePointerCapture(e.pointerId);
    }
  };

  useEffect(() => {
    if (isDragging) return;
    const interval = setInterval(() => {
      setRotY((y) => y + 0.2);
    }, 16);
    return () => clearInterval(interval);
  }, [isDragging]);

  return (
    <div className="flex flex-col items-center justify-center p-xl bg-canvas text-ink select-none overflow-hidden">
      <div
        ref={containerRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        className="relative w-viewer-size h-viewer-size flex items-center justify-center cursor-grab active:cursor-grabbing [perspective:1000px]"
        style={{ touchAction: 'none' }}
      >
        <motion.div
          style={{
            rotateX: rX,
            rotateY: rY,
            transformStyle: 'preserve-3d',
          }}
          className="relative w-40 h-40"
        >
          <div className="absolute inset-0 bg-primary/10 border border-primary/30 rounded-lg backdrop-blur-md flex items-center justify-center [transform:translateZ(80px)] shadow-product">
            <span className="text-body-strong text-primary">Front</span>
          </div>
          <div className="absolute inset-0 bg-primary/10 border border-primary/30 rounded-lg backdrop-blur-md flex items-center justify-center [transform:rotateY(180deg)_translateZ(80px)]">
            <span className="text-body-strong text-primary">Back</span>
          </div>
          <div className="absolute inset-0 bg-primary/10 border border-primary/30 rounded-lg backdrop-blur-md flex items-center justify-center [transform:rotateY(90deg)_translateZ(80px)]">
            <span className="text-body-strong text-primary">Right</span>
          </div>
          <div className="absolute inset-0 bg-primary/10 border border-primary/30 rounded-lg backdrop-blur-md flex items-center justify-center [transform:rotateY(-90deg)_translateZ(80px)]">
            <span className="text-body-strong text-primary">Left</span>
          </div>
          <div className="absolute inset-0 bg-primary/10 border border-primary/30 rounded-lg backdrop-blur-md flex items-center justify-center [transform:rotateX(90deg)_translateZ(80px)]">
            <span className="text-body-strong text-primary">Top</span>
          </div>
          <div className="absolute inset-0 bg-primary/10 border border-primary/30 rounded-lg backdrop-blur-md flex items-center justify-center [transform:rotateX(-90deg)_translateZ(80px)]">
            <span className="text-body-strong text-primary">Bottom</span>
          </div>
        </motion.div>
      </div>
      <p className="text-caption text-ink-muted-48 mt-sm">Drag to rotate the interactive design token</p>
    </div>
  );
}
