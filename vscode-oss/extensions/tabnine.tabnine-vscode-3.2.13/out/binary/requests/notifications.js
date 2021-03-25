"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendNotificationAction = exports.getNotifications = void 0;
const requests_1 = require("./requests");
function getNotifications() {
    return requests_1.tabNineProcess.request({ Notifications: {} });
}
exports.getNotifications = getNotifications;
async function sendNotificationAction(id, message, selected, notification_type, actions, state) {
    return requests_1.tabNineProcess.request({
        NotificationAction: {
            id,
            selected,
            message,
            notification_type,
            actions,
            state,
        },
    });
}
exports.sendNotificationAction = sendNotificationAction;
//# sourceMappingURL=notifications.js.map