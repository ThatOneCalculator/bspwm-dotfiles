"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.asyncExists = void 0;
const tmp = require("tmp");
const fs_1 = require("fs");
function createTempFileWithPostfix(postfix) {
    return new Promise((resolve, reject) => {
        tmp.file({ postfix }, (err, path, fd, cleanupCallback) => {
            if (err) {
                return reject(err);
            }
            return resolve({
                name: path,
                fd,
                removeCallback: cleanupCallback,
            });
        });
    });
}
exports.default = createTempFileWithPostfix;
async function asyncExists(path) {
    try {
        await fs_1.promises.access(path);
        return true;
    }
    catch (_a) {
        return false;
    }
}
exports.asyncExists = asyncExists;
//# sourceMappingURL=file.utils.js.map