"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const await_semaphore_1 = require("await-semaphore");
const InnerBinary_1 = require("./InnerBinary");
const runBinary_1 = require("./runBinary");
const consts_1 = require("../consts");
const utils_1 = require("../utils");
class Binary {
    constructor() {
        this.mutex = new await_semaphore_1.Mutex();
        this.innerBinary = new InnerBinary_1.default();
        this.consecutiveRestarts = 0;
        this.requestFailures = 0;
        this.isRestarting = false;
    }
    init() {
        return this.startChild();
    }
    async request(request, timeout = 1000) {
        const release = await this.mutex.acquire();
        try {
            if (this.isRestarting) {
                return null;
            }
            if (this.isBinaryDead()) {
                console.warn("Binary died. It is being restarted.");
                await this.restartChild();
                return null;
            }
            const result = await this.innerBinary.request(request, timeout);
            this.consecutiveRestarts = 0;
            this.requestFailures = 0;
            return result;
        }
        catch (err) {
            console.error(err);
            this.requestFailures += 1;
            if (this.requestFailures > consts_1.REQUEST_FAILURES_THRESHOLD) {
                console.warn("Binary not returning results, it is being restarted.");
                await this.restartChild();
            }
        }
        finally {
            release();
        }
        return null;
    }
    isBinaryDead() {
        var _a, _b;
        return (_b = (_a = this.proc) === null || _a === void 0 ? void 0 : _a.killed) !== null && _b !== void 0 ? _b : false;
    }
    async resetBinaryForTesting() {
        const { proc, readLine } = await runBinary_1.default([]);
        this.proc = proc;
        this.innerBinary.init(proc, readLine);
    }
    async restartChild() {
        var _a, _b;
        (_a = this.proc) === null || _a === void 0 ? void 0 : _a.removeAllListeners();
        (_b = this.proc) === null || _b === void 0 ? void 0 : _b.kill();
        this.isRestarting = true;
        this.consecutiveRestarts += 1;
        if (this.consecutiveRestarts >= consts_1.CONSECUTIVE_RESTART_THRESHOLD) {
            return; // We gave up. Keep it dead.
        }
        await utils_1.sleep(consts_1.restartBackoff(this.consecutiveRestarts));
        await this.startChild();
    }
    async startChild() {
        const { proc, readLine } = await runBinary_1.default([
            `ide-restart-counter=${this.consecutiveRestarts}`,
        ]);
        this.proc = proc;
        this.proc.unref(); // AIUI, this lets Node exit without waiting for the child
        this.proc.on("exit", (code, signal) => {
            console.warn(`Binary child process exited with code ${code !== null && code !== void 0 ? code : "unknown"} signal ${signal !== null && signal !== void 0 ? signal : "unknown"}`);
            void this.restartChild();
        });
        this.proc.on("error", (error) => {
            console.warn(`Binary child process error: ${error.message}`);
            void this.restartChild();
        });
        this.proc.stdin.on("error", (error) => {
            console.warn(`Binary child process stdin error: ${error.message}`);
            void this.restartChild();
        });
        this.proc.stdout.on("error", (error) => {
            console.warn(`Binary child process stdout error: ${error.message}`);
            void this.restartChild();
        });
        this.innerBinary.init(proc, readLine);
        this.isRestarting = false;
    }
}
exports.default = Binary;
//# sourceMappingURL=Binary.js.map