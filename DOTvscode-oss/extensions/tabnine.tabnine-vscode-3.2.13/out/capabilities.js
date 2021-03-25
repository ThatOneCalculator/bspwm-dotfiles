"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchCapabilitiesOnFocus = exports.isCapabilityEnabled = exports.Capability = void 0;
const vscode = require("vscode");
const requests_1 = require("./binary/requests/requests");
var Capability;
(function (Capability) {
    Capability["ON_BOARDING_CAPABILITY"] = "vscode.onboarding";
    Capability["VALIDATOR_CAPABILITY"] = "vscode.validator";
    Capability["VALIDATOR_MODE_A_CAPABILITY_KEY"] = "vscode.validator.mode.A";
    Capability["VALIDATOR_MODE_B_CAPABILITY_KEY"] = "vscode.validator.mode.B";
    Capability["VALIDATOR_BACKGROUND_CAPABILITY"] = "vscode.validator.background";
    Capability["VALIDATOR_PASTE_CAPABILITY"] = "vscode.validator.paste";
    Capability["SUGGESTIONS_SINGLE"] = "suggestions-single";
    Capability["SUGGESTIONS_TWO"] = "suggestions-two";
    Capability["SUGGESTIONS_ORIGINAL"] = "suggestions-original";
    Capability["ALPHA_CAPABILITY"] = "vscode.validator";
    Capability["SHOW_AGRESSIVE_STATUS_BAR_UNTIL_CLICKED"] = "promoteHub1";
})(Capability = exports.Capability || (exports.Capability = {}));
const enabledCapabilities = {};
function isCapabilityEnabled(capability) {
    return enabledCapabilities[capability];
}
exports.isCapabilityEnabled = isCapabilityEnabled;
function fetchCapabilitiesOnFocus() {
    return new Promise((resolve) => {
        if (vscode.window.state.focused) {
            console.log("capabilities resolved immediately");
            resolveCapabilities(resolve);
        }
        else {
            const disposable = vscode.window.onDidChangeWindowState(({ focused }) => {
                disposable.dispose();
                console.log(`capabilities resolved on focus ${focused}`);
                resolveCapabilities(resolve);
            });
        }
    });
}
exports.fetchCapabilitiesOnFocus = fetchCapabilitiesOnFocus;
function resolveCapabilities(resolve) {
    void requests_1.getCapabilities().then((capabilities) => {
        capabilities === null || capabilities === void 0 ? void 0 : capabilities.enabled_features.forEach((feature) => {
            enabledCapabilities[feature] = true;
        });
        resolve();
    });
}
//# sourceMappingURL=capabilities.js.map