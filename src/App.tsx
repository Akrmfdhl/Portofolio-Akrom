import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { initLenis } from './utils/lenis';
import Nav from './components/Nav';
import Footer from './components/Footer';
import Landing from './pages/Landing';
import ProjectDetail from './pages/ProjectDetail';
import ScrollToHash from './components/ScrollToHash';

function App() {
  useEffect(() => {
    initLenis();
  }, []);

  return (
    <Router>
      <ScrollToHash />
      <div className="flex flex-col min-h-screen bg-canvas text-ink selection:bg-primary selection:text-on-primary">
        <Nav />
        <main className="flex-grow pt-nav">
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/projects/:slug" element={<ProjectDetail />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
