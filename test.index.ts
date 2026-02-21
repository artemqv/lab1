import {
  createUser,
  createBook,
  calculateArea,
  getStatusColor,
  capitalizeFirst,
  trimAndFormat,
  getFirstElement,
  findById
} from './index';

describe('User functions', () => {
  test('createUser creates user with correct properties', () => {
    const user = createUser(1, 'Alex', 'alex@mail.com');
    expect(user).toEqual({
      id: 1,
      name: 'Alex',
      email: 'alex@mail.com',
      isActive: true
    });
  });

  test('createUser works without email', () => {
    const user = createUser(2, 'Bob');
    expect(user).toEqual({
      id: 2,
      name: 'Bob',
      email: undefined,
      isActive: true
    });
  });
});

describe('Book functions', () => {
  test('createBook creates fiction book', () => {
    const book = createBook({
      title: '1984',
      author: 'George Orwell',
      year: 1949,
      genre: 'fiction'
    });
    expect(book).toEqual({
      title: '1984',
      author: 'George Orwell',
      year: 1949,
      genre: 'fiction'
    });
  });
});

describe('Area calculation', () => {
  test('calculateArea for circle', () => {
    expect(calculateArea('circle', 10)).toBeCloseTo(314.159, 3);
  });

  test('calculateArea for square', () => {
    expect(calculateArea('square', 5)).toBe(25);
  });
});

describe('Status color', () => {
  test('getStatusColor returns correct colors', () => {
    expect(getStatusColor('active')).toBe('green');
    expect(getStatusColor('inactive')).toBe('red');
    expect(getStatusColor('new')).toBe('blue');
  });
});

describe('String formatters', () => {
  test('capitalizeFirst capitalizes first letter', () => {
    expect(capitalizeFirst('typescript')).toBe('Typescript');
  });

  test('trimAndFormat trims and optionally uppercases', () => {
    expect(trimAndFormat('  hello world  ')).toBe('hello world');
    expect(trimAndFormat('  hello world  ', true)).toBe('HELLO WORLD');
  });
});

describe('Generic functions', () => {
  test('getFirstElement returns first element', () => {
    expect(getFirstElement([1, 2, 3])).toBe(1);
    expect(getFirstElement(['a', 'b', 'c'])).toBe('a');
    expect(getFirstElement([])).toBeUndefined();
  });

  test('findById finds item by id', () => {
    const users = [
      { id: 1, name: 'Alex' },
      { id: 2, name: 'Bob' }
    ];
    expect(findById(users, 2)).toEqual({ id: 2, name: 'Bob' });
    expect(findById(users, 3)).toBeUndefined();
  });
});