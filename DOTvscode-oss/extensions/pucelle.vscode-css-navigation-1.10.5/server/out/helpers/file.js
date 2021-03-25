"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolveImportPath = exports.walkDirectoryToMatchFiles = exports.replacePathExtension = exports.getPathExtension = exports.generateGlobPatternFromExtensions = exports.generateGlobPatternFromPatterns = void 0;
const path = require("path");
const fs = require("fs-extra");
const ignoreWalk = require('@pucelle/ignore-walk');
function generateGlobPatternFromPatterns(patterns) {
    if (patterns.length > 1) {
        return '{' + patterns.join(',') + '}';
    }
    else if (patterns.length === 1) {
        return patterns[0];
    }
    return null;
}
exports.generateGlobPatternFromPatterns = generateGlobPatternFromPatterns;
function generateGlobPatternFromExtensions(extensions) {
    if (extensions.length > 1) {
        return '**/*.{' + extensions.join(',') + '}';
    }
    else if (extensions.length === 1) {
        return '**/*.' + extensions[0];
    }
    return null;
}
exports.generateGlobPatternFromExtensions = generateGlobPatternFromExtensions;
function getPathExtension(filePath) {
    return path.extname(filePath).slice(1).toLowerCase();
}
exports.getPathExtension = getPathExtension;
function replacePathExtension(filePath, toExtension) {
    return filePath.replace(/\.\w+$/, '.' + toExtension);
}
exports.replacePathExtension = replacePathExtension;
/** Will return the normalized full file path, not include folder paths. */
async function walkDirectoryToMatchFiles(folderPath, includeMatcher, excludeMatcher, ignoreFilesBy) {
    let filePaths = await ignoreWalk({
        path: folderPath,
        ignoreFiles: ignoreFilesBy,
        includeEmpty: false,
        follow: false,
    });
    let matchedFilePaths = new Set();
    for (let filePath of filePaths) {
        let absoluteFilePath = path.join(folderPath, filePath);
        if (includeMatcher.match(filePath) && (!excludeMatcher || !excludeMatcher.match(absoluteFilePath))) {
            matchedFilePaths.add(absoluteFilePath);
        }
    }
    return [...matchedFilePaths];
}
exports.walkDirectoryToMatchFiles = walkDirectoryToMatchFiles;
/** Resolve import path, will search `node_modules` directory to find final import path. */
async function resolveImportPath(fromPath, toPath) {
    let isModulePath = toPath.startsWith('~');
    let fromDir = path.dirname(fromPath);
    let fromPathExtension = getPathExtension(fromPath);
    // `~modulename/...`
    if (isModulePath) {
        while (fromDir) {
            let filePath = await fixPathExtension(path.resolve(fromDir, 'node_modules/' + toPath.slice(1)), fromPathExtension);
            if (filePath) {
                return filePath;
            }
            let dir = path.dirname(fromDir);
            if (dir === fromDir) {
                break;
            }
            fromDir = dir;
        }
        return null;
    }
    else {
        return await fixPathExtension(path.resolve(fromDir, toPath), fromPathExtension);
    }
}
exports.resolveImportPath = resolveImportPath;
/** Fix imported path with extension. */
async function fixPathExtension(filePath, fromPathExtension) {
    let extension = getPathExtension(filePath);
    if (extension && await fs.pathExists(filePath)) {
        return filePath;
    }
    if (fromPathExtension === 'scss') {
        // @import `b` -> `b.scss`
        if (path.extname(filePath) === '') {
            filePath += '.scss';
            if (await fs.pathExists(filePath)) {
                return filePath;
            }
        }
        // @import `b.scss` -> `_b.scss`
        if (path.basename(filePath)[0] !== '_') {
            filePath = path.join(path.dirname(filePath), '_' + path.basename(filePath));
            if (await fs.pathExists(filePath)) {
                return filePath;
            }
        }
    }
    // One issue here:
    //   If we rename `b.scss` to `_b.scss` in `node_modules`,
    //   we can't get file changing notification from VSCode,
    //   and we can't reload it from path because nothing changes in it.
    // So we may need to validate if imported paths exist after we got definition results,
    // although we still can't get new contents in `_b.scss`.
    return null;
}
//# sourceMappingURL=file.js.map