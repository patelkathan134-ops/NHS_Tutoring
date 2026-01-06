import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import TutorLogin from './pages/TutorLogin';
import TutorDashboard from './pages/TutorDashboard';
import StudentPortal from './pages/StudentPortal';

function App() {
  return (
    <BrowserRouter>
      {/* 
        We are removing the global header to allow each page 
        to control its own layout (Landing Page needs full screen, etc.) 
      */}
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/tutor-login" element={<TutorLogin />} />
        <Route path="/tutor-dashboard" element={<TutorDashboard />} />
        <Route path="/student" element={<StudentPortal />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
