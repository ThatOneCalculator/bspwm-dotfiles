"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const alphaInstaller_1 = require("../alphaInstaller");
const capabilities_1 = require("../capabilities");
const consts_1 = require("../consts");
class StatusBarData {
    constructor(_statusBarItem, _context) {
        this._statusBarItem = _statusBarItem;
        this._context = _context;
        this._limited = false;
    }
    set limited(limited) {
        this._limited = limited;
        this.updateStatusBar();
    }
    set serviceLevel(serviceLevel) {
        this._serviceLevel = serviceLevel;
        this.updateStatusBar();
    }
    get serviceLevel() {
        return this._serviceLevel;
    }
    set icon(icon) {
        this._icon = icon || undefined;
        this.updateStatusBar();
    }
    get icon() {
        return this._icon;
    }
    set text(text) {
        this._text = text || undefined;
        this.updateStatusBar();
    }
    get text() {
        return this._text;
    }
    updateStatusBar() {
        var _a;
        const issueText = this._text ? `: ${this._text}` : "";
        const serviceLevel = this._serviceLevel === "Pro" || this._serviceLevel === "Trial"
            ? " pro"
            : "";
        const limited = this._limited ? ` ${consts_1.LIMITATION_SYMBOL}` : "";
        this._statusBarItem.text = `${consts_1.FULL_BRAND_REPRESENTATION}${serviceLevel}${this.getIconText()}${issueText.trimEnd()}${limited}`;
        this._statusBarItem.tooltip =
            capabilities_1.isCapabilityEnabled(capabilities_1.Capability.SHOW_AGRESSIVE_STATUS_BAR_UNTIL_CLICKED) &&
                !this._context.globalState.get(consts_1.STATUS_BAR_FIRST_TIME_CLICKED)
                ? "Click 'tabnine' for settings and more information"
                : `${consts_1.FULL_BRAND_REPRESENTATION} (Click to open settings)${(_a = alphaInstaller_1.getPersistedAlphaVersion(this._context)) !== null && _a !== void 0 ? _a : ""}`;
    }
    getIconText() {
        if (this._icon) {
            return ` ${this._icon}`;
        }
        if (capabilities_1.isCapabilityEnabled(capabilities_1.Capability.SHOW_AGRESSIVE_STATUS_BAR_UNTIL_CLICKED) &&
            !this._context.globalState.get(consts_1.STATUS_BAR_FIRST_TIME_CLICKED)) {
            return " 👈";
        }
        return "";
    }
}
exports.default = StatusBarData;
//# sourceMappingURL=StatusBarData.js.map