"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
const path = require("path");
const extract = require("extract-zip");
const download_utils_1 = require("../../download.utils");
const paths_1 = require("../paths");
const reporter_1 = require("../../reporter");
const EXECUTABLE_FLAG = 0o755;
async function downloadAndExtractBundle() {
    const { bundlePath, bundleDownloadUrl, bundleDirectory, executablePath, } = await getBundlePaths();
    try {
        await createBundleDirectory(bundleDirectory);
        await download_utils_1.downloadFileToDestination(bundleDownloadUrl, bundlePath);
        await extractBundle(bundlePath, bundleDirectory);
        await removeBundle(bundlePath);
        await setDirectoryFilesAsExecutable(bundleDirectory);
        reporter_1.report(reporter_1.EventName.BUNDLE_DOWNLOAD_SUCCESS);
        return executablePath;
    }
    finally {
        await removeBundle(bundlePath);
    }
}
exports.default = downloadAndExtractBundle;
async function removeBundle(bundlePath) {
    try {
        await fs_1.promises.unlink(bundlePath);
        // eslint-disable-next-line no-empty
    }
    catch (_a) { }
}
async function getBundlePaths() {
    const version = await getCurrentVersion();
    const bundlePath = paths_1.getBundlePath(version);
    const bundleDownloadUrl = paths_1.getDownloadVersionUrl(version);
    const bundleDirectory = path.dirname(bundlePath);
    const executablePath = paths_1.versionPath(version);
    return { bundlePath, bundleDownloadUrl, bundleDirectory, executablePath };
}
function createBundleDirectory(bundleDirectory) {
    return fs_1.promises.mkdir(bundleDirectory, { recursive: true });
}
async function getCurrentVersion() {
    const versionUrl = paths_1.getUpdateVersionFileUrl();
    return download_utils_1.downloadFileToStr(versionUrl);
}
async function extractBundle(bundle, bundleDirectory) {
    return extract(bundle, { dir: bundleDirectory });
}
async function setDirectoryFilesAsExecutable(bundleDirectory) {
    if (paths_1.isWindows()) {
        return Promise.resolve([]);
    }
    const files = await fs_1.promises.readdir(bundleDirectory);
    return Promise.all(files.map((file) => fs_1.promises.chmod(path.join(bundleDirectory, file), EXECUTABLE_FLAG)));
}
//# sourceMappingURL=bundleDownloader.js.map