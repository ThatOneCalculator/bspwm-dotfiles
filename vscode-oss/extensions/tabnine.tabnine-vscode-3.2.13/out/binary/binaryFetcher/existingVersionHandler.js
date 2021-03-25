"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
const semverUtils_1 = require("../../semverUtils");
const utils_1 = require("../../utils");
const binaryValidator_1 = require("./binaryValidator");
const paths_1 = require("../paths");
async function handleExistingVersion() {
    try {
        const versionPaths = await fs_1.promises.readdir(paths_1.getRootPath());
        const versions = semverUtils_1.default(versionPaths).map(paths_1.versionPath);
        return utils_1.asyncFind(versions, binaryValidator_1.default);
    }
    catch (e) {
        console.error("Error handling existing version. Falling back to downloading", e);
    }
    return null;
}
exports.default = handleExistingVersion;
//# sourceMappingURL=existingVersionHandler.js.map