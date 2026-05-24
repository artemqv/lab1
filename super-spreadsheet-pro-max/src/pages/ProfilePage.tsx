import { useState } from 'react';
import { useAppSelector, useAppDispatch } from '../store/hooks';
import { setUser } from '../store/authSlice';

export default function ProfilePage() {
  const user = useAppSelector((state) => state.auth.user);
  const docs = useAppSelector((state) => state.documents.list);
  const dispatch = useAppDispatch();

  const [isEditingName, setIsEditingName] = useState(false);
  const [newName, setNewName] = useState(user?.name || '');
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleNameChange = () => {
    if (newName.trim().length < 2) {
      alert('Имя должно содержать минимум 2 символа');
      return;
    }
    if (user) {
      dispatch(setUser({ ...user, name: newName }));
      setIsEditingName(false);
      setSuccessMessage('Имя успешно изменено');
      setTimeout(() => setSuccessMessage(''), 3000);
    }
  };

  const handlePasswordChange = () => {
    setPasswordError('');

    if (currentPassword.length < 8) {
      setPasswordError('Текущий пароль должен содержать минимум 8 символов');
      return;
    }

    if (newPassword.length < 8) {
      setPasswordError('Новый пароль должен содержать минимум 8 символов');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('Пароли не совпадают');
      return;
    }

    // TODO: Заменить на реальный API вызов
    // await fetch('/api/auth/change-password', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ currentPassword, newPassword }),
    // });

    setIsChangingPassword(false);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setSuccessMessage('Пароль успешно изменен');
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  return (
    <div className="min-h-screen bg-[#0b0e11] text-white p-10">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Профиль пользователя</h1>

        {successMessage && (
          <div className="bg-green-600 text-white p-4 rounded-lg mb-6">
            {successMessage}
          </div>
        )}

        <div className="bg-[#121417] p-6 rounded-xl border border-[#2d3748] mb-6">
          <h2 className="text-xl font-bold mb-4">Информация</h2>
          <div className="space-y-4">
            <div>
              <span className="text-gray-400">Имя:</span>{' '}
              {isEditingName ? (
                <div className="inline-flex items-center gap-2 mt-2">
                  <input
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="bg-[#1a1d23] text-white border border-[#2d3748] rounded px-3 py-1"
                  />
                  <button
                    onClick={handleNameChange}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm"
                  >
                    Сохранить
                  </button>
                  <button
                    onClick={() => {
                      setIsEditingName(false);
                      setNewName(user?.name || '');
                    }}
                    className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-1 rounded text-sm"
                  >
                    Отмена
                  </button>
                </div>
              ) : (
                <>
                  {user?.name || 'Гость'}{' '}
                  <button
                    onClick={() => setIsEditingName(true)}
                    className="text-blue-500 hover:text-blue-400 text-sm ml-2"
                  >
                    Изменить
                  </button>
                </>
              )}
            </div>
            <p><span className="text-gray-400">Email:</span> {user?.email || 'guest@example.com'}</p>
            <p><span className="text-gray-400">Дата регистрации:</span> {user?.createdAt || '24.05.2026'}</p>
          </div>
        </div>

        <div className="bg-[#121417] p-6 rounded-xl border border-[#2d3748] mb-6">
          <h2 className="text-xl font-bold mb-4">Смена пароля</h2>
          {isChangingPassword ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Текущий пароль</label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full bg-[#1a1d23] text-white border border-[#2d3748] rounded px-3 py-2"
                  placeholder="••••••••"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">Новый пароль</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full bg-[#1a1d23] text-white border border-[#2d3748] rounded px-3 py-2"
                  placeholder="Минимум 8 символов"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">Подтверждение пароля</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-[#1a1d23] text-white border border-[#2d3748] rounded px-3 py-2"
                  placeholder="Повторите новый пароль"
                />
              </div>
              {passwordError && (
                <div className="text-red-500 text-sm">{passwordError}</div>
              )}
              <div className="flex gap-2">
                <button
                  onClick={handlePasswordChange}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded font-bold"
                >
                  Сохранить пароль
                </button>
                <button
                  onClick={() => {
                    setIsChangingPassword(false);
                    setCurrentPassword('');
                    setNewPassword('');
                    setConfirmPassword('');
                    setPasswordError('');
                  }}
                  className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded font-bold"
                >
                  Отмена
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setIsChangingPassword(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded font-bold"
            >
              Изменить пароль
            </button>
          )}
        </div>

        <div className="bg-[#121417] p-6 rounded-xl border border-[#2d3748]">
          <h2 className="text-xl font-bold mb-4">Статистика</h2>
          <div className="space-y-2">
            <p><span className="text-gray-400">Количество документов:</span> {docs.length}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
