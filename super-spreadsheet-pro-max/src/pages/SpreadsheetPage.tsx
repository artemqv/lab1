import { useParams, useNavigate } from 'react-router-dom';
import { useAppDispatch } from '../store/hooks';
import { setActiveDocId } from '../store/documentsSlice';
import Spreadsheet from '../Spreadsheet';
import { useEffect } from 'react';

export default function SpreadsheetPage() {
  const { documentId } = useParams<{ documentId: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (documentId) {
      dispatch(setActiveDocId(documentId));
    }
  }, [documentId, dispatch]);

  if (!documentId) {
    navigate('/dashboard');
    return null;
  }

  return (
    <div className="h-screen flex flex-col">
      <button
        onClick={() => {
          dispatch(setActiveDocId(null));
          navigate('/dashboard');
        }}
        className="fixed bottom-6 right-6 z-50 bg-slate-800 hover:bg-slate-700 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-2xl border border-slate-700 transition-all active:scale-95"
      >
        ← На главную
      </button>
      <Spreadsheet docId={documentId} />
    </div>
  );
}
