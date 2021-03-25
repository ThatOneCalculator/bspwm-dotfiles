"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class OnceReader {
    constructor(readline) {
        this.callbackQueue = [];
        readline.on("line", (line) => {
            const oldestCallback = this.callbackQueue.shift();
            if (!oldestCallback) {
                throw new Error("Read a response from the engine before a request was written.");
            }
            oldestCallback(line);
        });
    }
    onLineRead(callback) {
        this.callbackQueue.push(callback);
    }
}
exports.default = OnceReader;
//# sourceMappingURL=OnceReader.js.map