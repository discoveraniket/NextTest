import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ExamProvider } from './context/ExamContext';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { InstructionsPage } from './pages/InstructionsPage';
import { ExamTerminal } from './pages/ExamTerminal';

function App() {
  return (
    <BrowserRouter>
      <ExamProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/instructions/:id" element={<InstructionsPage />} />
          <Route path="/exam/:id" element={<ExamTerminal />} />
          {/* Default redirect to login */}
          <Route path="/" element={<Navigate to="/login" replace />} />
        </Routes>
      </ExamProvider>
    </BrowserRouter>
  );
}

export default App;
