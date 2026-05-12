export const evaluateFormula = (formula: string, grid: string[][]): string => {
  if (!formula.startsWith('=')) return formula;

  try {
    const query = formula.slice(1).toUpperCase();

    //парсим диапазон
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

    //тип функция суммы
    const preparedExpr = query.replace(/[A-Z]\d+/g, (match) => {
      const { r, c } = parseCoords(match);
      const val = grid[r][c] || '0';
      return isNaN(parseFloat(val)) ? '0' : val;
    });

    // убогий эвал
    return eval(preparedExpr).toString();
  } catch (e) {
    return '#ОШИБКА!'; 
  }
};

const parseCoords = (coord: string) => {
  const c = coord.charCodeAt(0) - 65;
  const r = parseInt(coord.slice(1)) - 1;
  return { r, c };
};