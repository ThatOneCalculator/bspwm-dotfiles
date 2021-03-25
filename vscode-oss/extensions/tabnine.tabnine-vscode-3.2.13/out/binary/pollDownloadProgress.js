"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const requests_1 = require("./requests/requests");
const setState_1 = require("./requests/setState");
const consts_1 = require("../consts");
const statusBar_1 = require("../statusBar/statusBar");
const utils_1 = require("../utils");
const state_1 = require("./state");
const PROGRESS_BAR_POLLING_INTERVAL = 1500; // just enough for the spinner to not blink
const POLLING_TIMEOUT = 60 * 1000; // one minutes
function pollDownloadProgress() {
    utils_1.withPolling((stop) => {
        void requests_1.getState().then((state) => {
            var _a, _b;
            if (isNotInDownloadingState(state)) {
                stop();
                statusBar_1.setDefaultStatus();
            }
            else if (((_a = state === null || state === void 0 ? void 0 : state.download_state) === null || _a === void 0 ? void 0 : _a.status) === state_1.DownloadStatus.IN_PROGRESS &&
                ((_b = state === null || state === void 0 ? void 0 : state.download_state) === null || _b === void 0 ? void 0 : _b.kind) === state_1.DownloadProgress.DOWNLOADING) {
                stop();
                handleDownloadingInProgress();
            }
        });
    }, PROGRESS_BAR_POLLING_INTERVAL, POLLING_TIMEOUT);
}
exports.default = pollDownloadProgress;
function isNotInDownloadingState(state) {
    var _a, _b, _c;
    return (!(state === null || state === void 0 ? void 0 : state.local_enabled) ||
        ((state === null || state === void 0 ? void 0 : state.local_enabled) &&
            !(state === null || state === void 0 ? void 0 : state.is_cpu_supported) &&
            !(state === null || state === void 0 ? void 0 : state.cloud_enabled)) ||
        ((_a = state === null || state === void 0 ? void 0 : state.download_state) === null || _a === void 0 ? void 0 : _a.status) === state_1.DownloadStatus.FINISHED ||
        (((_b = state === null || state === void 0 ? void 0 : state.download_state) === null || _b === void 0 ? void 0 : _b.status) === state_1.DownloadStatus.NOT_STARTED &&
            !!((_c = state === null || state === void 0 ? void 0 : state.download_state) === null || _c === void 0 ? void 0 : _c.last_failure)));
}
function handleDownloadingInProgress() {
    void setState_1.default({
        [consts_1.StatePayload.MESSAGE]: { message_type: consts_1.StateType.PROGRESS },
    });
    statusBar_1.setLoadingStatus(`Initializing... 0%`);
    const progressInterval = setInterval(() => {
        void requests_1.getState().then((state) => {
            if ((state === null || state === void 0 ? void 0 : state.download_state.status) === state_1.DownloadStatus.FINISHED ||
                (state === null || state === void 0 ? void 0 : state.download_state.last_failure)) {
                statusBar_1.setDefaultStatus();
                clearInterval(progressInterval);
            }
            else {
                statusBar_1.setLoadingStatus(`Initializing... ${downloadPercentage(state === null || state === void 0 ? void 0 : state.download_state)}%`);
            }
        });
    }, PROGRESS_BAR_POLLING_INTERVAL);
}
function downloadPercentage(download_state) {
    if (!download_state) {
        return "0";
    }
    return (download_state === null || download_state === void 0 ? void 0 : download_state.kind) === state_1.DownloadProgress.DOWNLOADING
        ? Math.round(100 *
            (toMB(download_state.crnt_bytes || 0) /
                toMB(download_state.total_bytes || 1))).toString()
        : "100";
}
function toMB(x) {
    return Math.floor(x / 1024 / 1024);
}
//# sourceMappingURL=pollDownloadProgress.js.map