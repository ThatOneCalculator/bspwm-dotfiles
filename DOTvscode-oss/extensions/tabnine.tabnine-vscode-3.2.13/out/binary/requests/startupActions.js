"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getStartupActions = void 0;
const requests_1 = require("./requests");
function getStartupActions() {
    return requests_1.tabNineProcess.request({ StartupActions: {} });
}
exports.getStartupActions = getStartupActions;
//# sourceMappingURL=startupActions.js.map