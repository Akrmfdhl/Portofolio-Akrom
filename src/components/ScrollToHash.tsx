import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { getLenis } from '../utils/lenis';

export default function ScrollToHash() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (hash) {
      const target = document.querySelector(hash) as HTMLElement | null;
      if (target) {
        const timer = setTimeout(() => {
          const lenis = getLenis();
          if (lenis) {
            lenis.scrollTo(target);
          } else {
            target.scrollIntoView({ behavior: 'smooth' });
          }
        }, 100);
        return () => clearTimeout(timer);
      }
    } else {
      const lenis = getLenis();
      if (lenis) {
        lenis.scrollTo(0, { immediate: true });
      } else {
        window.scrollTo(0, 0);
      }
    }
  }, [pathname, hash]);

  return null;
}
