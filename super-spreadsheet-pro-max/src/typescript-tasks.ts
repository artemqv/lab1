// Итоговое задание по TypeScript

// 1. Интерфейсы и типы
export interface User {
  id: number;
  name: string;
  email?: string;
  isActive: boolean;
}

export type Genre = 'fiction' | 'non-fiction';

export interface Book {
  title: string;
  author: string;
  year?: number;
  genre: Genre;
}

// 2. Функции с параметрами по умолчанию
export function createUser(
  id: number,
  name: string,
  email?: string,
  isActive: boolean = true
): User {
  return {
    id,
    name,
    email,
    isActive
  };
}

export function createBook(book: Book): Book {
  return book;
}

// 3. Перегрузка функций
export function calculateArea(shape: 'circle', radius: number): number;
export function calculateArea(shape: 'square', side: number): number;
export function calculateArea(
  shape: 'circle' | 'square',
  value: number
): number {
  if (shape === 'circle') {
    return Math.PI * value * value;
  }
  return value * value;
}

// 4. Union типы
export type Status = 'active' | 'inactive' | 'new';

export function getStatusColor(status: Status): string {
  switch (status) {
    case 'active':
      return 'green';
    case 'inactive':
      return 'red';
    case 'new':
      return 'blue';
  }
}

// 5. Типы функций
export type StringFormatter = (value: string, uppercase?: boolean) => string;

export const capitalizeFirst: StringFormatter = (value) => {
  if (!value) return value;
  return value[0].toUpperCase() + value.slice(1);
};

export const trimAndFormat: StringFormatter = (value, uppercase = false) => {
  const trimmed = value.trim();
  return uppercase ? trimmed.toUpperCase() : trimmed;
};

// 6. Generic функции
export function getFirstElement<T>(arr: T[]): T | undefined {
  return arr[0];
}

// 7. Generic с ограничениями
export interface HasId {
  id: number;
}

export function findById<T extends HasId>(
  items: T[],
  id: number
): T | undefined {
  return items.find(item => item.id === id);
}
