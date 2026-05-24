import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

// Интерфейс пользователя
interface User {
  id: string;
  name: string;
  email: string;
  createdAt?: string;
}

// Интерфейс состояния аутентификации
interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // Установка пользователя
    setUser: (state, action: PayloadAction<User | null>) => {
      state.user = action.payload;
      state.isAuthenticated = !!action.payload;
    },

    // Установка статуса загрузки
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },

    // Установка ошибки
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },

    // Выход из системы
    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
    },
  },
});

export const {
  setUser,
  setLoading,
  setError,
  logout,
} = authSlice.actions;

export default authSlice.reducer;
