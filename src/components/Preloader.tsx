import { useEffect, useState } from 'react';
import { motion } from 'motion/react';

interface PreloaderProps {
  onComplete: () => void;
}

export default function Preloader({ onComplete }: PreloaderProps) {
  const [progress, setProgress] = useState(0);
  const [isDone, setIsDone] = useState(false);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setProgress(100);
      setIsDone(true);
      setTimeout(onComplete, 100);
      return;
    }

    const duration = 1800;
    const intervalTime = 20;
    const step = 100 / (duration / intervalTime);

    const timer = setInterval(() => {
      setProgress((prev) => {
        const next = prev + step;
        if (next >= 100) {
          clearInterval(timer);
          setIsDone(true);
          return 100;
        }
        return next;
      });
    }, intervalTime);

    return () => clearInterval(timer);
  }, [onComplete]);

  return (
    <motion.div
      initial={{ clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)' }}
      animate={isDone ? { clipPath: 'polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)' } : {}}
      transition={{ duration: 0.8, ease: [0.76, 0, 0.24, 1], delay: 0.8 }}
      onAnimationComplete={(definition) => {
        if (typeof definition === 'object' && definition !== null && 'clipPath' in definition) {
          onComplete();
        }
      }}
      className="fixed inset-0 z-50 flex flex-col justify-center items-center bg-canvas select-none"
    >
      <div className="w-80 flex flex-col items-center gap-md">
        <div className="overflow-hidden relative h-16 w-full flex flex-col items-center justify-center">
          <motion.div
            initial={{ clipPath: 'polygon(0 100%, 100% 100%, 100% 100%, 0 100%)' }}
            animate={{ clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 100%)' }}
            transition={{ duration: 1.0, ease: 'easeOut', delay: 0.2 }}
            className="text-center"
          >
            <h1 className="text-display-md font-extrabold tracking-tight text-white leading-none font-apple-display">
              Akrom Fadhil
            </h1>
            <p className="text-caption-strong text-primary tracking-widest uppercase mt-xxs">
              Fullstack Developer
            </p>
          </motion.div>
        </div>

        <div className="w-full h-0.5 bg-white/10 rounded-full overflow-hidden mt-sm relative">
          <motion.div
            className="h-full bg-primary"
            style={{ width: `${progress}%` }}
            transition={{ ease: 'easeOut' }}
          />
        </div>

        <div className="text-caption text-body-muted font-mono self-end">
          {Math.floor(progress)}%
        </div>
      </div>
    </motion.div>
  );
}
