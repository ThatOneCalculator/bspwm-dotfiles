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
exports.IconTreeDataProvider = void 0;
const vscode = require("vscode");
const __fuse = require("fuse.js");
const types_1 = require("./types");
const configuration_1 = require("./configuration");
const util_1 = require("./util");
// import Fuse from "fuse.js" doesn't work, even with allowSyntheticDefaultImports
const Fuse = __fuse;
class IconTreeDataProvider {
    constructor() {
        this._onDidChangeTreeData = new vscode.EventEmitter();
        this.onDidChangeTreeData = this._onDidChangeTreeData
            .event;
    }
    refresh() {
        this._onDidChangeTreeData.fire();
    }
    getTreeItem(element) {
        switch (element.type) {
            case "icon":
                let tooltip = `Aliases: ${element.doc.aliases}\nTags: ${element.doc.tags}`;
                if (element.search && element.search.score) {
                    tooltip += `\n\nMatch score: ${Math.floor((1 - element.search.score) * 100)}%\nMatches: ${element.search.matches}`;
                }
                return {
                    contextValue: "mdiIcon",
                    label: util_1.createCompletion(element.meta.name, types_1.CompletionType.no),
                    description: element.search ? element.doc.tags : undefined,
                    iconPath: vscode.Uri.parse(`data:image/svg+xml;utf8,${element.doc.rawIcon}`),
                    command: {
                        command: "materialdesigniconsIntellisense.openIconPreview",
                        arguments: [element],
                        title: "Open icon preview",
                    },
                    tooltip,
                };
            case "tag":
                return {
                    contextValue: "mdiTag",
                    label: element.tag,
                    description: `${element.childCount} icons`,
                    collapsibleState: vscode.TreeItemCollapsibleState.Collapsed,
                };
            default:
                // search
                return {
                    contextValue: "mdiSearch",
                    label: element.label,
                    description: configuration_1.config.lastSearch,
                    collapsibleState: vscode.TreeItemCollapsibleState.Collapsed,
                    command: element.command,
                };
        }
    }
    getChildren(element) {
        return util_1.getMdiMetaData().then((d) => {
            if (element) {
                let filtered = [];
                let children = [];
                if (element.type === "tag") {
                    filtered = [...d].filter((a) => (a.tags.length === 0 && element.tag === "Other") ||
                        a.tags.indexOf(element.tag) !== -1);
                    children = filtered.map((child) => __awaiter(this, void 0, void 0, function* () {
                        return ({
                            type: "icon",
                            meta: child,
                            doc: yield util_1.getIconData(child),
                        });
                    }));
                }
                if (element.type === "other") {
                    const fuse = new Fuse(d, {
                        isCaseSensitive: false,
                        shouldSort: true,
                        includeMatches: true,
                        includeScore: true,
                        threshold: 0.3,
                        location: 0,
                        distance: 10000,
                        keys: [
                            { name: "name", weight: 0.9 },
                            { name: "aliases", weight: 0.6 },
                            { name: "tags", weight: 0.3 },
                            { name: "codepoint", weight: 0.2 },
                        ],
                    });
                    const result = fuse.search(configuration_1.config.lastSearch);
                    filtered = result.map((r) => r.item);
                    if (!filtered.length) {
                        vscode.window.showWarningMessage(`No icons found matching "${configuration_1.config.lastSearch}"`);
                    }
                    children = result.map((child) => __awaiter(this, void 0, void 0, function* () {
                        var _a;
                        return ({
                            type: "icon",
                            meta: child.item,
                            doc: yield util_1.getIconData(child.item),
                            search: {
                                score: child.score,
                                matches: (_a = child.matches) === null || _a === void 0 ? void 0 : _a.map((m) => m.value || ""),
                            },
                        });
                    }));
                }
                return Promise.all(children).then((c) => {
                    if (element.type === "other") {
                        // dont sort fuse output
                        return c;
                    }
                    c.sort((a, b) => (a.type === "icon" &&
                        b.type === "icon" &&
                        a.meta.name.localeCompare(b.meta.name)) ||
                        0);
                    return c;
                });
            }
            // root
            const tags = {};
            for (const icon of d) {
                if (icon.tags.length) {
                    for (const tag of icon.tags) {
                        if (tags[tag]) {
                            tags[tag]++;
                        }
                        else {
                            tags[tag] = 1;
                        }
                    }
                }
                else {
                    // use tag `Other` if icon has no tags
                    if (!tags["Other"]) {
                        tags["Other"] = 0;
                    }
                    tags["Other"]++;
                }
            }
            const children = Object.entries(tags)
                .map((tag) => ({ type: "tag", tag: tag[0], childCount: tag[1] }))
                .sort((a, b) => a.tag.localeCompare(b.tag));
            const searchResult = {
                type: "other",
                label: "Search results",
            };
            if (configuration_1.config.lastSearch) {
                children.unshift(searchResult);
            }
            return children;
        });
    }
    getParent(element) {
        return element.type === "tag" || element.type === "other"
            ? null
            : {
                type: "tag",
                tag: element.meta.tags[0] || "Other",
            };
    }
    provideTextDocumentContent(uri, token) {
        return Promise.resolve("text");
    }
}
exports.IconTreeDataProvider = IconTreeDataProvider;
//# sourceMappingURL=tree.js.map