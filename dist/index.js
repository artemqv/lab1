"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.trimAndFormat = exports.capitalizeFirst = void 0;
exports.createUser = createUser;
exports.createBook = createBook;
exports.calculateArea = calculateArea;
exports.getStatusColor = getStatusColor;
exports.getFirstElement = getFirstElement;
exports.findById = findById;
function createUser(id, name, email, isActive = true) {
    return {
        id,
        name,
        email,
        isActive
    };
}
const user1 = createUser(1, "Alex", "alex@mail.com");
const user2 = createUser(2, "Bob");
function createBook(book) {
    return book;
}
const book1 = createBook({
    title: "1984",
    author: "George Orwell",
    year: 1949,
    genre: 'fiction'
});
const book2 = createBook({
    title: "Clean Code",
    author: "Robert Martin",
    genre: 'non-fiction'
});
function calculateArea(shape, value) {
    if (shape === 'circle') {
        return Math.PI * value * value;
    }
    return value * value;
}
const circleArea = calculateArea('circle', 10);
const squareArea = calculateArea('square', 5);
function getStatusColor(status) {
    switch (status) {
        case 'active':
            return 'green';
        case 'inactive':
            return 'red';
        case 'new':
            return 'blue';
    }
}
getStatusColor('active');
getStatusColor('new');
const capitalizeFirst = (value) => {
    if (!value)
        return value;
    return value[0].toUpperCase() + value.slice(1);
};
exports.capitalizeFirst = capitalizeFirst;
const trimAndFormat = (value, uppercase = false) => {
    const trimmed = value.trim();
    return uppercase ? trimmed.toUpperCase() : trimmed;
};
exports.trimAndFormat = trimAndFormat;
(0, exports.capitalizeFirst)("typescript");
(0, exports.trimAndFormat)("  hello world  ");
(0, exports.trimAndFormat)("  hello world  ", true);
//генерик
function getFirstElement(arr) {
    return arr[0];
}
const numbers = [1, 2, 3];
const strings = ["a", "b", "c"];
getFirstElement(numbers);
getFirstElement(strings);
getFirstElement([]);
function findById(items, id) {
    return items.find(item => item.id === id);
}
const users = [
    { id: 1, name: "Alex" },
    { id: 2, name: "Bob" }
];
const foundUser = findById(users, 2);
console.log("status:", getStatusColor('active'));
console.log("USER1: ", user1);
console.log("USER2: ", user2);
console.log("BOOK1: ", book1);
console.log("BOOK2: ", book2);
console.log("CIRCLEAREA: ", circleArea);
console.log("squareArea: ", squareArea);
