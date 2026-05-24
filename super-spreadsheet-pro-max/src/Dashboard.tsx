import React, { useState } from 'react';
import { useAppDispatch, useAppSelector } from './store/hooks';
import { addDocument, updateDocument, deleteDocument, duplicateDocument } from './store/documentsSlice';
import { setShowCreateModal } from './store/uiSlice';

const Dashboard = ({ onSelectDoc }: { onSelectDoc: (id: string) => void }) => {
  const dispatch = useAppDispatch();
  const docs = useAppSelector((state) => state.documents.list);
  const showCreateModal = useAppSelector((state) => state.ui.showCreateModal);
  const [newDocName, setNewDocName] = useState('');
  const [newDocRows, setNewDocRows] = useState(100);
  const [newDocCols, setNewDocCols] = useState(26);

  const addDoc = () => {
    if (newDocName.trim()) {
      const newDoc = {
        id: 'doc_' + Date.now().toString(),
        name: newDocName.trim(),
        date: new Date().toLocaleDateString(),
        created: new Date().toLocaleDateString(),
        rows: newDocRows,
        cols: newDocCols
      };
      dispatch(addDocument(newDoc));
      dispatch(setShowCreateModal(false));
      setNewDocName('');
      setNewDocRows(100);
      setNewDocCols(26);
    }
  };

  const renameDoc = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const newName = prompt("Введите новое название:");
    if (newName) {
      dispatch(updateDocument({ id, name: newName, date: new Date().toLocaleDateString() }));
    }
  };

  const deleteDoc = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm("Удалить этот документ?")) {
      dispatch(deleteDocument(id));
    }
  };

  const duplicateDoc = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const docToCopy = docs.find((doc: any) => doc.id === id);
    if (docToCopy) {
      const newId = 'doc_' + Date.now().toString();
      dispatch(duplicateDocument({ oldId: id, newId, newName: docToCopy.name + ' (копия)' }));
    }
  };

  const getPreview = (docId: string) => {
    try {
      const saved = localStorage.getItem(`spreadsheet_data_${docId}`);
      if (!saved) return [['', '', ''], ['', '', ''], ['', '', '']];
      const grid = JSON.parse(saved);
      if (!Array.isArray(grid)) return [['', '', ''], ['', '', ''], ['', '', '']];
      return grid.slice(0, 3).map((row: string[]) => Array.isArray(row) ? row.slice(0, 3) : ['', '', '']);
    } catch (e) {
      console.error('Failed to get preview:', e);
      return [['', '', ''], ['', '', ''], ['', '', '']];
    }
  };

  return (
    <div className="p-10 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-10">
        <h2 className="text-3xl font-black text-[var(--text-main)] uppercase tracking-tighter">Мои документы</h2>
        <button onClick={() => dispatch(setShowCreateModal(true))} className="bg-blue-600 text-white px-6 py-2 rounded-full font-bold hover:bg-blue-700 transition">+ Создать</button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.isArray(docs) && docs.map((doc: any) => {
          const preview = getPreview(doc.id);
          return (
            <div key={doc.id} onClick={() => onSelectDoc(doc.id)} className="group bg-[var(--bg-cell)] p-6 rounded-xl border border-[var(--border-color)] shadow-sm hover:shadow-xl hover:border-blue-500 cursor-pointer transition-all relative">
              <div className="text-blue-500 font-bold mb-1 text-xs uppercase tracking-widest">ID: {doc.id}</div>
              <div className="text-xl font-bold text-[var(--text-main)] mb-3">{doc.name}</div>

              {/* Превью 3x3 */}
              <div className="mb-3 border border-[var(--border-color)] rounded overflow-hidden">
                <table className="w-full text-xs">
                  <tbody>
                    {Array.isArray(preview) && preview.map((row: string[], i: number) => (
                      <tr key={i}>
                        {Array.isArray(row) && row.map((cell: string, j: number) => (
                          <td key={j} className="border border-[var(--border-color)] px-1 py-0.5 truncate max-w-[60px] text-[var(--text-muted)]">
                            {cell || ''}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="text-[var(--text-muted)] text-xs">
                <div>Создан: {doc.created || doc.date}</div>
                <div>Изменен: {doc.date}</div>
              </div>
              <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={(e) => renameDoc(doc.id, e)} className="p-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-xs" title="Переименовать">✏️</button>
                <button onClick={(e) => duplicateDoc(doc.id, e)} className="p-2 bg-blue-700 hover:bg-blue-600 rounded-lg text-xs" title="Дублировать">📋</button>
                <button onClick={(e) => deleteDoc(doc.id, e)} className="p-2 bg-red-900 hover:bg-red-800 rounded-lg text-xs" title="Удалить">🗑️</button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Модальное окно создания документа */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => dispatch(setShowCreateModal(false))}>
          <div className="bg-[var(--bg-cell)] p-8 rounded-xl border border-[var(--border-color)] max-w-md w-full" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-2xl font-bold text-[var(--text-main)] mb-6">Создать новый документ</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-[var(--text-main)] mb-2">Название</label>
                <input
                  type="text"
                  value={newDocName}
                  onChange={(e) => setNewDocName(e.target.value)}
                  className="w-full bg-[var(--bg-main)] border border-[var(--border-color)] rounded px-3 py-2 text-[var(--text-main)] outline-none focus:border-blue-500"
                  placeholder="Мой документ"
                  autoFocus
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-[var(--text-main)] mb-2">Строки</label>
                  <input
                    type="number"
                    value={newDocRows}
                    onChange={(e) => setNewDocRows(Math.max(1, parseInt(e.target.value) || 100))}
                    className="w-full bg-[var(--bg-main)] border border-[var(--border-color)] rounded px-3 py-2 text-[var(--text-main)] outline-none focus:border-blue-500"
                    min="1"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-[var(--text-main)] mb-2">Столбцы</label>
                  <input
                    type="number"
                    value={newDocCols}
                    onChange={(e) => setNewDocCols(Math.max(1, parseInt(e.target.value) || 26))}
                    className="w-full bg-[var(--bg-main)] border border-[var(--border-color)] rounded px-3 py-2 text-[var(--text-main)] outline-none focus:border-blue-500"
                    min="1"
                  />
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  onClick={addDoc}
                  className="flex-1 bg-blue-600 text-white px-4 py-2 rounded font-bold hover:bg-blue-700 transition"
                >
                  Создать
                </button>
                <button
                  onClick={() => dispatch(setShowCreateModal(false))}
                  className="flex-1 bg-slate-700 text-white px-4 py-2 rounded font-bold hover:bg-slate-600 transition"
                >
                  Отмена
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;