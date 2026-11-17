import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Landing from './pages/Landing';
import ProjectDetail from './pages/ProjectDetail';
import ScrollToHash from './components/ScrollToHash';
import ResumeModal from './components/ResumeModal';

function App() {
  const [isResumeOpen, setIsResumeOpen] = useState(false);

  return (
    <Router>
      <ScrollToHash />
      <Routes>
        <Route path="/" element={<Landing onOpenResume={() => setIsResumeOpen(true)} />} />
        <Route path="/projects/:slug" element={<ProjectDetail />} />
      </Routes>
      <ResumeModal isOpen={isResumeOpen} onClose={() => setIsResumeOpen(false)} />
    </Router>
  );
}

export default App;
