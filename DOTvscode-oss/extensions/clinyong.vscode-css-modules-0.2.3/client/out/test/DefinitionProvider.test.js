"use strict";
const assert = require("assert");
const vscode = require("vscode");
const path = require("path");
const DefinitionProvider_1 = require("../src/DefinitionProvider");
const rootPath = path.join(__dirname, "../..");
const tsxFile = path.join(rootPath, "./test/fixtures/sample.jsx");
const uri = vscode.Uri.file(tsxFile);
function testDefinition(position) {
    return vscode.workspace.openTextDocument(uri).then(text => {
        const provider = new DefinitionProvider_1.CSSModuleDefinitionProvider;
        return provider.provideDefinition(text, position, undefined).then(location => {
            const { line, character } = location.range.start;
            assert.equal(true, line === 2 && character === 1);
        });
    });
}
function testDefinitionWithCase(position, camelCaseConfig, assertions) {
    return vscode.workspace.openTextDocument(uri).then(text => {
        const provider = new DefinitionProvider_1.CSSModuleDefinitionProvider(camelCaseConfig);
        return provider.provideDefinition(text, position, undefined).then(location => {
            const position = location ? location.range.start : null;
            assertions.map((assertion) => assertion(position));
        });
    });
}
test("testing es6 style definition", () => {
    const position = new vscode.Position(3, 21);
    return Promise.resolve(testDefinition(position)).catch(err => assert.ok(false, `error in OpenTextDocument ${err}`));
});
test("testing commonJS style definition", () => {
    const position = new vscode.Position(4, 21);
    return Promise.resolve(testDefinition(position)).catch(err => assert.ok(false, `error in OpenTextDocument ${err}`));
});
test("test camelCase:false style definition", () => {
    const position = new vscode.Position(6, 21);
    return Promise.resolve(testDefinitionWithCase(position, false, [
        (position) => assert.equal(true, position === null),
    ])).catch(err => assert.ok(false, `error in OpenTextDocument ${err}`));
});
test("test camelCase:true style completion", () => {
    const position = new vscode.Position(6, 21);
    return Promise.resolve(testDefinitionWithCase(position, true, [
        (position) => assert.equal(true, position.line === 4 && position.character === 1),
    ])).catch(err => assert.ok(false, `error in OpenTextDocument ${err}`));
});
test("test camelCase:dashes style completion", () => {
    const position = new vscode.Position(7, 21);
    return Promise.resolve(testDefinitionWithCase(position, "dashes", [
        (position) => assert.equal(true, position.line === 4 && position.character === 1),
    ])).catch(err => assert.ok(false, `error in OpenTextDocument ${err}`));
});
//# sourceMappingURL=DefinitionProvider.test.js.map