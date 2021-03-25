"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const commandsHandler_1 = require("../commandsHandler");
const consts_1 = require("../consts");
async function executeNotificationAction(selectedActions) {
    if (selectedActions === null || selectedActions === void 0 ? void 0 : selectedActions.includes(consts_1.MessageActions.OPEN_HUB)) {
        return commandsHandler_1.openConfigWithSource(consts_1.StateType.NOTIFICATION)();
    }
    return Promise.resolve();
}
exports.default = executeNotificationAction;
//# sourceMappingURL=executeNotificationAction.js.map