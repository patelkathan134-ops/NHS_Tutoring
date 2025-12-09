import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import TutorLogin from './pages/TutorLogin';
import TutorDashboard from './pages/TutorDashboard';
import StudentPortal from './pages/StudentPortal';

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen font-sans text-gray-900 bg-gray-50">
        <header className="bg-school-navy text-white p-4 shadow-md">
          <div className="container mx-auto flex justify-between items-center">
            <h1 className="text-xl font-bold tracking-tight">NHS Tutoring Club</h1>
          </div>
        </header>

        <main className="container mx-auto p-4 py-8">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/tutor-login" element={<TutorLogin />} />
            <Route path="/tutor-dashboard" element={<TutorDashboard />} />
            <Route path="/student-portal" element={<StudentPortal />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
