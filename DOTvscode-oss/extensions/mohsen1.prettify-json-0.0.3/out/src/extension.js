var vscode_1 = require('vscode');
var LINE_SEPERATOR = /\n|\r\n/;
// TODO: make this configurable.
var JSON_SPACE = 4;
function activate(context) {
    var disposable = vscode_1.commands.registerCommand('extension.prettifyJSON', function () {
        var editor = vscode_1.window.activeTextEditor;
        if (!editor) {
            return;
        }
        var raw = editor.document.getText();
        var json = null;
        try {
            json = JSON.parse(raw);
        }
        catch (jsonParseError) {
            return; // TODO: Handle invalid JSON
        }
        var pretty = JSON.stringify(json, null, JSON_SPACE);
        editor.edit(function (builder) {
            var start = new vscode_1.Position(0, 0);
            var lines = raw.split(LINE_SEPERATOR);
            var end = new vscode_1.Position(lines.length, lines[lines.length - 1].length);
            var allRange = new vscode_1.Range(start, end);
            builder.replace(allRange, pretty);
        }).then(function (success) {
            // TODO: unselect the text
        });
    });
    context.subscriptions.push(disposable);
}
exports.activate = activate;
//# sourceMappingURL=extension.js.map