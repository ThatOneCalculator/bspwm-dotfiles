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
exports.IconLint = void 0;
const vscode = require("vscode");
const util_1 = require("./util");
const configuration_1 = require("./configuration");
class IconLint {
    constructor() {
        this.lintDocument = this.lintDocument.bind(this);
        this.diagnosticCollection = vscode.languages.createDiagnosticCollection();
    }
    dispose() {
        if (this.diagnosticCollection) {
            this.diagnosticCollection.dispose();
        }
    }
    deleteDiagnostics(document) {
        if (this.diagnosticCollection) {
            this.diagnosticCollection.delete(document.uri);
        }
    }
    lintDocument(document) {
        return __awaiter(this, void 0, void 0, function* () {
            if (configuration_1.config.selector.indexOf(document.languageId) === -1) {
                return;
            }
            const diagnostics = [];
            let match = null;
            const meta = yield util_1.getMdiMetaData();
            for (let i = 0; i < document.lineCount; i++) {
                const line = document.lineAt(i);
                while ((match = IconLint.lintIconRegex.exec(line.text))) {
                    const index = match.index;
                    const length = match[0].length;
                    const iconName = match[2];
                    if (configuration_1.config.ignoredIcons.includes(match[0])) {
                        continue;
                    }
                    if (this.iconExists(meta, iconName)) {
                        continue;
                    }
                    const range = new vscode.Range(line.lineNumber, index, line.lineNumber, index + length);
                    const diagnostic = new vscode.Diagnostic(range, `MDI: Icon mdi-${iconName} not found`, vscode.DiagnosticSeverity.Information);
                    diagnostic.code = configuration_1.config.searchCodeActionCode;
                    diagnostics.push(diagnostic);
                }
            }
            if (this.diagnosticCollection) {
                this.diagnosticCollection.set(document.uri, diagnostics);
            }
        });
    }
    iconExists(meta, iconName) {
        for (const item of meta) {
            if (iconName === item.name) {
                return true;
            }
        }
        return false;
    }
    provideCodeActions(document, range, context, token) {
        const diagnostics = context.diagnostics;
        return diagnostics
            .filter(d => d.code === configuration_1.config.searchCodeActionCode)
            .map((d) => {
            const match = IconLint.lintIconRegex.exec(d.message);
            const iconName = (match && match[2]) || "";
            return {
                title: "Search icon",
                command: "materialdesigniconsIntellisense.performIconSearch",
                arguments: [iconName]
            };
        });
    }
}
exports.IconLint = IconLint;
IconLint.lintIconRegex = /\bmdi(-|:)((\w|\-)+)\b/gi;
//# sourceMappingURL=lint.js.map