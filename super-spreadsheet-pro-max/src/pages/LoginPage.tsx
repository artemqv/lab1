import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAppDispatch } from '../store/hooks';
import { setUser, setLoading, setError } from '../store/authSlice';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [validationError, setValidationError] = useState('');
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError('');

    if (!validateEmail(email)) {
      setValidationError('Неверный формат email');
      return;
    }

    if (password.length < 8) {
      setValidationError('Пароль должен содержать минимум 8 символов');
      return;
    }

    dispatch(setLoading(true));
    dispatch(setError(null));

    try {
      // TODO: Заменить на реальный API вызов
      // const response = await fetch('/api/auth/login', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ email, password }),
      // });
      // const data = await response.json();

      // Временная mock аутентификация
      setTimeout(() => {
        dispatch(setUser({
          id: 'user-1',
          name: email.split('@')[0],
          email,
          createdAt: new Date().toISOString(),
        }));
        dispatch(setLoading(false));
        navigate('/dashboard');
      }, 500);
    } catch (error) {
      dispatch(setError('Ошибка входа'));
      dispatch(setLoading(false));
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0e11] flex items-center justify-center p-4">
      <div className="bg-[#121417] p-8 rounded-xl border border-[#2d3748] w-full max-w-md">
        <h1 className="text-3xl font-bold text-white mb-6 text-center">Вход</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-gray-300 mb-2">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-[#1a1d23] text-white border border-[#2d3748] rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500"
              placeholder="your@email.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-300 mb-2">
              Пароль
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-[#1a1d23] text-white border border-[#2d3748] rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500"
              placeholder="••••••••"
              required
            />
          </div>

          {validationError && (
            <div className="text-red-500 text-sm">{validationError}</div>
          )}

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition"
          >
            Войти
          </button>
        </form>

        <div className="mt-6 text-center text-gray-400 text-sm">
          Нет аккаунта?{' '}
          <Link to="/register" className="text-blue-500 hover:text-blue-400">
            Зарегистрироваться
          </Link>
        </div>
      </div>
    </div>
  );
}
