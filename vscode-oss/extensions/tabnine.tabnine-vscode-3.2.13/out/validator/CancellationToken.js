"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class CancellationToken {
    constructor() {
        this.cancelled = false;
        this.callbacks = [];
    }
    isCancelled() {
        return this.cancelled;
    }
    cancel() {
        if (!this.isCancelled()) {
            this.cancelled = true;
            this.callbacks.forEach(([callback, args]) => callback(args));
        }
    }
    reset() {
        this.cancelled = false;
        this.callbacks = [];
    }
    registerCallback(callback, ...args) {
        if (this.isCancelled()) {
            callback(...args);
        }
        else {
            this.callbacks.push([callback, args]);
        }
    }
}
exports.default = CancellationToken;
//# sourceMappingURL=CancellationToken.js.map