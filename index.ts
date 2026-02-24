export interface User {
  id: number
  name: string
  email?: string
  isActive: boolean
}

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
  }
}

const user1 = createUser(1, "Alex", "alex@mail.com")
const user2 = createUser(2, "Bob")

//книга

export type Genre = 'fiction' | 'non-fiction'

export interface Book {
  title: string
  author: string
  year?: number
  genre: Genre
}

export function createBook(book: Book): Book {
  return book
}

const book1 = createBook({
  title: "1984",
  author: "George Orwell",
  year: 1949,
  genre: 'fiction'
})

const book2 = createBook({
  title: "Clean Code",
  author: "Robert Martin",
  genre: 'non-fiction'
})


//перегрузка

export function calculateArea(shape: 'circle', radius: number): number
export function calculateArea(shape: 'square', side: number): number
export function calculateArea(
  shape: 'circle' | 'square',
  value: number
): number {
  if (shape === 'circle') {
    return Math.PI * value * value
  }
  return value * value
}

const circleArea = calculateArea('circle', 10)
const squareArea = calculateArea('square', 5)

//статус


export type Status = 'active' | 'inactive' | 'new'

export function getStatusColor(status: Status): string {
  switch (status) {
    case 'active':
      return 'green'
    case 'inactive':
      return 'red'
    case 'new':
      return 'blue'
  }
}

getStatusColor('active')
getStatusColor('new')

//"стринг форматтер"

export type StringFormatter = (value: string, uppercase?: boolean) => string

export const capitalizeFirst: StringFormatter = (value) => {
  if (!value) return value
  return value[0].toUpperCase() + value.slice(1)
}

export const trimAndFormat: StringFormatter = (value, uppercase = false) => {
  const trimmed = value.trim()
  return uppercase ? trimmed.toUpperCase() : trimmed
}

capitalizeFirst("typescript")
trimAndFormat("  hello world  ")
trimAndFormat("  hello world  ", true)

//генерик

export function getFirstElement<T>(arr: T[]): T | undefined {
  return arr[0]
}

const numbers = [1, 2, 3]
const strings = ["a", "b", "c"]

getFirstElement(numbers)
getFirstElement(strings)
getFirstElement([])

//файнд бай айди


export interface HasId {
  id: number
}

export function findById<T extends HasId>(
  items: T[],
  id: number
): T | undefined {
  return items.find(item => item.id === id)
}

const users = [
  { id: 1, name: "Alex" },
  { id: 2, name: "Bob" }
]

const foundUser = findById(users, 2)

console.log("status:", getStatusColor('active'))
console.log("USER1: ", user1)
console.log("USER2: ", user2)
console.log("BOOK1: ", book1)
console.log("BOOK2: ", book2)
console.log("CIRCLEAREA: ", circleArea)
console.log("squareArea: ", squareArea)