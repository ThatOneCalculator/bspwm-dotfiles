"use strict";
const vscode_1 = require("vscode");
const CompletionProvider_1 = require("./CompletionProvider");
const DefinitionProvider_1 = require("./DefinitionProvider");
const extName = "cssModules";
function activate(context) {
    const mode = [
        { language: "typescriptreact", scheme: "file" },
        { language: "javascriptreact", scheme: "file" },
        { language: "javascript", scheme: "file" }
    ];
    const configuration = vscode_1.workspace.getConfiguration(extName);
    const camelCaseConfig = configuration.get("camelCase", false);
    context.subscriptions.push(vscode_1.languages.registerCompletionItemProvider(mode, new CompletionProvider_1.CSSModuleCompletionProvider(camelCaseConfig), "."));
    context.subscriptions.push(vscode_1.languages.registerDefinitionProvider(mode, new DefinitionProvider_1.CSSModuleDefinitionProvider(camelCaseConfig)));
}
exports.activate = activate;
function deactivate() {
}
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map
