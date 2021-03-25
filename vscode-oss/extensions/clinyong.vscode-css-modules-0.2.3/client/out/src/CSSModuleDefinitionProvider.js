"use strict";
const vscode_1 = require("vscode");
const utils_1 = require("./utils");
const path = require("path");
const fs = require("fs");
function getWords(line, position) {
    const headText = line.slice(0, position.character);
    const startIndex = headText.search(/[a-zA-Z0-9\._]*$/);
    // not found or not clicking object field
    if (startIndex === -1 || headText.slice(startIndex).indexOf(".") === -1) {
        return "";
    }
    const match = /^([a-zA-Z0-9\._]*)/.exec(line.slice(startIndex));
    if (match === null) {
        return "";
    }
    return match[1];
}
function getPosition(filePath, className) {
    const content = fs.readFileSync(filePath, { encoding: "utf8" });
    const lines = content.split("\n");
    let line = -1;
    let character = -1;
    const keyWord = `.${className}`;
    for (let i = 0; i < lines.length; i++) {
        character = lines[i].indexOf(keyWord);
        if (character !== -1) {
            line = i;
            break;
        }
    }
    if (line === -1) {
        return null;
    }
    else {
        return new vscode_1.Position(line, character + 1);
    }
}
function isImportLine(line) {
    return /\s+(\S+)\s+=\s+require\(['"](.+\.\S{1,2}ss)['"]\)/.exec(line);
}
function isValidMatches(line, matches, current) {
    if (matches === null) {
        return false;
    }
    const start1 = line.indexOf(matches[1]) + 1;
    const start2 = line.indexOf(matches[2]) + 1;
    return (current > start2 && current < start2 + matches[2].length) || (current > start1 && current < start1 + matches[1].length);
}
class CSSModuleDefinitionProvider {
    provideDefinition(document, position, token) {
        const currentDir = path.dirname(document.uri.fsPath);
        const currentLine = utils_1.getCurrentLine(document, position);
        const matches = isImportLine(currentLine);
        if (isValidMatches(currentLine, matches, position.character)) {
            return Promise.resolve(new vscode_1.Location(vscode_1.Uri.file(path.resolve(currentDir, matches[2])), new vscode_1.Position(0, 0)));
        }
        const words = getWords(currentLine, position);
        if (words === "" || words.indexOf(".") === -1) {
            return Promise.resolve(null);
        }
        const [obj, field] = words.split(".");
        const importPath = utils_1.findImportPath(document.getText(), obj, currentDir);
        const targetPosition = getPosition(importPath, field);
        if (targetPosition === null) {
            return Promise.resolve(null);
        }
        else {
            return Promise.resolve(new vscode_1.Location(vscode_1.Uri.file(importPath), targetPosition));
        }
    }
}
exports.CSSModuleDefinitionProvider = CSSModuleDefinitionProvider;
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = CSSModuleDefinitionProvider;
//# sourceMappingURL=CSSModuleDefinitionProvider.js.map