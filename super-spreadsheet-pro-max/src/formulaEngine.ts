// Парсинг координат ячейки (например, "A1" -> {r: 0, c: 0})
const parseCoords = (cellRef: string): { r: number; c: number } => {
  const match = cellRef.match(/^([A-Z]+)(\d+)$/);
  if (!match) return { r: 0, c: 0 };

  const colStr = match[1];
  const rowStr = match[2];

  // Преобразуем буквы в номер столбца (A=0, B=1, ..., Z=25, AA=26, ...)
  let c = 0;
  for (let i = 0; i < colStr.length; i++) {
    c = c * 26 + (colStr.charCodeAt(i) - 65 + 1);
  }
  c = c - 1;

  const r = parseInt(rowStr, 10) - 1;
  return { r, c };
};

// Вычисление формул в ячейках
export const evaluateFormula = (formula: string, grid: string[][]): string => {
  if (!formula.startsWith('=')) return formula;

  try {
    const query = formula.slice(1).toUpperCase();

    // Функция SUM - суммирование диапазона
    if (query.startsWith('SUM(')) {
      const rangeMatch = query.match(/\(([A-Z]+\d+):([A-Z]+\d+)\)/);
      if (rangeMatch) {
        const start = parseCoords(rangeMatch[1]);
        const end = parseCoords(rangeMatch[2]);
        let sum = 0;

        for (let r = Math.min(start.r, end.r); r <= Math.max(start.r, end.r); r++) {
          for (let c = Math.min(start.c, end.c); c <= Math.max(start.c, end.c); c++) {
            if (grid[r] && grid[r][c]) {
              const val = parseFloat(grid[r][c]);
              if (!isNaN(val)) sum += val;
            }
          }
        }
        return sum.toString();
      }
    }

    // Функция AVERAGE - среднее значение
    if (query.startsWith('AVERAGE(')) {
      const rangeMatch = query.match(/\(([A-Z]+\d+):([A-Z]+\d+)\)/);
      if (rangeMatch) {
        const start = parseCoords(rangeMatch[1]);
        const end = parseCoords(rangeMatch[2]);
        let sum = 0;
        let count = 0;

        for (let r = Math.min(start.r, end.r); r <= Math.max(start.r, end.r); r++) {
          for (let c = Math.min(start.c, end.c); c <= Math.max(start.c, end.c); c++) {
            if (grid[r] && grid[r][c]) {
              const val = parseFloat(grid[r][c]);
              if (!isNaN(val)) {
                sum += val;
                count++;
              }
            }
          }
        }
        return count === 0 ? '#ДЕЛ/0!' : (sum / count).toString();
      }
    }

    // Функция MIN - минимальное значение
    if (query.startsWith('MIN(')) {
      const rangeMatch = query.match(/\(([A-Z]+\d+):([A-Z]+\d+)\)/);
      if (rangeMatch) {
        const start = parseCoords(rangeMatch[1]);
        const end = parseCoords(rangeMatch[2]);
        let min = Infinity;

        for (let r = Math.min(start.r, end.r); r <= Math.max(start.r, end.r); r++) {
          for (let c = Math.min(start.c, end.c); c <= Math.max(start.c, end.c); c++) {
            if (grid[r] && grid[r][c]) {
              const val = parseFloat(grid[r][c]);
              if (!isNaN(val)) min = Math.min(min, val);
            }
          }
        }
        return min === Infinity ? '#Н/Д' : min.toString();
      }
    }

    // Функция MAX - максимальное значение
    if (query.startsWith('MAX(')) {
      const rangeMatch = query.match(/\(([A-Z]+\d+):([A-Z]+\d+)\)/);
      if (rangeMatch) {
        const start = parseCoords(rangeMatch[1]);
        const end = parseCoords(rangeMatch[2]);
        let max = -Infinity;

        for (let r = Math.min(start.r, end.r); r <= Math.max(start.r, end.r); r++) {
          for (let c = Math.min(start.c, end.c); c <= Math.max(start.c, end.c); c++) {
            if (grid[r] && grid[r][c]) {
              const val = parseFloat(grid[r][c]);
              if (!isNaN(val)) max = Math.max(max, val);
            }
          }
        }
        return max === -Infinity ? '#Н/Д' : max.toString();
      }
    }

    // Функция COUNT - количество числовых ячеек
    if (query.startsWith('COUNT(')) {
      const rangeMatch = query.match(/\(([A-Z]+\d+):([A-Z]+\d+)\)/);
      if (rangeMatch) {
        const start = parseCoords(rangeMatch[1]);
        const end = parseCoords(rangeMatch[2]);
        let count = 0;

        for (let r = Math.min(start.r, end.r); r <= Math.max(start.r, end.r); r++) {
          for (let c = Math.min(start.c, end.c); c <= Math.max(start.c, end.c); c++) {
            if (grid[r] && grid[r][c]) {
              const val = parseFloat(grid[r][c]);
              if (!isNaN(val)) count++;
            }
          }
        }
        return count.toString();
      }
    }

    // Арифметические выражения (например, =A1+B1*2)
    let expr = query;
    const cellRefs = expr.match(/[A-Z]+\d+/g) || [];

    // Заменяем ссылки на ячейки их значениями
    for (const ref of cellRefs) {
      const { r, c } = parseCoords(ref);
      const val = grid[r]?.[c] || '0';
      const num = parseFloat(val);
      expr = expr.replace(new RegExp(ref, 'g'), isNaN(num) ? '0' : val);
    }

    // Вычисляем выражение
    const result = eval(expr);
    return result.toString();
  } catch (e) {
    return '#ОШИБКА!';
  }
};
