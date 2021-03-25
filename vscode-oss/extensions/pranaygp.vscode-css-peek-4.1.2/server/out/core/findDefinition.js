"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.findDefinition = exports.findSymbols = exports.getLanguageService = exports.isLanguageServiceSupported = void 0;
const path = require("path");
const vscode_css_languageservice_1 = require("vscode-css-languageservice");
const logger_1 = require("./../logger");
const languageServices = {
    css: vscode_css_languageservice_1.getCSSLanguageService(),
    scss: vscode_css_languageservice_1.getSCSSLanguageService(),
    less: vscode_css_languageservice_1.getLESSLanguageService(),
};
function isLanguageServiceSupported(serviceId) {
    return !!languageServices[serviceId];
}
exports.isLanguageServiceSupported = isLanguageServiceSupported;
function getLanguageService(document) {
    let service = languageServices[document.languageId];
    if (!service) {
        logger_1.console.log("Document type is " + document.languageId + ", using css instead.");
        service = languageServices["css"];
    }
    return service;
}
exports.getLanguageService = getLanguageService;
function getSelection(selector) {
    switch (selector.attribute) {
        case "id":
            return "#" + selector.value;
        case "class":
            return "." + selector.value;
        default:
            return selector.value;
    }
}
function resolveSymbolName(symbols, i) {
    const name = symbols[i].name;
    if (name.startsWith("&")) {
        return resolveSymbolName(symbols, i - 1) + name.slice(1);
    }
    return name;
}
function findSymbols(selector, stylesheetMap) {
    const foundSymbols = [];
    // Construct RegExp of selector to test against the symbols
    let selection = getSelection(selector);
    const classOrIdSelector = selector.attribute === "class" || selector.attribute === "id";
    if (selection[0] === ".") {
        selection = "\\" + selection;
    }
    if (!classOrIdSelector) {
        // Tag selectors must have nothing, whitespace, or a combinator before it.
        selection = "(^|[\\s>+~])" + selection;
    }
    const re = new RegExp(selection + "(\\[[^\\]]*\\]|:{1,2}[\\w-()]+|\\.[\\w-]+|#[\\w-]+)*\\s*$", classOrIdSelector ? "" : "i");
    // Test all the symbols against the RegExp
    Object.keys(stylesheetMap).forEach((uri) => {
        const { symbols } = stylesheetMap[uri];
        try {
            logger_1.console.log(`${path.basename(uri)} has ${symbols.length} symbols`);
            symbols.forEach((symbol, i) => {
                let name = resolveSymbolName(symbols, i);
                logger_1.console.log(`  ${symbol.location.range.start.line}:${symbol.location.range.start.character} ${symbol.deprecated ? "[deprecated] " : " "}${symbol.containerName ? `[container:${symbol.containerName}] ` : " "} [${symbol.kind}] ${name}`);
                if (name.search(re) !== -1) {
                    foundSymbols.push(symbol);
                }
                else if (!classOrIdSelector) {
                    // Special case for tag selectors - match "*" as the rightmost character
                    if (/\*\s*$/.test(name)) {
                        foundSymbols.push(symbol);
                    }
                }
            });
        }
        catch (e) {
            logger_1.console.log(e.stack);
        }
    });
    return foundSymbols;
}
exports.findSymbols = findSymbols;
function findDefinition(selector, stylesheetMap) {
    return findSymbols(selector, stylesheetMap).map(({ location }) => location);
}
exports.findDefinition = findDefinition;
//# sourceMappingURL=findDefinition.js.map