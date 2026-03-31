import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ExamProvider } from './context/ExamContext';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { InstructionsPage } from './pages/InstructionsPage';
import { ExamTerminal } from './pages/ExamTerminal';

import { PracticeProvider } from './context/PracticeContext';
import { PracticeLibrary } from './pages/PracticeLibrary';
import { PracticeTerminal } from './pages/PracticeTerminal';
import { ExamPortal } from './pages/ExamPortal';
import { ThemeProvider } from './context/ThemeContext';

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <ExamProvider>
          <PracticeProvider>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/exams" element={<ExamPortal />} />
            <Route path="/instructions/:id" element={<InstructionsPage />} />
            <Route path="/exam/:id" element={<ExamTerminal />} />
            
            {/* Practice Routes */}
            <Route path="/practice" element={<PracticeLibrary />} />
            <Route path="/practice/terminal" element={<PracticeTerminal />} />

            {/* Default redirect to login */}
            <Route path="/" element={<Navigate to="/login" replace />} />
          </Routes>
        </PracticeProvider>
      </ExamProvider>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
