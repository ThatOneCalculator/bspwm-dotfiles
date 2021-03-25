"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.disposeStatus = exports.doPollStatus = void 0;
const statusBar_1 = require("../binary/requests/statusBar");
const consts_1 = require("../consts");
const statusBar_2 = require("./statusBar");
const stusBarActionHandler_1 = require("./stusBarActionHandler");
let statusPollingInterval = null;
function pollStatuses(context) {
    statusPollingInterval = setInterval(() => {
        void doPollStatus(context);
        void statusBar_2.pollServiceLevel();
    }, consts_1.BINARY_STATUS_BAR_FIRST_MESSAGE_POLLING_INTERVAL);
    void statusBar_2.onStartServiceLevel();
}
exports.default = pollStatuses;
function cancelStatusPolling() {
    if (statusPollingInterval) {
        clearInterval(statusPollingInterval);
    }
}
async function doPollStatus(context) {
    const status = await statusBar_1.getStatus();
    if (!(status === null || status === void 0 ? void 0 : status.message)) {
        return;
    }
    void stusBarActionHandler_1.default(context, status);
}
exports.doPollStatus = doPollStatus;
function disposeStatus() {
    stusBarActionHandler_1.disposeStatusBarCommand();
    cancelStatusPolling();
    statusBar_2.resetDefaultStatus();
}
exports.disposeStatus = disposeStatus;
//# sourceMappingURL=pollStatusBar.js.map