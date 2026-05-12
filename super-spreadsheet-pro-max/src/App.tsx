import { useState } from 'react';
import Dashboard from './Dashboard';
import Spreadsheet from './Spreadsheet';

function App() {
  //хранение айдишника
  const [activeDocId, setActiveDocId] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-[#0b0e11] font-sans selection:bg-blue-500/30">
      {activeDocId ? (
        // условие: если айди есть то выполняем
        <div className="relative h-screen flex flex-col">
          {/* Кнопка возврата к списку документов */}
          <button 
            onClick={() => setActiveDocId(null)}
            className="fixed bottom-6 right-6 z-50 bg-slate-800 hover:bg-slate-700 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-2xl border border-slate-700 transition-all active:scale-95"
          >
            ← На главную
          </button>
          
          <Spreadsheet docId={activeDocId} />
        </div>
      ) : (
        //элз:
        <Dashboard onSelectDoc={(id) => setActiveDocId(id)} />
      )}
    </div>
  );
}

export default App;