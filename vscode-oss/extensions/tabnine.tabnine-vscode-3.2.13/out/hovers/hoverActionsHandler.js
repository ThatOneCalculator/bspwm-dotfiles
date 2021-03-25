"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode_1 = require("vscode");
const hovers_1 = require("../binary/requests/hovers");
let hoverActionsDisposable = [];
function registerHoverCommands(hover, context) {
    hoverActionsDisposable.forEach((a) => !!a.dispose());
    hoverActionsDisposable = [];
    hover.options.forEach((option) => {
        const hoverAction = vscode_1.commands.registerCommand(option.key, () => {
            void hovers_1.sendHoverAction(hover.id, option.key, option.actions, hover.notification_type, hover.state);
        });
        hoverActionsDisposable.push(hoverAction);
        context.subscriptions.push(hoverAction);
    });
}
exports.default = registerHoverCommands;
//# sourceMappingURL=hoverActionsHandler.js.map