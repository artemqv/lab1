import type { Middleware } from '@reduxjs/toolkit';
import { saveDocument } from './documentsSlice';
import { setSaveStatus, setHasUnsavedChanges } from './uiSlice';

// таймер для дебаунса автосохранения
let saveTimeout: ReturnType<typeof setTimeout> | null = null;

// middleware для автоматического сохранения изменений
export const autoSaveMiddleware: Middleware = (store) => (next) => (action: any) => {
  const result = next(action);

  // отслеживаем изменения в spreadsheet
  if (action.type?.startsWith('spreadsheet/')) {
    const state = store.getState() as any;
    const { grid, colWidths, rowHeights } = state.spreadsheet;
    const { activeDocId } = state.documents;

    if (activeDocId) {
      // показываем статус "сохранение"
      store.dispatch(setSaveStatus('saving') as any);
      store.dispatch(setHasUnsavedChanges(true) as any);

      // очищаем предыдущий таймер
      if (saveTimeout) {
        clearTimeout(saveTimeout);
      }

      // запускаем новый таймер на 500мс
      saveTimeout = setTimeout(() => {
        store.dispatch(saveDocument({ docId: activeDocId, grid, colWidths, rowHeights }) as any)
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
