"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatError = exports.asyncFind = exports.isFunction = exports.sleep = exports.assertFirstTimeReceived = exports.withPolling = void 0;
function withPolling(callback, interval, timeout) {
    const pollingInterval = setInterval(() => callback(clearPolling), interval);
    const pollingTimeout = setTimeout(() => {
        clearInterval(pollingInterval);
    }, timeout);
    function clearPolling() {
        clearInterval(pollingInterval);
        clearTimeout(pollingTimeout);
    }
}
exports.withPolling = withPolling;
async function assertFirstTimeReceived(key, context) {
    return new Promise((resolve, reject) => {
        if (!context.globalState.get(key)) {
            void context.globalState.update(key, true).then(resolve, reject);
        }
        else {
            reject(new Error("Already happened"));
        }
    });
}
exports.assertFirstTimeReceived = assertFirstTimeReceived;
function sleep(time) {
    return new Promise((resolve) => setTimeout(resolve, time));
}
exports.sleep = sleep;
// eslint-disable-next-line
function isFunction(functionToCheck) {
    // eslint-disable-next-line
    return (functionToCheck && {}.toString.call(functionToCheck) === "[object Function]");
}
exports.isFunction = isFunction;
async function asyncFind(arr, predicate) {
    // eslint-disable-next-line no-restricted-syntax
    for await (const element of arr) {
        if (await predicate(element)) {
            return element;
        }
    }
    return null;
}
exports.asyncFind = asyncFind;
function formatError(error) {
    return `OS: ${process.platform} - ${process.arch}\n Error: ${error.name}\nMessage: ${error.message}\nStack: ${error.stack || ""}`;
}
exports.formatError = formatError;
//# sourceMappingURL=utils.js.map