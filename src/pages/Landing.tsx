import { useEffect } from 'react';
import Hero from '../components/Hero';
import About from '../components/About';
import Projects from '../components/Projects';
import Contact from '../components/Contact';
import FAQ from '../components/FAQ';

interface LandingProps {
  onOpenResume: () => void;
}

export default function Landing({ onOpenResume }: LandingProps) {
  useEffect(() => {
    document.title = 'Akrom Fadhil M. | Software Engineer';
  }, []);

  return (
    <div className="flex flex-col w-full relative">
      <div className="grid-overlay" />
      <Hero />
      <About />
      <Projects />
      <FAQ />
      <Contact onOpenResume={onOpenResume} />
    </div>
  );
}
