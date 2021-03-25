"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.doPollNotifications = exports.cancelNotificationsPolling = void 0;
const vscode = require("vscode");
const notifications_1 = require("../binary/requests/notifications");
const executeNotificationAction_1 = require("./executeNotificationAction");
const consts_1 = require("../consts");
const utils_1 = require("../utils");
const setState_1 = require("../binary/requests/setState");
let pollingInterval = null;
function pollNotifications(context) {
    pollingInterval = setInterval(() => void doPollNotifications(context), consts_1.BINARY_NOTIFICATION_POLLING_INTERVAL);
}
exports.default = pollNotifications;
function cancelNotificationsPolling() {
    if (pollingInterval) {
        clearInterval(pollingInterval);
    }
}
exports.cancelNotificationsPolling = cancelNotificationsPolling;
async function doPollNotifications(context) {
    const notifications = await notifications_1.getNotifications();
    if (!notifications || !notifications.notifications) {
        return;
    }
    notifications.notifications.forEach((notification) => void handleNotification(notification, context));
}
exports.doPollNotifications = doPollNotifications;
async function handleNotification({ id, message, notification_type, options, state }, context) {
    try {
        await utils_1.assertFirstTimeReceived(id, context);
        void setState_1.default({
            [consts_1.StatePayload.NOTIFICATION_SHOWN]: {
                id,
                text: message,
                notification_type,
                state,
            },
        });
        return vscode.window
            .showInformationMessage(message, ...options.map((option) => option.key))
            .then((selected) => {
            const selectedAction = options.find(({ key }) => key === selected);
            void notifications_1.sendNotificationAction(id, message, selected, notification_type, selectedAction === null || selectedAction === void 0 ? void 0 : selectedAction.actions, state);
            void executeNotificationAction_1.default(selectedAction === null || selectedAction === void 0 ? void 0 : selectedAction.actions);
        });
    }
    catch (error) {
        // This is OK, as we prevented the same popup to appear twice.
        return Promise.resolve();
    }
}
//# sourceMappingURL=pollNotifications.js.map