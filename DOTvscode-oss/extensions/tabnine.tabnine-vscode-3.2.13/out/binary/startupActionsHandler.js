"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const consts_1 = require("../consts");
const commandsHandler_1 = require("../commandsHandler");
const startupActions_1 = require("./requests/startupActions");
const utils_1 = require("../utils");
async function executeStartupActions() {
    await utils_1.sleep(consts_1.BINARY_STARTUP_GRACE);
    const actionsResult = await startupActions_1.getStartupActions();
    if (actionsResult === null || actionsResult === void 0 ? void 0 : actionsResult.actions.includes(consts_1.MessageActions.OPEN_HUB)) {
        return commandsHandler_1.openConfigWithSource(consts_1.StateType.STARTUP)();
    }
    return Promise.resolve();
}
exports.default = executeStartupActions;
//# sourceMappingURL=startupActionsHandler.js.map