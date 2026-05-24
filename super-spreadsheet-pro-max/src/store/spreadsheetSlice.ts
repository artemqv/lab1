import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

// Интерфейс для стилей ячейки
interface CellStyle {
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  backgroundColor?: string;
  textColor?: string;
  alignment?: 'left' | 'center' | 'right';
  format?: 'number' | 'percent' | 'currency' | 'date';
}

// Интерфейс для состояния таблицы
interface SpreadsheetState {
  grid: string[][];
  cellStyles: Record<string, CellStyle>;
  colWidths: number[];
  rowHeights: number[];
  activeCell: { r: number; c: number };
  selectionRange: { start: { r: number; c: number }; end: { r: number; c: number } } | null;
  history: string[][][];
  historyIndex: number;
  editing: boolean;
  clipboard: { cells: Array<{ r: number; c: number; value: string; style?: CellStyle }>; mode: 'copy' | 'cut' } | null;
}

const DEFAULT_ROWS = 100;
const DEFAULT_COLS = 26;

// Создаем пустую таблицу
const createEmptyGrid = (rows = DEFAULT_ROWS, cols = DEFAULT_COLS) =>
  Array(rows).fill("").map(() => Array(cols).fill(""));

const initialState: SpreadsheetState = {
  grid: createEmptyGrid(),
  cellStyles: {},
  colWidths: Array(DEFAULT_COLS).fill(100),
  rowHeights: Array(DEFAULT_ROWS).fill(32),
  activeCell: { r: 0, c: 0 },
  selectionRange: null,
  history: [],
  historyIndex: -1,
  editing: false,
  clipboard: null,
};

