import { useNavigate } from 'react-router-dom';
import { useAppDispatch } from '../store/hooks';
import { setActiveDocId } from '../store/documentsSlice';
import Dashboard from '../Dashboard';

export default function DashboardPage() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const handleSelectDoc = (id: string) => {
    dispatch(setActiveDocId(id));
    navigate(`/documents/${id}`);
  };

  return <Dashboard onSelectDoc={handleSelectDoc} />;
}
