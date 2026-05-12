import React, { useState, useEffect } from 'react';

const Dashboard = ({ onSelectDoc }: { onSelectDoc: (id: string) => void }) => {
  const [docs, setDocs] = useState(() => {
    const savedDocs = localStorage.getItem('spreadsheet_list');
    return savedDocs ? JSON.parse(savedDocs) : [{ id: 'doc1', name: 'Мой первый отчет', date: '05.05.2026' }];
  });

  useEffect(() => {
    localStorage.setItem('spreadsheet_list', JSON.stringify(docs));
  }, [docs]);

  const addDoc = () => {
    const name = prompt("Название нового документа?");
    if (name) {
      const newDoc = { 
        id: 'doc_' + Date.now().toString(), 
        name, 
        date: new Date().toLocaleDateString() 
      };
      setDocs([...docs, newDoc]);
    }
  };

  const renameDoc = (id: string, e: React.MouseEvent) => {
    e.stopPropagation(); 
    const newName = prompt("Введите новое название:");
    if (newName) {
      setDocs(docs.map((doc: any) => 
        doc.id === id ? { ...doc, name: newName, date: new Date().toLocaleDateString() } : doc
      ));
    }
  };

  const deleteDoc = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm("Удалить этот документ?")) {
      setDocs(docs.filter((doc: any) => doc.id !== id));
      localStorage.removeItem(`spreadsheet_data_${id}`);
    }
  };

  return (
    <div className="p-10 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-10">
        <h2 className="text-3xl font-black text-[var(--text-main)] uppercase tracking-tighter">Мои документы</h2>
        <button onClick={addDoc} className="bg-blue-600 text-white px-6 py-2 rounded-full font-bold hover:bg-blue-700 transition">+ Создать</button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {docs.map((doc: any) => (
          <div key={doc.id} onClick={() => onSelectDoc(doc.id)} className="group bg-[var(--bg-cell)] p-6 rounded-xl border border-[var(--border-color)] shadow-sm hover:shadow-xl hover:border-blue-500 cursor-pointer transition-all relative">
            <div className="text-blue-500 font-bold mb-1 text-xs uppercase tracking-widest">ID: {doc.id}</div>
            <div className="text-xl font-bold text-[var(--text-main)]">{doc.name}</div>
            <div className="text-[var(--text-muted)] text-sm mt-4 italic">Изменен: {doc.date}</div>
            
            <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button onClick={(e) => renameDoc(doc.id, e)} className="p-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-xs">✏️</button>
              <button onClick={(e) => deleteDoc(doc.id, e)} className="p-2 bg-red-900 hover:bg-red-800 rounded-lg text-xs">🗑️</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;