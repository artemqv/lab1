import type { Middleware } from '@reduxjs/toolkit';
import { saveDocument } from './documentsSlice';
import { setSaveStatus, setHasUnsavedChanges } from './uiSlice';

// Таймер для дебаунса автосохранения
let saveTimeout: ReturnType<typeof setTimeout> | null = null;

// Middleware для автоматического сохранения изменений с задержкой 500мс
export const autoSaveMiddleware: Middleware = (store) => (next) => (action: any) => {
  const result = next(action);

  // Отслеживаем изменения в таблице
  if (action.type?.startsWith('spreadsheet/')) {
    const state = store.getState() as any;
    const { grid, colWidths, rowHeights, cellStyles } = state.spreadsheet;
    const { activeDocId } = state.documents;

    if (activeDocId) {
      // Показываем статус "сохранение"
      store.dispatch(setSaveStatus('saving') as any);
      store.dispatch(setHasUnsavedChanges(true) as any);

      // Очищаем предыдущий таймер
      if (saveTimeout) {
        clearTimeout(saveTimeout);
      }

      // Запускаем новый таймер на 500мс
      saveTimeout = setTimeout(() => {
        store.dispatch(saveDocument({ docId: activeDocId, grid, colWidths, rowHeights, cellStyles }) as any)
          .then(() => {
            store.dispatch(setSaveStatus('saved') as any);
            store.dispatch(setHasUnsavedChanges(false) as any);
          })
          .catch(() => {
            store.dispatch(setSaveStatus('error') as any);
          });
      }, 500);
    }
  }

  return result;
};
