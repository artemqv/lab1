import { describe, it, expect } from 'vitest';
import uiReducer, {
  setTheme,
  toggleTheme,
  setSaveStatus,
  setShowCreateModal,
  setImportProgress,
  setContextMenu,
} from './uiSlice';

describe('uiSlice', () => {
  const initialState = {
    theme: 'dark' as const,
    saveStatus: 'saved' as const,
    hasUnsavedChanges: false,
    showCreateModal: false,
    importProgress: null,
    contextMenu: null,
  };

  it('setTheme changes theme', () => {
    const state = uiReducer(initialState, setTheme('light'));
    expect(state.theme).toBe('light');
  });

  it('toggleTheme switches theme', () => {
    const state = uiReducer(initialState, toggleTheme());
    expect(state.theme).toBe('light');
  });

  it('setSaveStatus updates save status', () => {
    const state = uiReducer(initialState, setSaveStatus('saving'));
    expect(state.saveStatus).toBe('saving');
  });

  it('setShowCreateModal toggles modal', () => {
    const state = uiReducer(initialState, setShowCreateModal(true));
    expect(state.showCreateModal).toBe(true);
  });

  it('setImportProgress updates progress', () => {
    const state = uiReducer(initialState, setImportProgress('50%'));
    expect(state.importProgress).toBe('50%');
  });

  it('setContextMenu sets context menu', () => {
    const menu = { visible: true, x: 100, y: 200, type: 'row' as const, index: 5 };
    const state = uiReducer(initialState, setContextMenu(menu));
    expect(state.contextMenu).toEqual(menu);
  });
});
