"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendStatusBarAction = exports.getStatus = void 0;
const requests_1 = require("./requests");
function getStatus() {
    return requests_1.tabNineProcess.request({ StatusBar: {} });
}
exports.getStatus = getStatus;
async function sendStatusBarAction(id, selected, notification_type, actions, state) {
    return requests_1.tabNineProcess.request({
        StatusBarAction: { id, selected, notification_type, actions, state },
    });
}
exports.sendStatusBarAction = sendStatusBarAction;
//# sourceMappingURL=statusBar.js.map