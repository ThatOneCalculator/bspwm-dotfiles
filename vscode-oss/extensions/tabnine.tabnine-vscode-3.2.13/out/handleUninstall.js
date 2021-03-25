"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const path = require("path");
const extensionContext_1 = require("./extensionContext");
function handleUninstall(onUninstall) {
    var _a;
    try {
        const extensionsPath = path.dirname((_a = extensionContext_1.tabnineContext.extensionPath) !== null && _a !== void 0 ? _a : "");
        const uninstalledPath = path.join(extensionsPath, ".obsolete");
        const isFileExists = (curr) => curr.size !== 0;
        const isModified = (curr, prev) => new Date(curr.mtimeMs) >= new Date(prev.atimeMs);
        const isUpdating = (files) => files.filter((f) => extensionContext_1.tabnineContext.id
            ? f.toLowerCase().includes(extensionContext_1.tabnineContext.id.toLowerCase())
            : false).length !== 1;
        const watchFileHandler = (curr, prev) => {
            if (isFileExists(curr) && isModified(curr, prev)) {
                fs.readFile(uninstalledPath, (err, uninstalled) => {
                    if (err) {
                        console.error("failed to read .obsolete file:", err);
                        throw err;
                    }
                    fs.readdir(extensionsPath, (error, files) => {
                        if (error) {
                            console.error(`failed to read ${extensionsPath} directory:`, error);
                            throw error;
                        }
                        if (!isUpdating(files) &&
                            uninstalled.includes(extensionContext_1.tabnineContext.name)) {
                            onUninstall()
                                .then(() => {
                                fs.unwatchFile(uninstalledPath, watchFileHandler);
                            })
                                .catch((e) => {
                                console.error("failed to report uninstall:", e);
                            });
                        }
                    });
                });
            }
        };
        fs.watchFile(uninstalledPath, watchFileHandler);
    }
    catch (error) {
        console.error("failed to invoke uninstall:", error);
    }
}
exports.default = handleUninstall;
//# sourceMappingURL=handleUninstall.js.map