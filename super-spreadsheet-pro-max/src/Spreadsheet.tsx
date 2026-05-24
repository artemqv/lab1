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
  setCellStyle,
  copyCells,
  cutCells,
  pasteCells,
  clearCell,
  selectAll,
} from './store/spreadsheetSlice';
import { loadDocument } from './store/documentsSlice';
import { toggleTheme, setImportProgress, setContextMenu } from './store/uiSlice';
import { evaluateFormula } from './formulaEngine';

const deepCopyGrid = (grid: string[][]) => grid.map(row => [...row]);

const Spreadsheet = ({ docId }: { docId: string }) => {
  const dispatch = useAppDispatch();
  const grid = useAppSelector((state) => state.spreadsheet.grid);
  const cellStyles = useAppSelector((state) => state.spreadsheet.cellStyles);
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

  // Загрузка данных документа
  useEffect(() => {
    dispatch(loadDocument(docId)).then((result: any) => {
      if (result.payload) {
        // Если есть сохраненная таблица - загружаем её
        if (Array.isArray(result.payload.grid)) {
          dispatch(setGrid(result.payload.grid));
        } else {
          // Если таблицы нет - создаем новую с размером из документа
          const docs = JSON.parse(localStorage.getItem('spreadsheet_list') || '[]');
          const doc = docs.find((d: any) => d.id === docId);
          if (doc && doc.rows && doc.cols) {
            const newGrid = Array(doc.rows).fill("").map(() => Array(doc.cols).fill(""));
            dispatch(setGrid(newGrid));
            dispatch(setColWidths(Array(doc.cols).fill(100)));
            dispatch(setRowHeights(Array(doc.rows).fill(32)));
          }
        }

        if (Array.isArray(result.payload.colWidths)) dispatch(setColWidths(result.payload.colWidths));
        if (Array.isArray(result.payload.rowHeights)) dispatch(setRowHeights(result.payload.rowHeights));
        if (result.payload.cellStyles) {
          // Загружаем стили ячеек
          Object.entries(result.payload.cellStyles).forEach(([key, style]) => {
            const [r, c] = key.split('-').map(Number);
            dispatch(setCellStyle({ r, c, style: style as any }));
          });
        }
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

  // ручное сохранение Ctrl+S и Undo/Redo и форматирование
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Сохранение
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        dispatch(loadDocument(docId));
      }
      // Undo
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        dispatch(undo());
      }
      // Redo
      if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
        e.preventDefault();
        dispatch(redo());
      }
      // Форматирование: Bold
      if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
        e.preventDefault();
        const key = `${activeCell.r}-${activeCell.c}`;
        const currentStyle = cellStyles[key] || {};
        dispatch(setCellStyle({ r: activeCell.r, c: activeCell.c, style: { bold: !currentStyle.bold } }));
      }
      // Форматирование: Italic
      if ((e.ctrlKey || e.metaKey) && e.key === 'i') {
        e.preventDefault();
        const key = `${activeCell.r}-${activeCell.c}`;
        const currentStyle = cellStyles[key] || {};
        dispatch(setCellStyle({ r: activeCell.r, c: activeCell.c, style: { italic: !currentStyle.italic } }));
      }
      // Форматирование: Underline
      if ((e.ctrlKey || e.metaKey) && e.key === 'u') {
        e.preventDefault();
        const key = `${activeCell.r}-${activeCell.c}`;
        const currentStyle = cellStyles[key] || {};
        dispatch(setCellStyle({ r: activeCell.r, c: activeCell.c, style: { underline: !currentStyle.underline } }));
      }
      // Копировать
      if ((e.ctrlKey || e.metaKey) && e.key === 'c') {
        e.preventDefault();
        dispatch(copyCells());
      }
      // Вырезать
      if ((e.ctrlKey || e.metaKey) && e.key === 'x') {
        e.preventDefault();
        dispatch(cutCells());
      }
      // Вставить
      if ((e.ctrlKey || e.metaKey) && e.key === 'v') {
        e.preventDefault();
        dispatch(pasteCells());
      }
      // Выделить все
      if ((e.ctrlKey || e.metaKey) && e.key === 'a') {
        e.preventDefault();
        dispatch(selectAll());
      }
      // Очистить ячейку
      if ((e.key === 'Delete' || e.key === 'Backspace') && !editing) {
        e.preventDefault();
        dispatch(clearCell({ r: activeCell.r, c: activeCell.c }));
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [dispatch, docId, activeCell, cellStyles, editing]);

  const saveEdit = useCallback((val: string) => {
    dispatch(setCellValue({ r: activeCell.r, c: activeCell.c, value: val }));
    dispatch(setEditingAction(false));
  }, [activeCell, dispatch]);

  // форматирование значения ячейки
  const formatCellValue = (value: string, format?: 'number' | 'percent' | 'currency' | 'date'): string => {
    if (!format || format === 'number') return value;
    const num = parseFloat(value);
    if (isNaN(num)) return value;

    switch (format) {
      case 'percent':
        return `${(num * 100).toFixed(2)}%`;
      case 'currency':
        return `$${num.toFixed(2)}`;
      case 'date':
        try {
          const date = new Date(value);
          return isNaN(date.getTime()) ? value : date.toLocaleDateString('ru-RU');
        } catch {
          return value;
        }
      default:
        return value;
    }
  };

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
      // При Shift расширяем выделение от начальной точки
      dispatch(setSelectionRangeAction({ start: selectionRange.start, end: { r, c } }));
      dispatch(setActiveCellAction({ r, c }));
    } else {
      // Обычный клик - новое выделение
      dispatch(setSelectionRangeAction({ start: { r, c }, end: { r, c } }));
      dispatch(setActiveCellAction({ r, c }));
    }
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
      if (e.key === 'Enter') {
        setInputValue(grid[activeCell.r][activeCell.c]);
        dispatch(setEditingAction(true));
      }
      if (e.key === 'Tab') {
        e.preventDefault();
        const newCol = Math.min(grid[0].length - 1, activeCell.c + 1);
        dispatch(setActiveCellAction({ r: activeCell.r, c: newCol }));
      }
      if (e.key === 'Escape') {
        dispatch(setEditingAction(false));
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

      {/* Панель форматирования */}
      <div className="p-2 bg-[var(--bg-header)] border-b border-[var(--border-color)] flex items-center gap-2 flex-wrap">
        <div className="flex items-center gap-1 border-r border-[var(--border-color)] pr-2">
          <button
            onClick={() => {
              const key = `${activeCell.r}-${activeCell.c}`;
              const currentStyle = cellStyles[key] || {};
              dispatch(setCellStyle({ r: activeCell.r, c: activeCell.c, style: { bold: !currentStyle.bold } }));
            }}
            className={`px-3 py-1 rounded text-sm font-bold ${cellStyles[`${activeCell.r}-${activeCell.c}`]?.bold ? 'bg-blue-600 text-white' : 'bg-gray-700 text-white hover:bg-gray-600'}`}
            title="Жирный (Ctrl+B)"
          >
            B
          </button>
          <button
            onClick={() => {
              const key = `${activeCell.r}-${activeCell.c}`;
              const currentStyle = cellStyles[key] || {};
              dispatch(setCellStyle({ r: activeCell.r, c: activeCell.c, style: { italic: !currentStyle.italic } }));
            }}
            className={`px-3 py-1 rounded text-sm italic ${cellStyles[`${activeCell.r}-${activeCell.c}`]?.italic ? 'bg-blue-600 text-white' : 'bg-gray-700 text-white hover:bg-gray-600'}`}
            title="Курсив (Ctrl+I)"
          >
            I
          </button>
          <button
            onClick={() => {
              const key = `${activeCell.r}-${activeCell.c}`;
              const currentStyle = cellStyles[key] || {};
              dispatch(setCellStyle({ r: activeCell.r, c: activeCell.c, style: { underline: !currentStyle.underline } }));
            }}
            className={`px-3 py-1 rounded text-sm underline ${cellStyles[`${activeCell.r}-${activeCell.c}`]?.underline ? 'bg-blue-600 text-white' : 'bg-gray-700 text-white hover:bg-gray-600'}`}
            title="Подчёркивание (Ctrl+U)"
          >
            U
          </button>
        </div>

        <div className="flex items-center gap-1 border-r border-[var(--border-color)] pr-2">
          <label className="text-xs text-[var(--text-muted)] mr-1">Фон:</label>
          <input
            type="color"
            value={cellStyles[`${activeCell.r}-${activeCell.c}`]?.backgroundColor || '#ffffff'}
            onChange={(e) => dispatch(setCellStyle({ r: activeCell.r, c: activeCell.c, style: { backgroundColor: e.target.value } }))}
            className="w-8 h-8 rounded cursor-pointer"
            title="Цвет фона"
          />
          <label className="text-xs text-[var(--text-muted)] ml-2 mr-1">Текст:</label>
          <input
            type="color"
            value={cellStyles[`${activeCell.r}-${activeCell.c}`]?.textColor || '#000000'}
            onChange={(e) => dispatch(setCellStyle({ r: activeCell.r, c: activeCell.c, style: { textColor: e.target.value } }))}
            className="w-8 h-8 rounded cursor-pointer"
            title="Цвет текста"
          />
        </div>

        <div className="flex items-center gap-1 border-r border-[var(--border-color)] pr-2">
          <button
            onClick={() => dispatch(setCellStyle({ r: activeCell.r, c: activeCell.c, style: { alignment: 'left' } }))}
            className={`px-3 py-1 rounded text-sm ${cellStyles[`${activeCell.r}-${activeCell.c}`]?.alignment === 'left' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-white hover:bg-gray-600'}`}
            title="По левому краю"
          >
            ⬅
          </button>
          <button
            onClick={() => dispatch(setCellStyle({ r: activeCell.r, c: activeCell.c, style: { alignment: 'center' } }))}
            className={`px-3 py-1 rounded text-sm ${cellStyles[`${activeCell.r}-${activeCell.c}`]?.alignment === 'center' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-white hover:bg-gray-600'}`}
            title="По центру"
          >
            ↔
          </button>
          <button
            onClick={() => dispatch(setCellStyle({ r: activeCell.r, c: activeCell.c, style: { alignment: 'right' } }))}
            className={`px-3 py-1 rounded text-sm ${cellStyles[`${activeCell.r}-${activeCell.c}`]?.alignment === 'right' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-white hover:bg-gray-600'}`}
            title="По правому краю"
          >
            ➡
          </button>
        </div>

        <div className="flex items-center gap-1">
          <label className="text-xs text-[var(--text-muted)] mr-1">Формат:</label>
          <select
            value={cellStyles[`${activeCell.r}-${activeCell.c}`]?.format || 'number'}
            onChange={(e) => dispatch(setCellStyle({ r: activeCell.r, c: activeCell.c, style: { format: e.target.value as 'number' | 'percent' | 'currency' | 'date' } }))}
            className="bg-gray-700 text-white px-2 py-1 rounded text-xs"
          >
            <option value="number">Число</option>
            <option value="percent">Процент</option>
            <option value="currency">Валюта</option>
            <option value="date">Дата</option>
          </select>
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
                const cellKey = `${r}-${c}`;
                const style = cellStyles[cellKey] || {};

                const cellStyle: React.CSSProperties = {
                  height: `${Array.isArray(rowHeights) ? rowHeights[r] : 32}px`,
                  backgroundColor: style.backgroundColor,
                  color: style.textColor,
                  fontWeight: style.bold ? 'bold' : 'normal',
                  fontStyle: style.italic ? 'italic' : 'normal',
                  textDecoration: style.underline ? 'underline' : 'none',
                  textAlign: style.alignment || 'left',
                };

                let displayValue = cell;
                if (cell.startsWith('=')) {
                  displayValue = evaluateFormula(cell, grid);
                }
                displayValue = formatCellValue(displayValue, style.format);

                return (
                  <div key={c} className={`cell-wrapper ${active ? 'active' : ''} ${inSelection && !active ? 'in-selection' : ''}`} style={cellStyle} onClick={(e) => handleCellClick(r, c, e)} onDoubleClick={() => { setInputValue(cell); dispatch(setEditingAction(true)); }}>
                    {editing && active ? (
                      <input autoFocus className="cell-input-fixed" value={inputValue} onChange={(e) => setInputValue(e.target.value)} onBlur={() => saveEdit(inputValue)} onKeyDown={(e) => e.key === 'Enter' && saveEdit(inputValue)} />
                    ) : (
                      <div className="w-full px-2 truncate text-sm" style={{ color: style.textColor || 'var(--text-main)' }}>
                        {cell.startsWith('=') ? <span className="text-blue-400">{displayValue}</span> : displayValue}
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