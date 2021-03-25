"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JSXScanner = void 0;
const simple_selector_1 = require("../common/simple-selector");
const text_scanner_1 = require("../common/text-scanner");
const path = require("path");
const vscode_uri_1 = require("vscode-uri");
const fs = require("fs-extra");
class JSXScanner extends text_scanner_1.TextScanner {
    /** Scan a JSX document from a specified offset to find a CSS selector. */
    async scanSelector() {
        let inExpression = false;
        let attributeValue = this.readLeftWord();
        if (!attributeValue) {
            return null;
        }
        // `.xxx`
        if (this.peekLeft() === '.') {
            this.readLeft();
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
        if ((this.peekLeft() === '"' || this.peekLeft() === '\'') && this.peekLeftSkipWhiteSpaces(1) === '[') {
            this.readLeftUntil(['[']);
            return this.scanCSSModule(attributeValue);
        }
        this.readLeftUntil(['<', '\'', '"', '`', '{']);
        // Compare with `html-scanner`, here should ignore `<tagName>`.
        if (this.peekRight(1) === '<') {
            return null;
        }
        // Skip expression left boundary `{`.
        this.skipLeftWhiteSpaces();
        if (this.peekLeft() !== '=') {
            // Assume it's in `className={...[HERE]...}` or `class="..."`
            this.readLeftUntil(['<', '{', '}']);
            if (this.peekRight(1) !== '{') {
                return null;
            }
            // Flit syntax `:class=${{property: boolean}}`.
            if (this.peekLeftSkipWhiteSpaces() === '{' && this.peekLeftSkipWhiteSpaces(1) === '$') {
                this.readLeftUntil(['$']);
            }
            inExpression = true;
        }
        // Read `=`.
        this.skipLeftWhiteSpaces();
        if (this.readLeft() !== '=') {
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
        if (this.readLeft() !== '=') {
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
        let re = /import\s+(\w+)\s+from\s+(['"])(.+?)\2/g;
        let match;
        while (match = re.exec(this.text)) {
            let name = match[1];
            if (name === nameToMatch) {
                return match[3];
            }
        }
        return null;
    }
}
exports.JSXScanner = JSXScanner;
//# sourceMappingURL=jsx-scanner.js.map