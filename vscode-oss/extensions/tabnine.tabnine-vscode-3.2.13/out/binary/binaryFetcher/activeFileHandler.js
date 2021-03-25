"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const paths_1 = require("../paths");
function handleActiveFile() {
    try {
        const activePath = paths_1.getActivePath();
        if (fs.existsSync(activePath)) {
            const activeVersion = fs.readFileSync(activePath, "utf-8").trim();
            const activeVersionPath = paths_1.versionPath(activeVersion);
            if (fs.existsSync(activeVersionPath)) {
                return activeVersionPath;
            }
        }
    }
    catch (e) {
        console.error("Error handling .active file. Falling back to semver sorting", e);
    }
    return null;
}
exports.default = handleActiveFile;
//# sourceMappingURL=activeFileHandler.js.map