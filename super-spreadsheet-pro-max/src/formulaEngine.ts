export const evaluateFormula = (formula: string, grid: string[][]): string => {
  if (!formula.startsWith('=')) return formula;
  try {
    const query = formula.slice(1).toUpperCase();
    // SUM
    if (query.startsWith('SUM(')) {
      const rangeMatch = query.match(/\(([A-Z]\d+):([A-Z]\d+)\)/);
      if (rangeMatch) {
        const start = parseCoords(rangeMatch[1]);
        const end = parseCoords(rangeMatch[2]);
        let sum = 0;
        for (let r = start.r; r <= end.r; r++) {
          for (let c = start.c; c <= end.c; c++) {
            const val = parseFloat(grid[r][c]);
            if (!isNaN(val)) sum += val;
          }
        }
        return sum.toString();
      }
    }
    // AVERAGE
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
    // общие выражения =A1+B1*2
    let expr = query;
    const cellRefs = expr.match(/[A-Z]\d+/g) || [];
    for (const ref of cellRefs) {
      const { r, c } = parseCoords(ref);
      const val = grid[r]?.[c] || '0';
      const num = parseFloat(val);
      expr = expr.replace(new RegExp(ref, 'g'), isNaN(num) ? '0' : val);
    }
    const result = eval(expr);
    return result.toString();
  } catch (e) {
    return '#ОШИБКА!';
  }
};

const parseCoords = (coord: string) => {
  const match = coord.match(/([A-Z])(\d+)/);
  if (!match) return { r: 0, c: 0 };
  const col = match[1].charCodeAt(0) - 65;
  const row = parseInt(match[2]) - 1;
  return { r: row, c: col };
};