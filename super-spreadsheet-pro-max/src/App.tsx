import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from './store/hooks';
import { setActiveDocId, loadDocuments } from './store/documentsSlice';
import Dashboard from './Dashboard';
import Spreadsheet from './Spreadsheet';

function App() {
  const dispatch = useAppDispatch();
  const activeDocId = useAppSelector((state) => state.documents.activeDocId);
  const loading = useAppSelector((state) => state.documents.loading);

  useEffect(() => {
    dispatch(loadDocuments());
  }, [dispatch]);

  // показываем загрузку пока документы не загрузились
  if (loading) {
    return (
      <div className="min-h-screen bg-[#0b0e11] font-sans flex items-center justify-center">
        <div className="text-white text-xl">Загрузка...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0b0e11] font-sans selection:bg-blue-500/30">
      {activeDocId ? (
        // условие: если айди есть то выполняем
        <div className="relative h-screen flex flex-col">
          {/* Кнопка возврата к списку документов */}
          <button
            onClick={() => dispatch(setActiveDocId(null))}
            className="fixed bottom-6 right-6 z-50 bg-slate-800 hover:bg-slate-700 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-2xl border border-slate-700 transition-all active:scale-95"
          >
            ← На главную
          </button>

          <Spreadsheet docId={activeDocId} />
        </div>
      ) : (
        //элз:
        <Dashboard onSelectDoc={(id) => dispatch(setActiveDocId(id))} />
      )}
    </div>
  );
}

export default App;