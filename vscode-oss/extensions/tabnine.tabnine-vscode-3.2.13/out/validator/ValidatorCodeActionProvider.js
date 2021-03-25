"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/* eslint-disable */
const vscode = require("vscode");
const diagnostics_1 = require("./diagnostics");
const ValidatorMode_1 = require("./ValidatorMode");
const commands_1 = require("./commands");
class ValidatorCodeActionProvider {
    // This method implements vscode.CodeActionProvider
    // eslint-disable-next-line class-methods-use-this
    provideCodeActions(document, range, context) {
        const codeActions = [];
        const diagnostics = context.diagnostics;
        diagnostics
            .filter((diagnostic) => diagnostic.code === diagnostics_1.TABNINE_DIAGNOSTIC_CODE)
            .forEach((diagnostic) => {
            diagnostic.choices.forEach((choice) => {
                codeActions.push(createCodeAction(document, diagnostic, choice));
            });
            // register ignore action
            const title = "Ignore TabNine Validator suggestions at this spot";
            const action = new vscode.CodeAction(title, vscode.CodeActionKind.QuickFix);
            action.command = {
                arguments: [
                    {
                        allSuggestions: diagnostic.choices,
                        reference: diagnostic.reference,
                        threshold: diagnostic.threshold,
                        responseId: diagnostic.responseId,
                    },
                ],
                command: commands_1.VALIDATOR_IGNORE_COMMAND,
                title: "ignore replacement",
            };
            codeActions.push(action);
        });
        return codeActions;
    }
}
exports.default = ValidatorCodeActionProvider;
ValidatorCodeActionProvider.providedCodeActionKinds = [
    vscode.CodeActionKind.QuickFix,
];
function createCodeAction(document, diagnostic, choice) {
    const { range } = diagnostic;
    const title = `Replace with '${choice.value}'`;
    const action = new vscode.CodeAction(title, vscode.CodeActionKind.QuickFix);
    action.edit = new vscode.WorkspaceEdit();
    action.edit.replace(document.uri, new vscode.Range(range.start, range.end), choice.value);
    if (ValidatorMode_1.getValidatorMode() === ValidatorMode_1.ValidatorMode.Paste) {
        diagnostic.references.forEach((r) => { var _a; return (_a = action.edit) === null || _a === void 0 ? void 0 : _a.replace(document.uri, r, choice.value); });
    }
    action.diagnostics = [diagnostic];
    action.command = {
        arguments: [
            {
                currentSuggestion: choice,
                allSuggestions: diagnostic.choices,
                reference: diagnostic.reference,
                threshold: diagnostic.threshold,
            },
        ],
        command: commands_1.VALIDATOR_SELECTION_COMMAND,
        title: "accept replacement",
    };
    return action;
}
//# sourceMappingURL=ValidatorCodeActionProvider.js.map