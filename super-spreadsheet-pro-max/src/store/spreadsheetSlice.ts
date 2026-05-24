import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

// интерфейс для состояния таблицы
interface SpreadsheetState {
  grid: string[][];
  colWidths: number[];
  rowHeights: number[];
  activeCell: { r: number; c: number };
  selectionRange: { start: { r: number; c: number }; end: { r: number; c: number } } | null;
  history: string[][][]; // история для undo/redo
  historyIndex: number;
  editing: boolean;
}

const DEFAULT_ROWS = 100;
const DEFAULT_COLS = 26;

// создаем пустую таблицу
const createEmptyGrid = (rows = DEFAULT_ROWS, cols = DEFAULT_COLS) =>
  Array(rows).fill("").map(() => Array(cols).fill(""));

const initialState: SpreadsheetState = {
  grid: createEmptyGrid(),
  colWidths: Array(DEFAULT_COLS).fill(100),
  rowHeights: Array(DEFAULT_ROWS).fill(32),
  activeCell: { r: 0, c: 0 },
  selectionRange: null,
  history: [],
  historyIndex: -1,
  editing: false,
};

const spreadsheetSlice = createSlice({
  name: 'spreadsheet',
  initialState,
  reducers: {
    // устанавливаем всю таблицу целиком
    setGrid: (state, action: PayloadAction<string[][]>) => {
      state.grid = action.payload;
    },
    // изменяем значение одной ячейки
    setCellValue: (state, action: PayloadAction<{ r: number; c: number; value: string }>) => {
      const { r, c, value } = action.payload;
      // сохраняем в историю перед изменением
      if (state.historyIndex < state.history.length - 1) {
        state.history = state.history.slice(0, state.historyIndex + 1);
      }
      state.history.push(JSON.parse(JSON.stringify(state.grid)));
      if (state.history.length > 50) state.history.shift(); // ограничиваем историю 50 шагами
      else state.historyIndex++;

      state.grid[r][c] = value;
    },
    // активная ячейка
    setActiveCell: (state, action: PayloadAction<{ r: number; c: number }>) => {
      state.activeCell = action.payload;
    },
    // выделенный диапазон
    setSelectionRange: (state, action: PayloadAction<{ start: { r: number; c: number }; end: { r: number; c: number } } | null>) => {
      state.selectionRange = action.payload;
    },
    setColWidths: (state, action: PayloadAction<number[]>) => {
      state.colWidths = action.payload;
    },
    setRowHeights: (state, action: PayloadAction<number[]>) => {
      state.rowHeights = action.payload;
    },
    // обновляем ширину одной колонки
    updateColWidth: (state, action: PayloadAction<{ index: number; width: number }>) => {
      state.colWidths[action.payload.index] = action.payload.width;
    },
    // обновляем высоту одной строки
    updateRowHeight: (state, action: PayloadAction<{ index: number; height: number }>) => {
      state.rowHeights[action.payload.index] = action.payload.height;
    },
    // вставка строки
    insertRow: (state, action: PayloadAction<number>) => {
      const index = action.payload;
      state.grid.splice(index, 0, Array(state.grid[0].length).fill(""));
      state.grid.pop();
      state.rowHeights.splice(index, 0, 32);
      state.rowHeights.pop();
    },
    // удаление строки
    deleteRow: (state, action: PayloadAction<number>) => {
      const index = action.payload;
      state.grid.splice(index, 1);
      state.grid.push(Array(state.grid[0].length).fill(""));
      state.rowHeights.splice(index, 1);
      state.rowHeights.push(32);
    },
    // вставка колонки
    insertColumn: (state, action: PayloadAction<number>) => {
      const index = action.payload;
      state.grid.forEach(row => {
        row.splice(index, 0, "");
        row.pop();
      });
      state.colWidths.splice(index, 0, 100);
      state.colWidths.pop();
    },
    // удаление колонки
    deleteColumn: (state, action: PayloadAction<number>) => {
      const index = action.payload;
      state.grid.forEach(row => {
        row.splice(index, 1);
        row.push("");
      });
      state.colWidths.splice(index, 1);
      state.colWidths.push(100);
    },
    // отмена последнего действия
    undo: (state) => {
      if (state.historyIndex > 0) {
        state.historyIndex--;
        state.grid = JSON.parse(JSON.stringify(state.history[state.historyIndex]));
      }
    },
    // повтор отмененного действия
    redo: (state) => {
      if (state.historyIndex < state.history.length - 1) {
        state.historyIndex++;
        state.grid = JSON.parse(JSON.stringify(state.history[state.historyIndex]));
      }
    },
    setEditing: (state, action: PayloadAction<boolean>) => {
      state.editing = action.payload;
    },
    // сброс всего состояния
    resetSpreadsheet: () => {
      return initialState;
    },
  },
});

export const {
  setGrid,
  setCellValue,
  setActiveCell,
  setSelectionRange,
  setColWidths,
  setRowHeights,
  updateColWidth,
  updateRowHeight,
  insertRow,
  deleteRow,
  insertColumn,
  deleteColumn,
  undo,
  redo,
  setEditing,
  resetSpreadsheet,
} = spreadsheetSlice.actions;

export default spreadsheetSlice.reducer;
