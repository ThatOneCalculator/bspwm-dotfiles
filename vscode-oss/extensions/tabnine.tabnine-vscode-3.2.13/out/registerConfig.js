"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode_1 = require("vscode");
const path = require("path");
const consts_1 = require("./consts");
function registerConfig(config) {
    var _a;
    const panel = vscode_1.window.createWebviewPanel("tabnine.settings", "Tabnine Hub", { viewColumn: vscode_1.ViewColumn.Active, preserveFocus: false }, {
        retainContextWhenHidden: true,
        enableFindWidget: true,
        enableCommandUris: true,
        enableScripts: true,
    });
    panel.iconPath = vscode_1.Uri.file(path.resolve(__dirname, "..", "small_logo.png"));
    panel.webview.html = `
        <!DOCTYPE html>
        <html lang="en" style="margin: 0; padding: 0; min-width: 100%; min-height: 100%">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Tabnine Hub</title>
            </head>
            <body style="margin: 0; padding: 0; min-width: 100%; min-height: 100%">
            <iframe src=${(_a = config === null || config === void 0 ? void 0 : config.message) !== null && _a !== void 0 ? _a : ""} id="config" frameborder="0" style="display: block; margin: 0; padding: 0; position: absolute; min-width: 100%; min-height: 100%; visibility: visible;"></iframe>
                <script>
                    window.onfocus = config.onload = function() {
                        setTimeout(function() {
                            document.getElementById("config").contentWindow.focus();
                        }, 100);
                    };
                    window.addEventListener("message", (e) => {
                      let data = e.data;
                      switch (data.type) {
                        case "keydown": {
                          if (${consts_1.IS_OSX}) {
                            window.dispatchEvent(new KeyboardEvent('keydown',data.event));
                          }
                          break;
                        }
                        case "link-click": {
                          let tempRef = document.createElement("a");
                          tempRef.setAttribute("href", data.href);
                          config.appendChild(tempRef);
                          tempRef.click();
                          tempRef.parentNode.removeChild(tempRef);
                          break;
                        }
                      }
                  }, false);
                  </script>
            </body>
        </html>`;
}
exports.default = registerConfig;
//# sourceMappingURL=registerConfig.js.map