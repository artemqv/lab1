import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';

// интерфейс документа
interface Document {
  id: string;
  name: string;
  date: string;
  created: string;
  rows?: number;
  cols?: number;
}

// состояние списка документов
interface DocumentsState {
  list: Document[];
  activeDocId: string | null;
  loading: boolean;
  error: string | null;
}

const initialState: DocumentsState = {
  list: [],
  activeDocId: null,
  loading: true, // начинаем с загрузки
  error: null,
};

// Async thunks для имитации работы с API
// загрузка списка документов
export const loadDocuments = createAsyncThunk(
  'documents/loadDocuments',
  async () => {
    // имитация загрузки с сервера
    await new Promise(resolve => setTimeout(resolve, 300));
    try {
      const savedDocs = localStorage.getItem('spreadsheet_list');
      if (!savedDocs) return [{ id: 'doc1', name: 'Мой первый отчет', date: '05.05.2026', created: '05.05.2026' }];
      const parsed = JSON.parse(savedDocs);
      return Array.isArray(parsed) ? parsed : [{ id: 'doc1', name: 'Мой первый отчет', date: '05.05.2026', created: '05.05.2026' }];
    } catch (e) {
      console.error('Failed to load documents:', e);
      return [{ id: 'doc1', name: 'Мой первый отчет', date: '05.05.2026', created: '05.05.2026' }];
    }
  }
);

// сохранение документа
export const saveDocument = createAsyncThunk(
  'documents/saveDocument',
  async ({ docId, grid, colWidths, rowHeights }: { docId: string; grid: string[][]; colWidths: number[]; rowHeights: number[] }) => {
    // имитация сохранения на сервер
    await new Promise(resolve => setTimeout(resolve, 200));
    try {
      localStorage.setItem(`spreadsheet_data_${docId}`, JSON.stringify(grid));
      localStorage.setItem(`spreadsheet_colwidths_${docId}`, JSON.stringify(colWidths));
      localStorage.setItem(`spreadsheet_rowheights_${docId}`, JSON.stringify(rowHeights));
    } catch (e) {
      console.error('Failed to save document:', e);
    }
    return { docId };
  }
);

// загрузка одного документа
export const loadDocument = createAsyncThunk(
  'documents/loadDocument',
  async (docId: string) => {
    // имитация загрузки документа с сервера
    await new Promise(resolve => setTimeout(resolve, 200));
    try {
      const saved = localStorage.getItem(`spreadsheet_data_${docId}`);
      const savedColWidths = localStorage.getItem(`spreadsheet_colwidths_${docId}`);
      const savedRowHeights = localStorage.getItem(`spreadsheet_rowheights_${docId}`);
      
      return {
        docId,
        grid: saved ? JSON.parse(saved) : null,
        colWidths: savedColWidths ? JSON.parse(savedColWidths) : null,
        rowHeights: savedRowHeights ? JSON.parse(savedRowHeights) : null,
      };
    } catch (e) {
      console.error('Failed to load document:', e);
      return { docId, grid: null, colWidths: null, rowHeights: null };
    }
  }
);

const documentsSlice = createSlice({
  name: 'documents',
  initialState,
  reducers: {
    addDocument: (state, action: PayloadAction<Document>) => {
      state.list.push(action.payload);
      localStorage.setItem('spreadsheet_list', JSON.stringify(state.list));
    },
    updateDocument: (state, action: PayloadAction<{ id: string; name?: string; date?: string }>) => {
      const doc = state.list.find(d => d.id === action.payload.id);
      if (doc) {
        if (action.payload.name) doc.name = action.payload.name;
        if (action.payload.date) doc.date = action.payload.date;
        localStorage.setItem('spreadsheet_list', JSON.stringify(state.list));
      }
    },
    deleteDocument: (state, action: PayloadAction<string>) => {
      state.list = state.list.filter(d => d.id !== action.payload);
      localStorage.setItem('spreadsheet_list', JSON.stringify(state.list));
      localStorage.removeItem(`spreadsheet_data_${action.payload}`);
      localStorage.removeItem(`spreadsheet_colwidths_${action.payload}`);
      localStorage.removeItem(`spreadsheet_rowheights_${action.payload}`);
    },
    duplicateDocument: (state, action: PayloadAction<{ oldId: string; newId: string; newName: string }>) => {
      const doc = state.list.find(d => d.id === action.payload.oldId);
      if (doc) {
        const newDoc = {
          ...doc,
          id: action.payload.newId,
          name: action.payload.newName,
          date: new Date().toLocaleDateString(),
          created: new Date().toLocaleDateString(),
        };
        state.list.push(newDoc);
        localStorage.setItem('spreadsheet_list', JSON.stringify(state.list));

        // копируем данные
        const data = localStorage.getItem(`spreadsheet_data_${action.payload.oldId}`);
        const colWidths = localStorage.getItem(`spreadsheet_colwidths_${action.payload.oldId}`);
        const rowHeights = localStorage.getItem(`spreadsheet_rowheights_${action.payload.oldId}`);
        if (data) localStorage.setItem(`spreadsheet_data_${action.payload.newId}`, data);
        if (colWidths) localStorage.setItem(`spreadsheet_colwidths_${action.payload.newId}`, colWidths);
        if (rowHeights) localStorage.setItem(`spreadsheet_rowheights_${action.payload.newId}`, rowHeights);
      }
    },
    setActiveDocId: (state, action: PayloadAction<string | null>) => {
      state.activeDocId = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadDocuments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loadDocuments.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload;
      })
      .addCase(loadDocuments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Ошибка загрузки документов';
      })
      .addCase(saveDocument.pending, (state) => {
        state.error = null;
      })
      .addCase(saveDocument.fulfilled, (state) => {
        // обновляем дату изменения документа
        const doc = state.list.find(d => d.id === state.activeDocId);
        if (doc) {
          doc.date = new Date().toLocaleDateString();
          localStorage.setItem('spreadsheet_list', JSON.stringify(state.list));
        }
      })
      .addCase(saveDocument.rejected, (state, action) => {
        state.error = action.error.message || 'Ошибка сохранения';
      })
      .addCase(loadDocument.pending, (state) => {
        state.loading = true;
      })
      .addCase(loadDocument.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(loadDocument.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Ошибка загрузки документа';
      });
  },
});

export const {
  addDocument,
  updateDocument,
  deleteDocument,
  duplicateDocument,
  setActiveDocId,
} = documentsSlice.actions;

export default documentsSlice.reducer;
