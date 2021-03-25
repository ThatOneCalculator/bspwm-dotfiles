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
exports.createDecorationSvg = exports.extractPathFromSvg = exports.createCompletion = exports.getMatchAtPosition = exports.matcherStringToRegex = exports.downloadAndExtractTarball = exports.handleDownload = exports.getPackageInfo = exports.getVersions = exports.hexToRgbString = exports.log = exports.getIconData = exports.encodeSpaces = exports.getMdiMetaData = void 0;
const fs = require("fs");
const path = require("path");
const vscode = require("vscode");
const https = require("https");
const tar = require("tar");
const semver_1 = require("semver");
const changeCase = require("change-case");
const configuration_1 = require("./configuration");
exports.getMdiMetaData = () => __awaiter(void 0, void 0, void 0, function* () {
    let data;
    const fallbackPath = path.normalize(path.join(__dirname, "../node_modules/@mdi/svg/", "meta.json"));
    try {
        data = yield fs.promises.readFile(configuration_1.config.mdiMetaDataPath);
    }
    catch (err) {
        exports.log(err);
        exports.log("local version not found, fetching available versions from npm registry");
        const info = yield exports.getVersions();
        if (info.versions.find((v) => v.version === configuration_1.config.mdiVersion)) {
            // download missing version
            yield exports.handleDownload(info.latest, info);
            data = yield fs.promises.readFile(configuration_1.config.mdiMetaDataPath);
        }
        else {
            vscode.window.showWarningMessage(`Couldn't find ${configuration_1.config.mdiMetaDataPath}`);
            data = yield fs.promises.readFile(fallbackPath);
        }
    }
    return JSON.parse(data.toString("utf8"));
});
exports.encodeSpaces = (content) => {
    return content.replace(/ /g, "%20");
};
exports.getIconData = (item) => __awaiter(void 0, void 0, void 0, function* () {
    const svgPath = path.normalize(path.join(configuration_1.config.mdiPath, "svg", `${item.name}.svg`));
    const fallbackSvgPath = path.normalize(path.join(__dirname, "../node_modules/@mdi/svg/", "svg", `${item.name}.svg`));
    let data;
    try {
        data = yield fs.promises.readFile(svgPath);
    }
    catch (err) {
        exports.log(err);
        data = yield fs.promises.readFile(fallbackSvgPath);
    }
    const utf8String = data
        .toString("utf8")
        .replace(/<path/gi, `<path fill="${configuration_1.config.iconColor}" `);
    const previewSvg = "data:image/svg+xml;utf8;base64," +
        Buffer.from(utf8String).toString("base64") +
        exports.encodeSpaces(` | width=${configuration_1.config.iconSize} height=${configuration_1.config.iconSize}`);
    return {
        aliases: [item.name, ...item.aliases].join(", "),
        author: item.author,
        codepoint: item.codepoint,
        name: item.name,
        tags: item.tags.join(", ") || "Other",
        version: item.version,
        link: new vscode.MarkdownString(`[docs](https://materialdesignicons.com/icon/${item.name})`),
        icon: new vscode.MarkdownString(`![preview](${previewSvg})`),
        rawIcon: utf8String,
    };
});
let outputChannel = null;
exports.log = (x, show = false) => {
    if (!outputChannel) {
        outputChannel = vscode.window.createOutputChannel("Material Design Icons Intellisense");
    }
    if (show) {
        outputChannel.show();
    }
    outputChannel.appendLine(x);
};
exports.hexToRgbString = (hex) => {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (!result) {
        return null;
    }
    const rgb = {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
    };
    return `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
};
exports.getVersions = () => __awaiter(void 0, void 0, void 0, function* () {
    const packageInfo = yield exports.getPackageInfo();
    return {
        latest: packageInfo["dist-tags"].latest,
        // versions sorted with semver
        versions: semver_1.sort(Object.keys(packageInfo.versions))
            .reverse()
            .map((version) => ({
            version: version,
            time: packageInfo.time[version],
            downloadUrl: packageInfo.versions[version].dist.tarball,
        })),
    };
});
exports.getPackageInfo = (url = "https://registry.npmjs.org/@mdi/svg") => {
    return new Promise((resolve, reject) => {
        var req = https.get(url, function (res) {
            const chunks = [];
            res.setEncoding("utf8");
            res.on("data", function (data) {
                chunks.push(data);
            });
            res.on("end", () => {
                try {
                    resolve(JSON.parse(chunks.join("")));
                }
                catch (e) {
                    reject(e);
                }
            });
        });
        req.on("error", function (e) {
            reject(e);
        });
        req.end();
    });
};
exports.handleDownload = (version, packageInfo) => vscode.window.withProgress({
    location: vscode.ProgressLocation.Notification,
    cancellable: false,
}, (progress) => __awaiter(void 0, void 0, void 0, function* () {
    progress.report({
        message: `Downloading and extracting @mdi/svg@${version}`,
    });
    const versionInfo = packageInfo.versions.find((v) => v.version === version);
    if (!versionInfo) {
        throw new Error(`Version ${version} not found`);
    }
    const p = path.join(configuration_1.config.context.globalStoragePath, version);
    yield fs.promises.mkdir(p, { recursive: true });
    yield exports.downloadAndExtractTarball(versionInfo.downloadUrl, p);
}));
exports.downloadAndExtractTarball = (url, destinationDirectory) => {
    return new Promise((resolve, reject) => {
        var req = https.get(url, function (res) {
            const t = tar.extract({
                cwd: destinationDirectory,
            });
            t.on("error", (err) => {
                reject(err);
            });
            res.pipe(t);
            res.on("error", (err) => {
                reject(err);
            });
            t.on("finish", () => {
                resolve();
            });
        });
        req.on("error", function (e) {
            reject(e);
        });
        req.end();
    });
};
exports.matcherStringToRegex = (str) => {
    const result = /\{(\w+)\}/.exec(str);
    if (!result) {
        exports.log("Type not found in matcher");
        return null;
    }
    const replacements = {
        camel: "A-Za-z",
        param: "-a-z",
        pascal: "A-Za-z",
        constant: "_A-Z",
        dot: ".a-z",
        header: "-A-Za-z",
        no: " a-z",
        path: "/a-z",
        snake: "_a-z",
    };
    const type = result[1];
    const replacement = replacements[type];
    if (!replacement) {
        exports.log("invalid matcher syntax");
        return null;
    }
    const createIconRegex = (count) => `(?<icon>[${replacement}0-9]${count})`;
    const prefix = result.input.slice(0, result.index);
    return {
        fullRegex: new RegExp(str.replace(/\{\w+\}/i, createIconRegex("+")), "ig"),
        type,
        suggestionPrefixAndIconRegex: new RegExp(`(?<prefix>${prefix})${createIconRegex("*")}$`),
    };
};
exports.getMatchAtPosition = (document, position) => {
    const matchers = configuration_1.config.matchers;
    for (const matcher of matchers) {
        const regex = exports.matcherStringToRegex(matcher.match);
        if (!regex)
            continue;
        const range = document.getWordRangeAtPosition(position, regex.fullRegex);
        if (!range) {
            continue;
        }
        const text = document.getText(range);
        const match = regex.fullRegex.exec(text);
        if (!match || !match.groups) {
            continue;
        }
        const iconName = changeCase.paramCase(match.groups.icon);
        return {
            match,
            iconName,
            range,
        };
    }
};
exports.createCompletion = (iconName, type) => {
    const transformers = {
        camel: changeCase.camelCase,
        param: changeCase.paramCase,
        pascal: changeCase.pascalCase,
        constant: changeCase.constantCase,
        dot: changeCase.dotCase,
        header: changeCase.headerCase,
        no: changeCase.noCase,
        path: changeCase.pathCase,
        snake: changeCase.snakeCase,
    };
    return transformers[type](iconName);
};
exports.extractPathFromSvg = (svg) => {
    const reg = /\bd="(.*?)"/g;
    const match = reg.exec(svg);
    if (!match) {
        return "";
    }
    return match[1];
};
exports.createDecorationSvg = (path) => {
    const size = 24;
    const template = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}"><path transform-origin="${size / 2} ${size / 2}" fill="${configuration_1.config.iconColor}" d="${path}"/></svg>`;
    return template;
};
//# sourceMappingURL=util.js.map