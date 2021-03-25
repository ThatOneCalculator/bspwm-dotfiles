"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.disposeStatusBarCommand = void 0;
const vscode = require("vscode");
const setState_1 = require("../binary/requests/setState");
const statusBar_1 = require("../binary/requests/statusBar");
const consts_1 = require("../consts");
const statusBar_2 = require("./statusBar");
const utils_1 = require("../utils");
const commandsHandler_1 = require("../commandsHandler");
let statusBarCommandDisposable;
function handleStatus(context, status) {
    registerStatusHandlingCommand(status, context);
    if (!statusBar_2.promotionTextIs(status.message)) {
        void setState_1.default({
            [consts_1.StatePayload.STATUS_SHOWN]: {
                id: status.id,
                text: status.message,
                notification_type: status.notification_type,
                state: status.state,
            },
        });
    }
    statusBar_2.setPromotionStatus(status.id, status.message, status.title, consts_1.OPEN_LP_FROM_STATUS_BAR);
    let duration = consts_1.STATUS_BAR_NOTIFICATION_PERIOD;
    if (status.duration_seconds) {
        duration = status.duration_seconds * 1000;
    }
    void asyncRemoveStatusAfterDuration(status.id, duration);
}
exports.default = handleStatus;
async function asyncRemoveStatusAfterDuration(id, duration) {
    await utils_1.sleep(duration);
    statusBar_2.resetDefaultStatus(id);
}
function registerStatusHandlingCommand(message, context) {
    statusBarCommandDisposable === null || statusBarCommandDisposable === void 0 ? void 0 : statusBarCommandDisposable.dispose();
    statusBarCommandDisposable = vscode.commands.registerCommand(consts_1.OPEN_LP_FROM_STATUS_BAR, () => {
        executeStatusAction(message);
        void statusBar_1.sendStatusBarAction(message.id, message.message, message.notification_type, message.actions, message.state);
    });
    context.subscriptions.push(statusBarCommandDisposable);
}
function executeStatusAction(message) {
    const selectedAction = message.actions;
    if (selectedAction === null || selectedAction === void 0 ? void 0 : selectedAction.includes(consts_1.MessageActions.OPEN_HUB)) {
        void commandsHandler_1.openConfigWithSource(consts_1.StateType.STATUS)();
    }
}
function disposeStatusBarCommand() {
    if (statusBarCommandDisposable) {
        statusBarCommandDisposable.dispose();
    }
}
exports.disposeStatusBarCommand = disposeStatusBarCommand;
//# sourceMappingURL=stusBarActionHandler.js.map