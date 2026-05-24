import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAppSelector } from '../store/hooks';

export default function AppLayout() {
  const location = useLocation();
  const user = useAppSelector((state) => state.auth.user);

  return (
    <div className="min-h-screen bg-[#0b0e11]">
      {/* Шапка */}
      <header className="bg-[#1a1d23] border-b border-[#2d3748] px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link to="/dashboard" className="text-2xl font-bold text-white">
              📊 Spreadsheet Pro
            </Link>
            <nav className="flex gap-4">
              <Link
                to="/dashboard"
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  location.pathname === '/dashboard'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Документы
              </Link>
              <Link
                to="/profile"
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  location.pathname === '/profile'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Профиль
              </Link>
            </nav>
          </div>
          <div className="text-white">
            {user?.name || 'Гость'}
          </div>
        </div>
      </header>

      {/* Хлебные крошки */}
      {location.pathname !== '/dashboard' && location.pathname !== '/' && (
        <div className="bg-[#121417] px-6 py-3 text-sm text-gray-400">
          <Link to="/dashboard" className="hover:text-white">Мои документы</Link>
          {location.pathname.startsWith('/documents/') && (
            <>
              <span className="mx-2">/</span>
              <span className="text-white">Документ</span>
            </>
          )}
          {location.pathname === '/profile' && (
            <>
              <span className="mx-2">/</span>
              <span className="text-white">Профиль</span>
            </>
          )}
        </div>
      )}

      {/* Контент */}
      <main>
        <Outlet />
      </main>
    </div>
  );
}
