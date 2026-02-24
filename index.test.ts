
import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  createUser,
  createBook,
  calculateArea,
  getStatusColor,
  capitalizeFirst,
  trimAndFormat,
  getFirstElement,
  findById,
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