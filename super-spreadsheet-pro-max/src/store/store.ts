import { configureStore } from '@reduxjs/toolkit';
import documentsReducer from './documentsSlice';
import uiReducer from './uiSlice';

export const store = configureStore({
  reducer: {
    documents: documentsReducer,
    ui: uiReducer
  }
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
