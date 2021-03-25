"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.disposeReporter = exports.reportException = exports.reportErrorEvent = exports.report = exports.initReporter = exports.EventName = void 0;
const vscode_extension_telemetry_1 = require("vscode-extension-telemetry");
let reporter;
var EventName;
(function (EventName) {
    EventName["EXTENSION_INSTALLED"] = "extension-installed";
    EventName["EXTENSION_ACTIVATED"] = "extension-activated";
    EventName["EXTENSION_UNINSTALLED"] = "extension-uninstalled";
    EventName["BUNDLE_DOWNLOAD_SUCCESS"] = "bundle-download-success";
    EventName["BUNDLE_DOWNLOAD_FAILURE"] = "bundle-download-failure";
    EventName["START_BINARY"] = "tabnine-binary-run";
})(EventName = exports.EventName || (exports.EventName = {}));
function initReporter(context, id, version, key) {
    reporter = new vscode_extension_telemetry_1.default(id, version, key);
    context.subscriptions.push(reporter);
}
exports.initReporter = initReporter;
function report(event) {
    reporter.sendTelemetryEvent(event);
}
exports.report = report;
function reportErrorEvent(event, error) {
    reporter.sendTelemetryErrorEvent(event, { error: error.message });
}
exports.reportErrorEvent = reportErrorEvent;
function reportException(error) {
    reporter.sendTelemetryException(error);
}
exports.reportException = reportException;
function disposeReporter() {
    void reporter.dispose();
}
exports.disposeReporter = disposeReporter;
//# sourceMappingURL=reporter.js.map