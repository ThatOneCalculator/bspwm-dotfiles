"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HTMLScanner = void 0;
const utils_1 = require("../../helpers/utils");
const simple_selector_1 = require("../common/simple-selector");
const text_scanner_1 = require("../common/text-scanner");
/*
in fact there is an easier way to do so, only about 20 lines of codes, but should be a little slower:
    1. get 1024 bytes in left.
    2. match /.*(?:(?:class\s*=\s*")(?<class>[\s\w-]*)|(?:id\s*=\s*")(?<id>[\w-]*)|<(?<tag>[\w-]+))$/s.
        .* - match any character in s flag, greedy mode, eat up all characters
        (?:
            (?:class\s*=\s*") - match class
            (?
                <class>
                [\s\w-]* - match multiple class name, can't use [\s\w-]*?[\w-]* to match, its already in greedy mode since above, another greedy expression will not work, here [\w-]* will match nothing
            )
            |
            (?:id\s*=\s*")(?<id>[\w-]*) - match id
            |
            <(?<tag>[\w-]+) - match tag
        )
        $
    3. for class, select /([\w-]+)$/.
    4. read word in right, or slice 128 bytes in right, and match /^([\w-]+)/.
    5. join left and right part.
*/
class HTMLScanner extends text_scanner_1.TextScanner {
    /** Scan a HTML document from a specified offset to find a CSS selector. */
    scanForSelector() {
        let word = this.readLeftWord();
        if (!word) {
            return null;
        }
        let char = this.peekLeftChar();
        if (char === '<') {
            return simple_selector_1.SimpleSelector.create(word);
        }
        this.readLeftUntil(['<', '\'', '"']);
        if (this.peekRightChar(1) === '<') {
            return null;
        }
        /*
        may be in left:
            class="a
            id="a'
            class="a b
            class="a" b
        have a very low possibility to meet '<tag a="class=" b', ignore it.
        the good part is it can get selectors in any place, no matter the code format.
        */
        if (this.peekLeftChar() === '\\') {
            this.moveLeft();
        }
        this.skipLeftWhiteSpaces();
        if (this.readLeftChar() !== '=') {
            return null;
        }
        this.skipLeftWhiteSpaces();
        let attribute = this.readLeftWord().toLowerCase();
        if (attribute === 'class' || attribute === 'id') {
            let raw = (attribute === 'class' ? '.' : '#') + word;
            return simple_selector_1.SimpleSelector.create(raw);
        }
        return null;
    }
    /** Scan for relative import path. */
    scanForImportPath() {
        this.readLeftUntil(['<', '>']);
        if (this.peekRightChar(1) !== '<') {
            return null;
        }
        this.moveRight();
        let code = this.readRightUntil(['>']);
        let tag = utils_1.firstMatch(code, /^<(\w+)/);
        let linkRE = /<link[^>]+rel\s*=\s*['"]stylesheet['"]/;
        let hrefRE = /\bhref\s*=['"](.*?)['"]/;
        let styleRE = /<style[^>]+src\s*=['"](.*?)['"]/;
        if (tag === 'link' && linkRE.test(code)) {
            return utils_1.firstMatch(code, hrefRE);
        }
        if (tag === 'style') {
            return utils_1.firstMatch(code, styleRE);
        }
        return null;
    }
}
exports.HTMLScanner = HTMLScanner;
//# sourceMappingURL=html-scanner.js.map