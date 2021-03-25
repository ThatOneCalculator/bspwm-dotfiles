"use strict";
const assert = require("assert");
const vscode = require("vscode");
const path = require("path");
const DefinitionProvider_1 = require("../src/DefinitionProvider");
const rootPath = path.join(__dirname, "../..");
const tsxFile = path.join(rootPath, "./test/fixtures/sample.jsx");
const uri = vscode.Uri.file(tsxFile);
test("testing definition", () => {
    return Promise.resolve(vscode.workspace.openTextDocument(uri).then(text => {
        const provider = new DefinitionProvider_1.CSSModuleDefinitionProvider;
        const position = new vscode.Position(1, 20);
        return provider.provideDefinition(text, position, undefined).then(location => {
            const { line, character } = location.range.start;
            assert.equal(true, line === 2 && character === 1);
        });
    })).catch(err => {
        assert.ok(false, `error in OpenTextDocument ${err}`);
    });
});
//# sourceMappingURL=DefinitionProvider.js.map