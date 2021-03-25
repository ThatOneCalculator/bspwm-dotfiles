"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode_html_languageservice_1 = require("vscode-html-languageservice");
const logger_1 = require("./../logger");
/**
 * Find the selector given the document and the current cursor position.
 * This is found by iterating forwards and backwards from the position to find a valid CSS class/id
 *
 * @param {vscode.TextDocument} document - The Document to check
 * @param {vscode.Position} position - The current cursor position
 * @returns {{attribute: string, value: string}} The valid CSS selector
 *
 * @memberOf PeekFileDefinitionProvider
 */
function findSelector(document, position, settings) {
    const text = document.getText();
    const offset = document.offsetAt(position);
    let start = offset;
    let end = offset;
    // expand selection to this word specifically
    while (start > 0 &&
        text.charAt(start - 1) !== " " &&
        text.charAt(start - 1) !== "'" &&
        text.charAt(start - 1) !== '"' &&
        text.charAt(start - 1) !== "\n" &&
        text.charAt(start - 1) !== "/" &&
        text.charAt(start - 1) !== "<")
        start -= 1;
    while (end < text.length &&
        text.charAt(end) !== " " &&
        text.charAt(end) !== "'" &&
        text.charAt(end) !== '"' &&
        text.charAt(end) !== "\n" &&
        text.charAt(end) !== ">")
        end += 1;
    const selectorWord = text.slice(start, end);
    let selector = null;
    const htmlScanner = vscode_html_languageservice_1.getLanguageService().createScanner(text);
    let attribute = null;
    logger_1.console.log(`${selectorWord} ${start}`);
    let tokenType = htmlScanner.scan();
    while (tokenType !== vscode_html_languageservice_1.TokenType.EOS) {
        switch (tokenType) {
            case vscode_html_languageservice_1.TokenType.StartTag:
            case vscode_html_languageservice_1.TokenType.EndTag:
                attribute = null;
                if (!settings.supportTags) {
                    break;
                }
                // FOR DEBUGGING
                logger_1.console.log(`  ${htmlScanner.getTokenText()} ${htmlScanner.getTokenOffset()} ${htmlScanner.getTokenEnd()}`);
                const tokenOffset = htmlScanner.getTokenOffset();
                if ([
                    "javascript",
                    "typescript",
                    "javascriptreact",
                    "typescriptreact",
                ].includes(document.languageId)) {
                    if (selectorWord[0].toUpperCase() === selectorWord[0]) {
                        // if the first letter is uppercase, this is a JSX component
                        break;
                    }
                }
                if (start === tokenOffset)
                    selector = { attribute: null, value: selectorWord };
                break;
            case vscode_html_languageservice_1.TokenType.AttributeName:
                attribute = htmlScanner.getTokenText().toLowerCase();
                // Convert the attribute to a standard class attribute
                if (attribute === "classname") {
                    attribute = "class";
                }
                break;
            case vscode_html_languageservice_1.TokenType.AttributeValue:
                // FOR DEBUGGING
                // console.log(
                //   `${htmlScanner.getTokenText()} ${htmlScanner.getTokenOffset()} ${htmlScanner.getTokenEnd()}`
                // );
                if (attribute === "class" || attribute === "id") {
                    const values = htmlScanner.getTokenText().slice(1, -1).split(" ");
                    // calculate startOffsets for each class/id in this attribute
                    // +1 because we sliced earlier, so the first offset is the offset + 1
                    let startOffset = htmlScanner.getTokenOffset() + 1;
                    const offsets = values.map((v) => {
                        const o = startOffset;
                        startOffset += v.length + 1; // add 1 for the space
                        return o;
                    });
                    values.forEach((value, i) => {
                        const startOffset = offsets[i];
                        // FOR DEBUGGING
                        // console.log(`  ${value} ${startOffset}`);
                        if (start === startOffset) {
                            selector = { attribute, value };
                        }
                    });
                }
                break;
        }
        if (selector) {
            break;
        }
        tokenType = htmlScanner.scan();
    }
    if (selector) {
        logger_1.console.log(`${selector.value} is a "${selector.attribute || "html tag"}"`);
    }
    else {
        logger_1.console.log("Invalid Selector");
    }
    return selector;
}
exports.default = findSelector;
//# sourceMappingURL=findSelector.js.map