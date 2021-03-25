"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerDecoration = void 0;
const vscode = require("vscode");
const util_1 = require("./util");
const change_case_1 = require("change-case");
const configuration_1 = require("./configuration");
exports.registerDecoration = () => {
    const subscriptions = [];
    let timeout = undefined;
    let activeEditor = vscode.window.activeTextEditor;
    const iconDecoration = vscode.window.createTextEditorDecorationType({
        rangeBehavior: vscode.DecorationRangeBehavior.ClosedOpen,
        before: {
            margin: configuration_1.config.decoration.margin,
            height: configuration_1.config.decoration.size,
            width: configuration_1.config.decoration.size,
        },
    });
    function updateDecorations() {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            if (!activeEditor) {
                return;
            }
            if (!configuration_1.config.enableDecorations) {
                activeEditor.setDecorations(iconDecoration, []); // clear existing decorations
                return;
            }
            const decorationsArr = [];
            for (const matcher of configuration_1.config.matchers) {
                const regex = util_1.matcherStringToRegex(matcher.match);
                if (!regex)
                    continue;
                const regEx = regex.fullRegex;
                const text = activeEditor.document.getText();
                let match;
                while ((match = regEx.exec(text))) {
                    const meta = yield util_1.getMdiMetaData();
                    const paramItemName = change_case_1.paramCase(((_a = match === null || match === void 0 ? void 0 : match.groups) === null || _a === void 0 ? void 0 : _a.icon) || "");
                    const item = meta.find((i) => paramItemName === i.name);
                    if (item) {
                        const meta = yield util_1.getIconData(item);
                        decorationsArr.push({
                            range: new vscode.Range(activeEditor.document.positionAt(match.index), activeEditor.document.positionAt(match.index + match[0].length)),
                            renderOptions: {
                                before: {
                                    contentIconPath: vscode.Uri.parse(`data:image/svg+xml;utf8,${encodeURI(util_1.createDecorationSvg(util_1.extractPathFromSvg(meta.rawIcon)))}`),
                                },
                            },
                        });
                    }
                }
            }
            activeEditor.setDecorations(iconDecoration, decorationsArr);
        });
    }
    function triggerUpdateDecorations() {
        if (timeout) {
            clearTimeout(timeout);
            timeout = undefined;
        }
        timeout = setTimeout(updateDecorations, 500);
    }
    if (activeEditor) {
        triggerUpdateDecorations();
    }
    vscode.window.onDidChangeActiveTextEditor((editor) => {
        activeEditor = editor;
        if (editor) {
            triggerUpdateDecorations();
        }
    }, null, subscriptions);
    vscode.workspace.onDidChangeTextDocument((event) => {
        if (activeEditor && event.document === activeEditor.document) {
            triggerUpdateDecorations();
        }
    }, null, subscriptions);
    vscode.workspace.onDidChangeConfiguration((event) => {
        if (event.affectsConfiguration("materialdesigniconsIntellisense.enableDecorations") ||
            event.affectsConfiguration("materialdesigniconsIntellisense.iconColor")) {
            triggerUpdateDecorations();
        }
        if (event.affectsConfiguration("materialdesigniconsIntellisense.decoration.size") ||
            event.affectsConfiguration("materialdesigniconsIntellisense.decoration.margin")) {
            vscode.window.showInformationMessage("materialdesigniconsIntellisense.decoration change takes affect after the next restart of code");
        }
    }, null, subscriptions);
    return subscriptions;
};
//# sourceMappingURL=decoration.js.map