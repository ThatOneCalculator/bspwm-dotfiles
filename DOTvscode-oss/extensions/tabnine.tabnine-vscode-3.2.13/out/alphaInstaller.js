"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updatePersistedAlphaVersion = exports.getPersistedAlphaVersion = void 0;
const semver = require("semver");
const vscode_1 = require("vscode");
const capabilities_1 = require("./capabilities");
const consts_1 = require("./consts");
const download_utils_1 = require("./download.utils");
const extensionContext_1 = require("./extensionContext");
const file_utils_1 = require("./file.utils");
async function handleAlpha(context) {
    try {
        if (userConsumesAlphaVersions()) {
            const artifactUrl = await getArtifactUrl();
            const availableVersion = getAvailableAlphaVersion(artifactUrl);
            if (isNewerAlphaVersionAvailable(context, availableVersion)) {
                const { name } = await file_utils_1.default(".vsix");
                await download_utils_1.downloadFileToDestination(artifactUrl, name);
                await vscode_1.commands.executeCommand(consts_1.INSTALL_COMMAND, vscode_1.Uri.file(name));
                await updatePersistedAlphaVersion(context, availableVersion);
                void promptReloadWindow(`TabNine has been updated to ${availableVersion} version. Please reload the window for the changes to take effect.`);
            }
        }
    }
    catch (e) {
        console.error(e);
    }
}
exports.default = handleAlpha;
async function getArtifactUrl() {
    const response = JSON.parse(await download_utils_1.downloadFileToStr(consts_1.LATEST_RELEASE_URL));
    return response[0].assets[0].browser_download_url;
}
function isNewerAlphaVersionAvailable(context, availableVersion) {
    var _a, _b;
    const currentVersion = getCurrentVersion(context);
    const isNewerVersion = !!currentVersion && semver.gt(availableVersion, currentVersion);
    const isAlphaAvailable = !!((_a = semver
        .prerelease(availableVersion)) === null || _a === void 0 ? void 0 : _a.includes("alpha"));
    const isSameWithAlphaAvailable = !!currentVersion &&
        semver.eq(((_b = semver.coerce(availableVersion)) === null || _b === void 0 ? void 0 : _b.version) || "", currentVersion) &&
        isAlphaAvailable;
    return (isAlphaAvailable && isNewerVersion) || isSameWithAlphaAvailable;
}
function getCurrentVersion(context) {
    const persistedAlphaVersion = getPersistedAlphaVersion(context);
    return persistedAlphaVersion || extensionContext_1.tabnineContext.version;
}
function getPersistedAlphaVersion(context) {
    return context.globalState.get(consts_1.ALPHA_VERSION_KEY);
}
exports.getPersistedAlphaVersion = getPersistedAlphaVersion;
function updatePersistedAlphaVersion(context, installedVersion) {
    return context.globalState.update(consts_1.ALPHA_VERSION_KEY, installedVersion);
}
exports.updatePersistedAlphaVersion = updatePersistedAlphaVersion;
function getAvailableAlphaVersion(artifactUrl) {
    const versionPattern = /(?<=download\/)(.*)(?=\/tabnine-vscode)/gi;
    const match = artifactUrl.match(versionPattern);
    return (match && match[0]) || "";
}
function userConsumesAlphaVersions() {
    const isVersionSupported = semver.gte(extensionContext_1.tabnineContext.vscodeVersion, consts_1.MINIMAL_SUPPORTED_VSCODE_API);
    const isAlpha = capabilities_1.isCapabilityEnabled(capabilities_1.Capability.ALPHA_CAPABILITY);
    return isVersionSupported && isAlpha;
}
async function promptReloadWindow(message) {
    const reload = "Reload";
    const value = await vscode_1.window.showInformationMessage(message, reload);
    if (value === reload) {
        void vscode_1.commands.executeCommand("workbench.action.reloadWindow");
    }
}
//# sourceMappingURL=alphaInstaller.js.map