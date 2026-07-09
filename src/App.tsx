import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { initLenis } from './utils/lenis';
import Nav from './components/Nav';
import Footer from './components/Footer';
import Landing from './pages/Landing';

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
            <Route path="/" element={<Landing />} />
            <Route path="/projects/:slug" element={<div>Project Detail Placeholder</div>} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
