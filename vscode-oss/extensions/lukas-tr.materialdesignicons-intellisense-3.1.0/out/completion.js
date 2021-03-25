"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CompletionProvider = exports.triggerCharacters = void 0;
const vscode = require("vscode");
const util_1 = require("./util");
const configuration_1 = require("./configuration");
exports.triggerCharacters = [":", "-", "i", "'", '"', "."];
class CompletionProvider {
    provideCompletionItems(document, position) {
        return __awaiter(this, void 0, void 0, function* () {
            let linePrefix = document
                .lineAt(position)
                .text.substr(0, position.character);
            for (const matcher of configuration_1.config.matchers) {
                const regex = util_1.matcherStringToRegex(matcher.match);
                if (!regex)
                    continue;
                const match = linePrefix.match(regex.suggestionPrefixAndIconRegex);
                if (!match || !match.groups) {
                    continue;
                }
                const meta = yield util_1.getMdiMetaData();
                const range = new vscode.Range(position.line, position.character - match.groups.icon.length, position.line, position.character);
                const edits = [];
                if (matcher.insertPrefix) {
                    edits.push(vscode.TextEdit.insert(position.translate(0, -match.length - 1), matcher.insertPrefix));
                }
                return {
                    incomplete: true,
                    items: meta.reduce((prev, cur) => prev.concat([cur.name, ...(configuration_1.config.includeAliases ? cur.aliases : [])].map((name) => ({
                        label: util_1.createCompletion(name, regex.type),
                        kind: vscode.CompletionItemKind.Text,
                        sortText: name,
                        meta: cur,
                        range,
                        insertText: `${util_1.createCompletion(cur.name, regex.type)}${matcher.insertSuffix || ""}`,
                        additionalTextEdits: edits,
                    }))), []),
                };
            }
            return [];
        });
    }
    resolveCompletionItem(item) {
        return util_1.getIconData(item.meta).then((data) => {
            return Object.assign(Object.assign({}, item), { documentation: data.icon.appendMarkdown(`
- link: ${data.link.value}
- aliases: ${data.aliases}
- codepoint: ${data.codepoint}
- author: ${data.author}
- version: ${data.version}`), detail: data.tags });
        });
    }
}
exports.CompletionProvider = CompletionProvider;
//# sourceMappingURL=completion.js.map