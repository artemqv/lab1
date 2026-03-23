import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { readFile, writeFile } from 'node:fs/promises'

import {
  createBook,
  calculateArea,
  getStatusColor,
  capitalizeFirst,
  trimAndFormat,
  getFirstElement,
  findById,
  csvToJSON,
  formatCSVFileToJSONFile
} from "./index.js"

describe("createBook", () => {
  it("should create book correctly", () => {
    const book = createBook({
      title: "Test",
      author: "Author",
      genre: "fiction"
    })

    expect(book.title).toBe("Test")
    expect(book.genre).toBe("fiction")
  })
})

describe("calculateArea", () => {
    it("should calculate circle area", () => {
      expect(calculateArea("circle", 10))
        .toBeCloseTo(314.159, 2)
    })
  
    it("should calculate square area", () => {
      expect(calculateArea("square", 5))
        .toBe(25)
    })
})

describe("getStatusColor", () => {
    it("should return correct color", () => {
      expect(getStatusColor("active")).toBe("green")
      expect(getStatusColor("inactive")).toBe("red")
      expect(getStatusColor("new")).toBe("blue")
    })
})

describe("String formatters", () => {
    it("capitalizeFirst", () => {
      expect(capitalizeFirst("typescript"))
        .toBe("Typescript")
    })
  
    it("trimAndFormat", () => {
      expect(trimAndFormat("  hello  "))
        .toBe("hello")
  
      expect(trimAndFormat("  hello  ", true))
        .toBe("HELLO")
    })
})

describe("getFirstElement", () => {
    it("should return first element", () => {
      expect(getFirstElement([1, 2, 3])).toBe(1)
      expect(getFirstElement(["a", "b"])).toBe("a")
    })
  
    it("should return undefined for empty array", () => {
      expect(getFirstElement([])).toBeUndefined()
    })
})

describe("findById", () => {
    const users = [
      { id: 1, name: "Alex" },
      { id: 2, name: "Bob" }
    ]
  
    it("should find user by id", () => {
      expect(findById(users, 2))
        .toEqual({ id: 2, name: "Bob" })
    })
  
    it("should return undefined if not found", () => {
      expect(findById(users, 999))
        .toBeUndefined()
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
    const mockCSV = 'name;age\nJohn' 
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