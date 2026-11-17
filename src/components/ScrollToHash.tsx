import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export default function ScrollToHash() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (hash) {
      const cleanHash = hash.replace(/^#/, '');
      const target = document.getElementById(cleanHash);
      if (target) {
        const timer = window.setTimeout(() => {
          target.scrollIntoView({ behavior: 'smooth' });
        }, 100);
        return () => window.clearTimeout(timer);
      }
    } else {
      window.scrollTo(0, 0);
    }
  }, [pathname, hash]);

  return null;
}
