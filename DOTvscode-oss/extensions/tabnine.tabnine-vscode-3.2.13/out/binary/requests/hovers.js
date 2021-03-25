"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendHoverAction = exports.getHover = exports.HoverActions = void 0;
const requests_1 = require("./requests");
var HoverActions;
(function (HoverActions) {
    HoverActions[HoverActions["NONE"] = 0] = "NONE";
})(HoverActions = exports.HoverActions || (exports.HoverActions = {}));
function getHover() {
    return requests_1.tabNineProcess.request({ Hover: {} });
}
exports.getHover = getHover;
async function sendHoverAction(id, selected, actions, notification_type, state) {
    return requests_1.tabNineProcess.request({
        HoverAction: { id, actions, notification_type, state, selected },
    });
}
exports.sendHoverAction = sendHoverAction;
//# sourceMappingURL=hovers.js.map