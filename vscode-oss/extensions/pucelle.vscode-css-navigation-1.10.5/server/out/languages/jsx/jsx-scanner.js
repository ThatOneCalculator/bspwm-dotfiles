"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JSXScanner = void 0;
const simple_selector_1 = require("../common/simple-selector");
const text_scanner_1 = require("../common/text-scanner");
const path = require("path");
const vscode_uri_1 = require("vscode-uri");
const fs = require("fs-extra");
/**
 * JSXScanner scans things in a js, jsx, ts, tsx document.
 * It was used as a child service of HTMLScanner.
 */
class JSXScanner extends text_scanner_1.TextScanner {
    /** Scan a JSX / JS / TS / TSX document from a specified offset to find a CSS selector. */
    async scanSelector() {
        let inExpression = false;
        let attributeValue = this.readLeftWord();
        if (!attributeValue) {
            return null;
        }
        // `.xxx`
        if (this.peekLeftChar() === '.') {
            this.readLeftChar();
            this.skipLeftWhiteSpaces();
            let attributeName = this.readLeftWord();
            // For Flit syntax `:class.property=...`
            if (attributeName === 'class') {
                let raw = '.' + attributeValue;
                return simple_selector_1.SimpleSelector.create(raw);
            }
            // Module CSS, e.g. `className={style.className}`.
            else {
                return this.scanCSSModule(attributeValue);
            }
        }
        // Module CSS, e.g. `className={style['class-name']}`.
        if ((this.peekLeftChar() === '"' || this.peekLeftChar() === '\'') && this.peekLeftCharSkipWhiteSpaces(1) === '[') {
            this.readLeftUntil(['[']);
            return this.scanCSSModule(attributeValue);
        }
        this.readLeftUntil(['<', '\'', '"', '`', '{']);
        // Compare with `html-scanner`, here should ignore `<tagName>`.
        if (this.peekRightChar(1) === '<') {
            return null;
        }
        // Skip expression left boundary `{`.
        this.skipLeftWhiteSpaces();
        if (this.peekLeftChar() !== '=') {
            // Assume it's in `className={...[HERE]...}` or `class="..."`
            this.readLeftUntil(['<', '{', '}']);
            if (this.peekRightChar(1) !== '{') {
                return null;
            }
            // Flit syntax `:class=${{property: boolean}}`.
            if (this.peekLeftCharSkipWhiteSpaces() === '{' && this.peekLeftCharSkipWhiteSpaces(1) === '$') {
                this.readLeftUntil(['$']);
            }
            inExpression = true;
        }
        // Read `=`.
        this.skipLeftWhiteSpaces();
        if (this.readLeftChar() !== '=') {
            return null;
        }
        this.skipLeftWhiteSpaces();
        let attributeName = this.readLeftWord();
        if (attributeName === 'className' || attributeName === 'class' || attributeName === 'id' && !inExpression) {
            let raw = (attributeName === 'id' ? '#' : '.') + attributeValue;
            return simple_selector_1.SimpleSelector.create(raw);
        }
        return null;
    }
    /** Scan imported CSS module. */
    async scanCSSModule(attributeValue) {
        let moduleVariable = this.readLeftWord();
        if (!moduleVariable) {
            return null;
        }
        this.readLeftUntil(['{']);
        this.skipLeftWhiteSpaces();
        if (this.readLeftChar() !== '=') {
            return null;
        }
        // Must be `className={style.className}`, or it will popup frequently even type `a.b`.
        this.skipLeftWhiteSpaces();
        let className = this.readLeftWord();
        if (className !== 'class' && className !== 'className') {
            return null;
        }
        let modulePath = this.parseImportedPathFromVariableName(moduleVariable);
        if (modulePath) {
            let fullPath = path.resolve(path.dirname(vscode_uri_1.URI.parse(this.document.uri).fsPath), modulePath);
            if (await fs.pathExists(fullPath)) {
                return simple_selector_1.SimpleSelector.create('.' + attributeValue, vscode_uri_1.URI.file(fullPath).toString());
            }
        }
        return simple_selector_1.SimpleSelector.create('.' + attributeValue);
    }
    /** Parse `import ...`. */
    parseImportedPathFromVariableName(nameToMatch) {
        let re = /import\s+(\w+)\s+from\s+['"`](.+?)['"`]/g;
        let match;
        while (match = re.exec(this.text)) {
            let name = match[1];
            if (name === nameToMatch) {
                return match[2];
            }
        }
        return null;
    }
    /** Scan for relative import path. */
    scanForImportPath() {
        this.peekLeftChar;
        // import * from '...'
        // import abc from '...'
        // import '...'
        let re = /import\s+(?:(?:\w+|\*)\s+from\s+)?['"`](.+?)['"`]/g;
        let match;
        re.lastIndex = this.offset - 1024;
        while (match = re.exec(this.text)) {
            // |'...'|, `|` marks location of start index and end index.
            let endIndex = re.lastIndex;
            let startIndex = re.lastIndex - match[1].length - 2;
            if (startIndex <= this.offset && endIndex > this.offset) {
                return match[1];
            }
        }
        return null;
    }
}
exports.JSXScanner = JSXScanner;
//# sourceMappingURL=jsx-scanner.js.map