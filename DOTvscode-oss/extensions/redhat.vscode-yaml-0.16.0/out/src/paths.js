"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.joinPath = exports.normalizePath = void 0;
const Dot = '.'.charCodeAt(0);
function normalizePath(parts) {
    const newParts = [];
    for (const part of parts) {
        if (part.length === 0 || (part.length === 1 && part.charCodeAt(0) === Dot)) {
            // ignore
        }
        else if (part.length === 2 && part.charCodeAt(0) === Dot && part.charCodeAt(1) === Dot) {
            newParts.pop();
        }
        else {
            newParts.push(part);
        }
    }
    if (parts.length > 1 && parts[parts.length - 1].length === 0) {
        newParts.push('');
    }
    let res = newParts.join('/');
    if (parts[0].length === 0) {
        res = '/' + res;
    }
    return res;
}
exports.normalizePath = normalizePath;
function joinPath(uri, ...paths) {
    const parts = uri.path.split('/');
    for (const path of paths) {
        parts.push(...path.split('/'));
    }
    return uri.with({ path: normalizePath(parts) });
}
exports.joinPath = joinPath;
//# sourceMappingURL=paths.js.map