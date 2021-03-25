"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCapabilities = exports.uninstalling = exports.deactivate = exports.getState = exports.configuration = exports.autocomplete = exports.resetBinaryForTesting = exports.initBinary = exports.tabNineProcess = void 0;
const Binary_1 = require("../Binary");
exports.tabNineProcess = new Binary_1.default();
function initBinary() {
    return exports.tabNineProcess.init();
}
exports.initBinary = initBinary;
function resetBinaryForTesting() {
    void exports.tabNineProcess.resetBinaryForTesting();
}
exports.resetBinaryForTesting = resetBinaryForTesting;
function autocomplete(requestData) {
    return exports.tabNineProcess.request({
        Autocomplete: requestData,
    });
}
exports.autocomplete = autocomplete;
function configuration(body = {}) {
    return exports.tabNineProcess.request({
        Configuration: body,
    }, 5000);
}
exports.configuration = configuration;
function getState(content = {}) {
    return exports.tabNineProcess.request({ State: content });
}
exports.getState = getState;
function deactivate() {
    if (exports.tabNineProcess) {
        return exports.tabNineProcess.request({ Deactivate: {} });
    }
    console.error("No TabNine process");
    return Promise.resolve(null);
}
exports.deactivate = deactivate;
function uninstalling() {
    return exports.tabNineProcess.request({ Uninstalling: {} });
}
exports.uninstalling = uninstalling;
async function getCapabilities() {
    try {
        const result = await exports.tabNineProcess.request({ Features: {} }, 7000);
        if (!Array.isArray(result === null || result === void 0 ? void 0 : result.enabled_features)) {
            throw new Error("Could not get enabled capabilities");
        }
        return result;
    }
    catch (error) {
        console.error(error);
        return { enabled_features: [] };
    }
}
exports.getCapabilities = getCapabilities;
//# sourceMappingURL=requests.js.map