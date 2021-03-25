"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const consts_1 = require("../consts");
const OnceReader_1 = require("./OnceReader");
class BinaryRequester {
    init(proc, readline) {
        this.proc = proc;
        this.onceReader = new OnceReader_1.default(readline);
    }
    async request(request, timeout = 1000) {
        const result = await this.requestWithTimeout(request, timeout);
        return JSON.parse(result.toString());
    }
    requestWithTimeout(request, timeout) {
        return new Promise((resolve, reject) => {
            var _a, _b;
            setTimeout(() => {
                reject(new Error("Binary request timed out."));
            }, timeout);
            (_a = this.onceReader) === null || _a === void 0 ? void 0 : _a.onLineRead(resolve);
            (_b = this.proc) === null || _b === void 0 ? void 0 : _b.stdin.write(`${JSON.stringify({
                version: consts_1.API_VERSION,
                request,
            })}\n`, "utf8");
        });
    }
}
exports.default = BinaryRequester;
//# sourceMappingURL=InnerBinary.js.map