import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { getLenis } from '../utils/lenis';

export default function ScrollToHash() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    const lenis = getLenis();

    if (hash) {
      const cleanHash = hash.replace('#', '');
      const target = document.getElementById(cleanHash);
      if (target) {
        const timer = setTimeout(() => {
          if (lenis) {
            lenis.scrollTo(target);
          } else {
            target.scrollIntoView({ behavior: 'smooth' });
          }
        }, 100);
        return () => clearTimeout(timer);
      }
    } else {
      if (lenis) {
        lenis.scrollTo(0, { immediate: true });
      } else {
        window.scrollTo(0, 0);
      }
    }
  }, [pathname, hash]);

  return null;
}
