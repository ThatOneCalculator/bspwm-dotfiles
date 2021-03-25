"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleImports = exports.getSelectionHandler = exports.HANDLE_IMPORTS = exports.COMPLETION_IMPORTS = void 0;
const vscode_1 = require("vscode");
const findImports_1 = require("./findImports");
const CompletionOrigin_1 = require("./CompletionOrigin");
const consts_1 = require("./consts");
const setState_1 = require("./binary/requests/setState");
const pollStatusBar_1 = require("./statusBar/pollStatusBar");
const hoverHandler_1 = require("./hovers/hoverHandler");
const pollNotifications_1 = require("./notifications/pollNotifications");
exports.COMPLETION_IMPORTS = "tabnine-completion-imports";
exports.HANDLE_IMPORTS = "tabnine-handle-imports";
function getSelectionHandler(context) {
    return function selectionHandler(editor, edit, { currentCompletion, completions, position, limited }) {
        try {
            handleState(position, completions, currentCompletion, limited, editor);
            if (!limited) {
                void vscode_1.commands.executeCommand(exports.HANDLE_IMPORTS, {
                    completion: currentCompletion,
                });
            }
        }
        catch (error) {
            console.error(error);
        }
    };
    function handleState(position, completions, currentCompletion, limited, editor) {
        if (position && (completions === null || completions === void 0 ? void 0 : completions.length)) {
            const eventData = eventDataOf(completions, currentCompletion, limited, editor, position);
            void setState_1.default(eventData).then(() => {
                void pollNotifications_1.doPollNotifications(context);
                void pollStatusBar_1.doPollStatus(context);
                void hoverHandler_1.default(context, position);
            });
        }
    }
}
exports.getSelectionHandler = getSelectionHandler;
function eventDataOf(completions, currentCompletion, limited, editor, position) {
    const index = completions.findIndex(({ new_prefix: newPrefix }) => newPrefix === currentCompletion);
    let numOfVanillaSuggestions = 0;
    let numOfDeepLocalSuggestions = 0;
    let numOfDeepCloudSuggestions = 0;
    let numOfLspSuggestions = 0;
    let numOfVanillaKeywordSuggestions = 0;
    const currInCompletions = completions[index];
    const suggestions = completions.map((c) => {
        var _a;
        switch (c.origin) {
            case CompletionOrigin_1.default.VANILLA:
                numOfVanillaSuggestions += 1;
                break;
            case CompletionOrigin_1.default.LOCAL:
                numOfDeepLocalSuggestions += 1;
                break;
            case CompletionOrigin_1.default.CLOUD:
                numOfDeepCloudSuggestions += 1;
                break;
            case CompletionOrigin_1.default.LSP:
                numOfLspSuggestions += 1;
                break;
            case CompletionOrigin_1.default.VANILLA_KEYWORD:
                numOfVanillaKeywordSuggestions += 1;
                break;
            default:
                break;
        }
        return {
            length: c.new_prefix.length,
            strength: resolveDetailOf(c),
            origin: (_a = c.origin) !== null && _a !== void 0 ? _a : CompletionOrigin_1.default.UNKNOWN,
        };
    });
    const { length } = currentCompletion;
    const netLength = editor.selection.anchor.character - position.character;
    const strength = resolveDetailOf(currInCompletions);
    const { origin } = currInCompletions;
    const prefixLength = editor.document
        .getText(new vscode_1.Range(new vscode_1.Position(position.line, 0), position))
        .trimLeft().length;
    const netPrefixLength = prefixLength - (currentCompletion.length - netLength);
    const suffixLength = editor.document.lineAt(position).text.trim().length -
        (prefixLength + netLength);
    const numOfSuggestions = completions.length;
    const eventData = {
        Selection: {
            language: extractLanguage(editor),
            length,
            net_length: netLength,
            strength,
            origin: origin !== null && origin !== void 0 ? origin : CompletionOrigin_1.default.UNKNOWN,
            index,
            line_prefix_length: prefixLength,
            line_net_prefix_length: netPrefixLength,
            line_suffix_length: suffixLength,
            num_of_suggestions: numOfSuggestions,
            num_of_vanilla_suggestions: numOfVanillaSuggestions,
            num_of_deep_local_suggestions: numOfDeepLocalSuggestions,
            num_of_deep_cloud_suggestions: numOfDeepCloudSuggestions,
            num_of_lsp_suggestions: numOfLspSuggestions,
            num_of_vanilla_keyword_suggestions: numOfVanillaKeywordSuggestions,
            suggestions,
            is_locked: limited,
        },
    };
    return eventData;
}
function resolveDetailOf(completion) {
    if (completion.origin === CompletionOrigin_1.default.LSP) {
        return "";
    }
    return completion.detail;
}
function extractLanguage(editor) {
    var _a;
    const fileNameElements = editor.document.fileName.split(".");
    return ((_a = fileNameElements[Math.max(1, fileNameElements.length - 1)]) !== null && _a !== void 0 ? _a : "undefined");
}
function handleImports(editor, edit, { completion }) {
    const { selection } = editor;
    const completionSelection = new vscode_1.Selection(selection.active.translate(0, -completion.length), selection.active);
    setTimeout(() => {
        void doAutoImport(editor, completionSelection, completion);
    }, consts_1.DELAY_FOR_CODE_ACTION_PROVIDER);
}
exports.handleImports = handleImports;
async function doAutoImport(editor, completionSelection, completion) {
    try {
        const codeActionCommands = await vscode_1.commands.executeCommand("vscode.executeCodeActionProvider", editor.document.uri, completionSelection, vscode_1.CodeActionKind.QuickFix.value);
        const importCommand = findImports_1.default(codeActionCommands)[0];
        if (importCommand && importCommand.edit) {
            await vscode_1.workspace.applyEdit(importCommand.edit);
            await vscode_1.commands.executeCommand(exports.HANDLE_IMPORTS, { completion });
        }
    }
    catch (error) {
        console.error(error);
    }
}
//# sourceMappingURL=selectionHandler.js.map