import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useAppDispatch, useAppSelector } from './store/hooks';
import {
  setGrid,
  setCellValue,
  setActiveCell as setActiveCellAction,
  setSelectionRange as setSelectionRangeAction,
  setColWidths,
  setRowHeights,
  updateColWidth,
  updateRowHeight,
  insertRow as insertRowAction,
  deleteRow as deleteRowAction,
  insertColumn as insertColumnAction,
  deleteColumn as deleteColumnAction,
  undo,
  redo,
  setEditing as setEditingAction,
} from './store/spreadsheetSlice';
import { loadDocument } from './store/documentsSlice';
import { toggleTheme, setImportProgress, setContextMenu } from './store/uiSlice';
import { evaluateFormula } from './formulaEngine';

const DEFAULT_ROWS = 100;
const DEFAULT_COLS = 26;

const deepCopyGrid = (grid: string[][]) => grid.map(row => [...row]);

const Spreadsheet = ({ docId }: { docId: string }) => {
  const dispatch = useAppDispatch();
  const grid = useAppSelector((state) => state.spreadsheet.grid);
  const activeCell = useAppSelector((state) => state.spreadsheet.activeCell);
  const editing = useAppSelector((state) => state.spreadsheet.editing);
  const colWidths = useAppSelector((state) => state.spreadsheet.colWidths);
  const rowHeights = useAppSelector((state) => state.spreadsheet.rowHeights);
  const selectionRange = useAppSelector((state) => state.spreadsheet.selectionRange);
  const theme = useAppSelector((state) => state.ui.theme);
  const saveStatus = useAppSelector((state) => state.ui.saveStatus);
  const hasUnsavedChanges = useAppSelector((state) => state.ui.hasUnsavedChanges);
  const importProgress = useAppSelector((state) => state.ui.importProgress);
  const contextMenu = useAppSelector((state) => state.ui.contextMenu);

  const [inputValue, setInputValue] = useState("");
  const menuRef = useRef<HTMLDivElement>(null);

  // загрузка сейвддаты
  useEffect(() => {
    dispatch(loadDocument(docId)).then((result: any) => {
      if (result.payload) {
        if (Array.isArray(result.payload.grid)) dispatch(setGrid(result.payload.grid));
        if (Array.isArray(result.payload.colWidths)) dispatch(setColWidths(result.payload.colWidths));
        if (Array.isArray(result.payload.rowHeights)) dispatch(setRowHeights(result.payload.rowHeights));
      }
    });
    document.documentElement.setAttribute('data-theme', theme);
  }, [docId, theme, dispatch]);

  // предупреждение при закрытии с несохраненными изменениями
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  // ручное сохранение Ctrl+S и Undo/Redo
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        // ручное сохранение через thunk
        dispatch(loadDocument(docId));
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        dispatch(undo());
      }
      if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
        e.preventDefault();
        dispatch(redo());
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [dispatch, docId]);

  const saveEdit = useCallback((val: string) => {
    dispatch(setCellValue({ r: activeCell.r, c: activeCell.c, value: val }));
    dispatch(setEditingAction(false));
  }, [activeCell, dispatch]);

  // ширина высота
  const handleColResize = (index: number, e: React.MouseEvent) => {
    e.preventDefault();
    const startX = e.pageX;
    const startWidth = colWidths[index];
    const onMouseMove = (me: MouseEvent) => {
      const newWidth = Math.max(50, startWidth + (me.pageX - startX));
      dispatch(updateColWidth({ index, width: newWidth }));
    };
    const onMouseUp = () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  };

  const handleRowResize = (index: number, e: React.MouseEvent) => {
    e.preventDefault();
    const startY = e.pageY;
    const startHeight = rowHeights[index];
    const onMouseMove = (me: MouseEvent) => {
      const newHeight = Math.max(20, startHeight + (me.pageY - startY));
      dispatch(updateRowHeight({ index, height: newHeight }));
    };
    const onMouseUp = () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  };

  // Добавление / удаление строк / колонок
  const insertRow = useCallback((index: number) => {
    dispatch(insertRowAction(index));
    if (activeCell.r >= index) dispatch(setActiveCellAction({ ...activeCell, r: activeCell.r + 1 }));
  }, [activeCell, dispatch]);

  const deleteRow = useCallback((index: number) => {
    dispatch(deleteRowAction(index));
    if (activeCell.r === index) dispatch(setActiveCellAction({ ...activeCell, r: Math.max(0, activeCell.r - 1) }));
    else if (activeCell.r > index) dispatch(setActiveCellAction({ ...activeCell, r: activeCell.r - 1 }));
  }, [activeCell, dispatch]);

  const insertColumn = useCallback((index: number) => {
    dispatch(insertColumnAction(index));
    if (activeCell.c >= index) dispatch(setActiveCellAction({ ...activeCell, c: activeCell.c + 1 }));
  }, [activeCell, dispatch]);

  const deleteColumn = useCallback((index: number) => {
    dispatch(deleteColumnAction(index));
    if (activeCell.c === index) dispatch(setActiveCellAction({ ...activeCell, c: Math.max(0, activeCell.c - 1) }));
    else if (activeCell.c > index) dispatch(setActiveCellAction({ ...activeCell, c: activeCell.c - 1 }));
  }, [activeCell, dispatch]);

  // контекстное меню
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) dispatch(setContextMenu(null));
    };
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, [dispatch]);

  const handleCellClick = (r: number, c: number, e: React.MouseEvent) => {
    if (e.shiftKey && selectionRange) {
      dispatch(setSelectionRangeAction({ start: selectionRange.start, end: { r, c } }));
    } else {
      dispatch(setSelectionRangeAction({ start: { r, c }, end: { r, c } }));
    }
    dispatch(setActiveCellAction({ r, c }));
    dispatch(setEditingAction(false));
  };

  const isInRange = (r: number, c: number): boolean => {
    if (!selectionRange) return false;
    const minRow = Math.min(selectionRange.start.r, selectionRange.end.r);
    const maxRow = Math.max(selectionRange.start.r, selectionRange.end.r);
    const minCol = Math.min(selectionRange.start.c, selectionRange.end.c);
    const maxCol = Math.max(selectionRange.start.c, selectionRange.end.c);
    return r >= minRow && r <= maxRow && c >= minCol && c <= maxCol;
  };

  // клава
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (editing) return;
      let newR = activeCell.r, newC = activeCell.c;
      if (e.key === 'ArrowUp') newR = Math.max(0, activeCell.r - 1);
      if (e.key === 'ArrowDown') newR = Math.min(grid.length - 1, activeCell.r + 1);
      if (e.key === 'ArrowLeft') newC = Math.max(0, activeCell.c - 1);
      if (e.key === 'ArrowRight') newC = Math.min(grid[0].length - 1, activeCell.c + 1);
      if (newR !== activeCell.r || newC !== activeCell.c) {
        e.preventDefault();
        if (e.shiftKey && selectionRange) {
          dispatch(setSelectionRangeAction({ start: selectionRange.start, end: { r: newR, c: newC } }));
        } else {
          dispatch(setSelectionRangeAction({ start: { r: newR, c: newC }, end: { r: newR, c: newC } }));
        }
        dispatch(setActiveCellAction({ r: newR, c: newC }));
      }
      if (e.key === 'Delete' || e.key === 'Backspace') saveEdit("");
      if (e.key === 'Enter') {
        setInputValue(grid[activeCell.r][activeCell.c]);
        dispatch(setEditingAction(true));
      }
      if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.shiftKey) {
        e.preventDefault();
        setInputValue(e.key);
        dispatch(setEditingAction(true));
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeCell, editing, grid, saveEdit, selectionRange, dispatch]);

  // выезд csv
  const exportToCSV = () => {
    const rows = grid.map(row =>
      row.map((cell) => {
        let value = cell;
        if (cell.startsWith('=')) {
          value = evaluateFormula(cell, grid);
        }
        if (value.includes(',') || value.includes('"') || value.includes('\n')) {
          value = `"${value.replace(/"/g, '""')}"`;
        }
        return value;
      }).join(',')
    ).join('\n');
    const blob = new Blob(["\uFEFF" + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `doc_${docId}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Импорт CSV (порциями по 50 строк)
  const handleImportCSV = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.csv';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      const text = await file.text();
      const lines = text.split(/\r?\n/);
      if (lines.length === 0) return;
      const parsedData: string[][] = lines.map(line => line.split(',').map(cell => cell.trim()));
      const numRows = parsedData.length;
      const numCols = Math.max(...parsedData.map(r => r.length), 1);
      let workingGrid = deepCopyGrid(grid);
      if (numRows > workingGrid.length) {
        const extra = numRows - workingGrid.length;
        for (let i = 0; i < extra; i++) workingGrid.push(Array(workingGrid[0].length).fill(""));
        dispatch(setRowHeights([...rowHeights, ...Array(extra).fill(32)]));
      }
      if (numCols > workingGrid[0].length) {
        const extra = numCols - workingGrid[0].length;
        for (let i = 0; i < workingGrid.length; i++) {
          for (let j = 0; j < extra; j++) workingGrid[i].push("");
        }
        dispatch(setColWidths([...colWidths, ...Array(extra).fill(100)]));
      }
      const CHUNK = 50;
      let start = 0;
      dispatch(setImportProgress(`Импорт 0/${numRows} ...`));
      const processChunk = () => {
        const end = Math.min(start + CHUNK, numRows);
        for (let i = start; i < end; i++) {
          const csvRow = parsedData[i];
          for (let j = 0; j < csvRow.length; j++) {
            if (workingGrid[i] && workingGrid[i][j] !== undefined) {
              workingGrid[i][j] = csvRow[j];
            }
          }
        }
        dispatch(setGrid([...workingGrid]));
        dispatch(setImportProgress(`Импорт ${end}/${numRows} ...`));
        start = end;
        if (start < numRows) {
          setTimeout(processChunk, 10);
        } else {
          dispatch(setImportProgress(null));
        }
      };
      processChunk();
    };
    input.click();
  };

  // экспорт в JSON
  const exportToJSON = () => {
    const data = {
      docId,
      grid,
      colWidths,
      rowHeights,
      exportDate: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `doc_${docId}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // импорт JSON
  const handleImportJSON = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      try {
        const text = await file.text();
        const data = JSON.parse(text);
        if (data.grid) dispatch(setGrid(data.grid));
        if (data.colWidths) dispatch(setColWidths(data.colWidths));
        if (data.rowHeights) dispatch(setRowHeights(data.rowHeights));
      } catch (err) {
        alert('Ошибка импорта JSON: ' + err);
      }
    };
    input.click();
  };

  return (
    <div className="flex flex-col h-screen select-none bg-[var(--bg-main)]">
      {/* Верхняя панель с hotbar (кнопки + импорт/экспорт) */}
      <div className="p-2 bg-[var(--bg-header)] border-b border-[var(--border-color)] flex items-center gap-2 flex-wrap">
        <button onClick={() => dispatch(toggleTheme())} className="bg-[var(--accent)] text-white px-3 py-1 rounded text-xs font-bold">
          {theme === 'dark' ? '☀️ LIGHT' : '🌙 DARK'}
        </button>
        <button onClick={exportToCSV} className="bg-green-700 text-white px-3 py-1 rounded text-xs font-bold">📥 CSV</button>
        <button onClick={handleImportCSV} className="bg-blue-600 text-white px-3 py-1 rounded text-xs font-bold">📂 CSV Import</button>
        <button onClick={exportToJSON} className="bg-green-700 text-white px-3 py-1 rounded text-xs font-bold">📥 JSON</button>
        <button onClick={handleImportJSON} className="bg-blue-600 text-white px-3 py-1 rounded text-xs font-bold">📂 JSON Import</button>

        {/* Индикатор статуса сохранения */}
        <div className="flex items-center gap-2 ml-2">
          {saveStatus === 'saved' && <span className="text-xs text-green-500">✓ Сохранено</span>}
          {saveStatus === 'saving' && <span className="text-xs text-yellow-500">⏳ Сохранение...</span>}
          {saveStatus === 'error' && <span className="text-xs text-red-500">❌ Ошибка сохранения</span>}
        </div>

        {importProgress && <span className="text-xs text-[var(--text-muted)]">{importProgress}</span>}

        {/* Панель формул */}
        <div className="flex-1 bg-[var(--bg-main)] border border-[var(--border-color)] px-3 py-1 rounded flex text-sm text-[var(--text-main)]">
          <span className="text-[var(--accent)] font-bold mr-2 italic">fx</span>
          <input
            className="bg-transparent outline-none w-full"
            value={editing ? inputValue : (grid[activeCell.r]?.[activeCell.c] || "")}
            onChange={(e) => setInputValue(e.target.value)}
            onBlur={() => editing && saveEdit(inputValue)}
          />
        </div>
      </div>

      {/* Область таблицы */}
      <div className="flex-1 overflow-auto p-4">
        <div className="spreadsheet-container" style={{ gridTemplateColumns: `40px ${Array.isArray(colWidths) ? colWidths.map(w => `${w}px`).join(' ') : ''}` }}>
          <div className="header-cell sticky top-0 left-0 z-40"></div>
          {Array.isArray(colWidths) && colWidths.map((_, i) => (
            <div key={i} className="header-cell sticky top-0 z-10" style={{ height: '30px' }} onContextMenu={(e) => { e.preventDefault(); dispatch(setContextMenu({ visible: true, x: e.clientX, y: e.clientY, type: 'col', index: i })); }}>
              {String.fromCharCode(65 + i)}
              <div className="resizer" onMouseDown={(e) => handleColResize(i, e)} />
            </div>
          ))}
          {Array.isArray(grid) && grid.map((row, r) => (
            <React.Fragment key={r}>
              <div className="header-cell sticky left-0 z-10" style={{ height: `${Array.isArray(rowHeights) ? rowHeights[r] : 32}px`, position: 'relative' }} onContextMenu={(e) => { e.preventDefault(); dispatch(setContextMenu({ visible: true, x: e.clientX, y: e.clientY, type: 'row', index: r })); }}>
                {r + 1}
                <div style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', height: '4px', cursor: 'row-resize' }} onMouseDown={(e) => handleRowResize(r, e)} />
              </div>
              {Array.isArray(row) && row.map((cell, c) => {
                const active = activeCell.r === r && activeCell.c === c;
                const inSelection = isInRange(r, c);
                return (
                  <div key={c} className={`cell-wrapper ${active ? 'active' : ''} ${inSelection && !active ? 'in-selection' : ''}`} style={{ height: `${Array.isArray(rowHeights) ? rowHeights[r] : 32}px` }} onClick={(e) => handleCellClick(r, c, e)} onDoubleClick={() => { setInputValue(cell); dispatch(setEditingAction(true)); }}>
                    {editing && active ? (
                      <input autoFocus className="cell-input-fixed" value={inputValue} onChange={(e) => setInputValue(e.target.value)} onBlur={() => saveEdit(inputValue)} onKeyDown={(e) => e.key === 'Enter' && saveEdit(inputValue)} />
                    ) : (
                      <div className="w-full px-2 truncate text-sm text-[var(--text-main)]">
                        {cell.startsWith('=') ? <span className="text-blue-400">{evaluateFormula(cell, grid)}</span> : cell}
                      </div>
                    )}
                  </div>
                );
              })}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Контекстное меню (правая кнопка) */}
      {contextMenu?.visible && (
        <div ref={menuRef} className="fixed bg-[var(--bg-cell)] border border-[var(--border-color)] rounded shadow-lg z-50 py-1" style={{ top: contextMenu.y, left: contextMenu.x }}>
          {contextMenu.type === 'row' && (
            <>
              <button className="w-full text-left px-4 py-2 text-sm hover:bg-[var(--bg-header)]" onClick={() => { insertRow(contextMenu.index); dispatch(setContextMenu(null)); }}>➕ Вставить строку выше</button>
              <button className="w-full text-left px-4 py-2 text-sm hover:bg-[var(--bg-header)] text-red-500" onClick={() => { deleteRow(contextMenu.index); dispatch(setContextMenu(null)); }}>🗑️ Удалить строку</button>
            </>
          )}
          {contextMenu.type === 'col' && (
            <>
              <button className="w-full text-left px-4 py-2 text-sm hover:bg-[var(--bg-header)]" onClick={() => { insertColumn(contextMenu.index); dispatch(setContextMenu(null)); }}>➕ Вставить столбец левее</button>
              <button className="w-full text-left px-4 py-2 text-sm hover:bg-[var(--bg-header)] text-red-500" onClick={() => { deleteColumn(contextMenu.index); dispatch(setContextMenu(null)); }}>🗑️ Удалить столбец</button>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default Spreadsheet;