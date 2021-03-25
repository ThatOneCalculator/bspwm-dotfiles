"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.provideHover = void 0;
const hovers_1 = require("../binary/requests/hovers");
const consts_1 = require("../consts");
const setState_1 = require("../binary/requests/setState");
const hoverActionsHandler_1 = require("./hoverActionsHandler");
const decorationState_1 = require("./decorationState");
let currentHover = null;
function provideHover(_document, position) {
    handleHoverShown(position);
    return null;
}
exports.provideHover = provideHover;
function handleHoverShown(position) {
    if (currentHover && decorationState_1.isDecorationContains(position)) {
        void setState_1.default({
            [consts_1.StatePayload.HOVER_SHOWN]: {
                id: currentHover.id,
                text: currentHover.message,
                notification_type: currentHover.notification_type,
                state: currentHover.state,
            },
        });
    }
}
async function setHover(context, position) {
    currentHover = await hovers_1.getHover();
    if (currentHover === null || currentHover === void 0 ? void 0 : currentHover.title) {
        hoverActionsHandler_1.default(currentHover, context);
        decorationState_1.default(position, context, currentHover);
    }
}
exports.default = setHover;
//# sourceMappingURL=hoverHandler.js.map