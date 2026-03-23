"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.trimAndFormat = exports.capitalizeFirst = void 0;
exports.createBook = createBook;
exports.calculateArea = calculateArea;
exports.getStatusColor = getStatusColor;
exports.getFirstElement = getFirstElement;
exports.findById = findById;
exports.formatCSVFileToJSONFile = formatCSVFileToJSONFile;
exports.csvToJSON = csvToJSON;
var promises_1 = require("node:fs/promises");
function createUser(id, name, email, isActive) {
    if (isActive === void 0) { isActive = true; }
    return {
        id: id,
        name: name,
        email: email,
        isActive: isActive
    };
}
var user1 = createUser(1, "Alex", "alex@mail.com");
var user2 = createUser(2, "Bob");
function createBook(book) {
    return book;
}
var book1 = createBook({
    title: "1984",
    author: "George Orwell",
    year: 1949,
    genre: 'fiction'
});
var book2 = createBook({
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
var circleArea = calculateArea('circle', 10);
var squareArea = calculateArea('square', 5);
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
var color1 = getStatusColor('active');
var color2 = getStatusColor('new');
var capitalizeFirst = function (value) {
    if (!value)
        return value;
    return value[0].toUpperCase() + value.slice(1);
};
exports.capitalizeFirst = capitalizeFirst;
var trimAndFormat = function (value, uppercase) {
    if (uppercase === void 0) { uppercase = false; }
    var trimmed = value.trim();
    return uppercase ? trimmed.toUpperCase() : trimmed;
};
exports.trimAndFormat = trimAndFormat;
//генерик
function getFirstElement(arr) {
    return arr[0];
}
var numbers = [1, 2, 3];
var strings = ["a", "b", "c"];
function findById(items, id) {
    return items.find(function (item) { return item.id === id; });
}
var users = [
    { id: 1, name: "Alex" },
    { id: 2, name: "Bob" }
];
var foundUser = findById(users, 2);
function csvToJSON(input, delimiter) {
    if (!input || input.length === 0) {
        throw new Error('Input array is empty');
    }
    //Разделяем заголовки
    var headers = input[0].split(delimiter);
    //Проверяем чтобы не было пустых headers
    if (headers.length === 0 || headers.some(function (h) { return !h.trim(); })) {
        throw new Error('Empty headers');
    }
    var result = [];
    for (var i = 1; i < input.length; i++) {
        var values = input[i].split(delimiter);
        if (values.length !== headers.length) {
            throw new Error("Row ".concat(i, " has ").concat(values.length, " values, expected ").concat(headers.length));
        }
        // Создаем объект
        var obj = {};
        for (var j = 0; j < headers.length; j++) {
            var value = values[j].trim();
            var num = Number(value);
            obj[headers[j].trim()] = isNaN(num) || value === '' ? value : num;
        }
        result.push(obj);
    }
    return result;
}
function formatCSVFileToJSONFile(input, output, delimiter) {
    return __awaiter(this, void 0, void 0, function () {
        var data, lines, jsonData, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 3, , 4]);
                    return [4 /*yield*/, (0, promises_1.readFile)(input, 'utf-8')
                        // Разбиваем на строки и фильтруем пустые
                    ];
                case 1:
                    data = _a.sent();
                    lines = data.split('\n').filter(function (line) { return line.trim() !== ''; });
                    jsonData = csvToJSON(lines, delimiter);
                    // Записываем результат
                    return [4 /*yield*/, (0, promises_1.writeFile)(output, JSON.stringify(jsonData, null, 2), 'utf-8')];
                case 2:
                    // Записываем результат
                    _a.sent();
                    return [3 /*break*/, 4];
                case 3:
                    error_1 = _a.sent();
                    // Исправлено: добавляем сообщение об ошибке
                    if (error_1 instanceof Error) {
                        throw new Error("Failed to process CSV file: ".concat(error_1.message));
                    }
                    throw new Error("Failed to process CSV file: Unknown error");
                case 4: return [2 /*return*/];
            }
        });
    });
}