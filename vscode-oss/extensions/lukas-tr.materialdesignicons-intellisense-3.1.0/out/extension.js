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
exports.deactivate = exports.activate = void 0;
const vscode = require("vscode");
const fs = require("fs");
const configuration_1 = require("./configuration");
const tree_1 = require("./tree");
const hover_1 = require("./hover");
const completion_1 = require("./completion");
const lint_1 = require("./lint");
const preview_1 = require("./preview");
const util_1 = require("./util");
const decoration_1 = require("./decoration");
function activate(context) {
    const treeDataProvider = new tree_1.IconTreeDataProvider();
    configuration_1.config.context = context;
    const treeView = vscode.window.createTreeView("materialDesignIconsExplorer", {
        treeDataProvider,
    });
    treeView.onDidChangeVisibility((event) => {
        if (event.visible) {
            treeDataProvider.refresh();
        }
    });
    vscode.commands.registerCommand("materialdesigniconsIntellisense.openIconPreview", (node) => {
        if (!node) {
            return vscode.window.showInformationMessage("Click on an icon in the MDI Explorer view to preview icons");
        }
        preview_1.showPreview(node, context);
    });
    context.subscriptions.push(vscode.commands.registerCommand("materialdesigniconsIntellisense.showMdiVersion", () => __awaiter(this, void 0, void 0, function* () {
        try {
            const data = yield fs.promises.readFile(configuration_1.config.mdiPackagePath);
            vscode.window.showInformationMessage("materialdesignicons-intellisense uses @mdi/svg@" +
                JSON.parse(data.toString("utf8"))["version"]);
        }
        catch (err) {
            vscode.window.showErrorMessage(err.message);
        }
    })));
    vscode.commands.registerCommand("materialdesigniconsIntellisense.insertIconInActiveEditor", (node) => __awaiter(this, void 0, void 0, function* () {
        const editor = vscode.window.activeTextEditor;
        if (editor) {
            if (node.type === "icon") {
                const match = configuration_1.config.matchers.find((m) => m.name === configuration_1.config.insertType);
                if (!match) {
                    vscode.window.showInformationMessage(`InsertType ${configuration_1.config.insertType} not found`);
                    return;
                }
                const snippet = match.insert.replace(/\{(\w+)\}/, (group0, group1) => {
                    return util_1.createCompletion(node.doc.name, group1);
                });
                yield editor.insertSnippet(new vscode.SnippetString(snippet));
            }
        }
        else {
            vscode.window.showInformationMessage(`No active editor`);
        }
    }));
    context.subscriptions.push(vscode.commands.registerCommand("materialdesigniconsIntellisense.closeSearch", () => __awaiter(this, void 0, void 0, function* () {
        configuration_1.config.lastSearch = "";
        treeDataProvider.refresh();
        treeView.reveal({
            type: "other",
            label: "Search results",
        }, {
            expand: true,
            focus: true,
        });
    })));
    context.subscriptions.push(vscode.commands.registerCommand("materialdesigniconsIntellisense.showIconSearch", () => __awaiter(this, void 0, void 0, function* () {
        const search = (yield vscode.window.showInputBox({
            value: configuration_1.config.lastSearch,
            prompt: "Search icons",
            placeHolder: "Search icons",
        })) || "";
        vscode.commands.executeCommand("materialdesigniconsIntellisense.performIconSearch", search);
    })));
    context.subscriptions.push(vscode.commands.registerCommand("materialdesigniconsIntellisense.changeSettings", () => vscode.commands.executeCommand("workbench.action.openSettings", "materialdesigniconsIntellisense")));
    context.subscriptions.push(vscode.commands.registerCommand("materialdesigniconsIntellisense.changeMdiVersion", () => __awaiter(this, void 0, void 0, function* () {
        let items = null;
        let info = null;
        yield vscode.window.withProgress({
            location: vscode.ProgressLocation.Notification,
            cancellable: false,
        }, (progress) => __awaiter(this, void 0, void 0, function* () {
            progress.report({
                message: "Getting versions from registry.npmjs.org",
            });
            try {
                info = yield util_1.getVersions();
                yield configuration_1.config.updateLatestMdiVersion(info.latest);
                items = [
                    {
                        label: "latest",
                        description: `currently ${info.latest}` +
                            ("latest" === configuration_1.config.rawMdiVersion ? " - selected" : ""),
                    },
                    ...info.versions.map((v) => ({
                        label: v.version,
                        description: v.time +
                            (v.version === configuration_1.config.rawMdiVersion ? " - selected" : ""),
                    })),
                ];
            }
            catch (error) {
                util_1.log(error);
                vscode.window.showErrorMessage(error.message);
            }
        }));
        const result = yield vscode.window.showQuickPick(items, {
            canPickMany: false,
            placeHolder: `Current version: ${configuration_1.config.rawMdiVersion}`,
        });
        if (result) {
            const selectedVersion = result.label;
            const versionToDownload = selectedVersion === "latest" ? info.latest : selectedVersion;
            yield util_1.handleDownload(versionToDownload, info);
            yield configuration_1.config.updateMdiVersion(selectedVersion);
            treeDataProvider.refresh();
        }
    })));
    context.subscriptions.push(vscode.commands.registerCommand("materialdesigniconsIntellisense.changeInsertStyle", () => __awaiter(this, void 0, void 0, function* () {
        const items = configuration_1.config.matchers.map((m) => ({
            label: m.displayName,
            description: m.name === configuration_1.config.insertType ? "selected" : "",
            name: m.name,
        }));
        const result = yield vscode.window.showQuickPick(items, {
            canPickMany: false,
        });
        if (result) {
            yield configuration_1.config.changeInsertType(result.name);
            treeDataProvider.refresh();
        }
    })));
    context.subscriptions.push(vscode.commands.registerCommand("materialdesigniconsIntellisense.changeLanguages", () => __awaiter(this, void 0, void 0, function* () {
        const languages = yield vscode.languages.getLanguages();
        const selected = configuration_1.config.selector;
        const selectedButNotAvailable = [];
        for (const s of selected) {
            if (!languages.includes(s)) {
                selectedButNotAvailable.push(s);
            }
        }
        const items = languages.map((l) => ({
            label: l,
            picked: selected.includes(l),
        }));
        items.push(...selectedButNotAvailable.map((l) => ({
            label: l,
            picked: true,
            description: "This language is currently not installed",
        })));
        const result = yield vscode.window.showQuickPick(items, {
            canPickMany: true,
            matchOnDescription: true,
            matchOnDetail: true,
        });
        if (result) {
            yield configuration_1.config.updateSelector(result.map((r) => r.label));
        }
    })));
    context.subscriptions.push(vscode.commands.registerCommand("materialdesigniconsIntellisense.performIconSearch", (search) => {
        if (!search) {
            return vscode.window.showInformationMessage("Use the MDI explorer view to search icons");
        }
        configuration_1.config.lastSearch = search;
        treeDataProvider.refresh();
        treeView.reveal({
            type: "other",
            label: "Search results",
        }, {
            expand: true,
            focus: true,
        });
    }));
    context.subscriptions.push(vscode.languages.registerHoverProvider(configuration_1.config.selector, new hover_1.HoverProvider()));
    context.subscriptions.push(vscode.languages.registerCompletionItemProvider(configuration_1.config.selector, new completion_1.CompletionProvider(), ...completion_1.triggerCharacters));
    const enableLinter = () => {
        const linter = new lint_1.IconLint();
        if (vscode.window.activeTextEditor) {
            linter.lintDocument(vscode.window.activeTextEditor.document);
        }
        const disposables = vscode.Disposable.from(vscode.workspace.onDidOpenTextDocument(linter.lintDocument.bind(linter), null), vscode.workspace.onDidCloseTextDocument(linter.deleteDiagnostics.bind(linter), null), vscode.workspace.onDidCloseTextDocument(linter.deleteDiagnostics.bind(linter), null), vscode.workspace.onDidSaveTextDocument(linter.lintDocument.bind(linter), null), vscode.languages.registerCodeActionsProvider(configuration_1.config.selector, linter), linter);
        context.subscriptions.push(disposables);
        return disposables;
    };
    let linterDisposables;
    if (configuration_1.config.enableLinter) {
        linterDisposables = enableLinter();
    }
    context.subscriptions.push(vscode.workspace.onDidChangeConfiguration((event) => {
        if (event.affectsConfiguration("materialdesigniconsIntellisense.enableLinter")) {
            if (linterDisposables) {
                linterDisposables.dispose();
                linterDisposables = undefined;
            }
            if (configuration_1.config.enableLinter) {
                linterDisposables = enableLinter();
            }
        }
    }));
    context.subscriptions.push(vscode.workspace.onDidChangeConfiguration((event) => {
        if (event.affectsConfiguration("materialdesigniconsIntellisense.selector")) {
            vscode.window.showInformationMessage("materialdesigniconsIntellisense.selector change takes affect after the next restart of code");
        }
        if (event.affectsConfiguration("materialdesigniconsIntellisense.overrideFontPackagePath") ||
            event.affectsConfiguration("materialdesigniconsIntellisense.mdiVersion")) {
            treeDataProvider.refresh();
        }
    }));
    // auto update
    if (configuration_1.config.rawMdiVersion === "latest") {
        (() => __awaiter(this, void 0, void 0, function* () {
            try {
                const info = yield util_1.getVersions();
                if (configuration_1.config.mdiVersion !== info.latest) {
                    yield util_1.handleDownload(info.latest, info);
                    yield configuration_1.config.updateLatestMdiVersion(info.latest);
                    treeDataProvider.refresh();
                }
            }
            catch (error) {
                util_1.log(error);
            }
        }))();
    }
    context.subscriptions.push(...decoration_1.registerDecoration());
    util_1.log('"materialdesignicons-intellisense" is now active');
}
exports.activate = activate;
// this method is called when your extension is deactivated
function deactivate() { }
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map