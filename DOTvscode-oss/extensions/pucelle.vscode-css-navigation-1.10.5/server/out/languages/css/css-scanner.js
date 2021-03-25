"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CSSScanner = void 0;
const simple_selector_1 = require("../common/simple-selector");
const text_scanner_1 = require("../common/text-scanner");
const css_service_1 = require("./css-service");
const css_range_parser_1 = require("./css-range-parser");
const utils_1 = require("../../helpers/utils");
class CSSScanner extends text_scanner_1.TextScanner {
    constructor(document, offset) {
        super(document, offset);
        this.supportsNesting = css_service_1.CSSService.isLanguageSupportsNesting(document.languageId);
        this.startOffset = offset;
    }
    /** Scan CSS selector for a CSS document from specified offset. */
    scanForSelector() {
        //when mouse in '|&-a', check if the next char is &
        let nextChar = this.peekLeftChar(-1);
        if (nextChar === '#' || nextChar === '.' || this.supportsNesting && nextChar === '&') {
            this.moveRight();
        }
        let word = this.readLeftWord();
        if (!word) {
            return null;
        }
        let char = this.readLeftChar();
        if (char === '.' || char === '#') {
            let selector = simple_selector_1.SimpleSelector.create(char + word);
            return selector ? [selector] : null;
        }
        if (this.supportsNesting && char === '&') {
            return this.parseAndGetSelectors(word);
        }
        return null;
    }
    /** Parse whole ranges for document and get selector. */
    parseAndGetSelectors(word) {
        let { ranges } = new css_range_parser_1.CSSRangeParser(this.document).parse();
        let currentRange;
        let selectorIncludedParentRange;
        // Binary searching should be a little better, but not help much
        for (let i = 0; i < ranges.length; i++) {
            let range = ranges[i];
            let start = this.document.offsetAt(range.range.start);
            let end = this.document.offsetAt(range.range.end);
            // Is a ancestor and has selector
            if (this.startOffset >= start && this.startOffset < end) {
                if (currentRange && this.isRangeHaveSelector(currentRange)) {
                    selectorIncludedParentRange = currentRange;
                }
                currentRange = range;
            }
            if (this.startOffset < start) {
                break;
            }
        }
        if (!selectorIncludedParentRange) {
            return null;
        }
        let selectors = [];
        for (let { full } of selectorIncludedParentRange.names) {
            if (full[0] === '.' || full[0] === '#') {
                let selector = simple_selector_1.SimpleSelector.create(full + word);
                if (selector) {
                    selectors.push(selector);
                }
            }
        }
        return selectors;
    }
    /** Checks whether range having a selector. */
    isRangeHaveSelector(range) {
        return range.names.some(({ mains }) => mains !== null);
    }
    /** Scan for relative import path. */
    scanForImportPath() {
        this.readLeftUntil([';']);
        this.moveRight();
        let code = this.readRightUntil([';']);
        let re = /@import\s*['"](.*?)['"]/;
        return utils_1.firstMatch(code, re);
    }
}
exports.CSSScanner = CSSScanner;
//# sourceMappingURL=css-scanner.js.map