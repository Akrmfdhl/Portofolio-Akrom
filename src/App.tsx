import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { initLenis } from './utils/lenis';
import Nav from './components/Nav';
import Footer from './components/Footer';

function App() {
  useEffect(() => {
    initLenis();
  }, []);

  return (
    <Router>
      <div className="flex flex-col min-h-screen bg-canvas text-ink selection:bg-primary selection:text-on-primary">
        <Nav />
        <main className="flex-grow pt-nav">
          <Routes>
            <Route path="/" element={<div className="h-[200vh]">Landing Page Placeholder</div>} />
            <Route path="/projects/:slug" element={<div>Project Detail Placeholder</div>} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
