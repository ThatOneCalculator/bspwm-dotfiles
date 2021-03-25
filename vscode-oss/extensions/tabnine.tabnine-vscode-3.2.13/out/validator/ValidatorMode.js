"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getValidatorMode = exports.setValidatorMode = exports.ValidatorMode = void 0;
var ValidatorMode;
(function (ValidatorMode) {
    ValidatorMode[ValidatorMode["Background"] = 0] = "Background";
    ValidatorMode[ValidatorMode["Paste"] = 1] = "Paste";
})(ValidatorMode = exports.ValidatorMode || (exports.ValidatorMode = {}));
let validatorMode = ValidatorMode.Background;
function setValidatorMode(m) {
    validatorMode = m;
}
exports.setValidatorMode = setValidatorMode;
function getValidatorMode() {
    return validatorMode;
}
exports.getValidatorMode = getValidatorMode;
//# sourceMappingURL=ValidatorMode.js.map