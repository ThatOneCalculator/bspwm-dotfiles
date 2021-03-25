"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.closeValidator = exports.setIgnore = exports.clearCache = exports.getCompilerDiagnostics = exports.getValidLanguages = exports.getValidExtensions = exports.getValidatorDiagnostics = exports.initValidator = exports.VALIDATOR_BINARY_VERSION = exports.VALIDATOR_API_VERSION = void 0;
/* eslint-disable */
const await_semaphore_1 = require("await-semaphore");
const child_process = require("child_process");
const readline = require("readline");
const vscode = require("vscode");
const setState_1 = require("../binary/requests/setState");
const capabilities_1 = require("../capabilities");
const consts_1 = require("../consts");
const commands_1 = require("./commands");
const diagnostics_1 = require("./diagnostics");
const utils_1 = require("./utils");
const ValidatorHandlers_1 = require("./ValidatorHandlers");
const ValidatorMode_1 = require("./ValidatorMode");
const ACTIVE_STATE_KEY = "tabnine-validator-active";
const ENABLED_KEY = "tabnine-validator:enabled";
const BACKGROUND_KEY = "tabnine-validator:background";
const CAPABILITY_KEY = "tabnine-validator:capability";
exports.VALIDATOR_API_VERSION = "1.0.0";
exports.VALIDATOR_BINARY_VERSION = "";
const MODE_A = "A";
const MODE_B = "B";
let MODE = MODE_A;
function getMode() {
    if (capabilities_1.isCapabilityEnabled(capabilities_1.Capability.VALIDATOR_MODE_A_CAPABILITY_KEY)) {
        return MODE_A;
    }
    if (capabilities_1.isCapabilityEnabled(capabilities_1.Capability.VALIDATOR_MODE_B_CAPABILITY_KEY)) {
        return MODE_B;
    }
    return MODE_A; // default
}
function initValidator(context, pasteDisposable) {
    vscode.commands.executeCommand("setContext", CAPABILITY_KEY, true);
    MODE = getMode();
    ValidatorMode_1.setValidatorMode(ValidatorMode_1.ValidatorMode.Background);
    let backgroundMode = true;
    if (capabilities_1.isCapabilityEnabled(capabilities_1.Capability.VALIDATOR_BACKGROUND_CAPABILITY)) {
        // use default values
    }
    else if (capabilities_1.isCapabilityEnabled(capabilities_1.Capability.VALIDATOR_PASTE_CAPABILITY)) {
        backgroundMode = false;
        ValidatorMode_1.setValidatorMode(ValidatorMode_1.ValidatorMode.Paste);
    }
    vscode.commands.executeCommand("setContext", BACKGROUND_KEY, backgroundMode);
    let isActive = context.globalState.get(ACTIVE_STATE_KEY, backgroundMode);
    if (isActive === null || typeof isActive === "undefined") {
        isActive = true;
    }
    context.subscriptions.push(vscode.commands.registerCommand(commands_1.VALIDATOR_TOGGLE_COMMAND, async () => {
        const value = !isActive ? "On" : "Off";
        const message = `Please reload Visual Studio Code to turn Validator ${value}.`;
        const reload = await vscode.window.showInformationMessage(message, "Reload Now");
        if (reload) {
            setState_1.default({
                [consts_1.StatePayload.STATE]: { state_type: utils_1.StateType.toggle, state: value },
            });
            await context.globalState.update(ACTIVE_STATE_KEY, !isActive);
            vscode.commands.executeCommand("workbench.action.reloadWindow");
        }
    }));
    if (isActive) {
        utils_1.downloadValidatorBinary()
            .then((isTabNineValidatorBinaryDownloaded) => {
            if (isTabNineValidatorBinaryDownloaded) {
                pasteDisposable.dispose();
                diagnostics_1.registerValidator(context, pasteDisposable);
                context.subscriptions.push(vscode.commands.registerTextEditorCommand(commands_1.VALIDATOR_SELECTION_COMMAND, ValidatorHandlers_1.validatorSelectionHandler));
                context.subscriptions.push(vscode.commands.registerTextEditorCommand(commands_1.VALIDATOR_IGNORE_COMMAND, ValidatorHandlers_1.validatorIgnoreHandler));
                if (backgroundMode) {
                    context.subscriptions.push(vscode.commands.registerCommand(commands_1.VALIDATOR_CLEAR_CACHE_COMMAND, ValidatorHandlers_1.validatorClearCacheHandler));
                }
                vscode.commands.executeCommand("setContext", ENABLED_KEY, true);
            }
        })
            .catch((e) => {
            console.log(e);
        });
    }
}
exports.initValidator = initValidator;
let validationProcess = null;
async function request(body, cancellationToken, timeToSleep = 10000) {
    if (validationProcess === null) {
        validationProcess = new ValidatorProcess();
        if (validationProcess) {
            const _body = {
                method: "get_version",
                params: {},
            };
            exports.VALIDATOR_BINARY_VERSION = await request(_body);
        }
    }
    if (validationProcess.shutdowned) {
        return;
    }
    return new Promise((resolve, reject) => {
        const id = utils_1.getNanoSecTime();
        validationProcess
            .post({ ...body, id, version: exports.VALIDATOR_API_VERSION }, id)
            .then(resolve, reject);
        cancellationToken === null || cancellationToken === void 0 ? void 0 : cancellationToken.registerCallback(reject, "Canceled");
        setTimeout(() => {
            reject("Timeout");
        }, timeToSleep);
    });
}
function getValidatorDiagnostics(code, fileName, visibleRange, threshold, editDistance, apiKey, cancellationToken) {
    const body = {
        method: "get_validator_diagnostics",
        params: {
            code,
            fileName,
            visibleRange,
            mode: MODE,
            threshold,
            editDistance,
            apiKey,
        },
    };
    return request(body, cancellationToken);
}
exports.getValidatorDiagnostics = getValidatorDiagnostics;
function getValidExtensions() {
    const method = "get_valid_extensions";
    const body = {
        method,
        params: {},
    };
    return request(body);
}
exports.getValidExtensions = getValidExtensions;
function getValidLanguages() {
    const method = "get_valid_languages";
    const body = {
        method,
        params: {},
    };
    return request(body);
}
exports.getValidLanguages = getValidLanguages;
function getCompilerDiagnostics(code, fileName) {
    const method = "get_compiler_diagnostics";
    const body = {
        method,
        params: {
            code,
            fileName,
        },
    };
    return request(body);
}
exports.getCompilerDiagnostics = getCompilerDiagnostics;
function clearCache() {
    const method = "clear_cache";
    const body = {
        method,
        params: {},
    };
    return request(body);
}
exports.clearCache = clearCache;
function setIgnore(responseId) {
    const method = "set_ignore";
    const body = {
        method,
        params: {
            responseId,
        },
    };
    return request(body);
}
exports.setIgnore = setIgnore;
function closeValidator() {
    console.log("Validator is closing");
    if (validationProcess) {
        const method = "shutdown";
        const body = {
            method,
            params: {},
        };
        validationProcess.shutdowned = true;
        return request(body);
    }
    return Promise.resolve();
}
exports.closeValidator = closeValidator;
class ValidatorProcess {
    constructor() {
        this.numRestarts = 0;
        this.childDead = false;
        this.mutex = new await_semaphore_1.Mutex();
        this.resolveMap = new Map();
        this._shutdowned = false;
        this.restartChild();
    }
    async post(anyRequest, id) {
        var _a;
        const release = await this.mutex.acquire();
        try {
            if (!this.isChildAlive()) {
                this.restartChild();
            }
            const request = `${JSON.stringify(anyRequest)}\n`;
            (_a = this.proc) === null || _a === void 0 ? void 0 : _a.stdin.write(request, "utf8");
            return new Promise((resolve) => {
                this.resolveMap.set(id, resolve);
            });
        }
        catch (e) {
            console.log(`Error interacting with TabNine Validator: ${e}`);
        }
        finally {
            release();
        }
    }
    get shutdowned() {
        return this._shutdowned;
    }
    set shutdowned(value) {
        this._shutdowned = value;
    }
    isChildAlive() {
        return !!this.proc && !this.childDead;
    }
    onChildDeath() {
        this.childDead = true;
        setTimeout(() => {
            if (!this.isChildAlive()) {
                this.restartChild();
            }
        }, 10000);
    }
    restartChild() {
        if (this.numRestarts >= 10) {
            return;
        }
        this.numRestarts += 1;
        if (this.proc) {
            this.proc.kill();
        }
        this.proc = run();
        this.childDead = false;
        this.proc.on("exit", () => {
            if (!this.shutdowned) {
                this.onChildDeath();
            }
        });
        this.proc.stdin.on("error", (error) => {
            console.log(`validator binary stdin error: ${error}`);
            this.onChildDeath();
        });
        this.proc.stdout.on("error", (error) => {
            console.log(`validator binary stdout error: ${error}`);
            this.onChildDeath();
        });
        this.proc.stderr.on("data", (data) => {
            console.log(data.toString().trim());
        });
        this.proc.unref(); // AIUI, this lets Node exit without waiting for the child
        this.rl = readline.createInterface({
            input: this.proc.stdout,
            output: this.proc.stdin,
        });
        this.rl.on("line", (line) => {
            const result = JSON.parse(line);
            const { id } = result;
            const { body } = result;
            this.resolveMap.get(id)(body);
            this.resolveMap.delete(id);
        });
    }
}
function run(additionalArgs = [], inheritStdio = false) {
    const args = [...additionalArgs];
    const command = utils_1.getFullPathToValidatorBinary();
    return child_process.spawn(command, args, {
        stdio: inheritStdio ? "inherit" : "pipe",
    });
}
//# sourceMappingURL=ValidatorClient.js.map