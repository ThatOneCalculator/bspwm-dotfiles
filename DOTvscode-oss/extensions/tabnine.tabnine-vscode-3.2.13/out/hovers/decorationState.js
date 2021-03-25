"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isDecorationContains = void 0;
const vscode_1 = require("vscode");
const setState_1 = require("../binary/requests/setState");
const consts_1 = require("../consts");
const decorationType = vscode_1.window.createTextEditorDecorationType({
    after: { margin: "0 0 0 1rem" },
});
let decoration;
let decorationsDebounce;
function showTextDecoration(position, context, hover) {
    decoration = {
        renderOptions: {
            after: {
                contentText: hover.title,
                color: "gray",
            },
        },
        range: new vscode_1.Range(new vscode_1.Position(position.line, position.character), new vscode_1.Position(position.line, 1024)),
        hoverMessage: getMarkdownMessage(context, hover),
    };
    renderDecoration();
    void setState_1.default({
        [consts_1.StatePayload.HINT_SHOWN]: {
            id: hover.id,
            text: hover.title,
            notification_type: hover.notification_type,
            state: null,
        },
    });
}
exports.default = showTextDecoration;
function isDecorationContains(position) {
    return !!(decoration === null || decoration === void 0 ? void 0 : decoration.range.contains(position));
}
exports.isDecorationContains = isDecorationContains;
function getMarkdownMessage(context, hover) {
    var _a;
    const fileUri = consts_1.getLogoPath(context);
    const actionKey = (_a = hover.options[0]) === null || _a === void 0 ? void 0 : _a.key;
    const logoAction = actionKey
        ? `command:${actionKey}`
        : "https://www.tabnine.com";
    const template = hover.message
        ? `[![tabnine](${fileUri}|width=100)](${logoAction})  \n${hover.message}`
        : "";
    const markdown = new vscode_1.MarkdownString(template, true);
    markdown.isTrusted = true;
    return markdown;
}
function renderDecoration(delay = 10) {
    if (decorationsDebounce) {
        clearTimeout(decorationsDebounce);
    }
    decorationsDebounce = setTimeout(() => {
        var _a;
        return decoration &&
            ((_a = vscode_1.window.activeTextEditor) === null || _a === void 0 ? void 0 : _a.setDecorations(decorationType, [decoration]));
    }, delay);
}
vscode_1.workspace.onDidChangeTextDocument(() => clearDecoration());
function clearDecoration() {
    var _a;
    (_a = vscode_1.window.activeTextEditor) === null || _a === void 0 ? void 0 : _a.setDecorations(decorationType, []);
    decoration = null;
}
//# sourceMappingURL=decorationState.js.map