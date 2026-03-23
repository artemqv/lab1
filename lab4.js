"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.query = query;
function query() {
    var steps = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        steps[_i] = arguments[_i];
    }
    return function (data) { return steps.reduce(function (acc, step) { return step(acc); }, data); };
}