const spreadsheetSlice = createSlice({
  name: 'spreadsheet',
  initialState,
  reducers: {
    // Устанавливаем всю таблицу целиком
    setGrid: (state, action: PayloadAction<string[][]>) => {
      state.grid = action.payload;
    },

    // Изменяем значение одной ячейки
    setCellValue: (state, action: PayloadAction<{ r: number; c: number; value: string }>) => {
      const { r, c, value } = action.payload;

      // Сохраняем в историю перед изменением
      if (state.historyIndex < state.history.length - 1) {
        state.history = state.history.slice(0, state.historyIndex + 1);
      }
      state.history.push(JSON.parse(JSON.stringify(state.grid)));
      if (state.history.length > 50) state.history.shift();
      else state.historyIndex++;

      state.grid[r][c] = value;
    },

    // Устанавливаем активную ячейку
    setActiveCell: (state, action: PayloadAction<{ r: number; c: number }>) => {
      state.activeCell = action.payload;
    },

    // Устанавливаем выделенный диапазон
    setSelectionRange: (state, action: PayloadAction<{ start: { r: number; c: number }; end: { r: number; c: number } } | null>) => {
      state.selectionRange = action.payload;
    },

    setColWidths: (state, action: PayloadAction<number[]>) => {
      state.colWidths = action.payload;
    },

    setRowHeights: (state, action: PayloadAction<number[]>) => {
      state.rowHeights = action.payload;
    },

    // Обновляем ширину одной колонки
    updateColWidth: (state, action: PayloadAction<{ index: number; width: number }>) => {
      state.colWidths[action.payload.index] = action.payload.width;
    },

    // Обновляем высоту одной строки
    updateRowHeight: (state, action: PayloadAction<{ index: number; height: number }>) => {
      state.rowHeights[action.payload.index] = action.payload.height;
    },

    // Вставка строки
    insertRow: (state, action: PayloadAction<number>) => {
      const index = action.payload;
      state.grid.splice(index, 0, Array(state.grid[0].length).fill(""));
      state.rowHeights.splice(index, 0, 32);
    },

    // Удаление строки
    deleteRow: (state, action: PayloadAction<number>) => {
      const index = action.payload;
      if (state.grid.length > 1) {
        state.grid.splice(index, 1);
        state.rowHeights.splice(index, 1);
      }
    },

    // Вставка колонки
    insertColumn: (state, action: PayloadAction<number>) => {
      const index = action.payload;
      state.grid.forEach(row => {
        row.splice(index, 0, "");
      });
      state.colWidths.splice(index, 0, 100);
    },

    // Удаление колонки
    deleteColumn: (state, action: PayloadAction<number>) => {
      const index = action.payload;
      if (state.grid[0].length > 1) {
        state.grid.forEach(row => {
          row.splice(index, 1);
        });
        state.colWidths.splice(index, 1);
      }
    },

    // Отмена последнего действия (Undo)
    undo: (state) => {
      if (state.historyIndex > 0) {
        state.historyIndex--;
        state.grid = JSON.parse(JSON.stringify(state.history[state.historyIndex]));
      }
    },

    // Повтор отмененного действия (Redo)
    redo: (state) => {
      if (state.historyIndex < state.history.length - 1) {
        state.historyIndex++;
        state.grid = JSON.parse(JSON.stringify(state.history[state.historyIndex]));
      }
    },

    setEditing: (state, action: PayloadAction<boolean>) => {
      state.editing = action.payload;
    },

    // Установка стиля ячейки
    setCellStyle: (state, action: PayloadAction<{ r: number; c: number; style: Partial<CellStyle> }>) => {
      const { r, c, style } = action.payload;
      const key = `${r}-${c}`;
      state.cellStyles[key] = { ...state.cellStyles[key], ...style };
    },

    // Копирование ячеек
    copyCells: (state) => {
      if (!state.selectionRange) {
        const { r, c } = state.activeCell;
        const key = `${r}-${c}`;
        state.clipboard = {
          cells: [{ r, c, value: state.grid[r][c], style: state.cellStyles[key] }],
          mode: 'copy',
        };
      } else {
        const { start, end } = state.selectionRange;
        const cells = [];
        for (let r = Math.min(start.r, end.r); r <= Math.max(start.r, end.r); r++) {
          for (let c = Math.min(start.c, end.c); c <= Math.max(start.c, end.c); c++) {
            const key = `${r}-${c}`;
            cells.push({ r, c, value: state.grid[r][c], style: state.cellStyles[key] });
          }
        }
        state.clipboard = { cells, mode: 'copy' };
      }
    },

    // Вырезание ячеек
    cutCells: (state) => {
      if (!state.selectionRange) {
        const { r, c } = state.activeCell;
        const key = `${r}-${c}`;
        state.clipboard = {
          cells: [{ r, c, value: state.grid[r][c], style: state.cellStyles[key] }],
          mode: 'cut',
        };
        state.grid[r][c] = '';
        delete state.cellStyles[key];
      } else {
        const { start, end } = state.selectionRange;
        const cells = [];
        for (let r = Math.min(start.r, end.r); r <= Math.max(start.r, end.r); r++) {
          for (let c = Math.min(start.c, end.c); c <= Math.max(start.c, end.c); c++) {
            const key = `${r}-${c}`;
            cells.push({ r, c, value: state.grid[r][c], style: state.cellStyles[key] });
            state.grid[r][c] = '';
            delete state.cellStyles[key];
          }
        }
        state.clipboard = { cells, mode: 'cut' };
      }
    },

    // Вставка ячеек
    pasteCells: (state) => {
      if (!state.clipboard) return;
      const { r: startR, c: startC } = state.activeCell;
      state.clipboard.cells.forEach((cell) => {
        const offsetR = cell.r - state.clipboard!.cells[0].r;
        const offsetC = cell.c - state.clipboard!.cells[0].c;
        const targetR = startR + offsetR;
        const targetC = startC + offsetC;
        if (targetR < state.grid.length && targetC < state.grid[0].length) {
          state.grid[targetR][targetC] = cell.value;
          if (cell.style) {
            const key = `${targetR}-${targetC}`;
            state.cellStyles[key] = { ...cell.style };
          }
        }
      });
    },

    // Очистка ячейки
    clearCell: (state, action: PayloadAction<{ r: number; c: number }>) => {
      const { r, c } = action.payload;
      state.grid[r][c] = '';
      const key = `${r}-${c}`;
      delete state.cellStyles[key];
    },

    // Выделить все ячейки
    selectAll: (state) => {
      state.selectionRange = {
        start: { r: 0, c: 0 },
        end: { r: state.grid.length - 1, c: state.grid[0].length - 1 },
      };
    },

    // Сброс всего состояния
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
  setCellStyle,
  copyCells,
  cutCells,
  pasteCells,
  clearCell,
  selectAll,
  resetSpreadsheet,
} = spreadsheetSlice.actions;

export default spreadsheetSlice.reducer;
export type { CellStyle };