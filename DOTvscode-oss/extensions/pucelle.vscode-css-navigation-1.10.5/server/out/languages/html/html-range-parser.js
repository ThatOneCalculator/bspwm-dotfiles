"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HTMLRangeParser = void 0;
const vscode_languageserver_1 = require("vscode-languageserver");
const simple_selector_1 = require("../common/simple-selector");
class HTMLRangeParser {
    constructor(document) {
        this.document = document;
    }
    /** Parse HTML document to ranges. */
    parse() {
        let text = this.document.getText();
        let ranges = [];
        let re = /(?:<!--.*?-->|<\w+(.*?)>)/gs;
        /*
            \s* - match white spaces in left
            (?:
                <!--.*?--> - match html comment
                |
                <\w+(.+?)> - match tag, $1 is the arrtibutes
            )
        */
        let match;
        while (match = re.exec(text)) {
            let attribute = match[1];
            if (!attribute) {
                continue;
            }
            let startIndex = match.index;
            let endIndex = re.lastIndex;
            ranges.push(...this.getRangesFromAttribute(attribute, startIndex, endIndex));
        }
        return ranges;
    }
    /** Parse CSS range for HTML tag attribute. */
    getRangesFromAttribute(attribute, start, end) {
        let re = /\b(class|id)\s*=\s*(?:"(.*?)"|'(.*?)')/g;
        let match;
        let ranges = [];
        while (match = re.exec(attribute)) {
            let attr = match[1].trim();
            let value = match[2] || match[3];
            if (!value) {
                continue;
            }
            if (attr === 'class') {
                for (let name of value.split(/\s+/)) {
                    name = '.' + name;
                    if (simple_selector_1.SimpleSelector.validate(name)) {
                        ranges.push({
                            name,
                            range: vscode_languageserver_1.Range.create(this.document.positionAt(start), this.document.positionAt(end))
                        });
                    }
                }
            }
            else {
                let name = '#' + value;
                if (simple_selector_1.SimpleSelector.validate(name)) {
                    ranges.push({
                        name,
                        range: vscode_languageserver_1.Range.create(this.document.positionAt(start), this.document.positionAt(end))
                    });
                }
            }
        }
        return ranges;
    }
}
exports.HTMLRangeParser = HTMLRangeParser;
//# sourceMappingURL=html-range-parser.js.map