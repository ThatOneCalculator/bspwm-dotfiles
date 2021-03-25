"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const semver = require("semver");
const FIRST = -1;
const EQUAL = 0;
const SECOND = 1;
function sortBySemver(versions) {
    versions.sort(cmpSemver);
    return versions;
}
exports.default = sortBySemver;
function cmpSemver(a, b) {
    const aValid = semver.valid(a);
    const bValid = semver.valid(b);
    if (aValid && bValid) {
        return semver.rcompare(a, b);
    }
    if (aValid) {
        return FIRST;
    }
    if (bValid) {
        return SECOND;
    }
    if (a < b) {
        return FIRST;
    }
    if (a > b) {
        return SECOND;
    }
    return EQUAL;
}
//# sourceMappingURL=semverUtils.js.map