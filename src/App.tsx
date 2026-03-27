import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import GaskaTapePage from './pages/GaskaTapePage';
import ProfessorPortal from './pages/ProfessorPortal';
import ProfessorDashboard from './pages/ProfessorDashboard';
import QuestionEditor from './pages/QuestionEditor';
import { CaseProvider } from './context/CaseContext';
import { AuthProvider } from './context/AuthContext';

export default function App() {
  return (
    <AuthProvider>
      <CaseProvider>
        <Router>
          <div className="min-h-screen bg-gray-200 font-sans text-[#333333] flex flex-col">
            <div className="flex-grow w-full">
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/case-study/gaska-tape" element={<GaskaTapePage />} />
                <Route path="/professor-portal" element={<ProfessorPortal />} />
                <Route path="/professor-dashboard" element={<ProfessorDashboard />} />
                <Route path="/question-editor" element={<QuestionEditor />} />
              </Routes>
            </div>
          </div>
        </Router>
      </CaseProvider>
    </AuthProvider>
  );
}
