"use strict";
/*! Copyright (c) Microsoft Corporation. All rights reserved. */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PythonSupport = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const vscode = __importStar(require("vscode"));
const genericErrorMessage = "Cannot start IntelliCode support for Python. See output window for more details.";
const defaultAnalyzerName = "intellisense-members";
const lstmAnalyzerName = "intellisense-members-lstm";
const lstmPylanceAnalyzerName = "intellisense-members-lstm-pylance";
const lsTypeSettingName = "languageServer";
const MPLS = "Microsoft";
const Pylance = "Pylance";
const Node = "Node";
const PYTHON_EXTENSION_ID = "ms-python.python";
class PythonSupport {
    constructor() {
        this.logger = () => { };
    }
    getRequestedConfig() {
        return [];
    }
    activate(api, logger) {
        return __awaiter(this, void 0, void 0, function* () {
            this.logger = logger;
            const pythonExtension = vscode.extensions.getExtension(PYTHON_EXTENSION_ID);
            if (!pythonExtension) {
                const err = "Microsoft Python extension is not installed.";
                this.logger(err);
                return Promise.reject(err);
            }
            const config = vscode.workspace.getConfiguration("python");
            if (!config) {
                this.logger("Unable to find Python configuration section.");
                return;
            }
            const ls = config.get(lsTypeSettingName);
            if (!ls || ls === "None") {
                this.logger(`Language server is set to ${ls || "undefined"}, IntelliCode is unable to continue.`);
                return;
            }
            this.logger(`Language server is set to ${ls}.`);
            if (ls !== Pylance && ls !== Node) {
                this.logger("IntelliCode Python suggests to use Pylance as language server. Details about Pylance: 'https://aka.ms/vscode-pylance'.");
            }
            if (ls === MPLS) {
                return this.handlePythonExtensionV1(api, pythonExtension);
            }
            if (ls === Pylance || ls === Node) {
                return this.handlePythonExtensionV2(api, pythonExtension);
            }
        });
    }
    handlePythonExtensionV1(api, pythonExtension) {
        return __awaiter(this, void 0, void 0, function* () {
            const useDeepLearning = api.isFeatureEnabled("python.deepLearning");
            const analyzerName = useDeepLearning ? lstmAnalyzerName : defaultAnalyzerName;
            const intelliCodeAssemblyName = useDeepLearning ? "IntelliCodeForPythonLstm.dll" : "IntellicodeForPython2.dll";
            const assembly = path_1.default.join(__dirname, intelliCodeAssemblyName);
            try {
                fs_1.default.accessSync(assembly, fs_1.default.constants.F_OK);
            }
            catch (err) {
                this.logger(`Python Language Server extension assembly doesn't exist in ${assembly}. Please reinstall IntelliCode.`);
                return Promise.reject(err);
            }
            let model = yield this.acquireModel(api, analyzerName);
            if (!model && analyzerName === lstmAnalyzerName) {
                this.logger("No deep learning model available for Python, fall back to the default model.");
                model = yield this.acquireModel(api, defaultAnalyzerName);
            }
            if (!model) {
                this.logger("No model available for Python, cannot continue.");
                return;
            }
            yield this.activatePythonExtension(pythonExtension);
            const typeName = "Microsoft.PythonTools.Analysis.Pythia.LanguageServerExtensionProvider";
            const command = vscode.commands.executeCommand("python._loadLanguageServerExtension", {
                assembly,
                typeName,
                properties: {
                    modelPath: model.modelPath,
                },
            });
            if (!command) {
                this.logger("Couldn't find language server extension command. Is the installed version of Python 2018.7.0 or later?");
                return Promise.reject(new Error(genericErrorMessage));
            }
        });
    }
    handlePythonExtensionV2(api, pythonExtension) {
        return __awaiter(this, void 0, void 0, function* () {
            this.logger("Acquiring model");
            let model = yield this.acquireModel(api, lstmPylanceAnalyzerName);
            if (!model) {
                this.logger("No model v2 available for Python, trying v1.");
                model = yield this.acquireModel(api, lstmAnalyzerName);
                if (!model) {
                    this.logger("No model available for Python, cannot continue.");
                    return;
                }
            }
            this.logger("Activating Python extension");
            yield this.activatePythonExtension(pythonExtension);
            try {
                yield vscode.commands.executeCommand("python.intellicode.loadLanguageServerExtension", {
                    modelPath: model.modelPath,
                });
            }
            catch (e) {
                const message = `Language server extension command failed. Exception: ${e.stack}`;
                this.logger(message);
                return Promise.reject(new Error(message));
            }
        });
    }
    activatePythonExtension(pythonExtension) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!pythonExtension.isActive) {
                yield pythonExtension.activate();
            }
            yield pythonExtension.exports.ready;
        });
    }
    acquireModel(api, analyzerName) {
        return __awaiter(this, void 0, void 0, function* () {
            const model = api.ModelAcquisitionService.getModelProvider("python", analyzerName).getModelAsync();
            if (model) {
                const modelJson = JSON.stringify(model);
                this.logger(`vs-intellicode-python was passed a model: ${modelJson}.`);
            }
            return model;
        });
    }
}
exports.PythonSupport = PythonSupport;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidnNjb2RlLWludGVsbGljb2RlLXB5dGhvbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy92c2NvZGUtaW50ZWxsaWNvZGUtcHl0aG9uLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQSxnRUFBZ0U7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFHaEUsNENBQW9CO0FBQ3BCLGdEQUF3QjtBQUN4QiwrQ0FBaUM7QUFFakMsTUFBTSxtQkFBbUIsR0FBVyxrRkFBa0YsQ0FBQztBQUN2SCxNQUFNLG1CQUFtQixHQUFHLHNCQUFzQixDQUFDO0FBQ25ELE1BQU0sZ0JBQWdCLEdBQUcsMkJBQTJCLENBQUM7QUFDckQsTUFBTSx1QkFBdUIsR0FBRyxtQ0FBbUMsQ0FBQztBQUVwRSxNQUFNLGlCQUFpQixHQUFHLGdCQUFnQixDQUFDO0FBRTNDLE1BQU0sSUFBSSxHQUFHLFdBQVcsQ0FBQztBQUV6QixNQUFNLE9BQU8sR0FBRyxTQUFTLENBQUM7QUFFMUIsTUFBTSxJQUFJLEdBQUcsTUFBTSxDQUFDO0FBRXBCLE1BQU0sbUJBQW1CLEdBQUcsa0JBQWtCLENBQUM7QUFFL0MsTUFBYSxhQUFhO0lBQTFCO1FBQ1ksV0FBTSxHQUEwQixHQUFHLEVBQUUsR0FBRSxDQUFDLENBQUM7SUF3SXJELENBQUM7SUF0SUcsa0JBQWtCO1FBRWQsT0FBTyxFQUFFLENBQUM7SUFDZCxDQUFDO0lBRUssUUFBUSxDQUFDLEdBQXFCLEVBQUUsTUFBNkI7O1lBQy9ELElBQUksQ0FBQyxNQUFNLEdBQUcsTUFBTSxDQUFDO1lBR3JCLE1BQU0sZUFBZSxHQUFHLE1BQU0sQ0FBQyxVQUFVLENBQUMsWUFBWSxDQUFDLG1CQUFtQixDQUFDLENBQUM7WUFDNUUsSUFBSSxDQUFDLGVBQWUsRUFBRTtnQkFDbEIsTUFBTSxHQUFHLEdBQUcsOENBQThDLENBQUM7Z0JBQzNELElBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUM7Z0JBQ2pCLE9BQU8sT0FB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