import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from './store/hooks';
import { loadDocuments } from './store/documentsSlice';
import AppLayout from './layouts/AppLayout';
import DashboardPage from './pages/DashboardPage';
import SpreadsheetPage from './pages/SpreadsheetPage';
import ProfilePage from './pages/ProfilePage';
import NotFoundPage from './pages/NotFoundPage';

function App() {
  const dispatch = useAppDispatch();
  const loading = useAppSelector((state) => state.documents.loading);
  const docs = useAppSelector((state) => state.documents.list);

  useEffect(() => {
    dispatch(loadDocuments());
  }, [dispatch]);

  // показываем загрузку только если нет документов и идет загрузка
  if (loading && docs.length === 0) {
    return (
      <div className="min-h-screen bg-[#0b0e11] font-sans flex items-center justify-center">
        <div className="text-white text-xl">Загрузка...</div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route element={<AppLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/documents/:documentId" element={<SpreadsheetPage />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Route>
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;