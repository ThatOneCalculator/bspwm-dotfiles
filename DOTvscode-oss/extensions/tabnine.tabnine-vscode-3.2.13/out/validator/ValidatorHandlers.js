"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validatorIgnoreHandler = exports.validatorSelectionHandler = exports.validatorClearCacheHandler = void 0;
/* eslint-disable */
const vscode = require("vscode");
const setState_1 = require("../binary/requests/setState");
const CompletionOrigin_1 = require("../CompletionOrigin");
const consts_1 = require("../consts");
const commands_1 = require("./commands");
const utils_1 = require("./utils");
const ValidatorClient_1 = require("./ValidatorClient");
const IGNORE_VALUE = "__IGNORE__";
async function validatorClearCacheHandler() {
    await ValidatorClient_1.clearCache();
    setState_1.default({
        [consts_1.StatePayload.STATE]: { state_type: utils_1.StateType.clearCache },
    });
}
exports.validatorClearCacheHandler = validatorClearCacheHandler;
// FIXME: try to find the exact type for the 3rd parameter...
async function validatorSelectionHandler(editor, edit, { currentSuggestion, allSuggestions, reference, threshold }) {
    try {
        const eventData = eventDataOf(editor, currentSuggestion, allSuggestions, reference, threshold, false);
        setState_1.default(eventData);
    }
    catch (error) {
        console.error(error);
    }
}
exports.validatorSelectionHandler = validatorSelectionHandler;
async function validatorIgnoreHandler(editor, edit, { allSuggestions, reference, threshold, responseId }) {
    try {
        await ValidatorClient_1.setIgnore(responseId);
        vscode.commands.executeCommand(commands_1.VALIDATOR_IGNORE_REFRESH_COMMAND);
        const completion = {
            value: IGNORE_VALUE,
            score: 0,
        };
        const eventData = eventDataOf(editor, completion, allSuggestions, reference, threshold, true);
        setState_1.default(eventData);
    }
    catch (error) {
        console.error(error);
    }
}
exports.validatorIgnoreHandler = validatorIgnoreHandler;
function eventDataOf(editor, currentSuggestion, allSuggestions, reference, threshold, isIgnore = false) {
    let index = allSuggestions.findIndex((sug) => sug === currentSuggestion);
    if (index === -1) {
        index = allSuggestions.length;
    }
    const suggestions = allSuggestions.map((sug) => {
        return {
            length: sug.value.length,
            strength: resolveDetailOf(sug),
            origin: CompletionOrigin_1.default.CLOUD,
        };
    });
    const { length } = currentSuggestion.value;
    const selectedSuggestion = currentSuggestion.value;
    const strength = resolveDetailOf(currentSuggestion);
    const origin = CompletionOrigin_1.default.CLOUD;
    const language = editor.document.fileName.split(".").pop();
    const numOfSuggestions = allSuggestions.length;
    const eventData = {
        ValidatorSelection: {
            language: language,
            length,
            strength,
            origin,
            index,
            threshold,
            num_of_suggestions: numOfSuggestions,
            suggestions,
            selected_suggestion: selectedSuggestion,
            reference,
            reference_length: reference.length,
            is_ignore: isIgnore,
            validator_version: ValidatorClient_1.VALIDATOR_BINARY_VERSION,
        },
    };
    return eventData;
}
function resolveDetailOf(completion) {
    return `${completion.score}%`;
}
//# sourceMappingURL=ValidatorHandlers.js.map