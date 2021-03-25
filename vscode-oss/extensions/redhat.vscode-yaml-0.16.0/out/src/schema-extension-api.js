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
exports.SchemaExtensionAPI = exports.CUSTOM_CONTENT_REQUEST = exports.CUSTOM_SCHEMA_REQUEST = exports.MODIFICATION_ACTIONS = void 0;
const vscode_uri_1 = require("vscode-uri");
const node_1 = require("vscode-languageclient/node");
const vscode_1 = require("vscode");
const extension_1 = require("./extension");
var MODIFICATION_ACTIONS;
(function (MODIFICATION_ACTIONS) {
    MODIFICATION_ACTIONS[MODIFICATION_ACTIONS["delete"] = 0] = "delete";
    MODIFICATION_ACTIONS[MODIFICATION_ACTIONS["add"] = 1] = "add";
})(MODIFICATION_ACTIONS = exports.MODIFICATION_ACTIONS || (exports.MODIFICATION_ACTIONS = {}));
// eslint-disable-next-line @typescript-eslint/no-namespace
var SchemaModificationNotification;
(function (SchemaModificationNotification) {
    // eslint-disable-next-line @typescript-eslint/ban-types
    SchemaModificationNotification.type = new node_1.RequestType('json/schema/modify');
})(SchemaModificationNotification || (SchemaModificationNotification = {}));
class SchemaExtensionAPI {
    constructor(client) {
        this._customSchemaContributors = {};
        this._yamlClient = client;
    }
    /**
     * Register a custom schema provider
     *
     * @param {string} the provider's name
     * @param requestSchema the requestSchema function
     * @param requestSchemaContent the requestSchemaContent function
     * @param label the content label, yaml key value pair, like 'apiVersion:some.api/v1'
     * @returns {boolean}
     */
    registerContributor(schema, requestSchema, requestSchemaContent, label) {
        if (this._customSchemaContributors[schema]) {
            return false;
        }
        if (!requestSchema) {
            throw new Error('Illegal parameter for requestSchema.');
        }
        if (label) {
            const [first, second] = label.split(':');
            if (first && second) {
                label = second.trim();
                label = label.replace('.', '\\.');
                label = `${first}:[\t ]+${label}`;
            }
        }
        this._customSchemaContributors[schema] = {
            requestSchema,
            requestSchemaContent,
            label,
        };
        return true;
    }
    /**
     * Call requestSchema for each provider and finds all matches.
     *
     * @param {string} resource
     * @returns {string} the schema uri
     */
    requestCustomSchema(resource) {
        const matches = [];
        for (const customKey of Object.keys(this._customSchemaContributors)) {
            try {
                const contributor = this._customSchemaContributors[customKey];
                let uri;
                if (contributor.label && vscode_1.workspace.textDocuments) {
                    const labelRegexp = new RegExp(contributor.label, 'g');
                    for (const doc of vscode_1.workspace.textDocuments) {
                        if (doc.uri.toString() === resource) {
                            if (labelRegexp.test(doc.getText())) {
                                uri = contributor.requestSchema(resource);
                                return [uri];
                            }
                        }
                    }
                }
                uri = contributor.requestSchema(resource);
                if (uri) {
                    matches.push(uri);
                }
            }
            catch (error) {
                extension_1.logToExtensionOutputChannel(`Error thrown while requesting schema "${error}" when calling the registered contributor "${customKey}"`);
            }
        }
        return matches;
    }
    /**
     * Call requestCustomSchemaContent for named provider and get the schema content.
     *
     * @param {string} uri the schema uri returned from requestSchema.
     * @returns {string} the schema content
     */
    requestCustomSchemaContent(uri) {
        if (uri) {
            const _uri = vscode_uri_1.URI.parse(uri);
            if (_uri.scheme &&
                this._customSchemaContributors[_uri.scheme] &&
                this._customSchemaContributors[_uri.scheme].requestSchemaContent) {
                return this._customSchemaContributors[_uri.scheme].requestSchemaContent(uri);
            }
        }
    }
    modifySchemaContent(schemaModifications) {
        return __awaiter(this, void 0, void 0, function* () {
            return this._yamlClient.sendRequest(SchemaModificationNotification.type, schemaModifications);
        });
    }
}
exports.SchemaExtensionAPI = SchemaExtensionAPI;
// constants
exports.CUSTOM_SCHEMA_REQUEST = 'custom/schema/request';
exports.CUSTOM_CONTENT_REQUEST = 'custom/schema/content';
//# sourceMappingURL=schema-extension-api.js.map