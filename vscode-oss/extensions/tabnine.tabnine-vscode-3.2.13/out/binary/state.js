"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmuMode = exports.Mode = exports.OSArchTarget = exports.DownloadProgress = exports.DownloadStatus = void 0;
var DownloadStatus;
(function (DownloadStatus) {
    DownloadStatus["FINISHED"] = "Finished";
    DownloadStatus["NOT_STARTED"] = "NotStarted";
    DownloadStatus["IN_PROGRESS"] = "InProgress";
})(DownloadStatus = exports.DownloadStatus || (exports.DownloadStatus = {}));
var DownloadProgress;
(function (DownloadProgress) {
    DownloadProgress["DOWNLOADING"] = "Downloading";
    DownloadProgress["RETRIEVING_METADATA"] = "RetrievingMetadata";
    DownloadProgress["VERIFYING_CHECKSUM"] = "VerifyingChecksum";
})(DownloadProgress = exports.DownloadProgress || (exports.DownloadProgress = {}));
var OSArchTarget;
(function (OSArchTarget) {
    // Partial, has more options.
    OSArchTarget["APPLE_64"] = "x86_64-apple-darwin";
})(OSArchTarget = exports.OSArchTarget || (exports.OSArchTarget = {}));
var Mode;
(function (Mode) {
    // Partial, has more options.
    Mode["RELEASE"] = "Release";
})(Mode = exports.Mode || (exports.Mode = {}));
var EmuMode;
(function (EmuMode) {
    // Partial, has more options.
    EmuMode["NATIVE"] = "Native";
})(EmuMode = exports.EmuMode || (exports.EmuMode = {}));
//# sourceMappingURL=state.js.map