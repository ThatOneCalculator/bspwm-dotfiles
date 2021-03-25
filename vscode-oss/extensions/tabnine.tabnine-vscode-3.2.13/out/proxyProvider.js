"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const agent_1 = require("https-proxy-agent/dist/agent");
const url = require("url");
const vscode_1 = require("vscode");
function getHttpsProxyAgent() {
    const proxySettings = getProxySettings();
    if (!proxySettings) {
        return { agent: undefined, rejectUnauthorized: false };
    }
    const proxyUrl = url.parse(proxySettings);
    if (proxyUrl.protocol !== "https:" && proxyUrl.protocol !== "http:") {
        return { agent: undefined, rejectUnauthorized: false };
    }
    const rejectUnauthorized = vscode_1.workspace
        .getConfiguration()
        .get("http.proxyStrictSSL", true);
    const parsedPort = proxyUrl.port
        ? parseInt(proxyUrl.port, 10)
        : undefined;
    const port = Number.isNaN(parsedPort) ? undefined : parsedPort;
    const proxyOptions = {
        host: proxyUrl.hostname,
        port,
        auth: proxyUrl.auth,
        rejectUnauthorized,
    };
    return {
        agent: new agent_1.default(proxyOptions),
        rejectUnauthorized,
    };
}
exports.default = getHttpsProxyAgent;
function getProxySettings() {
    let proxy = vscode_1.workspace
        .getConfiguration()
        .get("http.proxy");
    if (!proxy) {
        proxy =
            process.env.HTTPS_PROXY ||
                process.env.https_proxy ||
                process.env.HTTP_PROXY ||
                process.env.http_proxy;
    }
    return proxy;
}
//# sourceMappingURL=proxyProvider.js.map