import React, { useState, useEffect, useCallback, useRef } from 'react';
import { evaluateFormula } from './formulaEngine';

const DEFAULT_ROWS = 100;
const DEFAULT_COLS = 26;

const createEmptyGrid = (rows = DEFAULT_ROWS, cols = DEFAULT_COLS) =>
  Array(rows).fill("").map(() => Array(cols).fill(""));

const deepCopyGrid = (grid: string[][]) => grid.map(row => [...row]);

const Spreadsheet = ({ docId }: { docId: string }) => {
  const [grid, setGrid] = useState<string[][]>(createEmptyGrid());
  const [activeCell, setActiveCell] = useState<{ r: number; c: number }>({ r: 0, c: 0 });
  const [editing, setEditing] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [colWidths, setColWidths] = useState<number[]>(Array(DEFAULT_COLS).fill(100));
  const [rowHeights, setRowHeights] = useState<number[]>(Array(DEFAULT_ROWS).fill(32));
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [selectionRange, setSelectionRange] = useState<{ start: { r: number; c: number }; end: { r: number; c: number } } | null>(null);
  const [contextMenu, setContextMenu] = useState<{ visible: boolean; x: number; y: number; type: 'row' | 'col'; index: number } | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [importProgress, setImportProgress] = useState<string | null>(null);

  // загрузка сейвддаты
  useEffect(() => {
    const saved = localStorage.getItem(`spreadsheet_data_${docId}`);
    const savedColWidths = localStorage.getItem(`spreadsheet_colwidths_${docId}`);
    const savedRowHeights = localStorage.getItem(`spreadsheet_rowheights_${docId}`);
    setGrid(saved ? JSON.parse(saved) : createEmptyGrid());
    if (savedColWidths) setColWidths(JSON.parse(savedColWidths));
    if (savedRowHeights) setRowHeights(JSON.parse(savedRowHeights));
    document.documentElement.setAttribute('data-theme', theme);
  }, [docId, theme]);

  // автосейв
  useEffect(() => {
    if (grid.length) {
      const timer = setTimeout(() => {
        localStorage.setItem(`spreadsheet_data_${docId}`, JSON.stringify(grid));
        localStorage.setItem(`spreadsheet_colwidths_${docId}`, JSON.stringify(colWidths));
        localStorage.setItem(`spreadsheet_rowheights_${docId}`, JSON.stringify(rowHeights));
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [grid, colWidths, rowHeights, docId]);

  const saveEdit = useCallback((val: string) => {
    setGrid(prev => {
      const newGrid = deepCopyGrid(prev);
      newGrid[activeCell.r][activeCell.c] = val;
      return newGrid;
    });
    setEditing(false);
  }, [activeCell]);

  // ширина высота
  const handleColResize = (index: number, e: React.MouseEvent) => {
    e.preventDefault();
    const startX = e.pageX;
    const startWidth = colWidths[index];
    const onMouseMove = (me: MouseEvent) => {
      const newWidth = Math.max(50, startWidth + (me.pageX - startX));
      setColWidths(prev => {
        const next = [...prev];
        next[index] = newWidth;
        return next;
      });
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
      setRowHeights(prev => {
        const next = [...prev];
        next[index] = newHeight;
        return next;
      });
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
    setGrid(prev => {
      const newGrid = deepCopyGrid(prev);
      newGrid.splice(index, 0, Array(prev[0].length).fill(""));
      newGrid.pop();
      return newGrid;
    });
    setRowHeights(prev => {
      const newHeights = [...prev];
      newHeights.splice(index, 0, 32);
      newHeights.pop();
      return newHeights;
    });
    if (activeCell.r >= index) setActiveCell(prev => ({ ...prev, r: Math.min(prev.r + 1, DEFAULT_ROWS - 1) }));
  }, [activeCell.r]);

  const deleteRow = useCallback((index: number) => {
    setGrid(prev => {
      const newGrid = deepCopyGrid(prev);
      newGrid.splice(index, 1);
      newGrid.push(Array(prev[0].length).fill(""));
      return newGrid;
    });
    setRowHeights(prev => {
      const newHeights = [...prev];
      newHeights.splice(index, 1);
      newHeights.push(32);
      return newHeights;
    });
    if (activeCell.r === index) setActiveCell(prev => ({ ...prev, r: Math.max(0, prev.r - 1) }));
    else if (activeCell.r > index) setActiveCell(prev => ({ ...prev, r: prev.r - 1 }));
  }, [activeCell.r]);

  const insertColumn = useCallback((index: number) => {
    setGrid(prev => deepCopyGrid(prev).map(row => {
      row.splice(index, 0, "");
      row.pop();
      return row;
    }));
    setColWidths(prev => {
      const newWidths = [...prev];
      newWidths.splice(index, 0, 100);
      newWidths.pop();
      return newWidths;
    });
    if (activeCell.c >= index) setActiveCell(prev => ({ ...prev, c: Math.min(prev.c + 1, DEFAULT_COLS - 1) }));
  }, [activeCell.c]);

  const deleteColumn = useCallback((index: number) => {
    setGrid(prev => deepCopyGrid(prev).map(row => {
      row.splice(index, 1);
      row.push("");
      return row;
    }));
    setColWidths(prev => {
      const newWidths = [...prev];
      newWidths.splice(index, 1);
      newWidths.push(100);
      return newWidths;
    });
    if (activeCell.c === index) setActiveCell(prev => ({ ...prev, c: Math.max(0, prev.c - 1) }));
    else if (activeCell.c > index) setActiveCell(prev => ({ ...prev, c: prev.c - 1 }));
  }, [activeCell.c]);

  // контекстное меню
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setContextMenu(null);
    };
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

  const handleCellClick = (r: number, c: number, e: React.MouseEvent) => {
    if (e.shiftKey && selectionRange) {
      setSelectionRange({ start: selectionRange.start, end: { r, c } });
    } else {
      setSelectionRange({ start: { r, c }, end: { r, c } });
    }
    setActiveCell({ r, c });
    setEditing(false);
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
          setSelectionRange({ start: selectionRange.start, end: { r: newR, c: newC } });
        } else {
          setSelectionRange({ start: { r: newR, c: newC }, end: { r: newR, c: newC } });
        }
        setActiveCell({ r: newR, c: newC });
      }
      if (e.key === 'Delete' || e.key === 'Backspace') saveEdit("");
      if (e.key === 'Enter') {
        setInputValue(grid[activeCell.r][activeCell.c]);
        setEditing(true);
      }
      if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.shiftKey) {
        setInputValue(e.key);
        setEditing(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeCell, editing, grid, saveEdit, selectionRange]);

  // выезд csv
  const exportToCSV = () => {
    const rows = grid.map(row =>
      row.map((cell, cIdx) => {
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
        setRowHeights(prev => [...prev, ...Array(extra).fill(32)]);
      }
      if (numCols > workingGrid[0].length) {
        const extra = numCols - workingGrid[0].length;
        for (let i = 0; i < workingGrid.length; i++) {
          for (let j = 0; j < extra; j++) workingGrid[i].push("");
        }
        setColWidths(prev => [...prev, ...Array(extra).fill(100)]);
      }
      const CHUNK = 50;
      let start = 0;
      setImportProgress(`Импорт 0/${numRows} ...`);
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
        setGrid([...workingGrid]);
        setImportProgress(`Импорт ${end}/${numRows} ...`);
        start = end;
        if (start < numRows) {
          setTimeout(processChunk, 10);
        } else {
          setImportProgress(null);
        }
      };
      processChunk();
    };
    input.click();
  };

  return (
    <div className="flex flex-col h-screen select-none bg-[var(--bg-main)]">
      {/* Верхняя панель с hotbar (кнопки + импорт/экспорт) */}
      <div className="p-2 bg-[var(--bg-header)] border-b border-[var(--border-color)] flex items-center gap-2 flex-wrap">
        <button onClick={() => setTheme(t => t === 'dark' ? 'light' : 'dark')} className="bg-[var(--accent)] text-white px-3 py-1 rounded text-xs font-bold">
          {theme === 'dark' ? '☀️ LIGHT' : '🌙 DARK'}
        </button>
        <button onClick={exportToCSV} className="bg-green-700 text-white px-3 py-1 rounded text-xs font-bold">📥 CSV</button>
        <button onClick={handleImportCSV} className="bg-blue-600 text-white px-3 py-1 rounded text-xs font-bold">📂 CSV Import</button>
        <div className="w-px h-6 bg-[var(--border-color)] mx-1"></div>

        {/* Кнопки добавления/удаления строк/колонок (hotbar) */}
        <button onClick={() => insertRow(activeCell.r)} className="bg-slate-700 hover:bg-slate-600 text-white px-3 py-1 rounded text-xs font-bold">➕ Строку выше</button>
        <button onClick={() => deleteRow(activeCell.r)} className="bg-red-800 hover:bg-red-700 text-white px-3 py-1 rounded text-xs font-bold">🗑️ Строку</button>
        <button onClick={() => insertColumn(activeCell.c)} className="bg-slate-700 hover:bg-slate-600 text-white px-3 py-1 rounded text-xs font-bold">➕ Колонку левее</button>
        <button onClick={() => deleteColumn(activeCell.c)} className="bg-red-800 hover:bg-red-700 text-white px-3 py-1 rounded text-xs font-bold">🗑️ Колонку</button>

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
        <div className="spreadsheet-container" style={{ gridTemplateColumns: `40px ${colWidths.map(w => `${w}px`).join(' ')}` }}>
          <div className="header-cell sticky top-0 left-0 z-40"></div>
          {colWidths.map((_, i) => (
            <div key={i} className="header-cell sticky top-0 z-10" style={{ height: '30px' }} onContextMenu={(e) => { e.preventDefault(); setContextMenu({ visible: true, x: e.clientX, y: e.clientY, type: 'col', index: i }); }}>
              {String.fromCharCode(65 + i)}
              <div className="resizer" onMouseDown={(e) => handleColResize(i, e)} />
            </div>
          ))}
          {grid.map((row, r) => (
            <React.Fragment key={r}>
              <div className="header-cell sticky left-0 z-10" style={{ height: `${rowHeights[r]}px`, position: 'relative' }} onContextMenu={(e) => { e.preventDefault(); setContextMenu({ visible: true, x: e.clientX, y: e.clientY, type: 'row', index: r }); }}>
                {r + 1}
                <div style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', height: '4px', cursor: 'row-resize' }} onMouseDown={(e) => handleRowResize(r, e)} />
              </div>
              {row.map((cell, c) => {
                const active = activeCell.r === r && activeCell.c === c;
                const inSelection = isInRange(r, c);
                return (
                  <div key={c} className={`cell-wrapper ${active ? 'active' : ''} ${inSelection && !active ? 'in-selection' : ''}`} onClick={(e) => handleCellClick(r, c, e)} onDoubleClick={() => { setInputValue(cell); setEditing(true); }}>
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
              <button className="w-full text-left px-4 py-2 text-sm hover:bg-[var(--bg-header)]" onClick={() => { insertRow(contextMenu.index); setContextMenu(null); }}>➕ Вставить строку выше</button>
              <button className="w-full text-left px-4 py-2 text-sm hover:bg-[var(--bg-header)] text-red-500" onClick={() => { deleteRow(contextMenu.index); setContextMenu(null); }}>🗑️ Удалить строку</button>
            </>
          )}
          {contextMenu.type === 'col' && (
            <>
              <button className="w-full text-left px-4 py-2 text-sm hover:bg-[var(--bg-header)]" onClick={() => { insertColumn(contextMenu.index); setContextMenu(null); }}>➕ Вставить столбец левее</button>
              <button className="w-full text-left px-4 py-2 text-sm hover:bg-[var(--bg-header)] text-red-500" onClick={() => { deleteColumn(contextMenu.index); setContextMenu(null); }}>🗑️ Удалить столбец</button>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default Spreadsheet;