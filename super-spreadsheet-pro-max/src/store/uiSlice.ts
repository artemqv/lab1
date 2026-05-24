import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

interface UiState {
  theme: 'dark' | 'light';
  saveStatus: 'saved' | 'saving' | 'error';
  hasUnsavedChanges: boolean;
  showCreateModal: boolean;
  importProgress: string | null;
  contextMenu: {
    visible: boolean;
    x: number;
    y: number;
    type: 'row' | 'col';
    index: number;
  } | null;
}

const initialState: UiState = {
  theme: 'dark',
  saveStatus: 'saved',
  hasUnsavedChanges: false,
  showCreateModal: false,
  importProgress: null,
  contextMenu: null,
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setTheme: (state, action: PayloadAction<'dark' | 'light'>) => {
      state.theme = action.payload;
      document.documentElement.setAttribute('data-theme', action.payload);
    },
    toggleTheme: (state) => {
      state.theme = state.theme === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', state.theme);
    },
    setSaveStatus: (state, action: PayloadAction<'saved' | 'saving' | 'error'>) => {
      state.saveStatus = action.payload;
    },
    setHasUnsavedChanges: (state, action: PayloadAction<boolean>) => {
      state.hasUnsavedChanges = action.payload;
    },
    setShowCreateModal: (state, action: PayloadAction<boolean>) => {
      state.showCreateModal = action.payload;
    },
    setImportProgress: (state, action: PayloadAction<string | null>) => {
      state.importProgress = action.payload;
    },
    setContextMenu: (state, action: PayloadAction<UiState['contextMenu']>) => {
      state.contextMenu = action.payload;
    },
  },
});

export const {
  setTheme,
  toggleTheme,
  setSaveStatus,
  setHasUnsavedChanges,
  setShowCreateModal,
  setImportProgress,
  setContextMenu,
} = uiSlice.actions;

export default uiSlice.reducer;
