"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileTracker = void 0;
const path = require("path");
const minimatch = require("minimatch");
const fs = require("fs-extra");
const vscode_languageserver_1 = require("vscode-languageserver");
const vscode_languageserver_textdocument_1 = require("vscode-languageserver-textdocument");
const timer = require("./console");
const vscode_uri_1 = require("vscode-uri");
const file_1 = require("./file");
class FileTracker {
    constructor(options) {
        this.map = new Map();
        this.ignoredFilePaths = new Set();
        if (options.includeGlobPattern && path.isAbsolute(options.includeGlobPattern)) {
            throw new Error(`"includeGlobPattern" parameter "${options.includeGlobPattern}" should not be an absolute path pattern`);
        }
        this.includeGlobPattern = options.includeGlobPattern || '**/*';
        this.excludeGlobPattern = options.excludeGlobPattern;
        this.alwaysIncludeGlobPattern = options.alwaysIncludeGlobPattern;
        this.ignoreFilesBy = options.ignoreFilesBy || [];
        this.includeMatcher = new minimatch.Minimatch(this.includeGlobPattern);
        this.excludeMatcher = this.excludeGlobPattern ? new minimatch.Minimatch(this.excludeGlobPattern) : null;
        this.alwaysIncludeMatcher = this.alwaysIncludeGlobPattern ? new minimatch.Minimatch(this.alwaysIncludeGlobPattern) : null;
        this.updateImmediately = options.updateImmediately || false;
        this.startPath = options.startPath;
        this.startPathLoaded = !this.startPath;
        this.allFresh = this.startPathLoaded;
        if (this.startPath && this.updateImmediately) {
            this.loadStartPath();
        }
        options.documents.onDidChangeContent(this.onDocumentOpenOrContentChanged.bind(this));
        // Seems `onDidSave` not work, handle this logic on reTrackFile.
        //options.documents.onDidSave(this.onDocumentSaved.bind(this))
        options.documents.onDidClose(this.onDocumentClosed.bind(this));
        // There is one interesting bug here, `onDidChangeWatchedFiles` can't been registered for twice, or the first one will stop working.
        // Handle it in top server handler.
        //options.connection.onDidChangeWatchedFiles(this.onWatchedPathChanged.bind(this))
    }
    has(filePath) {
        return this.map.has(filePath);
    }
    async loadStartPath() {
        timer.start('track');
        await this.trackPath(this.startPath);
        timer.log(`${this.map.size} files tracked in ${timer.end('track')} ms`);
        this.startPathLoaded = true;
    }
    // No need to handle file opening because we have preloaded all the files.
    // Open and changed event will be distinguished by document version later.
    onDocumentOpenOrContentChanged(event) {
        let document = event.document;
        let filePath = vscode_languageserver_1.Files.uriToFilePath(document.uri);
        if (filePath && this.canTrackFilePath(filePath)) {
            this.trackOpenedFile(filePath, document);
        }
    }
    canTrackFilePath(filePath) {
        if (!this.includeMatcher.match(filePath)) {
            return false;
        }
        if (this.shouldExclude(filePath)) {
            return false;
        }
        return true;
    }
    shouldExclude(filePath) {
        if (this.excludeMatcher && this.excludeMatcher.match(filePath)) {
            if (!this.alwaysIncludeMatcher || !this.alwaysIncludeMatcher.match(filePath)) {
                return true;
            }
        }
        return false;
    }
    canTrackPath(fileOrFolderPath) {
        if (this.shouldExclude(fileOrFolderPath)) {
            return false;
        }
        return true;
    }
    // private onDocumentSaved(event: TextDocumentChangeEvent) {
    // 	let document = event.document
    // 	let filePath = Files.uriToFilePath(document.uri)
    // 	let item = this.map.get(filePath!)
    // 	// Since `onDidChangeWatchedFiles` event was triggered so frequently, we only do updating after saved.
    // 	if (item && !item.fresh && this.updateImmediately) {
    // 		this.doUpdate(filePath!, item)
    // 	}
    // }
    onDocumentClosed(event) {
        let document = event.document;
        let filePath = vscode_languageserver_1.Files.uriToFilePath(document.uri);
        this.unTrackOpenedFile(filePath);
    }
    // No need to handle file changes making by vscode when document is opening, and document version > 1 at this time.
    // Here is a issue for `@import x` resources:
    //   It's common that we import sources from `node_modules` directory,
    //   But we can't get notifications when files in it changed.
    async onWatchedPathChanged(params) {
        if (!this.startPathLoaded) {
            return;
        }
        for (let change of params.changes) {
            let uri = change.uri;
            let fileOrFolderPath = vscode_languageserver_1.Files.uriToFilePath(uri);
            if (!fileOrFolderPath) {
                continue;
            }
            if (change.type === vscode_languageserver_1.FileChangeType.Created) {
                this.trackPath(fileOrFolderPath);
            }
            else if (change.type === vscode_languageserver_1.FileChangeType.Changed) {
                let stat = await fs.stat(fileOrFolderPath);
                if (stat && stat.isFile()) {
                    let filePath = fileOrFolderPath;
                    if (this.canTrackFilePath(filePath)) {
                        this.reTrackFile(filePath);
                    }
                }
            }
            else if (change.type === vscode_languageserver_1.FileChangeType.Deleted) {
                this.unTrackPath(fileOrFolderPath);
            }
        }
    }
    async trackPath(fileOrFolderPath) {
        if (!this.canTrackPath(fileOrFolderPath)) {
            return;
        }
        let stat = await fs.stat(fileOrFolderPath);
        if (stat && stat.isDirectory()) {
            await this.trackFolder(fileOrFolderPath);
        }
        else if (stat && stat.isFile()) {
            let filePath = fileOrFolderPath;
            if (this.canTrackFilePath(filePath)) {
                await this.trackFile(filePath);
            }
        }
    }
    async trackFolder(folderPath) {
        let filePaths = await file_1.walkDirectoryToGetFilePaths(folderPath, this.includeMatcher, this.excludeMatcher, this.ignoreFilesBy, this.alwaysIncludeGlobPattern);
        for (let filePath of filePaths) {
            this.trackFile(filePath);
        }
    }
    trackFile(filePath) {
        let item = this.map.get(filePath);
        if (!item) {
            item = {
                document: null,
                version: 0,
                opened: false,
                fresh: false,
                updatePromise: null
            };
            this.map.set(filePath, item);
            this.handleTrackFollowed(filePath, item);
        }
    }
    // Used to track and load `@import` sources
    async trackAndUpdateImmediately(filePath) {
        let item = this.map.get(filePath);
        if (!item) {
            this.trackFile(filePath);
            item = this.map.get(filePath);
        }
        if (!item.fresh) {
            await this.doUpdate(filePath, item);
        }
    }
    handleTrackFollowed(filePath, item) {
        if (this.updateImmediately) {
            // Here it just loaded for future usage, no need to update asynchronously.
            this.doUpdate(filePath, item);
        }
        else {
            this.allFresh = false;
            timer.log(`${filePath} tracked`);
            this.onTrack(filePath, item);
        }
    }
    // Still keep data for ignored items.
    ignore(filePath) {
        this.ignoredFilePaths.add(filePath);
        timer.log(`${filePath} ignored`);
    }
    notIgnore(filePath) {
        this.ignoredFilePaths.delete(filePath);
        timer.log(`${filePath} restored from ignored`);
    }
    hasIgnored(filePath) {
        return this.ignoredFilePaths.size > 0 && this.ignoredFilePaths.has(filePath);
    }
    // When file content may changed, reload it.
    reTrackFile(filePath) {
        let item = this.map.get(filePath);
        if (item) {
            if (item.opened) {
                // Changes made in opened files, should be updated after files saved.
                if (!item.fresh && this.updateImmediately) {
                    this.doUpdate(filePath, item);
                }
            }
            else {
                item.document = null;
                item.version = 0;
                this.handleExpired(filePath, item);
            }
        }
        else {
            this.trackFile(filePath);
        }
    }
    handleExpired(filePath, item) {
        if (!item.opened && this.updateImmediately) {
            this.doUpdate(filePath, item);
        }
        else {
            item.fresh = false;
            this.allFresh = false;
            timer.log(`${filePath} expired`);
            this.onExpired(filePath, item);
        }
    }
    // `document` is always the same object for the same file.
    // Very frequently to trigger when do editing.
    trackOpenedFile(filePath, document) {
        let item = this.map.get(filePath);
        if (item) {
            // Both newly created document and firstly opened document have `version=1`.
            let changed = document.version > item.version;
            item.document = document;
            item.version = document.version;
            item.opened = true;
            if (changed && item.fresh) {
                this.handleExpired(filePath, item);
            }
        }
        else {
            item = {
                document,
                version: document.version,
                opened: true,
                fresh: false,
                updatePromise: null
            };
            this.map.set(filePath, item);
            this.handleTrackFollowed(filePath, item);
        }
    }
    unTrackOpenedFile(filePath) {
        let item = this.map.get(filePath);
        if (item) {
            // Tt becomes same as not opened document, but still fresh.
            item.document = null;
            item.version = 1;
            item.opened = false;
            timer.log(`${filePath} closed`);
        }
    }
    unTrackPath(deletedPath) {
        for (let filePath of this.map.keys()) {
            if (filePath.startsWith(deletedPath)) {
                let item = this.map.get(filePath);
                if (item) {
                    this.map.delete(filePath);
                    if (this.ignoredFilePaths.size > 0) {
                        this.ignoredFilePaths.delete(filePath);
                    }
                    timer.log(`${filePath} removed`);
                    this.onUnTrack(filePath, item);
                }
            }
        }
        // May restore ignore.
        this.allFresh = false;
    }
    async beFresh() {
        if (!this.allFresh) {
            if (!this.startPathLoaded) {
                await this.loadStartPath();
            }
            timer.start('update');
            let promises = [];
            for (let [filePath, item] of this.map.entries()) {
                if (!item.fresh) {
                    promises.push(this.doUpdate(filePath, item));
                }
            }
            let updateResults = await Promise.all(promises);
            let updatedCount = updateResults.reduce((count, value) => count + (value ? 1 : 0), 0);
            let timeCost = timer.end('update');
            if (updatedCount > 0) {
                timer.log(`${updatedCount} files loaded in ${timeCost} ms`);
            }
            this.allFresh = true;
        }
    }
    async doUpdate(filePath, item) {
        if (!this.hasIgnored(filePath)) {
            item.updatePromise = item.updatePromise || this.getUpdatePromise(filePath, item);
            await item.updatePromise;
            item.updatePromise = null;
            return true;
        }
        return false;
    }
    async getUpdatePromise(filePath, item) {
        let hasDocumentBefore = item.opened && !!item.document;
        if (!hasDocumentBefore) {
            item.document = await this.loadDocumentFromFilePath(filePath);
            if (item.document) {
                item.version = item.document.version;
            }
        }
        if (item.document) {
            item.fresh = true;
            await this.onUpdate(filePath, item);
            timer.log(`${filePath} loaded${hasDocumentBefore ? ' from document' : ''}`);
        }
    }
    async loadDocumentFromFilePath(filePath) {
        let languageId = path.extname(filePath).slice(1).toLowerCase();
        let uri = vscode_uri_1.URI.file(filePath).toString();
        let document = null;
        try {
            let text = (await fs.readFile(filePath)).toString('utf8');
            // Very low resource usage to create document.
            document = vscode_languageserver_textdocument_1.TextDocument.create(uri, languageId, 1, text);
        }
        catch (err) {
            timer.error(err);
        }
        return document;
    }
    onTrack(_filePath, _item) { }
    onExpired(_filePath, _item) { }
    async onUpdate(_filePath, _item) { }
    onUnTrack(_filePath, _item) { }
}
exports.FileTracker = FileTracker;
//# sourceMappingURL=file-tracker.js.map