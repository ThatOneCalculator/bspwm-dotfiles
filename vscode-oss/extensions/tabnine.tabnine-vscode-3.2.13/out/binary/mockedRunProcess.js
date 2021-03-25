"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isProcessReadyForTest = exports.requestResponseItems = exports.stdoutMock = exports.stdinMock = exports.readLineMock = exports.spawnedProcessMock = void 0;
const ts_mockito_1 = require("ts-mockito");
const utils_1 = require("../utils");
const capabilities_1 = require("../capabilities");
exports.spawnedProcessMock = ts_mockito_1.mock();
exports.readLineMock = ts_mockito_1.mock();
exports.stdinMock = ts_mockito_1.mock();
exports.stdoutMock = ts_mockito_1.mock();
let onMockReady = () => { };
const isProcessReady = new Promise((resolve) => {
    onMockReady = resolve;
});
exports.requestResponseItems = [];
function mockedRunProcess() {
    ts_mockito_1.when(exports.spawnedProcessMock.killed).thenReturn(false);
    ts_mockito_1.when(exports.spawnedProcessMock.stdin).thenReturn(ts_mockito_1.instance(exports.stdinMock));
    ts_mockito_1.when(exports.spawnedProcessMock.stdout).thenReturn(ts_mockito_1.instance(exports.stdoutMock));
    ts_mockito_1.when(exports.readLineMock.once("line", ts_mockito_1.anyFunction())).thenCall((event, callback) => {
        callback("1.2.3");
    });
    mockBinaryRequest();
    mockCapabilitiesRequest();
    onMockReady();
    return {
        proc: ts_mockito_1.instance(exports.spawnedProcessMock),
        readLine: ts_mockito_1.instance(exports.readLineMock),
    };
}
exports.default = mockedRunProcess;
function isProcessReadyForTest() {
    return isProcessReady;
}
exports.isProcessReadyForTest = isProcessReadyForTest;
function mockCapabilitiesRequest() {
    exports.requestResponseItems.push({
        isQualified: (request) => {
            var _a;
            const completionRequest = JSON.parse(request);
            return !!((_a = completionRequest === null || completionRequest === void 0 ? void 0 : completionRequest.request) === null || _a === void 0 ? void 0 : _a.Features);
        },
        result: {
            enabled_features: [capabilities_1.Capability.ALPHA_CAPABILITY],
        },
    });
}
function mockBinaryRequest() {
    let lineCallback = null;
    ts_mockito_1.when(exports.readLineMock.on("line", ts_mockito_1.anyFunction())).thenCall((_, callback) => {
        lineCallback = callback;
    });
    ts_mockito_1.when(exports.stdinMock.write(ts_mockito_1.anyString(), "utf8")).thenCall((request) => {
        const matchingItem = exports.requestResponseItems.find(({ isQualified }) => isQualified(request));
        lineCallback === null || lineCallback === void 0 ? void 0 : lineCallback(matchingItem ? response(request, matchingItem.result) : "null");
        return true;
    });
}
function response(request, result) {
    return JSON.stringify(utils_1.isFunction(result) ? result(request) : result);
}
//# sourceMappingURL=mockedRunProcess.js.map