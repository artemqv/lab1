import React, { useCallback } from 'react';
import { Grid } from 'react-window';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import {
  setActiveCell,
  setSelectionRange,
  setEditing,
} from '../store/spreadsheetSlice';
import { evaluateFormula } from '../formulaEngine';

interface VirtualizedSpreadsheetProps {
  docId: string;
  containerWidth: number;
  containerHeight: number;
}

const VirtualizedSpreadsheet: React.FC<VirtualizedSpreadsheetProps> = ({
  containerWidth,
  containerHeight,
}) => {
  const dispatch = useAppDispatch();
  const grid = useAppSelector((state) => state.spreadsheet.grid);
  const cellStyles = useAppSelector((state) => state.spreadsheet.cellStyles);
  const activeCell = useAppSelector((state) => state.spreadsheet.activeCell);
  const selectionRange = useAppSelector((state) => state.spreadsheet.selectionRange);
  const colWidths = useAppSelector((state) => state.spreadsheet.colWidths);
  const rowHeights = useAppSelector((state) => state.spreadsheet.rowHeights);

  const columnCount = grid[0]?.length || 26;
  const rowCount = grid.length || 100;

  const getColumnWidth = useCallback(
    (index: number) => colWidths[index] || 100,
    [colWidths]
  );

  const getRowHeight = useCallback(
    (index: number) => rowHeights[index] || 32,
    [rowHeights]
  );

  const isInRange = useCallback(
    (r: number, c: number): boolean => {
      if (!selectionRange) return false;
      const minRow = Math.min(selectionRange.start.r, selectionRange.end.r);
      const maxRow = Math.max(selectionRange.start.r, selectionRange.end.r);
      const minCol = Math.min(selectionRange.start.c, selectionRange.end.c);
      const maxCol = Math.max(selectionRange.start.c, selectionRange.end.c);
      return r >= minRow && r <= maxRow && c >= minCol && c <= maxCol;
    },
    [selectionRange]
  );

  const formatCellValue = useCallback(
    (value: string, format?: 'number' | 'percent' | 'currency' | 'date'): string => {
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
    },
    []
  );

  const Cell = useCallback(
    ({ columnIndex, rowIndex, style }: any) => {
      const r = rowIndex;
      const c = columnIndex;
      const cell = grid[r]?.[c] || '';
      const active = activeCell.r === r && activeCell.c === c;
      const inSelection = isInRange(r, c);
      const cellKey = `${r}-${c}`;
      const cellStyle = cellStyles[cellKey] || {};

      const combinedStyle: React.CSSProperties = {
        ...style,
        backgroundColor: cellStyle.backgroundColor,
        color: cellStyle.textColor,
        fontWeight: cellStyle.bold ? 'bold' : 'normal',
        fontStyle: cellStyle.italic ? 'italic' : 'normal',
        textDecoration: cellStyle.underline ? 'underline' : 'none',
        textAlign: cellStyle.alignment || 'left',
        border: '1px solid var(--border-color)',
        padding: '4px 8px',
        display: 'flex',
        alignItems: 'center',
      };

      if (active) {
        combinedStyle.outline = '2px solid var(--accent)';
        combinedStyle.outlineOffset = '-2px';
      } else if (inSelection) {
        combinedStyle.backgroundColor = 'rgba(59, 130, 246, 0.2)';
      }

      let displayValue = cell;
      if (cell.startsWith('=')) {
        displayValue = evaluateFormula(cell, grid);
      }
      displayValue = formatCellValue(displayValue, cellStyle.format);

      const handleClick = (e: React.MouseEvent) => {
        if (e.shiftKey && selectionRange) {
          dispatch(setSelectionRange({ start: selectionRange.start, end: { r, c } }));
        } else {
          dispatch(setSelectionRange({ start: { r, c }, end: { r, c } }));
        }
        dispatch(setActiveCell({ r, c }));
        dispatch(setEditing(false));
      };

      const handleDoubleClick = () => {
        dispatch(setEditing(true));
      };

      return (
        <div style={combinedStyle} onClick={handleClick} onDoubleClick={handleDoubleClick}>
          <div className="truncate text-sm" style={{ color: cellStyle.textColor || 'var(--text-main)' }}>
            {cell.startsWith('=') ? <span className="text-blue-400">{displayValue}</span> : displayValue}
          </div>
        </div>
      );
    },
    [grid, cellStyles, activeCell, selectionRange, isInRange, formatCellValue, dispatch]
  );

  return (
    <Grid
      columnCount={columnCount}
      columnWidth={getColumnWidth}
      defaultHeight={containerHeight}
      defaultWidth={containerWidth}
      rowCount={rowCount}
      rowHeight={getRowHeight}
      cellComponent={Cell}
      cellProps={{}}
    />
  );
};

export default React.memo(VirtualizedSpreadsheet);
