"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const semver = require("semver");
const file_utils_1 = require("../../file.utils");
const runProcess_1 = require("../runProcess");
async function isValidBinary(version) {
    if (!(await file_utils_1.asyncExists(version))) {
        return false;
    }
    const { proc, readLine } = runProcess_1.runProcess(version, ["--print-version"]);
    return new Promise((resolve) => {
        setTimeout(() => {
            console.error(`validating ${version} timeout`);
            resolve(false);
        }, 1000);
        proc.on("exit", (code, signal) => {
            if (code || signal) {
                resolve(false);
            }
        });
        proc.on("error", () => {
            resolve(false);
        });
        readLine.once("line", (line) => {
            if (semver.valid(line)) {
                resolve(true);
            }
            else {
                resolve(false);
            }
        });
    });
}
exports.default = isValidBinary;
//# sourceMappingURL=binaryValidator.js.map