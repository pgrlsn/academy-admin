import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import VideoListPage from './pages/videos/VideoListPage';
import VideoFormPage from './pages/videos/VideoFormPage';
import QuizBuilderPage from './pages/quiz/QuizBuilderPage';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/videos"
            element={
              <ProtectedRoute>
                <VideoListPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/videos/new"
            element={
              <ProtectedRoute>
                <VideoFormPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/videos/:id/edit"
            element={
              <ProtectedRoute>
                <VideoFormPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/videos/:videoId/quiz"
            element={
              <ProtectedRoute>
                <QuizBuilderPage />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
