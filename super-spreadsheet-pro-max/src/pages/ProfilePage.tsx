import { useAppSelector } from '../store/hooks';

export default function ProfilePage() {
  const user = useAppSelector((state) => state.auth.user);
  const docs = useAppSelector((state) => state.documents.list);

  return (
    <div className="min-h-screen bg-[#0b0e11] text-white p-10">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Профиль пользователя</h1>

        <div className="bg-[#121417] p-6 rounded-xl border border-[#2d3748] mb-6">
          <h2 className="text-xl font-bold mb-4">Информация</h2>
          <div className="space-y-2">
            <p><span className="text-gray-400">Имя:</span> {user?.name || 'Гость'}</p>
            <p><span className="text-gray-400">Email:</span> {user?.email || 'guest@example.com'}</p>
            <p><span className="text-gray-400">Дата регистрации:</span> {user?.createdAt || '24.05.2026'}</p>
          </div>
        </div>

        <div className="bg-[#121417] p-6 rounded-xl border border-[#2d3748]">
          <h2 className="text-xl font-bold mb-4">Статистика</h2>
          <div className="space-y-2">
            <p><span className="text-gray-400">Количество документов:</span> {docs.length}</p>
          </div>
        </div>

        <div className="mt-6">
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-bold transition">
            Изменить профиль
          </button>
        </div>
      </div>
    </div>
  );
}
