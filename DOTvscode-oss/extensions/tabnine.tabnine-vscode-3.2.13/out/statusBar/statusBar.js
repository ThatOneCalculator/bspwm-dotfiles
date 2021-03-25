"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.clearPromotion = exports.setPromotionStatus = exports.setCompletionStatus = exports.setLoadingStatus = exports.resetDefaultStatus = exports.setDefaultStatus = exports.onStartServiceLevel = exports.promotionTextIs = exports.pollServiceLevel = exports.registerStatusBar = void 0;
const vscode_1 = require("vscode");
const requests_1 = require("../binary/requests/requests");
const commandsHandler_1 = require("../commandsHandler");
const consts_1 = require("../consts");
const StatusBarData_1 = require("./StatusBarData");
const StatusBarPromotionItem_1 = require("./StatusBarPromotionItem");
const SPINNER = "$(sync~spin)";
let statusBarData;
let promotion;
function registerStatusBar(context) {
    if (statusBarData) {
        return;
    }
    const statusBar = vscode_1.window.createStatusBarItem(vscode_1.StatusBarAlignment.Left, -1);
    promotion = new StatusBarPromotionItem_1.default(vscode_1.window.createStatusBarItem(vscode_1.StatusBarAlignment.Left, -1));
    statusBarData = new StatusBarData_1.default(statusBar, context);
    statusBar.command = commandsHandler_1.STATUS_BAR_COMMAND;
    statusBar.show();
    setLoadingStatus("Starting...");
    context.subscriptions.push(statusBar);
    context.subscriptions.push(promotion.item);
}
exports.registerStatusBar = registerStatusBar;
async function pollServiceLevel() {
    if (!statusBarData) {
        return;
    }
    const state = await requests_1.getState();
    statusBarData.serviceLevel = state === null || state === void 0 ? void 0 : state.service_level;
}
exports.pollServiceLevel = pollServiceLevel;
function promotionTextIs(text) {
    var _a;
    return ((_a = promotion === null || promotion === void 0 ? void 0 : promotion.item) === null || _a === void 0 ? void 0 : _a.text) === text;
}
exports.promotionTextIs = promotionTextIs;
async function onStartServiceLevel() {
    if (!statusBarData) {
        return;
    }
    const state = await requests_1.getState();
    statusBarData.serviceLevel =
        (state === null || state === void 0 ? void 0 : state.service_level) === "Free"
            ? serviceLevelBaseOnAPIKey(state)
            : state === null || state === void 0 ? void 0 : state.service_level;
}
exports.onStartServiceLevel = onStartServiceLevel;
function serviceLevelBaseOnAPIKey(state) {
    return (state === null || state === void 0 ? void 0 : state.api_key) ? "Pro" : "Free";
}
function setDefaultStatus() {
    if (!statusBarData) {
        return;
    }
    statusBarData.icon = null;
    statusBarData.text = null;
}
exports.setDefaultStatus = setDefaultStatus;
function resetDefaultStatus(id) {
    if (!id || (promotion && promotion.id && promotion.id === id)) {
        setDefaultStatus();
        clearPromotion();
    }
}
exports.resetDefaultStatus = resetDefaultStatus;
function setLoadingStatus(issue) {
    if (!statusBarData) {
        return;
    }
    statusBarData.text = issue;
    statusBarData.icon = SPINNER;
}
exports.setLoadingStatus = setLoadingStatus;
function setCompletionStatus(limited = false) {
    if (!statusBarData) {
        return;
    }
    statusBarData.limited = limited;
}
exports.setCompletionStatus = setCompletionStatus;
function setPromotionStatus(id, message, tooltip, command) {
    if (!statusBarData || !promotion) {
        return;
    }
    promotion.id = id;
    promotion.item.text = message;
    promotion.item.command = command;
    promotion.item.tooltip = `${consts_1.FULL_BRAND_REPRESENTATION}${tooltip ? ` - ${tooltip}` : ""}`;
    promotion.item.color = "yellow";
    statusBarData.text = " ";
    promotion.item.show();
}
exports.setPromotionStatus = setPromotionStatus;
function clearPromotion() {
    if (!promotion) {
        return;
    }
    promotion.item.text = "";
    promotion.item.tooltip = "";
    promotion.item.hide();
}
exports.clearPromotion = clearPromotion;
//# sourceMappingURL=statusBar.js.map