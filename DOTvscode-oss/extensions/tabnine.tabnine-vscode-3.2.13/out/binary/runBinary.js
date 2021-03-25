"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const extensionContext_1 = require("../extensionContext");
const binaryFetcher_1 = require("./binaryFetcher");
const runProcess_1 = require("./runProcess");
async function runBinary(additionalArgs = [], inheritStdio = false) {
    var _a, _b, _c, _d, _e;
    const command = await binaryFetcher_1.default();
    const args = [
        "--client=vscode",
        "--no-lsp=true",
        extensionContext_1.tabnineContext.logFilePath
            ? `--log-file-path=${extensionContext_1.tabnineContext.logFilePath}`
            : null,
        "--client-metadata",
        `clientVersion=${extensionContext_1.tabnineContext.vscodeVersion}`,
        `pluginVersion=${(_a = extensionContext_1.tabnineContext.version) !== null && _a !== void 0 ? _a : "unknown"}`,
        `t9-vscode-AutoImportEnabled=${extensionContext_1.tabnineContext.isTabNineAutoImportEnabled}`,
        `t9-vscode-TSAutoImportEnabled=${(_b = extensionContext_1.tabnineContext.isTypeScriptAutoImports) !== null && _b !== void 0 ? _b : "unknown"}`,
        `t9-vscode-JSAutoImportEnabled=${(_c = extensionContext_1.tabnineContext.isJavaScriptAutoImports) !== null && _c !== void 0 ? _c : "unknown"}`,
        `vscode-remote=${extensionContext_1.tabnineContext.isRemote}`,
        `vscode-remote-name=${extensionContext_1.tabnineContext.remoteName}`,
        `vscode-extension-kind=${extensionContext_1.tabnineContext.extensionKind}`,
        `vscode-theme-name=${(_d = extensionContext_1.tabnineContext.themeName) !== null && _d !== void 0 ? _d : "unknown"}`,
        `vscode-theme-kind=${extensionContext_1.tabnineContext.themeKind}`,
        `vscode-status-customization=${(_e = extensionContext_1.tabnineContext.statusBarColorCustomizations) !== null && _e !== void 0 ? _e : "unknown"}`,
        ...additionalArgs,
    ].filter((i) => i !== null);
    return runProcess_1.runProcess(command, args, {
        stdio: inheritStdio ? "inherit" : "pipe",
    });
}
exports.default = runBinary;
//# sourceMappingURL=runBinary.js.map