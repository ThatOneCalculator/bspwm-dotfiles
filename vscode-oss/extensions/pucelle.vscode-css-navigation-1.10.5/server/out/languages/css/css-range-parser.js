"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CSSRangeParser = exports.NameType = void 0;
const vscode_languageserver_1 = require("vscode-languageserver");
const helpers_1 = require("../../helpers");
const css_service_1 = require("./css-service");
var NameType;
(function (NameType) {
    NameType[NameType["Selector"] = 0] = "Selector";
    NameType[NameType["Keyframes"] = 1] = "Keyframes";
    NameType[NameType["Import"] = 2] = "Import";
    NameType[NameType["AtRoot"] = 3] = "AtRoot";
    NameType[NameType["OtherCommand"] = 4] = "OtherCommand";
    NameType[NameType["Others"] = 5] = "Others";
})(NameType = exports.NameType || (exports.NameType = {}));
/** To parse css one css file to declarations. */
class CSSRangeParser {
    constructor(document) {
        this.supportedLanguages = ['css', 'less', 'scss'];
        this.stack = [];
        this.ignoreDeep = 0;
        /** When having `@import ...`, we need to load the imported files even they are inside `node_modules`. */
        this.importPaths = [];
        //here mixed language and file extension, must makesure all languages supported are sames as file extensions
        //may needs to be modified if more languages added
        let { languageId } = document;
        if (!this.supportedLanguages.includes(languageId)) {
            languageId = 'css';
            helpers_1.console.warn(`Language "${languageId}" is not a declared css language, using css language instead.`);
        }
        this.supportsNesting = css_service_1.CSSService.isLanguageSupportsNesting(languageId);
        this.document = document;
    }
    parse() {
        let text = this.document.getText();
        let ranges = [];
        let re = /\s*(?:\/\/.*|\/\*[\s\S]*?\*\/|((?:\(.*?\)|".*?"|'.*?'|\/\/.*|\/\*[\s\S]*?\*\/|[\s\S])*?)([;{}]))/g;
        /*
            \s* - match white spaces in left
            (?:
                \/\/.* - match comment line
                |
                \/\*[\s\S]*?\*\/ - match comment seagment
                |
                (?:
                    \(.*?\) - (...), sass code may include @include fn(${name})
                    ".*?" - double quote string
                    |
                    '.*?' - double quote string
                    |
                    [\s\S] - others
                )*? - declaration or selector
                ([;{}])
            )
        */
        let match;
        while (match = re.exec(text)) {
            let chars = match[1];
            let endChar = match[2];
            if (endChar === '{' && chars) {
                let startIndex = re.lastIndex - chars.length - 1;
                let selector = chars.trimRight().replace(/\s+/g, ' ');
                let names = this.parseToNames(selector);
                if (names.length === 0) {
                    continue;
                }
                if (this.ignoreDeep > 0 || names[0].type === NameType.Keyframes) {
                    this.ignoreDeep++;
                }
                this.current = this.newLeafRange(names, startIndex);
                ranges.push(this.current);
            }
            else if (endChar === '}') {
                if (this.ignoreDeep > 0) {
                    this.ignoreDeep--;
                }
                if (this.current) {
                    this.current.end = re.lastIndex;
                    this.current = this.stack.pop();
                }
            }
            // `@...` command in top level
            // parse `@import ...` to `this.importPaths`
            else if (chars && !this.current) {
                this.parseToNames(chars);
            }
        }
        if (this.current) {
            if (this.current.end === 0) {
                this.current.end = text.length;
            }
        }
        return {
            ranges: this.formatToNamedRanges(ranges),
            importPaths: this.importPaths
        };
    }
    /** Parse selector to name array. */
    parseToNames(selectors) {
        //may selectors like this: '[attr="]"]', but we are not high strictly parser
        //if want to handle it, use /((?:\[(?:"(?:\\"|.)*?"|'(?:\\'|.)*?'|[\s\S])*?\]|\((?:"(?:\\"|.)*?"|'(?:\\'|.)*?'|[\s\S])*?\)|[\s\S])+?)(?:,|$)/g
        selectors = this.removeComments(selectors);
        let match = selectors.match(/^@[\w-]+/);
        let names = [];
        if (match) {
            let command = match[0];
            let type = this.getCommandType(command);
            if (type === NameType.Import) {
                this.parseImportPaths(selectors);
            }
            //@at-root still follows selectors
            if (type === NameType.AtRoot) { //should only work on scss
                names.push({
                    raw: command,
                    full: command,
                    type
                });
                selectors = selectors.slice(command.length).trimLeft();
            }
            //other command take place whole line
            else {
                names.push({
                    raw: selectors,
                    full: selectors,
                    type
                });
                return names;
            }
        }
        let re = /((?:\[.*?\]|\(.*?\)|.)+?)(?:,|$)/gs;
        /*
            (?:
                \[.*?\] - match [...]
                |
                \(.*?\) - match (...)
                |
                . - match other characters
            )
            +?
            (?:,|$) - if match ',' or '$', end
        */
        while (match = re.exec(selectors)) {
            let name = match[1].trim();
            if (name) {
                names.push({
                    raw: name,
                    full: name,
                    type: this.ignoreDeep === 0 ? NameType.Selector : NameType.Others
                });
            }
        }
        return names;
    }
    /** Replace out comments. */
    removeComments(code) {
        return code.replace(/\/\/.*|\/\*[\s\S]*?\*\//g, '');
    }
    /** Get command type. */
    getCommandType(command) {
        switch (command) {
            case '@at-root':
                return NameType.AtRoot;
            case '@keyframes':
                return NameType.Keyframes;
            case '@import':
                return NameType.Import;
            default:
                return NameType.OtherCommand;
        }
    }
    /** Parse `@import ...` to paths. */
    parseImportPaths(selectors) {
        let match = selectors.match(/^@import\s+(['"])(.+?)\1/);
        if (match) {
            let isURL = /^https?:|^\/\//.test(match[2]);
            if (!isURL) {
                this.importPaths.push(match[2]);
            }
        }
    }
    /** Create range piece. */
    newLeafRange(names, start) {
        if (this.supportsNesting && this.ignoreDeep === 0 && this.current && this.haveSelectorInNames(names)) {
            names = this.combineNestingNames(names);
        }
        let parent = this.current;
        if (parent) {
            this.stack.push(parent);
        }
        return {
            names,
            start,
            end: 0,
            parent
        };
    }
    /** Check whether having selector in names. */
    haveSelectorInNames(names) {
        return names.length > 1 || names[0].type === NameType.Selector;
    }
    /** Combine nesting names into a name stack group. */
    combineNestingNames(oldNames) {
        let re = /(?<=^|[\s+>~])&/g; //has sass reference '&' if match
        let names = [];
        let parentFullNames = this.getClosestSelectorFullNames();
        let currentCommandType;
        for (let oldName of oldNames) {
            //copy non selector one
            if (oldName.type !== NameType.Selector) {
                names.push(oldName);
                currentCommandType = oldName.type;
            }
            //'a{&-b' -> 'a-b', not handle cross multiply when several '&' exist
            else if (parentFullNames && re.test(oldName.full)) {
                for (let parentFullName of parentFullNames) {
                    let full = oldName.full.replace(re, parentFullName);
                    names.push({ full, raw: oldName.raw, type: NameType.Selector });
                }
            }
            //'a{b}' -> 'a b', but not handle '@at-root a{b}'
            else if (currentCommandType !== NameType.AtRoot && parentFullNames) {
                for (let parentFullName of parentFullNames) {
                    let full = parentFullName + ' ' + oldName.full;
                    names.push({ full, raw: oldName.raw, type: NameType.Selector });
                }
            }
            else {
                names.push(oldName);
            }
        }
        return names;
    }
    /** Get names of closest parent selector. */
    getClosestSelectorFullNames() {
        let parent = this.current;
        while (parent) {
            if (this.haveSelectorInNames(parent.names)) {
                break;
            }
            parent = parent.parent;
        }
        if (!parent) {
            return null;
        }
        let fullNames = [];
        for (let name of parent.names) {
            if (name.type === NameType.Selector) {
                fullNames.push(name.full);
            }
        }
        return fullNames;
    }
    /** Leaves -> name ranges. */
    formatToNamedRanges(leafRanges) {
        let ranges = [];
        for (let { names, start, end } of leafRanges) {
            ranges.push({
                names: names.map(leafName => this.formatLeafNameToFullMainName(leafName)),
                //positionAt use a binary search algorithm, it should be fast enough, no need to count lines here, although faster
                range: vscode_languageserver_1.Range.create(this.document.positionAt(start), this.document.positionAt(end))
            });
        }
        return ranges;
    }
    /** Leaves -> names. */
    formatLeafNameToFullMainName({ raw, full, type }) {
        if (type !== NameType.Selector) {
            return {
                full,
                mains: null
            };
        }
        //if raw selector is like '&:...', ignore processing the main
        let shouldHaveMain = !this.hasSingleReferenceInRightMostDescendant(raw);
        if (!shouldHaveMain) {
            return {
                full,
                mains: null
            };
        }
        let mains = this.getMainSelectors(full);
        return {
            full,
            mains
        };
    }
    /** Checks whether having a reference tag `&` in right most part, returns `true` for '&:hover', 'a &:hover'. */
    hasSingleReferenceInRightMostDescendant(selector) {
        let rightMost = this.getRightMostDescendant(selector);
        return /^&(?:[^\w-]|$)/.test(rightMost);
    }
    /**
     * Returns the start of the right most descendant as the main part.
     * e.g., selectors below wull returns '.a'
     * 	.a[...]
     * 	.a:actived
     * 	.a::before
     * 	.a.b
     */
    getMainSelectors(selector) {
        let rightMost = this.getRightMostDescendant(selector);
        if (!rightMost) {
            return null;
        }
        let match = rightMost.match(/^\w[\w-]*/);
        if (match) {
            //if main is a tag selector, it must be the only
            if (match[0].length === selector.length) {
                return match;
            }
            rightMost = rightMost.slice(match[0].length);
        }
        //class and id selectors must followed each other
        let mains = [];
        while (match = rightMost.match(/^[#.]\w[\w-]*/)) {
            mains.push(match[0]);
            rightMost = rightMost.slice(match[0].length);
        }
        return mains.length > 0 ? mains : null;
    }
    /** Returns descendant combinator used to split ancestor and descendant: space > + ~. */
    getRightMostDescendant(selector) {
        // It's not a strict regexp, if want so, use /(?:\[(?:"(?:\\"|.)*?"|'(?:\\'|.)*?'|[^\]])*?+?\]|\((?:"(?:\\"|.)*?"|'(?:\\'|.)*?'|[^)])*?+?\)|[^\s>+~|])+?$/
        let descendantRE = /(?:\[[^\]]*?\]|\([^)]*?\)|[^\s+>~])+?$/;
        /*
            (?:
                \[[^\]]+?\] - [...]
                |
                \([^)]+?\) - (...)
                |
                [^\s>+~] - others which are not descendant combinator
            )+? - must have ?, or the greedy mode will cause unnecessary exponential fallback
            $
        */
        let match = selector.match(descendantRE);
        return match ? match[0] : '';
    }
}
exports.CSSRangeParser = CSSRangeParser;
//# sourceMappingURL=css-range-parser.js.map