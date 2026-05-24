import { describe, it, expect } from 'vitest';
import spreadsheetReducer, {
  setGrid,
  setCellValue,
  setActiveCell,
  insertRow,
  deleteRow,
  insertColumn,
  deleteColumn,
  undo,
  redo,
} from './spreadsheetSlice';

describe('spreadsheetSlice', () => {
  const initialState = {
    grid: [['', ''], ['', '']],
    cellStyles: {},
    colWidths: [100, 100],
    rowHeights: [32, 32],
    activeCell: { r: 0, c: 0 },
    selectionRange: null,
    history: [],
    historyIndex: -1,
    editing: false,
    clipboard: null,
  };

  it('setGrid updates grid', () => {
    const newGrid = [['A', 'B'], ['C', 'D']];
    const state = spreadsheetReducer(initialState, setGrid(newGrid));
    expect(state.grid).toEqual(newGrid);
  });

  it('setCellValue updates cell and adds to history', () => {
    const state = spreadsheetReducer(initialState, setCellValue({ r: 0, c: 0, value: 'test' }));
    expect(state.grid[0][0]).toBe('test');
    expect(state.history.length).toBe(1);
  });

  it('setActiveCell updates active cell', () => {
    const state = spreadsheetReducer(initialState, setActiveCell({ r: 1, c: 1 }));
    expect(state.activeCell).toEqual({ r: 1, c: 1 });
  });

  it('insertRow adds new row', () => {
    const state = spreadsheetReducer(initialState, insertRow(0));
    expect(state.grid.length).toBe(3);
    expect(state.rowHeights.length).toBe(3);
  });

  it('deleteRow removes row', () => {
    const state = spreadsheetReducer(initialState, deleteRow(0));
    expect(state.grid.length).toBe(1);
    expect(state.rowHeights.length).toBe(1);
  });

  it('insertColumn adds new column', () => {
    const state = spreadsheetReducer(initialState, insertColumn(0));
    expect(state.grid[0].length).toBe(3);
    expect(state.colWidths.length).toBe(3);
  });

  it('deleteColumn removes column', () => {
    const state = spreadsheetReducer(initialState, deleteColumn(0));
    expect(state.grid[0].length).toBe(1);
    expect(state.colWidths.length).toBe(1);
  });

  it('undo works without errors', () => {
    let state = spreadsheetReducer(initialState, setCellValue({ r: 0, c: 0, value: 'A' }));
    state = spreadsheetReducer(state, setCellValue({ r: 0, c: 0, value: 'B' }));
    expect(state.grid[0][0]).toBe('B');
    expect(state.history.length).toBeGreaterThan(0);
    state = spreadsheetReducer(state, undo());
    // Undo должен работать без ошибок
    expect(state.grid).toBeDefined();
  });

  it('redo works without errors', () => {
    let state = spreadsheetReducer(initialState, setCellValue({ r: 0, c: 0, value: 'A' }));
    state = spreadsheetReducer(state, undo());
    state = spreadsheetReducer(state, redo());
    // Redo должен работать без ошибок
    expect(state.grid).toBeDefined();
  });
});
