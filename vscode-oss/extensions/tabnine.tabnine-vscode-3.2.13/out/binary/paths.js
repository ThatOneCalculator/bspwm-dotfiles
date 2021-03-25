"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isWindows = exports.getUpdateVersionFileUrl = exports.getActivePath = exports.getRootPath = exports.getDownloadVersionUrl = exports.getBundlePath = exports.versionPath = void 0;
const path = require("path");
const consts_1 = require("../consts");
const ARCHITECTURE = getArch();
const SUFFIX = getSuffix();
const BUNDLE_SUFFIX = getBundleSuffix();
function versionPath(version) {
    return path.join(consts_1.BINARY_ROOT_PATH, version, `${ARCHITECTURE}-${SUFFIX}`);
}
exports.versionPath = versionPath;
function getBundlePath(version) {
    return path.join(consts_1.BINARY_ROOT_PATH, version, `${ARCHITECTURE}-${BUNDLE_SUFFIX}`);
}
exports.getBundlePath = getBundlePath;
function getDownloadVersionUrl(version) {
    return `${consts_1.BINARY_UPDATE_URL}/${version}/${ARCHITECTURE}-${BUNDLE_SUFFIX}`;
}
exports.getDownloadVersionUrl = getDownloadVersionUrl;
function getRootPath() {
    return consts_1.BINARY_ROOT_PATH;
}
exports.getRootPath = getRootPath;
function getActivePath() {
    return consts_1.ACTIVE_PATH;
}
exports.getActivePath = getActivePath;
function getUpdateVersionFileUrl() {
    return consts_1.BINARY_UPDATE_VERSION_FILE_URL;
}
exports.getUpdateVersionFileUrl = getUpdateVersionFileUrl;
function getSuffix() {
    switch (process.platform) {
        case "win32":
            return "pc-windows-gnu/TabNine.exe";
        case "darwin":
            return "apple-darwin/TabNine";
        case "linux":
            return "unknown-linux-musl/TabNine";
        default:
            throw new Error(`Sorry, the platform '${process.platform}' is not supported by TabNine.`);
    }
}
function isWindows() {
    return process.platform === "win32";
}
exports.isWindows = isWindows;
function getBundleSuffix() {
    return `${SUFFIX.replace(".exe", "")}.zip`;
}
function getArch() {
    if (process.platform === "darwin" && process.arch === "arm64") {
        return "aarch64";
    }
    if (process.arch === "x32" || process.arch === "ia32") {
        return "i686";
    }
    if (process.arch === "x64") {
        return "x86_64";
    }
    throw new Error(`Sorry, the architecture '${process.arch}' is not supported by TabNine.`);
}
//# sourceMappingURL=paths.js.map