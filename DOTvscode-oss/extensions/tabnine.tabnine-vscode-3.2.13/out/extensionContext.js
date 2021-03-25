"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getContext = exports.tabnineContext = void 0;
const vscode = require("vscode");
const EXTENSION_SUBSTRING = "tabnine-vscode";
exports.tabnineContext = getContext();
function getContext() {
    const extension = vscode.extensions.all.find((x) => x.id.includes(EXTENSION_SUBSTRING));
    const configuration = vscode.workspace.getConfiguration();
    const isJavaScriptAutoImports = configuration.get("javascript.suggest.autoImports");
    const isTypeScriptAutoImports = configuration.get("typescript.suggest.autoImports");
    const autoImportConfig = "tabnine.experimentalAutoImports";
    const logFilePath = configuration.get("tabnine.logFilePath");
    let isTabNineAutoImportEnabled = configuration.get(autoImportConfig);
    const { remoteName } = vscode.env;
    const { extensionKind } = extension;
    const isRemote = !!remoteName && extensionKind === 2;
    const isInstalled = isTabNineAutoImportEnabled === null;
    if (isTabNineAutoImportEnabled !== false) {
        isTabNineAutoImportEnabled = true;
        void configuration.update(autoImportConfig, isTabNineAutoImportEnabled, true);
    }
    return {
        get extensionPath() {
            return extension === null || extension === void 0 ? void 0 : extension.extensionPath;
        },
        get version() {
            return (extension === null || extension === void 0 ? void 0 : extension.packageJSON).version;
        },
        get id() {
            return extension === null || extension === void 0 ? void 0 : extension.id;
        },
        get name() {
            var _a;
            return `${EXTENSION_SUBSTRING}-${(_a = this.version) !== null && _a !== void 0 ? _a : "unknown"}`;
        },
        get vscodeVersion() {
            return vscode.version;
        },
        get isTabNineAutoImportEnabled() {
            return !!isTabNineAutoImportEnabled;
        },
        get isJavaScriptAutoImports() {
            return isJavaScriptAutoImports;
        },
        get isTypeScriptAutoImports() {
            return isTypeScriptAutoImports;
        },
        get logFilePath() {
            return logFilePath ? `${logFilePath}-${process.pid}` : "";
        },
        get isRemote() {
            return isRemote;
        },
        get remoteName() {
            return remoteName;
        },
        get extensionKind() {
            return extensionKind;
        },
        get themeKind() {
            return vscode.ColorThemeKind[vscode.window.activeColorTheme.kind];
        },
        get themeName() {
            const workbenchConfig = getWorkbenchSettings();
            return workbenchConfig.get("colorTheme");
        },
        get statusBarColorCustomizations() {
            const workbenchConfig = getWorkbenchSettings();
            const colorCustomizations = workbenchConfig.get("colorCustomizations");
            return colorCustomizations === null || colorCustomizations === void 0 ? void 0 : colorCustomizations["statusBar.background"];
        },
        get isInstalled() {
            return isInstalled;
        },
    };
}
exports.getContext = getContext;
function getWorkbenchSettings() {
    return vscode.workspace.getConfiguration("workbench");
}
//# sourceMappingURL=extensionContext.js.map