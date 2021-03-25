"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode_1 = require("vscode");
const consts_1 = require("../../consts");
const reporter_1 = require("../../reporter");
const activeFileHandler_1 = require("./activeFileHandler");
const bundleDownloader_1 = require("./bundleDownloader");
const existingVersionHandler_1 = require("./existingVersionHandler");
async function fetchBinaryPath() {
    const activeVersionPath = activeFileHandler_1.default();
    if (activeVersionPath) {
        return activeVersionPath;
    }
    const existingVersion = await existingVersionHandler_1.default();
    if (existingVersion) {
        return existingVersion;
    }
    return tryDownloadVersion();
}
exports.default = fetchBinaryPath;
async function tryDownloadVersion() {
    try {
        return await downloadVersion();
    }
    catch (error) {
        const existingVersion = await existingVersionHandler_1.default();
        if (existingVersion) {
            return existingVersion;
        }
        return handleErrorMessage(error);
    }
}
async function downloadVersion() {
    return vscode_1.window.withProgress({
        location: vscode_1.ProgressLocation.Notification,
        title: `Initializing Tabnine`,
    }, bundleDownloader_1.default);
}
async function handleErrorMessage(error) {
    reporter_1.reportErrorEvent(reporter_1.EventName.BUNDLE_DOWNLOAD_FAILURE, error);
    reporter_1.reportException(error);
    return new Promise((resolve, reject) => {
        void vscode_1.window
            .showErrorMessage(consts_1.BUNDLE_DOWNLOAD_FAILURE_MESSAGE, consts_1.RELOAD_BUTTON, consts_1.OPEN_NETWORK_SETUP_HELP)
            .then((result) => {
            if (result === consts_1.OPEN_NETWORK_SETUP_HELP) {
                void vscode_1.env.openExternal(consts_1.getNetworkSettingsHelpLink());
                reject(error);
            }
            else if (result === consts_1.RELOAD_BUTTON) {
                void vscode_1.commands.executeCommand("workbench.action.reloadWindow");
                reject(error);
            }
            else {
                reject(error);
            }
        }, reject);
    });
}
//# sourceMappingURL=index.js.map