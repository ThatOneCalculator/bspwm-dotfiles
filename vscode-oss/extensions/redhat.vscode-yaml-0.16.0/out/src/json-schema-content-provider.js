"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Red Hat, Inc. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
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
exports.getJsonSchemaContent = exports.JSONSchemaDocumentContentProvider = void 0;
const vscode_1 = require("vscode");
const request_light_1 = require("request-light");
class JSONSchemaDocumentContentProvider {
    constructor(schemaCache) {
        this.schemaCache = schemaCache;
    }
    provideTextDocumentContent(uri) {
        return getJsonSchemaContent(uri.toString().replace('json-schema://', 'https://'), this.schemaCache);
    }
}
exports.JSONSchemaDocumentContentProvider = JSONSchemaDocumentContentProvider;
function getJsonSchemaContent(uri, schemaCache) {
    return __awaiter(this, void 0, void 0, function* () {
        const cachedETag = schemaCache.getETag(uri);
        const httpSettings = vscode_1.workspace.getConfiguration('http');
        request_light_1.configure(httpSettings.http && httpSettings.http.proxy, httpSettings.http && httpSettings.http.proxyStrictSSL);
        const headers = { 'Accept-Encoding': 'gzip, deflate' };
        if (cachedETag) {
            headers['If-None-Match'] = cachedETag;
        }
        return request_light_1.xhr({ url: uri, followRedirects: 5, headers })
            .then((response) => __awaiter(this, void 0, void 0, function* () {
            // cache only if server supports 'etag' header
            if (response.headers['etag']) {
                yield schemaCache.putSchema(uri, response.headers['etag'], response.responseText);
            }
            return response.responseText;
        }))
            .then((text) => {
            return text;
        })
            .catch((error) => {
            // content not changed, return cached
            if (error.status === 304) {
                return schemaCache.getSchema(uri);
            }
            // in case of some error, like internet connection issue, check if cached version exist and return it
            if (schemaCache.getETag(uri)) {
                return schemaCache.getSchema(uri);
            }
            return Promise.reject(error.responseText || request_light_1.getErrorStatusDescription(error.status) || error.toString());
        });
    });
}
exports.getJsonSchemaContent = getJsonSchemaContent;
//# sourceMappingURL=json-schema-content-provider.js.map