"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
const vscode = require("vscode");
const path = require("path");
const util_1 = require("./util");
const searchCodeActionCode = 1;
exports.config = {
    context: null,
    get all() {
        return vscode.workspace.getConfiguration("materialdesigniconsIntellisense");
    },
    get matchers() {
        return (exports.config.all.get("matchers") || []);
    },
    get iconSize() {
        return exports.config.all.get("iconSize") || 100;
    },
    /**
     * For some reason, vscode doesn't display the icon in tree view if the color contains `#`
     * @returns {string} rgb(r, g, b)
     */
    get iconColor() {
        return util_1.hexToRgbString(exports.config.all.get("iconColor") || "#bababa");
    },
    get selector() {
        return exports.config.all.get("selector") || [];
    },
    updateSelector(selector) {
        return exports.config.all.update("selector", selector, vscode.ConfigurationTarget.Global);
    },
    get includeAliases() {
        return exports.config.all.get("includeAliases") || false;
    },
    get latestMdiVersion() {
        var _a;
        return (_a = exports.config.context) === null || _a === void 0 ? void 0 : _a.globalState.get("latestMdiVersion");
    },
    updateLatestMdiVersion(version) {
        var _a;
        return (_a = exports.config.context) === null || _a === void 0 ? void 0 : _a.globalState.update("latestMdiVersion", version);
    },
    get rawMdiVersion() {
        return exports.config.all.get("mdiVersion") || "latest";
    },
    get mdiVersion() {
        const version = exports.config.rawMdiVersion;
        return version === "latest" ? exports.config.latestMdiVersion : version;
    },
    updateMdiVersion(version) {
        return exports.config.all.update("mdiVersion", version, vscode.ConfigurationTarget.Global);
    },
    get mdiPath() {
        return (exports.config.all.get("overrideFontPackagePath") ||
            (exports.config.context &&
                exports.config.mdiVersion &&
                path.join(exports.config.context.globalStoragePath, exports.config.mdiVersion, "package")) ||
            path.normalize(path.join(__dirname, "../node_modules/@mdi/svg/")) // fallback
        );
    },
    get mdiPackagePath() {
        return path.normalize(path.join(exports.config.mdiPath, "package.json"));
    },
    get mdiMetaDataPath() {
        return path.normalize(path.join(exports.config.mdiPath, "meta.json"));
    },
    get searchCodeActionCode() {
        return searchCodeActionCode;
    },
    get insertType() {
        return exports.config.all.get("insertStyle");
    },
    lastSearch: "",
    changeInsertType(newType) {
        return exports.config.all.update("insertStyle", newType, vscode.ConfigurationTarget.Global);
    },
    get enableLinter() {
        return exports.config.all.get("enableLinter");
    },
    get enableDecorations() {
        return exports.config.all.get("enableDecorations");
    },
    get ignoredIcons() {
        return exports.config.all.get("ignoredIcons") || [];
    },
    get decoration() {
        return exports.config.all.get("decoration");
    }
};
//# sourceMappingURL=configuration.js.map