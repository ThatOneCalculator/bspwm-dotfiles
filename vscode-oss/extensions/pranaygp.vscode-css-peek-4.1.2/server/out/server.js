"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const minimatch = require("minimatch");
const path = require("path");
const vscode_languageserver_1 = require("vscode-languageserver");
const findSelector_1 = require("./core/findSelector");
const findDefinition_1 = require("./core/findDefinition");
const logger_1 = require("./logger");
// Creates the LSP connection
const connection = vscode_languageserver_1.createConnection(vscode_languageserver_1.ProposedFeatures.all);
// Create a manager for open text documents
const documents = new vscode_languageserver_1.TextDocuments();
// Create a map of styleSheet URIs to the stylesheet text content
const styleSheets = {};
// The workspace folder this server is operating on
let workspaceFolder;
let hasConfigurationCapability = false;
let hasWorkspaceFolderCapability = false;
async function documentShouldBeIgnored(document) {
    const settings = await getDocumentSettings(document.uri);
    if (!settings.peekFromLanguages.includes(document.languageId) ||
        settings.peekToExclude.find((glob) => minimatch(document.uri, glob))) {
        return true;
    }
    else {
        return false;
    }
}
/* Handle Document Updates */
documents.onDidOpen(async (event) => {
    if (await documentShouldBeIgnored(event.document)) {
        return;
    }
    connection.console.log(`[Server(${process.pid}) ${path.basename(workspaceFolder)}/] Document opened: ${path.basename(event.document.uri)}`);
    if (findDefinition_1.isLanguageServiceSupported(event.document.languageId)) {
        const languageService = findDefinition_1.getLanguageService(event.document);
        const stylesheet = languageService.parseStylesheet(event.document);
        const symbols = languageService.findDocumentSymbols(event.document, stylesheet);
        styleSheets[event.document.uri] = {
            document: event.document,
            symbols,
        };
    }
});
documents.onDidChangeContent(async (event) => {
    if (await documentShouldBeIgnored(event.document)) {
        return;
    }
    connection.console.log(`[Server(${process.pid}) ${path.basename(workspaceFolder)}/] Document changed: ${path.basename(event.document.uri)}`);
    if (findDefinition_1.isLanguageServiceSupported(event.document.languageId)) {
        const languageService = findDefinition_1.getLanguageService(event.document);
        const stylesheet = languageService.parseStylesheet(event.document);
        const symbols = languageService.findDocumentSymbols(event.document, stylesheet);
        styleSheets[event.document.uri] = {
            document: event.document,
            symbols,
        };
    }
});
documents.listen(connection);
/* Server Initialization */
connection.onInitialize((params) => {
    logger_1.create(connection.console);
    const capabilities = params.capabilities;
    workspaceFolder = params.rootUri;
    // Does the client support the `workspace/configuration` request?
    // If not, we will fall back using global settings
    hasConfigurationCapability =
        capabilities.workspace && !!capabilities.workspace.configuration;
    hasWorkspaceFolderCapability =
        capabilities.workspace && !!capabilities.workspace.workspaceFolders;
    connection.console.log(`[Server(${process.pid}) ${path.basename(workspaceFolder)}/] onInitialize`);
    setupInitialStyleMap(params);
    connection.console.log(`[Server(${process.pid}) ${path.basename(workspaceFolder)}/] setupInitialStylemap`);
    return {
        capabilities: {
            textDocumentSync: {
                openClose: true,
                change: vscode_languageserver_1.TextDocumentSyncKind.Full,
            },
            definitionProvider: true,
            workspaceSymbolProvider: true,
        },
    };
});
connection.onInitialized(() => {
    if (hasConfigurationCapability) {
        // Register for all configuration changes.
        connection.client.register(vscode_languageserver_1.DidChangeConfigurationNotification.type, undefined);
    }
    if (hasWorkspaceFolderCapability) {
        connection.workspace.onDidChangeWorkspaceFolders((_event) => {
            connection.console.log("Workspace folder change event received.");
        });
    }
});
// The global settings, used when the `workspace/configuration` request is not supported by the client.
const defaultSettings = {
    supportTags: true,
    peekFromLanguages: ["html"],
    peekToExclude: ["**/node_modules/**", "**/bower_components/**"],
};
let globalSettings = defaultSettings;
// Cache the settings of all open documents
let documentSettings = new Map();
connection.onDidChangeConfiguration((change) => {
    if (hasConfigurationCapability) {
        // Reset all cached document settings
        documentSettings.clear();
    }
    else {
        globalSettings = (change.settings.cssPeek || defaultSettings);
    }
});
function getDocumentSettings(resource) {
    if (!hasConfigurationCapability) {
        return Promise.resolve(globalSettings);
    }
    let result = documentSettings.get(resource);
    if (!result) {
        result = connection.workspace.getConfiguration({
            scopeUri: resource,
            section: "cssPeek",
        });
        documentSettings.set(resource, result);
    }
    return result;
}
// Only keep settings for open documents
documents.onDidClose((e) => {
    documentSettings.delete(e.document.uri);
});
function setupInitialStyleMap(params) {
    const styleFiles = params.initializationOptions.stylesheets;
    styleFiles.forEach((fileUri) => {
        const languageId = fileUri.fsPath.split(".").slice(-1)[0];
        const text = fs.readFileSync(fileUri.fsPath, "utf8");
        const document = vscode_languageserver_1.TextDocument.create(fileUri.uri, languageId, 1, text);
        const languageService = findDefinition_1.getLanguageService(document);
        const stylesheet = languageService.parseStylesheet(document);
        const symbols = languageService.findDocumentSymbols(document, stylesheet);
        styleSheets[fileUri.uri] = {
            document,
            symbols,
        };
    });
}
connection.onDefinition(async (textDocumentPositon) => {
    const documentIdentifier = textDocumentPositon.textDocument;
    const position = textDocumentPositon.position;
    const document = documents.get(documentIdentifier.uri);
    if (await documentShouldBeIgnored(document)) {
        return null;
    }
    const settings = await getDocumentSettings(document.uri);
    const selector = findSelector_1.default(document, position, settings);
    if (!selector) {
        return null;
    }
    return findDefinition_1.findDefinition(selector, styleSheets);
});
connection.onWorkspaceSymbol(({ query }) => {
    const selectors = [
        {
            attribute: "class",
            value: query,
        },
        {
            attribute: "id",
            value: query,
        },
    ];
    return selectors.reduce((p, selector) => [...p, ...findDefinition_1.findSymbols(selector, styleSheets)], []);
});
connection.listen();
//# sourceMappingURL=server.js.map