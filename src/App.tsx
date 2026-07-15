import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { initLenis } from './utils/lenis';
import Nav from './components/Nav';
import Footer from './components/Footer';
import Landing from './pages/Landing';
import ProjectDetail from './pages/ProjectDetail';
import ScrollToHash from './components/ScrollToHash';
import GooeyNav from './components/GooeyNav';
import ResumeModal from './components/ResumeModal';
import Preloader from './components/Preloader';

function App() {
  const [isResumeOpen, setIsResumeOpen] = useState(false);
  const [isPreloading, setIsPreloading] = useState(true);

  useEffect(() => {
    initLenis();
  }, []);

  return (
    <Router>
      <ScrollToHash />
      <GooeyNav />
      {isPreloading ? (
        <Preloader onComplete={() => setIsPreloading(false)} />
      ) : (
        <div className="flex flex-col min-h-screen bg-canvas text-ink selection:bg-primary selection:text-on-primary">
          <Nav onOpenResume={() => setIsResumeOpen(true)} />
          <main className="flex-grow">
            <Routes>
              <Route path="/" element={<Landing onOpenResume={() => setIsResumeOpen(true)} />} />
              <Route path="/projects/:slug" element={<ProjectDetail />} />
            </Routes>
          </main>
          <Footer onOpenResume={() => setIsResumeOpen(true)} />
        </div>
      )}
      <ResumeModal isOpen={isResumeOpen} onClose={() => setIsResumeOpen(false)} />
    </Router>
  );
}

export default App;
