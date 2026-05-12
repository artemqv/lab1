import React, { useState, useEffect, useCallback } from 'react';
import { evaluateFormula } from './formulaEngine';

const ROWS = 50;
const COLS = 26;
const createEmptyGrid = () => Array(ROWS).fill("").map(() => Array(COLS).fill(""));

const Spreadsheet = ({ docId }: { docId: string }) => {
  const [grid, setGrid] = useState<string[][]>(createEmptyGrid());
  const [activeCell, setActiveCell] = useState<{r: number, c: number}>({ r: 0, c: 0 });
  const [editing, setEditing] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [colWidths, setColWidths] = useState<number[]>(Array(COLS).fill(100));
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  useEffect(() => {
    const saved = localStorage.getItem(`spreadsheet_data_${docId}`);
    setGrid(saved ? JSON.parse(saved) : createEmptyGrid());
    document.documentElement.setAttribute('data-theme', theme);
  }, [docId, theme]);

  useEffect(() => {
    if (grid.length > 0) {
      const timer = setTimeout(() => {
        localStorage.setItem(`spreadsheet_data_${docId}`, JSON.stringify(grid));
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [grid, docId]);

  const saveEdit = useCallback((val: string) => {
    setGrid(prev => {
      const newGrid = [...prev];
      newGrid[activeCell.r] = [...newGrid[activeCell.r]];
      newGrid[activeCell.r][activeCell.c] = val;
      return newGrid;
    });
    setEditing(false);
  }, [activeCell]);

  const handleResize = (index: number, e: React.MouseEvent) => {
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

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (editing) return;
      if (e.key === 'ArrowUp') setActiveCell(p => ({ ...p, r: Math.max(0, p.r - 1) }));
      if (e.key === 'ArrowDown') setActiveCell(p => ({ ...p, r: Math.min(ROWS - 1, p.r + 1) }));
      if (e.key === 'ArrowLeft') setActiveCell(p => ({ ...p, c: Math.max(0, p.c - 1) }));
      if (e.key === 'ArrowRight') setActiveCell(p => ({ ...p, c: Math.min(COLS - 1, p.c + 1) }));
      if (e.key === 'Delete' || e.key === 'Backspace') saveEdit("");
      if (e.key === 'Enter') { setInputValue(grid[activeCell.r][activeCell.c]); setEditing(true); }
      if (e.key.length === 1 && !e.ctrlKey && !e.metaKey) { setInputValue(e.key); setEditing(true); }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeCell, editing, grid, saveEdit]);

  const exportToCSV = () => {
    const csv = grid.map(row => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `doc_${docId}.csv`;
    a.click();
  };

  return (
    <div className="flex flex-col h-screen select-none bg-[var(--bg-main)]">
      <div className="p-2 bg-[var(--bg-header)] border-b border-[var(--border-color)] flex items-center gap-4">
        <button onClick={() => setTheme(t => t === 'dark' ? 'light' : 'dark')} className="bg-[var(--accent)] text-white px-3 py-1 rounded text-xs font-bold">
          {theme === 'dark' ? '☀️ LIGHT' : '🌙 DARK'}
        </button>
        <button onClick={exportToCSV} className="bg-green-700 text-white px-3 py-1 rounded text-xs font-bold">📥 CSV</button>
        <div className="flex-1 bg-[var(--bg-main)] border border-[var(--border-color)] px-3 py-1 rounded flex text-sm text-[var(--text-main)]">
          <span className="text-[var(--accent)] font-bold mr-2 italic">fx</span>
          <input className="bg-transparent outline-none w-full" value={editing ? inputValue : grid[activeCell.r][activeCell.c]} onChange={(e) => setInputValue(e.target.value)} onBlur={() => editing && saveEdit(inputValue)} />
        </div>
      </div>
      <div className="flex-1 overflow-auto p-4">
        <div className="spreadsheet-container" style={{ gridTemplateColumns: `40px ${colWidths.map(w => `${w}px`).join(' ')}` }}>
          <div className="header-cell sticky top-0 left-0 z-40"></div>
          {colWidths.map((_, i) => (
            <div key={i} className="header-cell sticky top-0 z-10">
              {String.fromCharCode(65 + i)}
              <div className="resizer" onMouseDown={(e) => handleResize(i, e)} />
            </div>
          ))}
          {grid.map((row, r) => (
            <React.Fragment key={r}>
              <div className="header-cell sticky left-0 z-10">{r + 1}</div>
              {row.map((cell, c) => {
                const active = activeCell.r === r && activeCell.c === c;
                return (
                  <div key={c} className={`cell-wrapper ${active ? 'active' : ''}`} onClick={() => { setEditing(false); setActiveCell({ r, c }); }} onDoubleClick={() => { setInputValue(cell); setEditing(true); }}>
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
    </div>
  );
};

export default Spreadsheet;