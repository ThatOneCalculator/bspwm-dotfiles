"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.openConfigWithSource = exports.registerCommands = exports.STATUS_BAR_COMMAND = exports.CONFIG_COMMAND = void 0;
const vscode_1 = require("vscode");
const registerConfig_1 = require("./registerConfig");
const consts_1 = require("./consts");
const requests_1 = require("./binary/requests/requests");
const setState_1 = require("./binary/requests/setState");
const capabilities_1 = require("./capabilities");
exports.CONFIG_COMMAND = "TabNine::config";
exports.STATUS_BAR_COMMAND = "TabNine.statusBar";
function registerCommands(context) {
    context.subscriptions.push(vscode_1.commands.registerCommand(exports.CONFIG_COMMAND, openConfigWithSource(consts_1.StateType.PALLETTE)));
    context.subscriptions.push(vscode_1.commands.registerCommand(exports.STATUS_BAR_COMMAND, handleStatusBar(context)));
}
exports.registerCommands = registerCommands;
function handleStatusBar(context) {
    const openConfigWithStatusSource = openConfigWithSource(consts_1.StateType.STATUS);
    return async (args = null) => {
        await openConfigWithStatusSource(args);
        if (capabilities_1.isCapabilityEnabled(capabilities_1.Capability.SHOW_AGRESSIVE_STATUS_BAR_UNTIL_CLICKED)) {
            await context.globalState.update(consts_1.STATUS_BAR_FIRST_TIME_CLICKED, true);
        }
    };
}
function openConfigWithSource(type) {
    return async (args = null) => {
        registerConfig_1.default(await requests_1.configuration({ quiet: true }));
        void setState_1.default({
            [consts_1.StatePayload.STATE]: { state_type: (args === null || args === void 0 ? void 0 : args.join("-")) || type },
        });
    };
}
exports.openConfigWithSource = openConfigWithSource;
//# sourceMappingURL=commandsHandler.js.map