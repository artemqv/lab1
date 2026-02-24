
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { readFile, writeFile } from 'node:fs/promises'
import {
  createUser,
  createBook,
  calculateArea,
  getStatusColor,
  capitalizeFirst,
  trimAndFormat,
  getFirstElement,
  findById,
  csvToJSON,
  formatCSVFileToJSONFile
}from './index.ts'

describe('User functions', () => {
  it('createUser creates user with correct properties', () => {
    const user = createUser(1, 'Alex', 'alex@mail.com')
    expect(user).toEqual({
      id: 1,
      name: 'Alex',
      email: 'alex@mail.com',
      isActive: true
    })
  })

  it('createUser works without email', () => {
    const user = createUser(2, 'Bob')
    expect(user).toEqual({
      id: 2,
      name: 'Bob',
      email: undefined,
      isActive: true
    })
  })
})

describe('Book functions', () => {
  it('createBook creates fiction book', () => {
    const book = createBook({
      title: '1984',
      author: 'George Orwell',
      year: 1949,
      genre: 'fiction'
    })
    expect(book).toEqual({
      title: '1984',
      author: 'George Orwell',
      year: 1949,
      genre: 'fiction'
    })
  })

  it('createBook creates non-fiction book without year', () => {
    const book = createBook({
      title: 'Clean Code',
      author: 'Robert Martin',
      genre: 'non-fiction'
    })
    expect(book).toEqual({
      title: 'Clean Code',
      author: 'Robert Martin',
      genre: 'non-fiction',
      year: undefined
    })
  })
})

describe('Area calculation', () => {
  it('calculateArea for circle', () => {
    expect(calculateArea('circle', 10)).toBeCloseTo(314.159, 3)
  })

  it('calculateArea for square', () => {
    expect(calculateArea('square', 5)).toBe(25)
  })
})

describe('Status color', () => {
  it('getStatusColor returns correct colors', () => {
    expect(getStatusColor('active')).toBe('green')
    expect(getStatusColor('inactive')).toBe('red')
    expect(getStatusColor('new')).toBe('blue')
  })
})

describe('String formatters', () => {
  it('capitalizeFirst capitalizes first letter', () => {
    expect(capitalizeFirst('typescript')).toBe('Typescript')
  })

  it('capitalizeFirst handles empty string', () => {
    expect(capitalizeFirst('')).toBe('')
  })

  it('trimAndFormat trims and optionally uppercases', () => {
    expect(trimAndFormat('  hello world  ')).toBe('hello world')
    expect(trimAndFormat('  hello world  ', true)).toBe('HELLO WORLD')
  })
})

describe('Generic functions', () => {
  it('getFirstElement returns first element', () => {
    expect(getFirstElement([1, 2, 3])).toBe(1)
    expect(getFirstElement(['a', 'b', 'c'])).toBe('a')
    expect(getFirstElement([])).toBeUndefined()
  })

  it('findById finds item by id', () => {
    const users = [
      { id: 1, name: 'Alex' },
      { id: 2, name: 'Bob' }
    ]
    expect(findById(users, 2)).toEqual({ id: 2, name: 'Bob' })
    expect(findById(users, 3)).toBeUndefined()
  })
})

// Пример теста с использованием Vitest-specific функций
describe('Vitest specific features', () => {
  it('can use vi.fn() for mocking', () => {
    const mockFn = vi.fn()
    mockFn('hello')
    expect(mockFn).toHaveBeenCalledWith('hello')
    expect(mockFn).toHaveBeenCalledTimes(1)
  })

  it('can use vi.spyOn()', () => {
    const consoleSpy = vi.spyOn(console, 'log')
    
    console.log('test message')
    
    expect(consoleSpy).toHaveBeenCalledWith('test message')
    consoleSpy.mockRestore()
  })
})

describe('csvToJSON', () => {
  it('converts valid CSV to JSON objects', () => {
    const input = [
      'p1;p2;p3;p4',
      '1;A;b;c',
      '2;B;v;d'
    ]
    
    const result = csvToJSON(input, ';')
    
    expect(result).toEqual([
      { p1: 1, p2: 'A', p3: 'b', p4: 'c' },
      { p1: 2, p2: 'B', p3: 'v', p4: 'd' }
    ])
  })

  it('handles different delimiters', () => {
    const input = [
      'name,age,city',
      'John,25,New York',
      'Jane,30,Boston'
    ]
    
    const result = csvToJSON(input, ',')
    
    expect(result).toEqual([
      { name: 'John', age: 25, city: 'New York' },
      { name: 'Jane', age: 30, city: 'Boston' }
    ])
  })

  it('handles empty strings as empty strings not numbers', () => {
    const input = [
      'name,age,city',
      'John,,New York'
    ]
    
    const result = csvToJSON(input, ',')
    
    expect(result).toEqual([
      { name: 'John', age: '', city: 'New York' }
    ])
  })

  it('throws error on empty input', () => {
    expect(() => csvToJSON([], ';')).toThrow('Input array is empty')
  })

  it('throws error on empty headers', () => {
    const input = [';;', '1;2;3']
    expect(() => csvToJSON(input, ';')).toThrow('Empty headers')
  })

  it('throws error on mismatched column count', () => {
    const input = [
      'p1;p2;p3',
      '1;2',
      '3;4;5'
    ]
    expect(() => csvToJSON(input, ';')).toThrow('Row 1 has 2 values, expected 3')
  })
})

vi.mock('node:fs/promises', () => ({
  readFile: vi.fn(),
  writeFile: vi.fn()
}))

describe('formatCSVFileToJSONFile', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('reads CSV file and writes JSON file', async () => {
    const mockCSV = 'name;age\nJohn;25\nJane;30'
    vi.mocked(readFile).mockResolvedValue(mockCSV)

    await formatCSVFileToJSONFile('input.csv', 'output.json', ';')

    expect(readFile).toHaveBeenCalledWith('input.csv', 'utf-8')
    expect(writeFile).toHaveBeenCalledWith(
      'output.json',
      JSON.stringify([
        { name: 'John', age: 25 },
        { name: 'Jane', age: 30 }
      ], null, 2),
      'utf-8'
    )
  })

  it('handles empty lines in CSV file', async () => {
    const mockCSV = 'name;age\n\nJohn;25\n\nJane;30\n'
    vi.mocked(readFile).mockResolvedValue(mockCSV)

    await formatCSVFileToJSONFile('input.csv', 'output.json', ';')

    expect(writeFile).toHaveBeenCalledWith(
      'output.json',
      JSON.stringify([
        { name: 'John', age: 25 },
        { name: 'Jane', age: 30 }
      ], null, 2),
      'utf-8'
    )
  })

  it('throws error when CSV is invalid', async () => {
    const mockCSV = 'name;age\nJohn' // неверное количество колонок
    vi.mocked(readFile).mockResolvedValue(mockCSV)

    await expect(formatCSVFileToJSONFile('input.csv', 'output.json', ';'))
      .rejects
      .toThrow('Failed to process CSV file')
    
    expect(writeFile).not.toHaveBeenCalled()
  })

  it('throws error when readFile fails', async () => {
    vi.mocked(readFile).mockRejectedValue(new Error('File not found'))

    await expect(formatCSVFileToJSONFile('nonexistent.csv', 'output.json', ';'))
      .rejects
      .toThrow('Failed to process CSV file')
  })
})
console.log(".")