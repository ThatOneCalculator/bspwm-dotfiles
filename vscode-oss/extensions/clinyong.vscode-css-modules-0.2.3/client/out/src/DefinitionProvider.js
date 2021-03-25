"use strict";
const vscode_1 = require("vscode");
const utils_1 = require("./utils");
const path = require("path");
const fs = require("fs");
const _ = require("lodash");
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
function getTransformer(camelCaseConfig) {
    switch (camelCaseConfig) {
        case true:
            return _.camelCase;
        case "dashes":
            return utils_1.dashesCamelCase;
        default: return null;
    }
}
function getPosition(filePath, className, camelCaseConfig) {
    const content = fs.readFileSync(filePath, { encoding: "utf8" });
    const lines = content.split("\n");
    let lineNumber = -1;
    let character = -1;
    let keyWord = className;
    const classTransformer = getTransformer(camelCaseConfig);
    if (camelCaseConfig !== true) {
        keyWord = `.${className}`;
    }
    for (let i = 0; i < lines.length; i++) {
        const originalLine = lines[i];
        /**
         * The only way to guarantee that a position will be returned for a camelized class
         * is to check after camelizing the source line.
         * Doing the opposite -- uncamelizing the used classname -- would not always give
         * correct result, as camelization is lossy.
         * i.e. `.button--disabled`, `.button-disabled` both give same
         * final class: `css.buttonDisabled`, and going back from this to that is not possble.
         *
         * But this has a drawback - camelization of a line may change the final
         * positions of classes. But as of now, I don't see a better way, and getting this
         * working is more important, also putting this functionality out there would help
         * get more eyeballs and hopefully a better way.
         */
        const line = !classTransformer ? originalLine : classTransformer(originalLine);
        character = line.indexOf(keyWord);
        if (character === -1 && !!classTransformer) {
            // if camelized match fails, and transformer is there
            // try matching the un-camelized classnames too!
            character = originalLine.indexOf(keyWord);
        }
        if (character !== -1) {
            lineNumber = i;
            break;
        }
    }
    if (lineNumber === -1) {
        return null;
    }
    else {
        return new vscode_1.Position(lineNumber, character + 1);
    }
}
function isImportLineMatch(line, matches, current) {
    if (matches === null) {
        return false;
    }
    const start1 = line.indexOf(matches[1]) + 1;
    const start2 = line.indexOf(matches[2]) + 1;
    // check current character is between match words
    return (current > start2 && current < start2 + matches[2].length) || (current > start1 && current < start1 + matches[1].length);
}
class CSSModuleDefinitionProvider {
    constructor(camelCaseConfig) {
        this._camelCaseConfig = false;
        this._camelCaseConfig = camelCaseConfig;
    }
    provideDefinition(document, position, token) {
        const currentDir = path.dirname(document.uri.fsPath);
        const currentLine = utils_1.getCurrentLine(document, position);
        const matches = utils_1.genImportRegExp("(\\S+)").exec(currentLine);
        if (isImportLineMatch(currentLine, matches, position.character)) {
            return Promise.resolve(new vscode_1.Location(vscode_1.Uri.file(path.resolve(currentDir, matches[2])), new vscode_1.Position(0, 0)));
        }
        const words = getWords(currentLine, position);
        if (words === "" || words.indexOf(".") === -1) {
            return Promise.resolve(null);
        }
        const [obj, field] = words.split(".");
        const importPath = utils_1.findImportPath(document.getText(), obj, currentDir);
        if (importPath === "") {
            return Promise.resolve(null);
        }
        const targetPosition = getPosition(importPath, field, this._camelCaseConfig);
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
//# sourceMappingURL=DefinitionProvider.js.map