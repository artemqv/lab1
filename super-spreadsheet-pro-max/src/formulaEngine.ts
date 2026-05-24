const parseCoords = (cellRef: string): { r: number; c: number } => {
  const match = cellRef.match(/^([A-Z]+)(\d+)$/);
  if (!match) return { r: 0, c: 0 };
  
  const colStr = match[1];
  const rowStr = match[2];
  
  let c = 0;
  for (let i = 0; i < colStr.length; i++) {
    c = c * 26 + (colStr.charCodeAt(i) - 65 + 1);
  }
  c = c - 1; 
  
  const r = parseInt(rowStr, 10) - 1;
  return { r, c };
};
// движок для вычисления формул в ячейках
export const evaluateFormula = (formula: string, grid: string[][]): string => {
  if (!formula.startsWith('=')) return formula;
  try {
    const query = formula.slice(1).toUpperCase();

    // функция SUM - суммирование диапазона
    if (query.startsWith('SUM(')) {
      const rangeMatch = query.match(/\(([A-Z]\d+):([A-Z]\d+)\)/);
      if (rangeMatch) {
        const start = parseCoords(rangeMatch[1]);
        const end = parseCoords(rangeMatch[2]);
        let sum = 0;
        // проходим по всем ячейкам в диапазоне
        for (let r = start.r; r <= end.r; r++) {
          for (let c = start.c; c <= end.c; c++) {
            const val = parseFloat(grid[r][c]);
            if (!isNaN(val)) sum += val;
          }
        }
        return sum.toString();
      }
    }

    // функция AVERAGE - среднее значение
    if (query.startsWith('AVERAGE(')) {
      const rangeMatch = query.match(/\(([A-Z]\d+):([A-Z]\d+)\)/);
      if (rangeMatch) {
        const start = parseCoords(rangeMatch[1]);
        const end = parseCoords(rangeMatch[2]);
        let sum = 0, count = 0;
        for (let r = start.r; r <= end.r; r++) {
          for (let c = start.c; c <= end.c; c++) {
            const val = parseFloat(grid[r][c]);
            if (!isNaN(val)) { sum += val; count++; }
          }
        }
        return count === 0 ? '#ДЕЛ/0!' : (sum / count).toString();
      }
    }

    // общие выражения типа =A1+B1*2
    let expr = query;
    const cellRefs = expr.match(/[A-Z]\d+/g) || [];
    for (const ref of cellRefs) {
      const { r, c } = parseCoords(ref);
      const val = grid[r]?.[c] || '0';
      const num = parseFloat(val);
      expr = expr.replace(new RegExp(ref, 'g'), isNaN(num) ? '0' : val);
    }
    const result = eval(expr); // WARNING: Using eval is generally discouraged due to security risks and performance. For a production-grade application, consider a custom formula parser or a safer expression evaluation library. 
    return result.toString();
  } catch (e) {
    return '#ОШИБКА!';
  }
};
